/**
 * WinSMSService
 * 
 * Service for sending SMS messages via WinSMS API (South African SMS provider).
 * This is a placeholder implementation for the refactoring exercise.
 * In a real implementation, this would integrate with the WinSMS REST API.
 */

class WinSMSService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.WINSMS_API_KEY;
    this.username = config.username || process.env.WINSMS_USERNAME;
    this.password = config.password || process.env.WINSMS_PASSWORD;
    this.baseUrl = config.baseUrl || 'https://www.winsms.co.za/api/rest/v1';
    this.defaultSender = config.defaultSender || 'SchoolSMS';
    
    // Rate limiting configuration
    this.rateLimit = {
      maxPerSecond: 10,
      maxPerMinute: 300,
      currentSecond: 0,
      currentMinute: 0,
      lastSecond: Date.now(),
      lastMinute: Date.now()
    };
  }

  /**
   * Send SMS message via WinSMS
   * @param {Object} params
   * @param {string} params.to - Recipient phone number
   * @param {string} params.message - SMS message content
   * @param {string} params.sender - Sender ID (optional)
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Send result
   */
  async sendSMS({ to, message, sender = null, metadata = {} }) {
    try {
      // Validate input
      if (!to || !message) {
        throw new Error('Recipient phone number and message are required');
      }

      // Check rate limits
      await this.checkRateLimit();

      // Format phone number for South African numbers
      const formattedTo = this.formatSouthAfricanNumber(to);
      const senderName = sender || this.defaultSender;

      // Validate message length
      if (message.length > 918) { // WinSMS limit for concatenated SMS
        throw new Error('Message too long. Maximum 918 characters allowed.');
      }

      // Log the SMS sending attempt
      console.log('WinSMSService: Sending SMS', {
        to: formattedTo,
        sender: senderName,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messageLength: message.length,
        smsCount: this.calculateSMSCount(message),
        metadata
      });

      // Simulate API call delay
      await this.simulateDelay(800, 2500);

      // Simulate success/failure (92% success rate)
      if (Math.random() < 0.92) {
        const result = {
          success: true,
          messageId: `WINSMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          to: formattedTo,
          sender: senderName,
          status: 'sent',
          smsCount: this.calculateSMSCount(message),
          cost: this.calculateCost(message),
          credits: this.calculateCredits(message),
          timestamp: new Date().toISOString(),
          provider: 'winsms',
          type: 'sms',
          network: this.detectNetwork(formattedTo)
        };

        console.log('WinSMSService: SMS sent successfully', result);
        return result;
      } else {
        throw new Error('SMS delivery failed - invalid number or network error');
      }

    } catch (error) {
      console.error('WinSMSService: SMS sending failed', error);
      return {
        success: false,
        error: error.message,
        to,
        provider: 'winsms',
        type: 'sms',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send bulk SMS messages
   * @param {Array} recipients - Array of recipient objects
   * @param {string} message - SMS message content
   * @param {string} sender - Sender ID (optional)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Array>} Array of send results
   */
  async sendBulkSMS(recipients, message, sender = null, metadata = {}) {
    console.log(`WinSMSService: Starting bulk SMS send to ${recipients.length} recipients`);
    
    const results = [];
    const batchSize = 50; // WinSMS supports larger batches
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Process batch
      const batchResults = await this.processBatch(batch, message, sender, metadata);
      results.push(...batchResults);
      
      // Delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await this.simulateDelay(2000, 3000);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`WinSMSService: Bulk SMS completed. ${successCount}/${results.length} successful`);
    
    return results;
  }

  /**
   * Process a batch of SMS messages
   * @param {Array} batch - Batch of recipients
   * @param {string} message - SMS message content
   * @param {string} sender - Sender ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Array>} Batch results
   */
  async processBatch(batch, message, sender, metadata) {
    // In real implementation, this would use WinSMS bulk API
    // For simulation, we'll process individually with some optimizations
    
    console.log(`WinSMSService: Processing batch of ${batch.length} messages`);
    
    const batchPromises = batch.map(async (recipient, index) => {
      // Small stagger to simulate bulk processing
      await this.simulateDelay(index * 50, index * 100);
      
      return this.sendSMS({
        to: recipient.phone,
        message: this.interpolateMessage(message, recipient),
        sender,
        metadata: { ...metadata, recipientId: recipient.id, batchIndex: index }
      });
    });
    
    return Promise.all(batchPromises);
  }

  /**
   * Check SMS delivery status
   * @param {string} messageId - Message ID to check
   * @returns {Promise<Object>} Status result
   */
  async checkStatus(messageId) {
    try {
      console.log(`WinSMSService: Checking status for message ${messageId}`);
      
      // Simulate API call
      await this.simulateDelay(300, 800);
      
      // Simulate different status possibilities
      const statuses = ['delivered', 'pending', 'failed', 'expired'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        messageId,
        status: randomStatus,
        timestamp: new Date().toISOString(),
        provider: 'winsms'
      };
      
    } catch (error) {
      console.error('WinSMSService: Status check failed', error);
      return {
        messageId,
        status: 'unknown',
        error: error.message,
        provider: 'winsms'
      };
    }
  }

  /**
   * Get account balance and credits
   * @returns {Promise<Object>} Account information
   */
  async getAccountInfo() {
    try {
      console.log('WinSMSService: Fetching account information');
      
      // Simulate API call
      await this.simulateDelay(500, 1200);
      
      return {
        credits: Math.floor(Math.random() * 10000) + 1000, // Random credits between 1000-11000
        balance: (Math.random() * 500 + 100).toFixed(2), // Random balance R100-R600
        currency: 'ZAR',
        provider: 'winsms',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('WinSMSService: Account info fetch failed', error);
      return {
        error: error.message,
        provider: 'winsms'
      };
    }
  }

  /**
   * Format phone number for South African networks
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} Formatted phone number
   */
  formatSouthAfricanNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different South African number formats
    if (cleaned.startsWith('27')) {
      return cleaned; // Already in international format without +
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '27' + cleaned.substring(1); // Remove leading 0, add 27
    } else if (cleaned.length === 9) {
      return '27' + cleaned; // Add 27 prefix
    } else {
      // For other international numbers, keep as is
      return cleaned;
    }
  }

  /**
   * Calculate number of SMS messages required
   * @param {string} message - SMS message
   * @returns {number} Number of SMS messages
   */
  calculateSMSCount(message) {
    if (message.length <= 160) return 1;
    if (message.length <= 306) return 2;
    return Math.ceil(message.length / 153); // 153 chars per SMS in concatenated messages
  }

  /**
   * Calculate SMS cost in ZAR
   * @param {string} message - SMS message
   * @returns {number} Cost in ZAR
   */
  calculateCost(message) {
    const smsCount = this.calculateSMSCount(message);
    return smsCount * 0.15; // R0.15 per SMS (example rate)
  }

  /**
   * Calculate credits required
   * @param {string} message - SMS message
   * @returns {number} Credits required
   */
  calculateCredits(message) {
    return this.calculateSMSCount(message); // 1 credit per SMS
  }

  /**
   * Detect mobile network from phone number
   * @param {string} phoneNumber - Phone number
   * @returns {string} Network name
   */
  detectNetwork(phoneNumber) {
    const number = phoneNumber.replace(/\D/g, '');
    
    // South African network prefixes (simplified)
    if (number.startsWith('2782') || number.startsWith('2783') || number.startsWith('2784')) {
      return 'Vodacom';
    } else if (number.startsWith('2781') || number.startsWith('2786')) {
      return 'MTN';
    } else if (number.startsWith('2785')) {
      return 'Cell C';
    } else if (number.startsWith('2787')) {
      return 'Telkom Mobile';
    } else {
      return 'Unknown';
    }
  }

  /**
   * Check and enforce rate limits
   * @returns {Promise<void>}
   */
  async checkRateLimit() {
    const now = Date.now();
    
    // Reset counters if time periods have passed
    if (now - this.rateLimit.lastSecond >= 1000) {
      this.rateLimit.currentSecond = 0;
      this.rateLimit.lastSecond = now;
    }
    
    if (now - this.rateLimit.lastMinute >= 60000) {
      this.rateLimit.currentMinute = 0;
      this.rateLimit.lastMinute = now;
    }
    
    // Check limits
    if (this.rateLimit.currentSecond >= this.rateLimit.maxPerSecond) {
      const waitTime = 1000 - (now - this.rateLimit.lastSecond);
      await this.simulateDelay(waitTime, waitTime);
    }
    
    if (this.rateLimit.currentMinute >= this.rateLimit.maxPerMinute) {
      const waitTime = 60000 - (now - this.rateLimit.lastMinute);
      await this.simulateDelay(waitTime, waitTime);
    }
    
    // Increment counters
    this.rateLimit.currentSecond++;
    this.rateLimit.currentMinute++;
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
      service: 'WinSMSService',
      configured: !!(this.apiKey || (this.username && this.password)),
      baseUrl: this.baseUrl,
      defaultSender: this.defaultSender,
      rateLimit: {
        maxPerSecond: this.rateLimit.maxPerSecond,
        maxPerMinute: this.rateLimit.maxPerMinute
      },
      capabilities: ['sms', 'bulk_sms', 'status_check', 'account_info'],
      supportedNetworks: ['Vodacom', 'MTN', 'Cell C', 'Telkom Mobile']
    };
  }
}

export default WinSMSService;

