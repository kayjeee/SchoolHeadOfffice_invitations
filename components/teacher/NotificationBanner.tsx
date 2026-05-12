import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import OneSignal from 'react-onesignal';

export default function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if notifications are already enabled or blocked
    const checkNotificationStatus = async () => {
      if (typeof window !== 'undefined') {
        const permission = Notification.permission;
        // In react-onesignal v3+, use User.PushSubscription.optedIn
        const isSubscribed = OneSignal.User?.PushSubscription?.optedIn ?? false;

        if (permission === 'default' && !isSubscribed) {
          setShowBanner(true);
        }
      }
    };

    checkNotificationStatus();
  }, []);

  const handleRequestPermission = async () => {
    try {
      // Trigger OneSignal slide prompt (react-onesignal v3+)
      await OneSignal.Slidedown.promptPush();
      setShowBanner(false);
    } catch (error) {
      console.error('❌ [NotificationBanner] Error requesting permission:', error);

      // Fallback to standard API if OneSignal prompt fails
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setShowBanner(false);
        }
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface-container border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-primary-accent/10 rounded-xl">
            <Bell className="w-5 h-5 text-primary-accent" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold text-white/90">Turn on Notifications</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Stay updated on new messages and classroom alerts even when you're away.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-white text-surface text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition-all active:scale-95"
              >
                Enable
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 text-white/20 hover:text-white/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
