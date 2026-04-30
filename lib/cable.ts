import type { Consumer } from '@rails/actioncable';

let consumer: Consumer | null = null;
let currentEmail: string | undefined = undefined;

/**
 * Get or create the singleton Action Cable consumer.
 * Includes a "Safety wrapper" to prevent crashes during SSR or if the package is missing.
 * The import is handled surgically inside the function to avoid top-level resolution issues.
 */
export const getCableConsumer = (email?: string): Consumer | null => {
  if (typeof window === 'undefined') return null;

  try {
    // If email changed, disconnect existing consumer to re-establish with new identity
    if (consumer && currentEmail !== email) {
      console.log(`🔌 [ActionCable] Email changed from ${currentEmail} to ${email}, reconnecting...`);
      disconnectCable();
    }

    if (consumer) return consumer;

    // Surgical require to avoid silent crashes during import phase
    const ActionCable = require('@rails/actioncable');
    if (!ActionCable || !ActionCable.createConsumer) {
      throw new Error('ActionCable module could not be loaded');
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

    // Robust URL construction to ensure it targets the /cable endpoint
    let wsUrl: string;
    const base = baseUrl.replace(/\/$/, ''); // Remove trailing slash

    // Replace http/https with ws/wss
    const wsProtocol = base.startsWith('https') ? 'wss' : 'ws';
    const baseWithoutProtocol = base.replace(/^https?:\/\//, '');

    // Ensure it hits /cable and not the root or /api/v1
    if (baseWithoutProtocol.includes('/api/v1')) {
      wsUrl = `${wsProtocol}://${baseWithoutProtocol.replace(/\/api\/v1(\/|$)/, '/cable')}`;
    } else {
      // If it doesn't have /api/v1, just append /cable but avoid double slashes
      const cleanedBase = baseWithoutProtocol.replace(/\/$/, '');
      wsUrl = `${wsProtocol}://${cleanedBase}/cable`;
    }

    // Add user_email as query param if provided
    const cableUrl = (email && email.trim() !== '')
      ? `${wsUrl}?user_email=${encodeURIComponent(email)}`
      : wsUrl;

    console.log(`🔌 [ActionCable] Connecting to ${cableUrl}`);
    consumer = ActionCable.createConsumer(cableUrl);
    currentEmail = email;
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
    currentEmail = undefined;
  }
};
