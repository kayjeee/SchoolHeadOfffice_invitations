// lib/utils/analytics.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }
  },
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
        ...traits,
      });
    }
  },
};
