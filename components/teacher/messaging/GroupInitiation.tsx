import React, { useState, useMemo } from 'react';
import { MessagingAPI } from '@/lib/api/messaging-api';
import {
  Users,
  GraduationCap,
  Megaphone,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupInitiationProps {
  schoolId: string;
  currentUserId: string;
  classes: {
    id: string;
    grade_name: string;
    learner_count: number;
  }[];
  onBack: () => void;
  onSuccess: (conversationId: string) => void;
  godMode?: boolean;
}

type ScopeType = 'broadcast' | 'grade' | 'classroom';

interface TargetOption {
  id: string;
  name: string;
  description?: string;
  icon?: React.ElementType;
}

export default function GroupInitiation({
  schoolId,
  currentUserId,
  classes,
  onBack,
  onSuccess,
  godMode = false,
}: GroupInitiationProps) {
  const [activeTab, setActiveTab] = useState<ScopeType>('broadcast');
  const [selectedTarget, setSelectedTarget] = useState<TargetOption | null>(null);
  const [groupName, setGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────

  const broadcastOptions: TargetOption[] = [
    { id: 'all_parents', name: 'All Parents', description: 'Reach every verified parent in the school' },
    { id: 'all_teachers', name: 'All Teachers', description: 'Internal broadcast to all teaching staff' },
  ];

  // Derive unique grades from classes (e.g., "Grade 9" from "Grade 9A Maths")
  const gradeOptions: TargetOption[] = useMemo(() => {
    const uniqueGrades = Array.from(new Set(classes.map(c => {
      // Split by space and take first two parts: "Grade" + "9"
      const parts = c.grade_name.split(' ');
      return parts.slice(0, 2).join(' ');
    })));
    return uniqueGrades.map(grade => ({
      id: grade,
      name: grade,
      description: `All learners and parents mapped to ${grade}`
    }));
  }, [classes]);

  const classroomOptions: TargetOption[] = useMemo(() => {
    return classes.map(c => ({
      id: c.id,
      name: c.grade_name,
      description: `${c.learner_count} Learners • Real-time classroom stream`
    }));
  }, [classes]);

  const activeOptions = useMemo(() => {
    if (activeTab === 'broadcast') return broadcastOptions;
    if (activeTab === 'grade') return gradeOptions;
    return classroomOptions;
  }, [activeTab, gradeOptions, classroomOptions]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateGroup = async () => {
    if (!selectedTarget || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        school_id: schoolId,
        scope_type: activeTab,
        target_id: selectedTarget.id,
        custom_name: groupName.trim() || null
      };

      const conversation = await MessagingAPI.groupInitiation(payload);
      onSuccess(conversation.id);
    } catch (err) {
      console.error('Failed to initiate group:', err);
      // Optional: Add error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPreviewText = () => {
    if (!selectedTarget) return null;

    if (activeTab === 'broadcast') {
      return `✨ Broadcast Group: This action will open an instant real-time message stream to ${selectedTarget.name.toLowerCase()}.`;
    }
    if (activeTab === 'grade') {
      return `✨ Grade Broadcast: This action will open an instant real-time message stream to all verified parents mapped to ${selectedTarget.name} learners.`;
    }
    return `✨ Classroom Stream: You are opening a direct communication channel with all parents in ${selectedTarget.name}.`;
  };

  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';
  const accentBg = godMode ? 'bg-secondary-accent/10' : 'bg-primary-accent/10';
  const accentBorder = godMode ? 'border-secondary-accent/20' : 'border-primary-accent/20';

  return (
    <div className="flex flex-col h-full bg-surface-container overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white/90">New Group Message</h2>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
          {(['broadcast', 'grade', 'classroom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedTarget(null);
              }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              )}
            >
              {tab === 'broadcast' && 'Broadcasts'}
              {tab === 'grade' && 'Grades'}
              {tab === 'classroom' && 'My Classes'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Item Selection */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2">
            Select Target {activeTab === 'classroom' ? 'Class' : activeTab}
          </p>

          <div className={cn(
            "grid gap-3",
            activeTab === 'broadcast' ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          )}>
            {activeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedTarget(option)}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition-all group overflow-hidden",
                  selectedTarget?.id === option.id
                    ? "bg-primary-accent/10 border-primary-accent/40"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                {selectedTarget?.id === option.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-accent" />
                  </div>
                )}

                <div className="space-y-1 pr-6">
                  <h4 className="font-bold text-white/90 text-sm">{option.name}</h4>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* Visual Flair */}
                <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {activeTab === 'broadcast' && <Megaphone className="w-16 h-16 text-white" />}
                  {activeTab === 'grade' && <GraduationCap className="w-16 h-16 text-white" />}
                  {activeTab === 'classroom' && <Users className="w-16 h-16 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Name */}
        {selectedTarget && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2">
              Group Display Name (Optional)
            </p>
            <input
              type="text"
              placeholder={`e.g., ${selectedTarget.name} Parent Portal`}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
            />
          </div>
        )}
      </div>

      {/* Footer / Summary */}
      <div className="p-6 border-t border-white/5 bg-surface-container/50">
        <div className="space-y-4 max-w-lg mx-auto">
          {selectedTarget && (
            <div className="p-4 bg-primary-accent/5 border border-primary-accent/10 rounded-2xl flex items-start gap-4 animate-in zoom-in-95">
              <div className="shrink-0 p-2 bg-primary-accent/20 rounded-xl">
                <Sparkles className="w-4 h-4 text-primary-accent" />
              </div>
              <p className="text-xs text-white/60 leading-relaxed italic">
                {getPreviewText()}
              </p>
            </div>
          )}

          <button
            onClick={handleCreateGroup}
            disabled={!selectedTarget || isSubmitting}
            className={cn(
              "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95",
              selectedTarget
                ? "bg-primary-accent text-on-primary-fixed shadow-2xl shadow-primary-accent/20"
                : "bg-white/5 text-white/20 cursor-not-allowed",
              isSubmitting && "opacity-80"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Hydration...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Initialize Group Channel
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-white/20 font-medium">
            Verified members will be automatically synchronized upon creation.
          </p>
        </div>
      </div>
    </div>
  );
}
