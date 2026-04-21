import React, { useState, useEffect } from 'react';
import { SchoolAPI } from '@/lib/api/school-api';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { Participant } from '@/lib/types/messaging';
import { Search, User, Shield, Users, GraduationCap, ChevronRight, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DirectoryListProps {
  schoolId: string;
  onSelectConversation: (id: string) => void;
  onBack: () => void;
}

type DirectoryData = {
  admins: Participant[];
  teachers: Participant[];
  parents: Participant[];
};

export default function DirectoryList({
  schoolId,
  onSelectConversation,
  onBack,
}: DirectoryListProps) {
  const [directory, setDirectory] = useState<DirectoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingConvId, setCreatingConvId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      const data = await SchoolAPI.getDirectory(schoolId);
      setDirectory(data);
      setLoading(false);
    };

    fetchDirectory();
  }, [schoolId]);

  const handleContactClick = async (contactId: string) => {
    setCreatingConvId(contactId);
    try {
      // Create or get existing conversation
      const conv = await MessagingAPI.createConversation([contactId], schoolId);
      onSelectConversation(conv.id);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    } finally {
      setCreatingConvId(null);
    }
  };

  const filterParticipants = (participants: Participant[]) => {
    if (!searchQuery) return participants;
    return participants.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const sections = [
    { title: 'Admins', icon: Shield, data: directory?.admins || [] },
    { title: 'Teachers', icon: GraduationCap, data: directory?.teachers || [] },
    { title: 'Parents', icon: Users, data: directory?.parents || [] },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-accent animate-spin" />
        <p className="text-sm text-white/40 font-medium">Loading directory...</p>
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
            Back
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Directory Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sections.map((section) => {
          const filteredData = filterParticipants(section.data);
          if (filteredData.length === 0) return null;

          return (
            <div key={section.title} className="py-2">
              <div className="px-6 py-2 flex items-center gap-2">
                <section.icon className="w-3.5 h-3.5 text-white/20" />
                <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  {section.title} ({filteredData.length})
                </h3>
              </div>
              <div className="space-y-1 px-2">
                {filteredData.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactClick(contact.id)}
                    disabled={creatingConvId === contact.id}
                    className="w-full p-3 flex items-center gap-4 transition-all hover:bg-white/5 rounded-2xl group"
                  >
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
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-surface-container"></span>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-bold text-white/90 truncate text-sm">
                        {contact.name}
                      </h4>
                      <p className="text-[10px] text-white/20 font-medium capitalize">
                        {contact.role}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                       {creatingConvId === contact.id ? (
                         <Loader2 className="w-4 h-4 text-primary-accent animate-spin" />
                       ) : (
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-accent/10 rounded-xl group-hover:bg-primary-accent/20 transition-all">
                            <MessageSquare className="w-3.5 h-3.5 text-primary-accent" />
                            <span className="text-[10px] font-bold text-primary-accent uppercase tracking-widest">Message</span>
                         </div>
                       )}
                       <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {sections.every(s => filterParticipants(s.data).length === 0) && (
          <div className="p-8 text-center">
            <p className="text-sm text-white/20 font-medium">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
