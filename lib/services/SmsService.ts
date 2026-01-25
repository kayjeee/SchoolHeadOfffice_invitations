// lib/services/SmsService.ts
import { nasaLog as logger } from '../nasaLogger';

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  learnerNumbers?: string[];
  parentName?: string;
  gradeId?: string;
  sender: string;
  userEmail?: string;
}

interface SmsParams {
  to: string;
  message: string;
  supplier?: 'winsms' | 'bulksms';
  schoolId: string;
  testType?: string;
  scheduledTime?: string;
}

interface BulkSmsParams {
  recipients: Array<{
    phone: string;
    name?: string;
    [key: string]: any;
  }> | string[];
  message: string;
  schoolId: string;
  supplier?: 'winsms' | 'bulksms';
  scheduledTime?: string;
  testType?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "shobackendv2-production.up.railway.app";

class SmsService {
  baseURL: string;
  invitationsURL: string;

  constructor() {
    this.baseURL = '/api/sms';
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  /**
   * 🔹 Step 1: Create an invitation to generate a token
   */
  async createInvitation({
    phoneNumber,
    schoolId,
    learnerNumbers,
    parentName,
    gradeId,
    sender,
    userEmail,
  }: InvitationParams): Promise<string> {
    try {
      logger('INFO', 'SmsService', 'Creating invitation token', {
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
        school_id: schoolId,
        learner_numbers: learnerNumbers ?? [],
        role: 'parent',
        parent_name: parentName ?? null,
        grade_id: gradeId ?? null,
        invited_via: 'sms',
        sender,
      };

      console.log('📤 [SmsService] Creating invitation with payload:', payload);

      const response = await fetch(this.invitationsURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 [SmsService] Invitation response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to create invitation`);
      }

      const token = data.invitation?.token || data.token;
      if (!token) {
        throw new Error('No token received in invitation response');
      }

      logger('INFO', 'SmsService', 'Invitation token created successfully', {
        token: token.substring(0, 8) + '...',
        phoneNumber
      });
      return token;
    } catch (error: any) {
      logger('ERROR', 'SmsService', 'Failed to create invitation', {
        error: error.message,
        phoneNumber,
        schoolId,
        userEmail
      });
      throw error;
    }
  }

  /**
   * 🔹 Step 2: Build professional induction message
   */
  buildInductionMessage({ schoolName, magicLink }: { schoolName: string; magicLink: string }) {
    return `🏫 ${schoolName}: You are invited to the Parent Portal. Join here: ${magicLink}`;
  }

  /**
   * 🔹 Step 3: Build magic link from token and school name
   */
  buildMagicLink({ token, schoolName }: { token: string; schoolName: string }) {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    return `https://portal.${domain}.com/join?token=${token}`;
  }

  /**
   * 🔹 Step 4: Send SMS - Single or Bulk
   */
  async sendSms(params: SmsParams & { userEmail?: string }) {
    try {
      const { to, message, supplier = 'winsms', schoolId, testType, scheduledTime, userEmail } = params;

      logger('INFO', 'SmsService', 'Sending SMS', {
        to,
        supplier,
        schoolId,
        testType,
        scheduledTime,
        type: 'SINGLE',
        userEmail
      });

      const payload = {
        to,
        message,
        supplier,
        schoolId,
        testType,
        scheduledTime,
        isBulk: false
      };

      console.log('📤 [SmsService] Sending single SMS with payload:', payload);

      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 [SmsService] Send SMS response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}: Failed to send SMS`);
      }

      logger('INFO', 'SmsService', 'SMS sent successfully', {
        messageId: data.messageId,
        to
      });

      return data;
    } catch (error: any) {
      logger('ERROR', 'SmsService', 'Failed to send SMS', {
        error: error.message,
        to: params.to,
        supplier: params.supplier
      });
      throw error;
    }
  }

  /**
   * 🔹 Send Bulk SMS
   */
  async sendBulkSms(params: BulkSmsParams & { userEmail?: string }) {
    try {
      const { recipients, message, supplier = 'winsms', schoolId, testType, scheduledTime, userEmail } = params;

      logger('INFO', 'SmsService', 'Sending bulk SMS', {
        recipientCount: recipients.length,
        supplier,
        schoolId,
        testType,
        scheduledTime,
        type: 'BULK',
        userEmail
      });

      // Format recipients array
      const formattedRecipients = recipients.map(recipient => {
        if (typeof recipient === 'string') {
          return { phone: recipient };
        }
        return recipient;
      });

      const payload = {
        recipients: formattedRecipients,
        message,
        supplier,
        schoolId,
        testType,
        scheduledTime,
        isBulk: true
      };

      console.log('📤 [SmsService] Sending bulk SMS with payload:', {
        ...payload,
        recipients: `${formattedRecipients.length} recipients`
      });

      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 [SmsService] Send bulk SMS response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}: Failed to send bulk SMS`);
      }

      logger('INFO', 'SmsService', 'Bulk SMS sent successfully', {
        messageId: data.messageId,
        sentCount: data.sentCount,
        failedCount: data.failedCount
      });

      return data;
    } catch (error: any) {
      logger('ERROR', 'SmsService', 'Failed to send bulk SMS', {
        error: error.message,
        recipientCount: params.recipients.length,
        supplier: params.supplier
      });
      throw error;
    }
  }

  /**
   * 🔹 Higher-level method to send a test SMS with magic link (Single)
   */
  async sendTestMessage({ to, schoolName, schoolId, userEmail, supplier = 'winsms', scheduledTime }: {
    to: string;
    schoolName: string;
    schoolId: string;
    userEmail?: string;
    supplier?: 'winsms' | 'bulksms';
    scheduledTime?: string;
  }) {
    const token = await this.createInvitation({
      phoneNumber: to,
      schoolId,
      sender: userEmail || 'kagiso.killagram@gmail.com',
      userEmail,
    });

    const magicLink = this.buildMagicLink({ token, schoolName });
    const message = this.buildInductionMessage({ schoolName, magicLink });

    return await this.sendSms({
      to,
      message,
      supplier,
      schoolId,
      testType: 'MAGIC_LINK',
      scheduledTime,
      userEmail,
    });
  }

  /**
   * 🔹 Higher-level method for bulk SMS with magic links
   */
  async sendBulkTestMessages({ schoolName, recipients, schoolId, userEmail, supplier = 'winsms', scheduledTime }: {
    schoolName: string;
    recipients: { phone: string; name: string }[];
    schoolId: string;
    userEmail?: string;
    supplier?: 'winsms' | 'bulksms';
    scheduledTime?: string;
  }) {
    logger('INFO', 'SmsService', 'Sending bulk test SMS with magic links', {
      recipientCount: recipients.length,
      schoolId,
      scheduledTime
    });

    // First, create invitations for all recipients
    const invitations = [];
    const invitationErrors = [];

    for (const recipient of recipients) {
      try {
        const token = await this.createInvitation({
          phoneNumber: recipient.phone,
          schoolId,
          parentName: recipient.name,
          sender: userEmail || 'kagiso.killagram@gmail.com',
          userEmail,
        });

        const magicLink = this.buildMagicLink({ token, schoolName });
        const message = this.buildInductionMessage({ schoolName, magicLink });

        invitations.push({
          ...recipient,
          message,
          token
        });
      } catch (error: any) {
        invitationErrors.push({
          ...recipient,
          error: error.message
        });
      }
    }

    if (invitations.length === 0) {
      return {
        sentCount: 0,
        failedCount: recipients.length,
        errors: invitationErrors
      };
    }

    // Send bulk SMS
    try {
      const bulkResult = await this.sendBulkSms({
        recipients: invitations.map(inv => ({
          phone: inv.phone,
          name: inv.name,
          message: inv.message
        })),
        message: invitations[0].message, // All messages are the same structure
        schoolId,
        supplier,
        scheduledTime,
        testType: 'MAGIC_LINK_BULK',
        userEmail,
      });

      // Combine invitation errors with bulk send errors
      return {
        ...bulkResult,
        invitationErrors: invitationErrors.length > 0 ? invitationErrors : undefined
      };
    } catch (error: any) {
      logger('ERROR', 'SmsService', 'Failed to send bulk test messages', {
        error: error.message,
        invitationCount: invitations.length,
        errorCount: invitationErrors.length
      });
      
      throw {
        message: error.message,
        invitationErrors,
        invitationsSent: invitations.length
      };
    }
  }

  /**
   * 🔹 Schedule bulk messages for later delivery
   */
  async scheduleBulkMessage({ gradeIds, message, scheduledAt, timezone, recipientNumbers, schoolId, schoolName, supplier = 'winsms', userEmail }: {
    gradeIds?: string[];
    message: string;
    scheduledAt: string;
    timezone: string;
    recipientNumbers: string[];
    schoolId: string;
    schoolName: string;
    supplier?: 'winsms' | 'bulksms';
    userEmail?: string;
  }) {
    try {
      logger('INFO', 'SmsService', 'Scheduling bulk SMS', {
        scheduledAt,
        recipientCount: recipientNumbers.length,
        schoolName,
        timezone
      });

      // Convert scheduled time to WinSMS format
      const scheduledTime = new Date(scheduledAt).toISOString();

      return await this.sendBulkSms({
        recipients: recipientNumbers,
        message,
        schoolId,
        supplier,
        scheduledTime,
        testType: 'SCHEDULED_BULK',
        userEmail,
      });
    } catch (error: any) {
      logger('ERROR', 'SmsService', 'Failed to schedule bulk SMS', { error: error.message });
      throw error;
    }
  }
}

export default new SmsService();