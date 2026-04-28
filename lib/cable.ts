import { createConsumer, Consumer } from '@rails/actioncable';

let consumer: Consumer | null = null;
let currentEmail: string | null = null;

/**
 * Returns a singleton ActionCable consumer.
 * Recreates the consumer if the user email changes.
 */
export const getCable = (userEmail: string): Consumer => {
  if (typeof window === 'undefined') {
    // ActionCable requires a browser environment
    return null as any;
  }

  // If we already have a consumer for this email, return it
  if (consumer && currentEmail === userEmail) {
    return consumer;
  }

  // If email changed or first time, disconnect old consumer if exists
  if (consumer) {
    try {
      consumer.disconnect();
    } catch (e) {
      console.error('Error disconnecting old cable consumer:', e);
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shobackendv2-production.up.railway.app/api/v1';

  // Strip /api/v1 and trailing slash to get the base domain
  const baseUrl = envUrl.split('/api/v1')[0].replace(/\/$/, '');

  // Convert http/https to ws/wss
  const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  const wsHost = baseUrl.replace(/^https?:\/\//, '');

  const cableUrl = `${wsProtocol}://${wsHost}/cable?user_email=${encodeURIComponent(userEmail)}`;

  console.log(`[Cable] Connecting to ${cableUrl}`);
  consumer = createConsumer(cableUrl);
  currentEmail = userEmail;

  return consumer;
};

/**
 * Disconnects the current consumer and clears the singleton.
 */
export const disconnectCable = () => {
  if (consumer) {
    try {
      consumer.disconnect();
    } catch (e) {
      console.error('Error disconnecting cable consumer:', e);
    }
    consumer = null;
    currentEmail = null;
  }
};
