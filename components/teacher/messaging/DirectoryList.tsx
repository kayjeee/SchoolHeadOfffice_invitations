import React, { useState, useEffect } from 'react';
import { SchoolAPI } from '@/lib/api/school-api';
import { MessagingAPI, ConversationError } from '@/lib/api/messaging-api';
import { Participant } from '@/lib/types/messaging';
import {
  Search, User, Shield, Users, GraduationCap,
  ChevronRight, Loader2, MessageSquare, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/hooks/useApi';

interface DirectoryListProps {
  schoolId: string;
  currentUserId: string;
  onSelectConversation: (id: string) => void;
  onBack: () => void;
  existingConversations?: any[];
}

type DirectoryData = {
  admins: Participant[];
  teachers: Participant[];
  parents: Participant[];
};

// ── Small inline error toast ─────────────────────────────────────────────────
function InlineError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs text-red-300 flex-1 leading-relaxed">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400/60 hover:text-red-400 text-[10px] font-bold uppercase shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function DirectoryList({
  schoolId,
  currentUserId,
  onSelectConversation,
  onBack,
  existingConversations = [],
}: DirectoryListProps) {
  const [directory, setDirectory]           = useState<DirectoryData | null>(null);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [creatingConvId, setCreatingConvId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]             = useState<string | null>(null);
  const { accessToken }                     = useApi();

  useEffect(() => {
    // 🛡️ Guard: Ensure we have an access token before fetching school directory to avoid 401
    if (!accessToken) return;

    let mounted = true;
    setLoading(true);
    SchoolAPI.getDirectory(schoolId)
      .then(data  => { if (mounted) { setDirectory(data); setLoading(false); } })
      .catch(_err => { if (mounted) { setLoading(false); } });
    return () => { mounted = false; };
  }, [schoolId, accessToken]);

  const handleContactClick = async (contact: Participant) => {
    setErrorMsg(null);

    // ── Target correct User ID reference when dealing with a teacher contact wrapper ──
    const targetParticipantId = contact.role === 'teacher' && (contact as any).user_id
      ? (contact as any).user_id
      : contact.id;

    // ── Check for an existing conversation first ─────────────────────────
    const existing = existingConversations.find(conv => {
      const ids = (conv.participant_ids || conv.participants || [])
        .map((p: any) => (p.id ?? p).toString());
      return (
        ids.includes(targetParticipantId.toString()) &&
        ids.includes(currentUserId?.toString())
      );
    });

    if (existing) {
      onSelectConversation(existing.id);
      return;
    }

    // ── Create new conversation ──────────────────────────────────────────
    setCreatingConvId(contact.id);
    try {
      // Secure Clean Note-to-Self/Self-Conversation Payloads
      const isSelf = targetParticipantId.toString() === currentUserId?.toString();
      const participantIds = isSelf ? [] : [targetParticipantId];

      const conv = await MessagingAPI.createConversation(participantIds, schoolId);
      onSelectConversation(conv.id);
    } catch (err) {
      // Map ConversationError codes to user-friendly messages
      if (err instanceof ConversationError) {
        const userMessage: Record<ConversationError['code'], string> = {
          SELF_MESSAGE:          "Opening your personal notes…",   // shouldn't surface now
          PARTICIPANT_NOT_FOUND: "That contact could not be found. Please refresh the directory.",
          MISSING_SCHOOL:        "School information is missing. Please reload the page.",
          VALIDATION_FAILED:     "The conversation could not be created. Please try again.",
          UNKNOWN:               "Something went wrong. Please try again.",
        };
        setErrorMsg(userMessage[err.code] ?? err.message);
      } else {
        setErrorMsg("Could not start conversation. Please check your connection.");
      }
    } finally {
      setCreatingConvId(null);
    }
  };

  const filterParticipants = (participants: Participant[]) => {
    if (!searchQuery) return participants;
    const q = searchQuery.toLowerCase();
    return participants.filter(p => p.name.toLowerCase().includes(q));
  };

  const getUniqueContacts = (contacts: Participant[]) => {
    const seen = new Set<string>();
    return contacts.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  };

  const sections = [
    { title: 'Admins',   Icon: Shield,        data: getUniqueContacts(directory?.admins   || []) },
    { title: 'Teachers', Icon: GraduationCap, data: getUniqueContacts(directory?.teachers || []) },
    { title: 'Parents',  Icon: Users,         data: getUniqueContacts(directory?.parents  || []) },
  ];

  const hasResults = sections.some(s => filterParticipants(s.data).length > 0);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-accent animate-spin" />
        <p className="text-sm text-white/40 font-medium">Loading directory…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-container border-r border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white/90">School Directory</h2>
          <button
            onClick={onBack}
            className="text-xs font-bold text-primary-accent uppercase tracking-widest hover:text-primary-accent/80 transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
          <input
            type="text"
            placeholder="Search contacts…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Inline error banner */}
      {errorMsg && (
        <InlineError message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      )}

      {/* Directory sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!hasResults ? (
          <div className="p-8 text-center">
            <p className="text-sm text-white/20 font-medium">
              {searchQuery ? 'No contacts found' : 'Directory is empty'}
            </p>
          </div>
        ) : (
          sections.map(({ title, Icon, data }) => {
            const filtered = filterParticipants(data);
            if (filtered.length === 0) return null;

            return (
              <div key={title} className="py-2">
                {/* Section header */}
                <div className="px-6 py-2 flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-white/20" />
                  <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    {title} ({filtered.length})
                  </h3>
                </div>

                {/* Contact rows */}
                <div className="space-y-1 px-2">
                  {filtered.map(contact => {
                    const isSelf      = contact.id === currentUserId;
                    const isCreating  = creatingConvId === contact.id;

                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleContactClick(contact)}
                        disabled={isCreating}
                        className="w-full p-3 flex items-center gap-4 transition-all hover:bg-white/5 rounded-2xl group disabled:opacity-60"
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {contact.avatar ? (
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="w-10 h-10 rounded-xl object-cover bg-surface-container"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-white/20" />
                            </div>
                          )}
                          {contact.online_status === 'online' && (
                            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-surface-container" />
                          )}
                        </div>

                        {/* Name + role */}
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-bold text-white/90 truncate text-sm">
                            {contact.name}
                            {isSelf && (
                              <span className="ml-2 text-[9px] font-black text-primary-accent/60 uppercase tracking-widest">
                                You
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-white/20 font-medium capitalize">
                            {contact.role}
                          </p>
                        </div>

                        {/* Action indicator */}
                        <div className="flex items-center gap-2">
                          {isCreating ? (
                            <Loader2 className="w-4 h-4 text-primary-accent animate-spin" />
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-accent/10 rounded-xl group-hover:bg-primary-accent/20 transition-all">
                              <MessageSquare className="w-3.5 h-3.5 text-primary-accent" />
                              <span className="text-[10px] font-bold text-primary-accent uppercase tracking-widest">
                                {isSelf ? 'Notes' : 'Message'}
                              </span>
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}