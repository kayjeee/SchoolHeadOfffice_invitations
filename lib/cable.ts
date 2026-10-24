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
    if (consumer && email && currentEmail !== email) {
      console.log(`🔌 [ActionCable] Email changed from ${currentEmail} to ${email}, reconnecting...`);
      disconnectCable();
    }

    if (consumer) return consumer;

    // Surgical require to avoid silent crashes during import phase
    const ActionCable = require('@rails/actioncable');
    if (!ActionCable || !ActionCable.createConsumer) {
      throw new Error('ActionCable module could not be loaded');
    }

    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

    // Bulletproof URL construction:
    // Strip trailing /api/v1 or similar suffixes, then append /cable
    const wsBase = base
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/$/, '')
      .replace(/^http/, 'ws');

    const cableUrl = (email && email.trim() !== '')
      ? `${wsBase}/cable?user_email=${encodeURIComponent(email)}`
      : `${wsBase}/cable`;

    console.log(`🔌 [ActionCable] Connecting to: ${cableUrl}`);
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
