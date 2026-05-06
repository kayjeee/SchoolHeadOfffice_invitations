import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Calendar, MessageSquare } from 'lucide-react';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { Message } from '@/lib/types/messaging';
import { cn } from '@/lib/utils';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  onJumpToMessage: (messageId: string) => void;
}

export default function SearchPanel({
  isOpen,
  onClose,
  conversationId,
  onJumpToMessage,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !conversationId) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await MessagingAPI.searchMessages(conversationId, searchQuery);
      setResults(searchResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        handleSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-surface-container border-l border-white/10 z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-accent/10 rounded-xl">
                  <Search className="w-5 h-5 text-primary-accent" />
                </div>
                <h3 className="text-lg font-bold text-white/90">Search Messages</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary-accent transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search in conversation..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary-accent/50 focus:border-primary-accent/50 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-accent/40" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/20">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">
                    {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
                  </p>
                  {results.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => onJumpToMessage(msg.id)}
                      className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-accent uppercase tracking-wider">
                          <MessageSquare className="w-3 h-3" />
                          Message
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-white/20">
                          <Calendar className="w-3 h-3" />
                          {formatDate(msg.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-2 leading-relaxed group-hover:text-white/80 transition-colors">
                        {msg.content}
                      </p>
                    </button>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                    <Search className="w-8 h-8 text-white/10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white/60">No messages found</p>
                    <p className="text-xs text-white/20">Try a different search term</p>
                  </div>
                </div>
              ) : !query ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-40">
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                    <MessageSquare className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Search history</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
