/**
 * SendGridService
 * 
 * Service for sending emails via SendGrid API.
 * This is a placeholder implementation for the refactoring exercise.
 * In a real implementation, this would integrate with the SendGrid SDK.
 */

class SendGridService {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.SENDGRID_API_KEY;
    this.fromEmail = config.fromEmail || process.env.SENDGRID_FROM_EMAIL;
    this.fromName = config.fromName || process.env.SENDGRID_FROM_NAME || 'School Administration';
    this.baseUrl = 'https://api.sendgrid.com/v3';
    this.templateId = config.templateId || null;
    
    // Rate limiting configuration
    this.rateLimit = {
      maxPerSecond: 100,
      maxPerDay: 40000, // Free tier limit
      currentSecond: 0,
      currentDay: 0,
      lastSecond: Date.now(),
      lastDay: Date.now()
    };
  }

  /**
   * Send email via SendGrid
   * @param {Object} params
   * @param {string} params.to - Recipient email address
   * @param {string} params.subject - Email subject
   * @param {string} params.content - Email content (HTML or plain text)
   * @param {string} params.contentType - Content type ('text/html' or 'text/plain')
   * @param {Array} params.attachments - Email attachments (optional)
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Send result
   */
  async sendEmail({ 
    to, 
    subject, 
    content, 
    contentType = 'text/html', 
    attachments = [], 
    metadata = {} 
  }) {
    try {
      // Validate input
      if (!to || !subject || !content) {
        throw new Error('Recipient email, subject, and content are required');
      }

      // Validate email format
      if (!this.isValidEmail(to)) {
        throw new Error('Invalid email address format');
      }

      // Check rate limits
      await this.checkRateLimit();

      // Log the email sending attempt
      console.log('SendGridService: Sending email', {
        to,
        from: `${this.fromName} <${this.fromEmail}>`,
        subject,
        contentType,
        contentLength: content.length,
        attachmentCount: attachments.length,
        metadata
      });

      // Simulate API call delay
      await this.simulateDelay(1000, 3000);

      // Simulate success/failure (96% success rate)
      if (Math.random() < 0.96) {
        const result = {
          success: true,
          messageId: `SG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          to,
          from: this.fromEmail,
          subject,
          status: 'sent',
          timestamp: new Date().toISOString(),
          provider: 'sendgrid',
          type: 'email',
          contentType,
          attachmentCount: attachments.length
        };

        console.log('SendGridService: Email sent successfully', result);
        return result;
      } else {
        throw new Error('Email delivery failed - invalid email or server error');
      }

    } catch (error) {
      console.error('SendGridService: Email sending failed', error);
      return {
        success: false,
        error: error.message,
        to,
        provider: 'sendgrid',
        type: 'email',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send bulk emails
   * @param {Array} recipients - Array of recipient objects
   * @param {string} subject - Email subject template
   * @param {string} content - Email content template
   * @param {string} contentType - Content type
   * @param {Array} attachments - Common attachments
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Array>} Array of send results
   */
  async sendBulkEmail(recipients, subject, content, contentType = 'text/html', attachments = [], metadata = {}) {
    console.log(`SendGridService: Starting bulk email send to ${recipients.length} recipients`);
    
    const results = [];
    const batchSize = 25; // SendGrid batch size
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Process batch
      const batchResults = await this.processBatch(batch, subject, content, contentType, attachments, metadata);
      results.push(...batchResults);
      
      // Delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await this.simulateDelay(1000, 2000);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`SendGridService: Bulk email completed. ${successCount}/${results.length} successful`);
    
    return results;
  }

  /**
   * Process a batch of emails
   * @param {Array} batch - Batch of recipients
   * @param {string} subject - Email subject template
   * @param {string} content - Email content template
   * @param {string} contentType - Content type
   * @param {Array} attachments - Attachments
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Array>} Batch results
   */
  async processBatch(batch, subject, content, contentType, attachments, metadata) {
    console.log(`SendGridService: Processing batch of ${batch.length} emails`);
    
    // In real implementation, this would use SendGrid's batch API
    const batchPromises = batch.map(async (recipient, index) => {
      // Small stagger to simulate batch processing
      await this.simulateDelay(index * 100, index * 200);
      
      return this.sendEmail({
        to: recipient.email,
        subject: this.interpolateMessage(subject, recipient),
        content: this.interpolateMessage(content, recipient),
        contentType,
        attachments,
        metadata: { ...metadata, recipientId: recipient.id, batchIndex: index }
      });
    });
    
    return Promise.all(batchPromises);
  }

  /**
   * Send templated email using SendGrid templates
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.templateId - SendGrid template ID
   * @param {Object} params.dynamicData - Template variables
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Send result
   */
  async sendTemplatedEmail({ to, templateId, dynamicData = {}, metadata = {} }) {
    try {
      if (!to || !templateId) {
        throw new Error('Recipient email and template ID are required');
      }

      if (!this.isValidEmail(to)) {
        throw new Error('Invalid email address format');
      }

      console.log('SendGridService: Sending templated email', {
        to,
        templateId,
        dynamicDataKeys: Object.keys(dynamicData),
        metadata
      });

      await this.simulateDelay(800, 2000);

      if (Math.random() < 0.97) {
        const result = {
          success: true,
          messageId: `SGT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          to,
          templateId,
          status: 'sent',
          timestamp: new Date().toISOString(),
          provider: 'sendgrid',
          type: 'templated_email'
        };

        console.log('SendGridService: Templated email sent successfully', result);
        return result;
      } else {
        throw new Error('Templated email delivery failed');
      }

    } catch (error) {
      console.error('SendGridService: Templated email sending failed', error);
      return {
        success: false,
        error: error.message,
        to,
        templateId,
        provider: 'sendgrid',
        type: 'templated_email',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check email delivery status
   * @param {string} messageId - Message ID to check
   * @returns {Promise<Object>} Status result
   */
  async checkStatus(messageId) {
    try {
      console.log(`SendGridService: Checking status for message ${messageId}`);
      
      await this.simulateDelay(300, 800);
      
      const statuses = ['delivered', 'opened', 'clicked', 'bounced', 'dropped', 'deferred'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        messageId,
        status: randomStatus,
        timestamp: new Date().toISOString(),
        provider: 'sendgrid',
        events: this.generateEventHistory(randomStatus)
      };
      
    } catch (error) {
      console.error('SendGridService: Status check failed', error);
      return {
        messageId,
        status: 'unknown',
        error: error.message,
        provider: 'sendgrid'
      };
    }
  }

  /**
   * Get email statistics
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(startDate, endDate) {
    try {
      console.log(`SendGridService: Fetching statistics from ${startDate} to ${endDate}`);
      
      await this.simulateDelay(500, 1200);
      
      return {
        period: { startDate, endDate },
        metrics: {
          sent: Math.floor(Math.random() * 1000) + 100,
          delivered: Math.floor(Math.random() * 950) + 90,
          opened: Math.floor(Math.random() * 400) + 50,
          clicked: Math.floor(Math.random() * 100) + 10,
          bounced: Math.floor(Math.random() * 20) + 1,
          unsubscribed: Math.floor(Math.random() * 5) + 0
        },
        provider: 'sendgrid',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('SendGridService: Statistics fetch failed', error);
      return {
        error: error.message,
        provider: 'sendgrid'
      };
    }
  }

  /**
   * Validate email address format
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate event history for status simulation
   * @param {string} finalStatus - Final status
   * @returns {Array} Event history
   */
  generateEventHistory(finalStatus) {
    const events = [
      { event: 'processed', timestamp: new Date(Date.now() - 300000).toISOString() },
      { event: 'delivered', timestamp: new Date(Date.now() - 240000).toISOString() }
    ];

    if (['opened', 'clicked'].includes(finalStatus)) {
      events.push({ event: 'opened', timestamp: new Date(Date.now() - 120000).toISOString() });
    }

    if (finalStatus === 'clicked') {
      events.push({ event: 'clicked', timestamp: new Date(Date.now() - 60000).toISOString() });
    }

    if (finalStatus === 'bounced') {
      events[1] = { event: 'bounced', timestamp: new Date(Date.now() - 240000).toISOString() };
    }

    return events;
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
    
    if (now - this.rateLimit.lastDay >= 86400000) {
      this.rateLimit.currentDay = 0;
      this.rateLimit.lastDay = now;
    }
    
    // Check limits
    if (this.rateLimit.currentSecond >= this.rateLimit.maxPerSecond) {
      const waitTime = 1000 - (now - this.rateLimit.lastSecond);
      await this.simulateDelay(waitTime, waitTime);
    }
    
    if (this.rateLimit.currentDay >= this.rateLimit.maxPerDay) {
      throw new Error('Daily email limit reached. Please upgrade your SendGrid plan.');
    }
    
    // Increment counters
    this.rateLimit.currentSecond++;
    this.rateLimit.currentDay++;
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
      service: 'SendGridService',
      configured: !!(this.apiKey && this.fromEmail),
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      templateId: this.templateId,
      rateLimit: {
        maxPerSecond: this.rateLimit.maxPerSecond,
        maxPerDay: this.rateLimit.maxPerDay,
        currentDay: this.rateLimit.currentDay
      },
      capabilities: [
        'email', 
        'bulk_email', 
        'templated_email', 
        'attachments', 
        'status_check', 
        'statistics'
      ]
    };
  }
}

export default SendGridService;

