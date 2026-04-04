import React, { useState, useMemo } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import { useConversations, useMessages, useTyping } from '@/lib/hooks/useMessaging';
import { MessagingAgent } from '@/lib/ai/messaging-agent';
import { Participant } from '@/lib/types/messaging';
import { Menu, User, Phone, Video, Search, MoreHorizontal, ArrowLeft, LayoutDashboard, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessagingSectionProps {
  currentUserId: string;
  godMode?: boolean;
}

export default function MessagingSection({
  currentUserId,
  godMode = false,
}: MessagingSectionProps) {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { conversations, loading: loadingConvs, refresh: refreshConvs } = useConversations();
  const { messages, loading: loadingMessages, isSending, sendMessage } = useMessages(activeConvId);
  const { isTyping: isOtherTyping, handleTyping } = useTyping(activeConvId);

  const activeConversation = useMemo(() =>
    conversations.find(c => c.id === activeConvId),
  [conversations, activeConvId]);

  const otherParticipant = useMemo(() => {
    if (!activeConversation) return null;
    return activeConversation.participants.find(p => p.id !== currentUserId) || activeConversation.participants[0];
  }, [activeConversation, currentUserId]);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setShowMobileList(false);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  const onSendMessage = async (content: string) => {
    if (!activeConvId) return;
    try {
      await sendMessage(content, currentUserId);
      setAiSuggestion(null);
      refreshConvs(); // Refresh list to update last message/timestamp
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleAiSuggest = async () => {
    if (!activeConvId || messages.length === 0) return;

    setIsAiLoading(true);
    try {
      const lastMsg = messages[messages.length - 1].content;
      const context = messages.slice(-5).map(m => m.content).join('\n');

      const insight = await MessagingAgent.suggestResponse(context, lastMsg);
      setAiSuggestion(insight.metadata?.suggestedText || insight.message);
    } catch (err) {
      console.error('AI Suggestion error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const useAiSuggestion = () => {
    if (aiSuggestion) {
      onSendMessage(aiSuggestion);
    }
  };

  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';
  const accentBorder = godMode ? 'border-secondary-accent/20' : 'border-primary-accent/20';

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[700px] bg-surface-container/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">

      {/* Background Glow */}
      <div className={cn(
        "absolute -top-32 -left-32 w-64 h-64 blur-[120px] opacity-10 pointer-events-none transition-all duration-1000",
        godMode ? "bg-secondary-accent" : "bg-primary-accent"
      )}></div>

      <div className="flex h-full relative z-10">

        {/* Left Panel - Conversation List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col md:relative transition-all duration-300",
          !showMobileList && "hidden md:flex"
        )}>
           <ConversationList
             conversations={conversations}
             activeConversationId={activeConvId}
             onSelectConversation={handleSelectConversation}
             currentUserId={currentUserId}
           />
        </div>

        {/* Right Panel - Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          showMobileList && "hidden md:flex"
        )}>
          {activeConvId ? (
            <>
              {/* Chat Header */}
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
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-4 border-surface-container"></span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-white/90 text-sm md:text-base truncate">
                      {activeConversation?.title || otherParticipant?.name}
                    </h3>
                    <p className="text-[10px] md:text-[11px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                      {otherParticipant?.online_status === 'online' ? (
                        <>
                           <span className="w-1 h-1 rounded-full bg-green-500"></span>
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
                  <button className="p-2.5 md:p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all">
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 md:p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <ChatWindow
                messages={messages}
                participants={activeConversation?.participants || []}
                currentUserId={currentUserId}
                loading={loadingMessages}
              />

              {/* AI Suggestion Bar */}
              {aiSuggestion && (
                <div className="mx-6 mb-2 p-4 bg-primary-accent/10 border border-primary-accent/20 rounded-2xl flex items-start gap-4 animate-in slide-in-from-bottom-2">
                   <div className="shrink-0 p-2 bg-primary-accent/20 rounded-xl">
                      <Sparkles className="w-4 h-4 text-primary-accent" />
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold text-primary-accent uppercase tracking-widest">AI Response Suggestion</p>
                      <p className="text-sm text-white/80 leading-relaxed italic">"{aiSuggestion}"</p>
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

              {/* Chat Input */}
              <div className="relative group">
                <MessageInput
                  onSendMessage={onSendMessage}
                  onTyping={handleTyping}
                  isSending={isSending}
                  isOtherTyping={isOtherTyping}
                />

                {/* AI Trigger Button */}
                <div className="absolute right-24 md:right-32 bottom-8 md:bottom-10 flex items-center">
                   <button
                     onClick={handleAiSuggest}
                     disabled={isAiLoading || messages.length === 0}
                     className={cn(
                       "p-2 rounded-xl transition-all active:scale-95 group/ai",
                       isAiLoading ? "animate-pulse bg-primary-accent/20" : "hover:bg-white/5"
                     )}
                     title="Suggest AI Response"
                   >
                     <Wand2 className={cn("w-5 h-5", isAiLoading ? "text-primary-accent" : "text-white/20 group-hover/ai:text-primary-accent")} />
                   </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
               <div className="relative">
                 <div className={cn("absolute -inset-4 blur-2xl opacity-10 rounded-full", godMode ? "bg-secondary-accent" : "bg-primary-accent")}></div>
                 <div className="relative w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                    <LayoutDashboard className={cn("w-10 h-10", accentColor)} />
                 </div>
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-black text-white/90">Select a conversation</h3>
                 <p className="text-sm text-white/40 max-w-xs mx-auto">
                    Choose a contact from the left panel to start communicating with parents and faculty.
                 </p>
               </div>
               <button
                 onClick={() => {/* Open new conversation modal */}}
                 className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
               >
                 New Message
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
