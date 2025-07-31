/**
 * TwilioService
 * 
 * Service for sending SMS and WhatsApp messages via Twilio API.
 * This is a placeholder implementation for the refactoring exercise.
 * In a real implementation, this would integrate with the Twilio SDK.
 */

class TwilioService {
  constructor(config = {}) {
    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID;
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = config.fromNumber || process.env.TWILIO_FROM_NUMBER;
    this.whatsappNumber = config.whatsappNumber || process.env.TWILIO_WHATSAPP_NUMBER;
    
    // In real implementation, initialize Twilio client here
    // this.client = twilio(this.accountSid, this.authToken);
  }

  /**
   * Send SMS message via Twilio
   * @param {Object} params
   * @param {string} params.to - Recipient phone number
   * @param {string} params.message - SMS message content
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Send result
   */
  async sendSMS({ to, message, metadata = {} }) {
    try {
      // Validate input
      if (!to || !message) {
        throw new Error('Recipient phone number and message are required');
      }

      // Format phone number (ensure it starts with +)
      const formattedTo = this.formatPhoneNumber(to);

      // Log the SMS sending attempt (placeholder for actual API call)
      console.log('TwilioService: Sending SMS', {
        to: formattedTo,
        from: this.fromNumber,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messageLength: message.length,
        metadata
      });

      // Simulate API call delay
      await this.simulateDelay(1000, 3000);

      // Simulate success/failure (90% success rate)
      if (Math.random() < 0.9) {
        const result = {
          success: true,
          messageId: `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          to: formattedTo,
          from: this.fromNumber,
          status: 'sent',
          cost: this.calculateSMSCost(message),
          timestamp: new Date().toISOString(),
          provider: 'twilio',
          type: 'sms'
        };

        console.log('TwilioService: SMS sent successfully', result);
        return result;
      } else {
        throw new Error('SMS delivery failed - network error');
      }

    } catch (error) {
      console.error('TwilioService: SMS sending failed', error);
      return {
        success: false,
        error: error.message,
        to,
        provider: 'twilio',
        type: 'sms',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send WhatsApp message via Twilio
   * @param {Object} params
   * @param {string} params.to - Recipient WhatsApp number
   * @param {string} params.message - WhatsApp message content
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Send result
   */
  async sendWhatsApp({ to, message, metadata = {} }) {
    try {
      // Validate input
      if (!to || !message) {
        throw new Error('Recipient WhatsApp number and message are required');
      }

      // Format phone number for WhatsApp
      const formattedTo = `whatsapp:${this.formatPhoneNumber(to)}`;
      const formattedFrom = `whatsapp:${this.whatsappNumber}`;

      // Log the WhatsApp sending attempt
      console.log('TwilioService: Sending WhatsApp message', {
        to: formattedTo,
        from: formattedFrom,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messageLength: message.length,
        metadata
      });

      // Simulate API call delay
      await this.simulateDelay(500, 2000);

      // Simulate success/failure (95% success rate for WhatsApp)
      if (Math.random() < 0.95) {
        const result = {
          success: true,
          messageId: `WA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          to: formattedTo,
          from: formattedFrom,
          status: 'sent',
          cost: this.calculateWhatsAppCost(message),
          timestamp: new Date().toISOString(),
          provider: 'twilio',
          type: 'whatsapp'
        };

        console.log('TwilioService: WhatsApp message sent successfully', result);
        return result;
      } else {
        throw new Error('WhatsApp delivery failed - recipient not reachable');
      }

    } catch (error) {
      console.error('TwilioService: WhatsApp sending failed', error);
      return {
        success: false,
        error: error.message,
        to,
        provider: 'twilio',
        type: 'whatsapp',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send bulk SMS messages
   * @param {Array} recipients - Array of recipient objects
   * @param {string} message - SMS message content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Array>} Array of send results
   */
  async sendBulkSMS(recipients, message, metadata = {}) {
    console.log(`TwilioService: Starting bulk SMS send to ${recipients.length} recipients`);
    
    const results = [];
    const batchSize = 10; // Process in batches to avoid rate limits
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(recipient => 
        this.sendSMS({
          to: recipient.phone,
          message: this.interpolateMessage(message, recipient),
          metadata: { ...metadata, recipientId: recipient.id }
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await this.simulateDelay(100, 500);
      }
    }
    
    console.log(`TwilioService: Bulk SMS completed. ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
  }

  /**
   * Send bulk WhatsApp messages
   * @param {Array} recipients - Array of recipient objects
   * @param {string} message - WhatsApp message content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Array>} Array of send results
   */
  async sendBulkWhatsApp(recipients, message, metadata = {}) {
    console.log(`TwilioService: Starting bulk WhatsApp send to ${recipients.length} recipients`);
    
    const results = [];
    const batchSize = 5; // Smaller batches for WhatsApp
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(recipient => 
        this.sendWhatsApp({
          to: recipient.whatsapp || recipient.phone,
          message: this.interpolateMessage(message, recipient),
          metadata: { ...metadata, recipientId: recipient.id }
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Longer delay between WhatsApp batches
      if (i + batchSize < recipients.length) {
        await this.simulateDelay(1000, 2000);
      }
    }
    
    console.log(`TwilioService: Bulk WhatsApp completed. ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
  }

  /**
   * Format phone number to international format
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add + if not present and number doesn't start with country code
    if (!phoneNumber.startsWith('+')) {
      // Assume South African number if no country code
      if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return `+27${cleaned.substring(1)}`;
      } else if (cleaned.length === 9) {
        return `+27${cleaned}`;
      } else {
        return `+${cleaned}`;
      }
    }
    
    return phoneNumber;
  }

  /**
   * Calculate SMS cost based on message length
   * @param {string} message - SMS message
   * @returns {number} Cost in currency units
   */
  calculateSMSCost(message) {
    const smsCount = Math.ceil(message.length / 160);
    return smsCount * 0.12; // R0.12 per SMS
  }

  /**
   * Calculate WhatsApp cost
   * @param {string} message - WhatsApp message
   * @returns {number} Cost in currency units
   */
  calculateWhatsAppCost(message) {
    return 0.05; // Flat rate for WhatsApp messages
  }

  /**
   * Interpolate message with recipient data
   * @param {string} template - Message template with variables
   * @param {Object} recipient - Recipient data
   * @returns {string} Interpolated message
   */
  interpolateMessage(template, recipient) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return recipient[key] || match;
    });
  }

  /**
   * Simulate API call delay
   * @param {number} min - Minimum delay in ms
   * @param {number} max - Maximum delay in ms
   * @returns {Promise} Promise that resolves after delay
   */
  async simulateDelay(min = 500, max = 2000) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get service status and configuration
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      service: 'TwilioService',
      configured: !!(this.accountSid && this.authToken),
      fromNumber: this.fromNumber,
      whatsappNumber: this.whatsappNumber,
      capabilities: ['sms', 'whatsapp', 'bulk_sms', 'bulk_whatsapp']
    };
  }
}

export default TwilioService;

