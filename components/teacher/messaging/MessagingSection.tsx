import React, { useState, useMemo, useEffect } from 'react';
import ConversationList from './ConversationList';
import DirectoryList from './DirectoryList';
import ChatWindow from './ChatWindow';
import GroupInitiation from './GroupInitiation';
import MessageInput from './MessageInput';
import SearchPanel from './SearchPanel';
import PinnedMessagesPanel from './PinnedMessagesPanel';
import SavedMessagesView from './SavedMessagesView';
import { useConversations, useMessages, useTyping } from '@/lib/hooks/useMessaging';
import { useApi } from '@/lib/hooks/useApi';
import { MessagingAgent } from '@/lib/ai/messaging-agent';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { SchoolAPI } from '@/lib/api/school-api';
import { Message, Participant } from '@/lib/types/messaging';
import {
  User, Phone, Video, Search, MoreHorizontal, ArrowLeft,
  LayoutDashboard, Sparkles, Wand2, Users, Pin, Plus as PlusIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessagingSectionProps {
  currentUserId: string;
  schoolId: string;
  godMode?: boolean;
  classes?: {
    id: string;
    grade_name: string;
    learner_count: number;
  }[];
}

export default function MessagingSection({
  currentUserId,
  schoolId,
  godMode = false,
  classes = [],
}: MessagingSectionProps) {
  useEffect(() => {
    console.log(`🚀 [MessagingSection] mounted with IDs: currentUserId=${currentUserId}, schoolId=${schoolId}`);
  }, [currentUserId, schoolId]);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showGroupInitiation, setShowGroupInitiation] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<(Message & { sender_name: string }) | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [directory, setDirectory] = useState<{
    admins: Participant[];
    teachers: Participant[];
    parents: Participant[];
  } | null>(null);
  const [learners, setLearners] = useState<any[]>([]);

  const { conversations, loading: loadingConvs, refresh: refreshConvs } = useConversations();
  const { messages, loading: loadingMessages, isSending, sendMessage } = useMessages(activeConvId);
  const { accessToken } = useApi();

  // ✅ FIX: hook exports `isOtherTyping`, not `isTyping`
  const { isOtherTyping, handleTyping } = useTyping(activeConvId);

  // Fetch directory once for contact name resolution
  useEffect(() => {
    // 🛡️ Guard: Ensure we have an access token before fetching school directory to avoid 401
    if (!accessToken) return;

    SchoolAPI.getDirectory(schoolId)
      .then(data => setDirectory(data))
      .catch(err => console.error('Failed to fetch directory:', err));

    SchoolAPI.getSchoolLearners(schoolId)
      .then(data => setLearners(data.learners))
      .catch(err => console.error('Failed to fetch learners:', err));
  }, [schoolId, accessToken]);

  // Memoised ID → Participant map
  // We index by both 'id' (legacy/profile) and 'user_id' (core account)
  // to ensure name resolution works across different reference layers.
  const contactMap = useMemo(() => {
    const map = new Map<string, Participant>();
    if (!directory) return map;
    [...directory.admins, ...directory.teachers, ...directory.parents].forEach(p => {
      map.set(p.id.toString(), p);
      if (p.user_id) {
        map.set(p.user_id.toString(), p);
      }
    });
    return map;
  }, [directory]);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [conversations, activeConvId]
  );

  const pinnedMessages = useMemo(
    () => messages.filter(m => m.is_pinned),
    [messages]
  );

  const resolvedParticipants = useMemo(() => {
    if (!activeConversation) return [];

    const participants = activeConversation.participants || [];
    const participantIds = (activeConversation as any).participant_ids || [];

    const allIds = Array.from(
      new Set([
        ...participants.map((p: any) => p.id?.toString()),
        ...participantIds.map((id: any) => id?.toString()),
      ])
    ).filter(Boolean) as string[];

    return allIds.map(id => {
      const fromDirectory = contactMap.get(id);
      const fromConv = participants.find((p: any) => p.id?.toString() === id);

      let resolved: Participant =
        fromConv || ({ id, name: 'Contact', role: 'staff' } as Participant);

      if (fromDirectory) {
        resolved = { ...resolved, ...fromDirectory };
      } else if (id === currentUserId?.toString()) {
        resolved = { ...resolved, name: 'You', role: 'teacher' };
      }

      return resolved;
    });
  }, [activeConversation, contactMap, currentUserId]);

  const otherParticipant = useMemo(() => {
    if (resolvedParticipants.length === 0) return null;

    // Filter out the current user to find the "other" person
    // Using .toString() for robust comparison with BSON IDs
    const others = resolvedParticipants.filter(
      p => p.id?.toString() !== currentUserId?.toString()
    );

    // Case: It's a conversation with someone else
    if (others.length > 0) {
      return others[0];
    }

    // Case: Self-conversation (only current user found or single-participant)
    const me = resolvedParticipants.find(
      p => p.id?.toString() === currentUserId?.toString()
    );

    if (me) {
      return { ...me, name: 'Me (Private)' };
    }

    return resolvedParticipants[0] || null;
  }, [resolvedParticipants, currentUserId]);

  // ✅ FIX: always close directory and update mobile state together
  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setShowDirectory(false);
    setShowGroupInitiation(false);
    setShowSearch(false);
    setShowSaved(false);
    setShowMobileList(false);
    setHighlightedMessageId(null);
    setReplyTo(null);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  const handleNoteToSelf = async () => {
    // Check if a self-conversation already exists
    const selfConv = conversations.find(conv => {
      const ids = (conv.participant_ids || conv.participants || [])
        .map((p: any) => (p.id ?? p).toString());
      return ids.length === 1 && ids[0] === currentUserId.toString();
    });

    if (selfConv) {
      handleSelectConversation(selfConv.id);
      return;
    }

    // Create new self-conversation if it doesn't exist
    try {
      const conv = await MessagingAPI.createConversation([], schoolId, currentUserId);
      handleSelectConversation(conv.id);
      refreshConvs();
    } catch (err) {
      console.error('Failed to create self-conversation:', err);
    }
  };

  // Mark as read when switching conversations
  useEffect(() => {
    if (!activeConvId) return;
    MessagingAPI.markAsRead(activeConvId)
      .then(() => refreshConvs())
      .catch(err => console.warn('markAsRead failed:', err));
  }, [activeConvId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSendMessage = async (content: string, attachment?: { url: string; type: string; name: string; size?: number }) => {
    if (!activeConvId) return;
    try {
      await sendMessage(content, currentUserId, attachment, replyTo?.id);
      setAiSuggestion(null);
      setReplyTo(null);
      refreshConvs();
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err; // Propagate error to MessageInput so it doesn't clear the field
    }
  };

  const handleAiSuggest = async () => {
    if (!activeConvId || messages.length === 0) return;
    setIsAiLoading(true);
    try {
      const context = messages.slice(-5).map(m => m.content).join('\n');
      const lastMsg = messages[messages.length - 1].content;
      const insight = await MessagingAgent.suggestResponse(context, lastMsg);
      setAiSuggestion(insight.metadata?.suggestedText || insight.message);
    } catch (err) {
      console.error('AI Suggestion error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const useAiSuggestion = () => {
    if (aiSuggestion) onSendMessage(aiSuggestion);
  };

  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[700px] bg-surface-container/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Background glow */}
      <div
        className={cn(
          'absolute -top-32 -left-32 w-64 h-64 blur-[120px] opacity-10 pointer-events-none transition-all duration-1000',
          godMode ? 'bg-secondary-accent' : 'bg-primary-accent'
        )}
      />

      <div className="flex h-full relative z-10">
        {/* ── Left sidebar ── */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col md:relative transition-all duration-300',
            !showMobileList && 'hidden md:flex'
          )}
        >
          {/* ✅ FIX: show directory/group initiation in sidebar only on mobile; on desktop it always shows the conversation list in the sidebar */}
          <div className="flex-1 flex flex-col md:hidden">
            {(showDirectory || showGroupInitiation) && showMobileList ? (
              showDirectory ? (
                <DirectoryList
                  schoolId={schoolId}
                  onSelectConversation={handleSelectConversation}
                  onBack={() => setShowDirectory(false)}
                  existingConversations={conversations}
                  currentUserId={currentUserId}
                />
              ) : (
                <GroupInitiation
                  schoolId={schoolId}
                  currentUserId={currentUserId}
                  classes={classes}
                  onBack={() => setShowGroupInitiation(false)}
                  onSuccess={handleSelectConversation}
                  godMode={godMode}
                />
              )
            ) : (
              <ConversationList
                conversations={conversations}
                learners={learners}
                activeConversationId={activeConvId}
                onSelectConversation={handleSelectConversation}
                currentUserId={currentUserId}
                onNoteToSelf={handleNoteToSelf}
                onNewMessage={() => {
                  setShowDirectory(true);
                  setShowGroupInitiation(false);
                  setShowSaved(false);
                  setActiveConvId(null);
                }}
                onNewGroupMessage={() => {
                  setShowGroupInitiation(true);
                  setShowDirectory(false);
                  setShowSaved(false);
                  setActiveConvId(null);
                  setShowMobileList(false);
                }}
                onShowSaved={() => {
                  setShowSaved(true);
                  setShowDirectory(false);
                  setShowGroupInitiation(false);
                  setActiveConvId(null);
                  setShowMobileList(false);
                }}
                contactMap={contactMap}
              />
            )}
          </div>

          <div className="hidden md:flex flex-1 flex-col">
            <ConversationList
              conversations={conversations}
              learners={learners}
              activeConversationId={activeConvId}
              onSelectConversation={handleSelectConversation}
              currentUserId={currentUserId}
              onNoteToSelf={handleNoteToSelf}
              onNewMessage={() => {
                setShowDirectory(true);
                setShowGroupInitiation(false);
                setShowSaved(false);
                setActiveConvId(null);
              }}
              onNewGroupMessage={() => {
                setShowGroupInitiation(true);
                setShowDirectory(false);
                setShowSaved(false);
                setActiveConvId(null);
                setShowMobileList(false);
              }}
              onShowSaved={() => {
                setShowSaved(true);
                setShowDirectory(false);
                setShowGroupInitiation(false);
                setActiveConvId(null);
                setShowMobileList(false);
              }}
              contactMap={contactMap}
            />
          </div>
        </div>

        {/* ── Right panel ── */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 transition-all duration-300',
            showMobileList && 'hidden md:flex'
          )}
        >
          {/* ✅ FIX: Priority — activeConvId wins over showDirectory and showSaved */}
          {activeConvId ? (
            <>
              {/* Chat header */}
              <div className="p-4 md:p-6 border-b border-white/5 bg-surface-container flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    {otherParticipant?.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover bg-surface-container"
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-white/20" />
                      </div>
                    )}
                    {otherParticipant?.online_status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-4 border-surface-container" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-white/90 text-sm md:text-base truncate">
                      {activeConversation?.title || otherParticipant?.name || 'Contact'}
                    </h3>
                    <p className="text-[10px] md:text-[11px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                      {otherParticipant?.online_status === 'online' ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-green-500" />
                          Active now
                        </>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                  <button className="p-2.5 md:p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all hidden sm:flex">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 md:p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all hidden sm:flex">
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowSearch(true)}
                    className={cn(
                      "p-2.5 md:p-3 transition-all rounded-2xl",
                      showSearch ? "bg-white/10 text-white" : "text-white/20 hover:text-white/60 hover:bg-white/5"
                    )}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPinned(!showPinned)}
                    className={cn(
                      "p-2.5 md:p-3 transition-all rounded-2xl relative",
                      showPinned ? "bg-primary-accent/20 text-primary-accent" : "text-white/20 hover:text-white/60 hover:bg-white/5"
                    )}
                  >
                    <Pin className={cn("w-5 h-5", showPinned && "fill-current")} />
                    {pinnedMessages.length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-primary-accent rounded-full border-2 border-surface-container" />
                    )}
                  </button>
                  <button className="p-2.5 md:p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Pinned Messages Panel */}
              <PinnedMessagesPanel
                isOpen={showPinned}
                onClose={() => setShowPinned(false)}
                pinnedMessages={pinnedMessages}
                participants={resolvedParticipants}
                onJumpToMessage={(messageId) => {
                  setHighlightedMessageId(messageId);
                  // Optional: Close panel on jump? Usually better to keep open if user wants to see others.
                  // For now keep it open.
                }}
              />

              {/* Messages */}
              <ChatWindow
                conversationId={activeConvId}
                messages={messages}
                participants={resolvedParticipants}
                currentUserId={currentUserId}
                loading={loadingMessages}
                highlightedMessageId={highlightedMessageId}
                onReply={setReplyTo}
              />

              {/* Search Panel */}
              <SearchPanel
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
                conversationId={activeConvId}
                onJumpToMessage={(messageId) => {
                  setHighlightedMessageId(messageId);
                  setShowSearch(false);
                  // Clear highlight after 3 seconds
                  setTimeout(() => {
                    setHighlightedMessageId(null);
                  }, 3000);
                }}
              />

              {/* AI suggestion bar */}
              {aiSuggestion && (
                <div className="mx-6 mb-2 p-4 bg-primary-accent/10 border border-primary-accent/20 rounded-2xl flex items-start gap-4 animate-in slide-in-from-bottom-2">
                  <div className="shrink-0 p-2 bg-primary-accent/20 rounded-xl">
                    <Sparkles className="w-4 h-4 text-primary-accent" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-bold text-primary-accent uppercase tracking-widest">
                      AI Response Suggestion
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed italic">
                      "{aiSuggestion}"
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={useAiSuggestion}
                        className="px-3 py-1.5 bg-primary-accent text-on-primary-fixed text-[10px] font-bold uppercase rounded-lg hover:bg-primary-accent/80 transition-colors"
                      >
                        Use This Response
                      </button>
                      <button
                        onClick={() => setAiSuggestion(null)}
                        className="px-3 py-1.5 bg-white/5 text-white/40 text-[10px] font-bold uppercase rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input + AI trigger */}
              <div className="relative group">
                <MessageInput
                  onSendMessage={onSendMessage}
                  onTyping={handleTyping}
                  isSending={isSending}
                  isOtherTyping={isOtherTyping}
                  replyTo={replyTo}
                  onClearReply={() => setReplyTo(null)}
                />
                <div className="absolute right-24 md:right-32 bottom-8 md:bottom-10 flex items-center">
                  <button
                    onClick={handleAiSuggest}
                    disabled={isAiLoading || messages.length === 0}
                    className={cn(
                      'p-2 rounded-xl transition-all active:scale-95 group/ai',
                      isAiLoading
                        ? 'animate-pulse bg-primary-accent/20'
                        : 'hover:bg-white/5'
                    )}
                    title="Suggest AI Response"
                  >
                    <Wand2
                      className={cn(
                        'w-5 h-5',
                        isAiLoading
                          ? 'text-primary-accent'
                          : 'text-white/20 group-hover/ai:text-primary-accent'
                      )}
                    />
                  </button>
                </div>
              </div>
            </>
          ) : showDirectory ? (
            /* ✅ FIX: directory renders in right panel on desktop */
            <div className="flex-1 overflow-hidden">
              <DirectoryList
                schoolId={schoolId}
                onSelectConversation={handleSelectConversation}
                onBack={() => setShowDirectory(false)}
                existingConversations={conversations}
                currentUserId={currentUserId}
              />
            </div>
          ) : showGroupInitiation ? (
            /* Group initiation renders in right panel on desktop */
            <div className="flex-1 overflow-hidden">
              <GroupInitiation
                schoolId={schoolId}
                currentUserId={currentUserId}
                classes={classes}
                onBack={() => setShowGroupInitiation(false)}
                onSuccess={handleSelectConversation}
                godMode={godMode}
              />
            </div>
          ) : showSaved ? (
            <div className="flex-1 overflow-hidden">
              <SavedMessagesView
                onBack={() => {
                  setShowSaved(false);
                  setShowMobileList(true);
                }}
                onJumpToConversation={(convId, msgId) => {
                  setActiveConvId(convId);
                  setHighlightedMessageId(msgId);
                  setShowSaved(false);
                }}
                currentUserId={currentUserId}
                contactMap={contactMap}
              />
            </div>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
              <div className="relative">
                <div
                  className={cn(
                    'absolute -inset-4 blur-2xl opacity-10 rounded-full',
                    godMode ? 'bg-secondary-accent' : 'bg-primary-accent'
                  )}
                />
                <div className="relative w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                  <LayoutDashboard className={cn('w-10 h-10', accentColor)} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white/90">Select a conversation</h3>
                <p className="text-sm text-white/40 max-w-xs mx-auto">
                  Choose a contact from the left panel or open the school directory to start communicating.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowGroupInitiation(true);
                    setShowDirectory(false);
                    setShowSaved(false);
                  }}
                  className="px-8 py-3.5 bg-primary-accent text-on-primary-fixed rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-accent/90 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn min-w-[180px] shadow-xl shadow-primary-accent/20"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Group Message
                </button>
                <button
                  onClick={() => setShowDirectory(true)}
                  className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn min-w-[180px]"
                >
                  <Users
                    className={cn(
                      'w-4 h-4 transition-colors',
                      godMode
                        ? 'group-hover/btn:text-secondary-accent'
                        : 'group-hover/btn:text-primary-accent'
                    )}
                  />
                  Open Directory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}