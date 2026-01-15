export const CHANNELS = [
  { id: "email", name: "Email", icon: "📧", description: "Send via email" },
  { id: "sms", name: "SMS", icon: "💬", description: "Send text messages" },
  { id: "whatsapp", name: "WhatsApp", icon: "💚", description: "Send via WhatsApp" },
  { id: "portal", name: "School Portal", icon: "🏫", description: "Notify in school portal" },
];

import { API_CONFIG } from '../../../../../../lib/config/api';

export const API_BASE_URL = API_CONFIG.CLIENT_API_BASE;
