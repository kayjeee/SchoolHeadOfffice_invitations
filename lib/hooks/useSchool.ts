'use client';

import { useState, useEffect } from 'react';
import { SchoolAPI } from '@/lib/api/school-api';

/**
 * Custom hook to resolve and manage school identity from a URL slug.
 * Ensures that components use the raw MongoDB/Backend ID for queries
 * instead of the human-readable slug string.
 */
export function useSchool(slug: string) {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function resolveSchool() {
      setIsLoading(true);
      try {
        const school = await SchoolAPI.getSchoolBySlug(slug);
        if (school) {
          const resolvedId = school.id || school._id || school.id?.toString() || school._id?.toString();
          setSchoolId(resolvedId);
          setSchoolData(school);
        } else {
          setError(new Error(`School with slug "${slug}" not found`));
          setSchoolId(null);
          setSchoolData(null);
        }
      } catch (err: any) {
        console.error(`❌ [useSchool] Failed to resolve school slug "${slug}":`, err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    resolveSchool();
  }, [slug]);

  return {
    schoolId,
    schoolData,
    isLoading,
    error
  };
}
