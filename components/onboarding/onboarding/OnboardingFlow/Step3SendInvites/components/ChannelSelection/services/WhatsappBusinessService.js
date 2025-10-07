import { logger } from '../utils/logger';

class WhatsAppBusinessService {
  constructor() {
    this.baseURL = '/api/whatsapp-business';
  }

  async sendTestMessage({ to, message, gradeId, schoolName }) {
    try {
      logger.info('WhatsAppBusinessService', 'Sending test message', {
        to: to.substring(0, 6) + '...',
        gradeId,
        messageLength: message.length
      });

      const response = await fetch(`${this.baseURL}/test-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          to,
          message,
          gradeId,
          schoolName,
          testType: 'PREVIEW'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test message');
      }

      logger.info('WhatsAppBusinessService', 'Test message sent successfully', {
        messageId: data.messageId
      });

      return data;
    } catch (error) {
      logger.error('WhatsAppBusinessService', 'Failed to send test message', error);
      throw error;
    }
  }

  async sendBulkMessages({ gradeIds, message, schoolName, recipientNumbers }) {
    try {
      logger.info('WhatsAppBusinessService', 'Sending bulk messages', {
        gradeIds,
        recipientCount: recipientNumbers.length,
        messageLength: message.length
      });

      const response = await fetch(`${this.baseURL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          gradeIds,
          message,
          schoolName,
          recipientNumbers,
          campaignType: 'SCHOOL_ANNOUNCEMENT'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send bulk messages');
      }

      logger.info('WhatsAppBusinessService', 'Bulk messages sent successfully', {
        sentCount: data.sentCount,
        failedCount: data.failedCount
      });

      return data;
    } catch (error) {
      logger.error('WhatsAppBusinessService', 'Failed to send bulk messages', error);
      throw error;
    }
  }

  async scheduleBulkMessage({ gradeIds, message, scheduledAt, timezone, recipientNumbers }) {
    try {
      logger.info('WhatsAppBusinessService', 'Scheduling bulk message', {
        gradeIds,
        scheduledAt,
        recipientCount: recipientNumbers.length,
        messageLength: message.length
      });

      const response = await fetch(`${this.baseURL}/schedule-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          gradeIds,
          message,
          scheduledAt,
          timezone,
          recipientNumbers,
          campaignType: 'SCHOOL_ANNOUNCEMENT'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule message');
      }

      logger.info('WhatsAppBusinessService', 'Message scheduled successfully', {
        scheduleId: data.scheduleId,
        scheduledFor: scheduledAt,
        recipientCount: recipientNumbers.length
      });

      return data;
    } catch (error) {
      logger.error('WhatsAppBusinessService', 'Failed to schedule message', error);
      throw error;
    }
  }

  validateMessageTemplate(message) {
    const validations = [
      {
        check: message.length <= 4096,
        error: 'Message exceeds maximum length of 4096 characters'
      },
      {
        check: !message.includes('{{1}}') || message.match(/{{(\d+)}}/g)?.length <= 10,
        error: 'Maximum 10 variables allowed in template'
      },
      {
        check: !message.match(/[<>]/g),
        error: 'Message contains invalid characters (< or >)'
      }
    ];

    for (const validation of validations) {
      if (!validation.check) {
        throw new Error(validation.error);
      }
    }

    return true;
  }
}

export default new WhatsAppBusinessService();