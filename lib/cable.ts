import { createConsumer, Consumer } from '@rails/actioncable';

let consumer: Consumer | null = null;

/**
 * Get or create the singleton Action Cable consumer.
 * In development, we append the X-User-Email for identification if provided.
 */
export const getCableConsumer = (email?: string): Consumer | null => {
  if (typeof window === 'undefined') return null;
  if (consumer) return consumer;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
  // Convert http(s) to ws(s) and remove /api/v1 for the cable endpoint
  const wsUrl = baseUrl.replace(/^http/, 'ws').replace(/\/api\/v1$/, '/cable');

  const cableUrl = email
    ? `${wsUrl}?user_email=${encodeURIComponent(email)}`
    : wsUrl;

  console.log(`🔌 [ActionCable] Connecting to ${cableUrl}`);
  consumer = createConsumer(cableUrl);
  return consumer;
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
