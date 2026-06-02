import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Users, GraduationCap, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/components/hooks/useDebounce';
import { apiClient } from '@/lib/api/api-client';
import { z } from 'zod';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SearchResult {
  id: string;
  name: string;
  type: 'learner' | 'teacher' | 'class';
  metadata?: string;
  status?: string;
  slug?: string;
}

const SearchResponseSchema = z.object({
  data: z.object({
    results: z.array(z.any()).optional()
  }).optional(),
  results: z.array(z.any()).optional(),
}).passthrough();

export function GlobalSearch({ schoolId, schoolSlug }: { schoolId: string; schoolSlug: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ learners: any[]; teachers: any[]; classes: any[] }>({
    learners: [],
    teachers: [],
    classes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults({ learners: [], teachers: [], classes: [] });
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.get(
          `/schools/${schoolId}/global_search?q=${encodeURIComponent(debouncedQuery)}`,
          SearchResponseSchema
        );

        const data = response.data || response;
        const rawResults = data.results || [];

        // Normalize results to handle case-insensitivity and variations in property names
        const normalizedResults = rawResults.map((r: any) => {
          const type = (r.type || '').toLowerCase();
          const id = r.id || r._id?.$oid || r._id || r.value;
          const name = r.label || r.name || r.full_name || '';

          return { ...r, type, id, name };
        });

        setResults({
          learners: normalizedResults.filter((r: any) => r.type === 'learner' || r.type === 'student'),
          teachers: normalizedResults.filter((r: any) => r.type === 'teacher' || r.type === 'staff'),
          classes: normalizedResults.filter((r: any) => r.type === 'class' || r.type === 'grade'),
        });
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, schoolId]);

  const hasResults = results.learners.length > 0 || results.teachers.length > 0 || results.classes.length > 0;

  const handleSelect = (item: any, type: string) => {
    setIsOpen(false);
    setQuery('');

    // Logic for navigation based on type
    if (type === 'learner') {
      router.push(`/admin/${schoolSlug}/learners/${item.id || item.slug}`);
    } else if (type === 'teacher') {
      router.push(`/admin/${schoolSlug}/teachers/${item.slug || item.id}`);
    } else if (type === 'class') {
      router.push(`/admin/${schoolSlug}/grades`); // Or a specific class view if implemented
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
          isOpen ? "text-school-primary" : "text-slate-400"
        )} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          placeholder="Search learners, teachers, or classes..."
          className="w-full pl-10 pr-10 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-school-primary focus:ring-4 focus:ring-school-primary/10 rounded-xl text-sm transition-all outline-none"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        ) : query && (
          <button
            onClick={() => { setQuery(''); setResults({ learners: [], teachers: [], classes: [] }); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (debouncedQuery.length >= 2 || isLoading) && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {!isLoading && !hasResults && (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">No results found for "{debouncedQuery}"</p>
              </div>
            )}

            {results.learners.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" />
                  Learners
                </div>
                {results.learners.map((learner) => (
                  <button
                    key={learner.id}
                    onClick={() => handleSelect(learner, 'learner')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {(learner.label || learner.name)?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                          {learner.label || learner.name}
                        </p>
                        <p className="text-xs text-slate-500">{learner.metadata?.grade || learner.grade || 'No Grade'}</p>
                      </div>
                    </div>
                    {(learner.metadata?.status || learner.status) && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        (learner.metadata?.status || learner.status) === 'Linked'
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        {learner.status}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {results.teachers.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Teachers
                </div>
                {results.teachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    onClick={() => handleSelect(teacher, 'teacher')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                        {(teacher.label || teacher.name)?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                          {teacher.label || teacher.name}
                        </p>
                        <p className="text-xs text-slate-500">{teacher.metadata?.email || teacher.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                      Staff
                    </span>
                  </button>
                ))}
              </div>
            )}

            {results.classes.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Classes
                </div>
                {results.classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleSelect(cls, 'class')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                        {(cls.label || cls.name)?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-school-primary transition-colors">
                          {cls.label || cls.name}
                        </p>
                        <p className="text-xs text-slate-500">{cls.metadata?.grade_name || cls.grade_name || 'Class'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Press Enter to see all results
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
