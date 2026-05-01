import React, { useState } from 'react';
import { Participant } from '@/lib/types/messaging';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { User, X, UserPlus, UserMinus, Shield, GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mutate } from 'swr';

interface GroupInfoPanelProps {
  conversationId: string;
  participants: Participant[];
  currentUserId: string;
  onClose: () => void;
  schoolId: string;
  directory: {
    admins: Participant[];
    teachers: Participant[];
    parents: Participant[];
  } | null;
}

export default function GroupInfoPanel({
  conversationId,
  participants,
  currentUserId,
  onClose,
  schoolId,
  directory,
}: GroupInfoPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const participantIds = new Set(participants.map(p => p.id.toString()));

  const handleAddParticipant = async (participantId: string) => {
    setIsUpdating(true);
    try {
      const newParticipantIds = [...Array.from(participantIds), participantId];
      await MessagingAPI.updateParticipants(conversationId, newParticipantIds);
      await mutate('/api/v1/conversations');
      // No need to manually update resolvedParticipants if MessagingSection re-renders on conversations change
    } catch (err) {
      console.error('Failed to add participant:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (participantId === currentUserId) return; // Don't remove self from here
    setIsUpdating(true);
    try {
      const newParticipantIds = Array.from(participantIds).filter(id => id !== participantId);
      await MessagingAPI.updateParticipants(conversationId, newParticipantIds);
      await mutate('/api/v1/conversations');
    } catch (err) {
      console.error('Failed to remove participant:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const allContacts = directory
    ? [...directory.admins, ...directory.teachers, ...directory.parents]
    : [];

  const availableContacts = allContacts.filter(
    contact => !participantIds.has(contact.id.toString()) &&
    (searchQuery === '' || contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'principal':
        return <Shield className="w-3 h-3" />;
      case 'teacher':
        return <GraduationCap className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  return (
    <div className="w-80 border-l border-white/5 bg-surface-container flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-bold text-white/90">Conversation Info</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-white/40 hover:text-white/80">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Members List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              Members ({participants.length})
            </h4>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="p-1.5 bg-primary-accent/10 text-primary-accent rounded-lg hover:bg-primary-accent/20 transition-colors"
              title="Add Member"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {showAddMember && (
            <div className="space-y-3 p-3 bg-white/5 rounded-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-200">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-primary-accent/50 transition-all"
              />
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                {availableContacts.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-2">No contacts found</p>
                ) : (
                  availableContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleAddParticipant(contact.id.toString())}
                      disabled={isUpdating}
                      className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                    >
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} className="w-6 h-6 rounded-lg object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-xs text-white/60 group-hover:text-white/90 truncate flex-1 text-left">
                        {contact.name}
                      </span>
                      <UserPlus className="w-3 h-3 text-primary-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 group">
                <div className="relative">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-xl object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  {p.online_status === 'online' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-surface-container" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/90 truncate">
                    {p.id.toString() === currentUserId ? 'You' : p.name}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-white/20 uppercase tracking-tight">
                    {getRoleIcon(p.role)}
                    {p.role}
                  </div>
                </div>
                {p.id.toString() !== currentUserId && (
                  <button
                    onClick={() => handleRemoveParticipant(p.id.toString())}
                    disabled={isUpdating}
                    className="p-1.5 text-white/0 group-hover:text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Remove from group"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for future features like shared media, settings, etc */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest text-center">
            More features coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
