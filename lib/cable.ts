import type { Consumer } from '@rails/actioncable';

let consumer: Consumer | null = null;

/**
 * Get or create the singleton Action Cable consumer.
 * Includes a "Safety wrapper" to prevent crashes during SSR or if the package is missing.
 * The import is handled surgically inside the function to avoid top-level resolution issues.
 */
export const getCableConsumer = (email?: string): Consumer | null => {
  if (typeof window === 'undefined') return null;

  try {
    if (consumer) return consumer;

    // Surgical require to avoid silent crashes during import phase
    const ActionCable = require('@rails/actioncable');
    if (!ActionCable || !ActionCable.createConsumer) {
      throw new Error('ActionCable module could not be loaded');
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

    // Robust URL construction
    let wsUrl: string;
    if (baseUrl.includes('/api/v1')) {
      wsUrl = baseUrl.replace(/^http/, 'ws').replace(/\/api\/v1$/, '/cable');
    } else {
      wsUrl = `${baseUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/cable`;
    }

    const cableUrl = email
      ? `${wsUrl}?user_email=${encodeURIComponent(email)}`
      : wsUrl;

    console.log(`🔌 [ActionCable] Connecting to ${cableUrl}`);
    consumer = ActionCable.createConsumer(cableUrl);
    return consumer;
  } catch (error) {
    console.error('❌ [ActionCable] Safety Wrapper caught initialization error:', error);
    return null;
  }
};

/**
 * Cleanup the consumer
 */
export const disconnectCable = () => {
  if (consumer) {
    consumer.disconnect();
    consumer = null;
  }
};
