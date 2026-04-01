'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Send,
  User,
  Users,
  MessageSquare,
  Search,
  Bot,
  CheckCheck,
  Clock,
  AlertCircle,
  MoreVertical,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Conversation, Message, AgentResponse } from '@/lib/types/messaging';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessagingSectionProps {
  schoolId: string;
  currentUserId: string;
  godMode?: boolean;
}

export default function MessagingSection({ schoolId, currentUserId, godMode = false }: MessagingSectionProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [agentSuggestion, setAgentSuggestion] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [potentialParticipants, setPotentialParticipants] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';
  const accentBg = godMode ? 'bg-secondary-accent/10' : 'bg-primary-accent/10';
  const accentBorder = godMode ? 'border-secondary-accent/20' : 'border-primary-accent/20';
  const accentBtn = godMode ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-primary-fixed text-on-primary-fixed';

  useEffect(() => {
    fetchConversations();
  }, [schoolId]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);

      // Auto-mark as read
      markAsRead(activeConversation.id);

      // Implement polling for real-time feel (every 5 seconds)
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id, true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const markAsRead = async (convId: string) => {
    try {
      await fetch(`/api/v1/messaging/messages?conversationId=${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' })
      });
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewMessage = async () => {
    setIsCreating(true);
    // Fetch teachers/staff in the school to start a chat
    try {
      // This is a simplified lookup for the sandbox
      const res = await fetch(`/api/v1/schools/${schoolId}/teachers`);
      // Fallback for non-existent endpoint in sandbox or different structure
      if (res.ok) {
        const data = await res.json();
        setPotentialParticipants(data || []);
      } else {
        // Mocked participants if API fails
        setPotentialParticipants([
           { id: 'principal_1', name: 'Principal Williams', role: 'principal' },
           { id: 'teacher_2', name: 'Mr. Dlamini', role: 'teacher' }
        ]);
      }
    } catch (err) {
      setPotentialParticipants([
         { id: 'principal_1', name: 'Principal Williams', role: 'principal' }
      ]);
    }
  };

  const createConversation = async (participant: any) => {
    try {
      const res = await fetch(`/api/v1/messaging/conversations?schoolId=${schoolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participants: [
            { id: currentUserId, name: 'You', role: 'teacher' },
            { id: participant.id, name: participant.name, role: participant.role }
          ]
        })
      });
      if (res.ok) {
        const { conversationId } = await res.json();
        await fetchConversations();
        setIsCreating(false);
        // Find and activate the new conversation
        // Note: fetchConversations is async, so we might need to find it from the new state
      }
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/v1/messaging/conversations?schoolId=${schoolId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (convId: string, isPoll = false) => {
    try {
      const res = await fetch(`/api/v1/messaging/messages?conversationId=${convId}`);
      if (res.ok) {
        // Fetch typing status for other participants (mock API response for this iteration)
        // In reality, this would be a separate API or part of the messages metadata
        const typingRes = await fetch(`/api/v1/messaging/agent?conversationId=${convId}&checkTyping=true`);
        if (typingRes.ok) {
          const { isTyping: otherTyping } = await typingRes.json().catch(() => ({ isTyping: false }));
          setOtherUserTyping(!!otherTyping);
        }

        const data = await res.json();
        const reversed = data.reverse();

        // Update state if new messages or status changed
        setMessages(prev => {
           const hasChanges = prev.length !== reversed.length ||
                              prev.some((m, i) => m.status !== reversed[i]?.status);

           if (!hasChanges) return prev;

           // Notify if new message from others
           const lastNew = reversed[reversed.length - 1];
           if (isPoll && lastNew && lastNew.senderId !== currentUserId) {
             toast.success(`New message in ${activeConversation?.metadata?.groupName || 'this chat'}`);
           }

           return reversed;
        });

        if (!isPoll) scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const updateTypingStatus = async (typing: boolean) => {
    if (!activeConversation) return;
    try {
      await fetch(`/api/v1/messaging/messages?conversationId=${activeConversation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'typing', isTyping: typing })
      });
    } catch (err) {
      console.error('Failed to update typing status', err);
    }
  };

  const handleTyping = (content: string) => {
    setNewMessage(content);

    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    if (typingTimer) clearTimeout(typingTimer);

    const timer = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);

    setTypingTimer(timer);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const content = newMessage;
    setNewMessage('');
    setAgentSuggestion(null);

    // Optimistic update
    const tempMsg: Message = {
      id: Date.now().toString(),
      conversationId: activeConversation.id,
      senderId: currentUserId,
      content,
      type: 'text',
      status: 'sent',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      // 1. Send actual message
      await fetch(`/api/v1/messaging/messages?conversationId=${activeConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      // 2. Ask Agent for analysis/suggestions
      const agentRes = await fetch(`/api/v1/messaging/agent?schoolId=${schoolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (agentRes.ok) {
        const agentData: AgentResponse = await agentRes.json();
        if (agentData.suggestions.length > 0 || agentData.type === 'alert' || agentData.recipients.length > 0) {
          setAgentSuggestion(agentData);
        }
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center text-white/20">Loading conversations...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
      {/* Conversations List */}
      <div className="lg:col-span-4 bg-surface-container rounded-3xl border border-white/5 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className={cn("w-3.5 h-3.5", accentColor)} />
              Messages
            </h3>
            <button onClick={startNewMessage} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <Plus className="w-4 h-4 text-white/40" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-white/10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isCreating ? (
            <div className="space-y-1">
              <div className="px-3 py-2 flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Select Recipient</span>
                <button onClick={() => setIsCreating(false)} className="text-[10px] font-bold text-red-400 uppercase">Cancel</button>
              </div>
              {potentialParticipants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => createConversation(p)}
                  className="w-full p-3 rounded-2xl hover:bg-white/5 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-bold uppercase text-xs">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white/80">{p.name}</h4>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest">{p.role}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-white/20 text-xs italic">No active conversations</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={cn(
                  "w-full p-3 rounded-2xl transition-all flex items-center gap-3 group text-left",
                  activeConversation?.id === conv.id ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:border-white/10">
                  {conv.type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-sm font-bold text-white/80 truncate">
                      {conv.type === 'group' ? conv.metadata?.groupName : conv.participants.find(p => p.id !== currentUserId)?.name || 'Direct Chat'}
                    </h4>
                    <span className="text-[10px] text-white/20">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate">
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-8 bg-surface-container rounded-3xl border border-white/5 overflow-hidden flex flex-col relative">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40">
                  {activeConversation.type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">
                    {activeConversation.type === 'group' ? activeConversation.metadata?.groupName : activeConversation.participants.find(p => p.id !== currentUserId)?.name}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/60"></span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <MoreVertical className="w-5 h-5 text-white/20" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.senderId === currentUserId ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm",
                    msg.senderId === currentUserId
                      ? "bg-white/10 text-white/90 rounded-tr-none"
                      : "bg-surface-container-high text-white/80 border border-white/5 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-white/20 uppercase font-bold">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.senderId === currentUserId && (
                      msg.status === 'read'
                        ? <CheckCheck className="w-3 h-3 text-green-500/40" />
                        : <Clock className="w-3 h-3 text-white/20" />
                    )}
                  </div>
                </div>
              ))}
              {otherUserTyping && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/20 animate-pulse" />
                  </div>
                  <div className="px-3 py-2 bg-white/5 rounded-xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Agent Suggestions overlay */}
            {agentSuggestion && (
              <div className="px-6 py-3 bg-indigo-500/10 border-t border-indigo-500/20 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Sentinel Suggestion</p>
                    <div className="flex flex-wrap gap-2">
                      {agentSuggestion.target === 'group' && agentSuggestion.recipients.length > 0 && (
                        <div className="w-full mb-1">
                          <span className="text-[9px] font-bold text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            Targets: {agentSuggestion.metadata?.grade || agentSuggestion.recipients.length + ' recipients'}
                          </span>
                        </div>
                      )}
                      {agentSuggestion.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setNewMessage(s)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white/60 hover:bg-white/10 hover:text-white/90 transition-all font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setAgentSuggestion(null)} className="text-white/20 hover:text-white/40">
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-surface-container border-t border-white/5">
              <div className="relative flex items-center gap-2 p-1 pl-4 rounded-2xl bg-white/5 border border-white/5 focus-within:border-white/10 transition-all">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 placeholder:text-white/20 text-white/80"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "p-2.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-20",
                    accentBtn
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
             <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-white/10">
               <MessageSquare className="w-10 h-10" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-white/90 mb-1">Select a Conversation</h3>
               <p className="text-sm text-white/40 max-w-xs">Choose a chat from the left to start messaging with parents, principals, or staff.</p>
             </div>
             <button
               onClick={startNewMessage}
               className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95", accentBtn)}
              >
               New Message
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
