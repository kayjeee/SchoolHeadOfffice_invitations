// services/WhatsAppBusinessService.js
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

class WhatsAppBusinessService {
  constructor() {
    this.baseURL = '/api/whatsapp-business';
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  /**
   * 🔹 Create an invitation to generate a token
   */
  async createInvitation({ phoneNumber, schoolId, userEmail }) {
    try {
      console.log('🎯 [createInvitation] Starting with:', { 
        phoneNumber, 
        schoolId,
        userEmail 
      });

      if (!schoolId) {
        throw new Error('schoolId is required to create invitation');
      }

      if (!phoneNumber) {
        throw new Error('phoneNumber is required to create invitation');
      }

      const payload = {
        phone_number: phoneNumber,
        school: schoolId,
        role: 'parent',
      };

      console.log('📤 [createInvitation] Sending to invitations API:', payload);

      const response = await fetch(this.invitationsURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 [createInvitation] Response:', { 
        status: response.status, 
        data 
      });

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to create invitation`);
      }

      if (!data.success) {
        throw new Error(data.message || 'API returned success: false');
      }

      const token = data.invitation?.token || data.token;
      if (!token) {
        throw new Error('No token received in invitation response');
      }

      console.log('✅ [createInvitation] Token created successfully');
      return token;
    } catch (error) {
      console.error('❌ [createInvitation] Error:', error.message);
      throw error;
    }
  }

  /**
   * 🔹 Compose final WhatsApp message with magic link
   */
  buildMagicLinkMessage({ schoolName, gradeName, magicLink }) {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    const supportEmail = `support@${domain}.com`;

    const message = `🏫 ${schoolName} Parent Portal Invitation

Dear Parent,

You're invited to join our secure parent communication portal for ${gradeName}.

✅ Get real-time updates about your child's progress
✅ Receive important announcements instantly
✅ Connect with teachers directly
✅ Access school resources and calendar

🔗 Join now: ${magicLink}

For support, WhatsApp us at this number or email ${supportEmail}

Best wishes,
${schoolName} Admin Team`;

    console.log('📝 [buildMagicLinkMessage] Built message:', {
      schoolName,
      gradeName,
      magicLinkLength: magicLink?.length,
      messageLength: message.length
    });

    return message;
  }

  /**
   * 🔹 Validate message before sending
   */
  validateMessageTemplate(message) {
    if (typeof message !== 'string') {
      throw new Error('Message must be a string');
    }

    const validations = [
      {
        check: message.length > 0,
        error: 'Message cannot be empty',
      },
      {
        check: message.length <= 4096,
        error: `Message exceeds maximum length of 4096 characters (current: ${message.length})`,
      }
    ];

    for (const validation of validations) {
      if (!validation.check) {
        throw new Error(validation.error);
      }
    }

    console.log('✅ [validateMessageTemplate] Message validation passed');
    return true;
  }

  /**
   * 🔹 Build magic link from token and school name
   */
  buildMagicLink({ token, schoolName }) {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    const magicLink = `https://portal.${domain}.com/join?token=${token}`;
    console.log('🔗 [buildMagicLink] Generated:', magicLink);
    return magicLink;
  }

  /**
   * 🔹 Send a single test message
   */
  async sendTestMessage({ to, schoolName, grade, schoolId, userEmail }) {
    try {
      console.log('🚀 [sendTestMessage] Starting with:', {
        to,
        schoolName,
        schoolId,
        grade: grade?.name
      });

      // Validate inputs
      if (!to || !schoolName || !schoolId) {
        throw new Error('Missing required fields: to, schoolName, and schoolId are required');
      }

      // 1️⃣ Create token first
      const token = await this.createInvitation({
        phoneNumber: to,
        schoolId,
        userEmail,
      });

      // 2️⃣ Build dynamic link
      const magicLink = this.buildMagicLink({ token, schoolName });

      // 3️⃣ Build the message body
      const message = this.buildMagicLinkMessage({
        schoolName,
        gradeName: grade?.name || 'your child\'s class',
        magicLink,
      });

      // 4️⃣ Validate message
      this.validateMessageTemplate(message);

      console.log('📤 [sendTestMessage] Prepared message details:', {
        to,
        messageLength: message.length,
        magicLink,
        hasToken: !!token
      });

      // 5️⃣ Send the test message as TEXT
      const payload = {
        to: to,
        message: message,
        schoolName,
        magicLink,
        grade: grade?.name,
      };

      console.log('🎯 [sendTestMessage] Sending to API endpoint');

      const response = await fetch(`${this.baseURL}/test-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('📥 [sendTestMessage] API Response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send test message`);
      }

      console.log('✅ [sendTestMessage] Success!', { 
        messageId: data.messageId,
        type: data.type || 'text'
      });

      return {
        ...data,
        magicLink,
        token
      };
    } catch (error) {
      console.error('❌ [sendTestMessage] Failed:', error.message);
      throw error;
    }
  }

  /**
   * 🔹 Send bulk messages with personalized links
   */
  async sendBulkMessages({ gradeIds, schoolName, recipientNumbers, schoolId, userEmail }) {
    try {
      console.log('🚀 [sendBulkMessages] Starting bulk send:', {
        recipientCount: recipientNumbers.length,
        schoolName,
        schoolId
      });

      // Validate inputs
      if (!schoolId || !schoolName) {
        throw new Error('schoolId and schoolName are required for bulk messages');
      }

      if (!recipientNumbers || recipientNumbers.length === 0) {
        throw new Error('recipientNumbers cannot be empty');
      }

      const personalizedMessages = [];
      const errors = [];

      // Generate individual tokens and messages per recipient
      for (let i = 0; i < recipientNumbers.length; i++) {
        const number = recipientNumbers[i];

        try {
          console.log(`🔄 [sendBulkMessages] Processing ${i + 1}/${recipientNumbers.length}: ${number}`);

          const token = await this.createInvitation({
            phoneNumber: number,
            schoolId,
            userEmail,
          });

          const magicLink = this.buildMagicLink({ token, schoolName });
          const message = this.buildMagicLinkMessage({
            schoolName,
            gradeName: 'your child\'s class',
            magicLink,
          });

          // Validate each message
          this.validateMessageTemplate(message);

          personalizedMessages.push({
            to: number,
            message,
            magicLink,
            token
          });

          // Small delay to avoid overwhelming the API
          if (i < recipientNumbers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (error) {
          console.error(`❌ [sendBulkMessages] Failed for ${number}:`, error.message);
          errors.push({
            phoneNumber: number,
            error: error.message
          });
        }
      }

      if (errors.length > 0) {
        console.warn(`⚠️ [sendBulkMessages] ${errors.length} invitations failed during generation`);
      }

      if (personalizedMessages.length === 0) {
        throw new Error('No messages could be generated. All invitations failed.');
      }

      console.log(`📤 [sendBulkMessages] Sending ${personalizedMessages.length} messages to bulk endpoint`);

      const response = await fetch(`${this.baseURL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          gradeIds,
          schoolName,
          schoolId,
          campaignType: 'MAGIC_LINK_INVITES',
          personalizedMessages,
          totalRecipients: personalizedMessages.length,
          failedDuringGeneration: errors.length,
        }),
      });

      const data = await response.json();

      console.log('📥 [sendBulkMessages] Bulk API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send bulk messages`);
      }

      return {
        ...data,
        generationErrors: errors,
        totalProcessed: personalizedMessages.length + errors.length
      };
    } catch (error) {
      console.error('❌ [sendBulkMessages] Failed:', error.message);
      throw error;
    }
  }

  /**
   * 🔹 Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    const cleaned = phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(cleaned);
  }

  /**
   * 🔹 Format phone number consistently
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\s+/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  /**
   * 🔹 Quick health check for WhatsApp service
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return {
        healthy: response.ok,
        ...data
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * 🔹 Schedule bulk messages with personalized links
   */
  async scheduleBulkMessage(data) {
    // TODO: Implement scheduling logic
    console.log('Scheduling bulk message with data:', data);
    return Promise.resolve({ success: true, message: 'Scheduling not implemented yet' });
  }

  /**
   * 🔹 Validate message template
   */
  validateMessageTemplate(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message content is invalid');
    }
    if (message.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (message.length > 4096) {
      throw new Error('Message content is too long');
    }
  }
}

export default new WhatsAppBusinessService();
