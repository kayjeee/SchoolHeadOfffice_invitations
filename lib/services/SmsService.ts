// lib/services/SmsService.ts
import { nasaLog as logger } from '../nasaLogger';

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  learnerNumbers?: string[];
  parentName?: string;
  gradeId?: string;
  sender: string; // ⚠️ TEMPORARY – remove once backend auth is enforced
  userEmail?: string;
}

interface SmsParams {
  to: string;
  message: string;
  supplier: 'winsms' | 'bulksms';
  schoolId: string;
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
        sender, // ⚠️ TEMPORARY
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
   * 🔹 Step 4: Send SMS (Test & Bulk)
   */
  async sendSms({ to, message, supplier, schoolId, testType, userEmail }: SmsParams & { userEmail?: string }) {
    try {
      logger('INFO', 'SmsService', 'Sending SMS', {
        to,
        supplier,
        schoolId,
        testType,
        userEmail
      });

      const payload = {
        to,
        message,
        supplier,
        schoolId,
        testType
      };

      console.log('📤 [SmsService] Sending SMS with payload:', payload);

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
        to,
        supplier
      });
      throw error;
    }
  }

  /**
   * Higher-level method to send a test SMS with magic link
   */
  async sendTestMessage({ to, schoolName, schoolId, userEmail, supplier = 'winsms' }: {
    to: string;
    schoolName: string;
    schoolId: string;
    userEmail?: string;
    supplier?: 'winsms' | 'bulksms'
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
      userEmail,
    });
  }

  /**
   * Higher-level method for bulk SMS
   */
  async sendBulkMessages({ gradeIds, schoolName, recipients, schoolId, userEmail, supplier = 'winsms' }: {
    gradeIds: string[];
    schoolName: string;
    recipients: { phone: string; name: string }[];
    schoolId: string;
    userEmail?: string;
    supplier?: 'winsms' | 'bulksms';
  }) {
    logger('INFO', 'SmsService', 'Sending bulk SMS', {
      recipientCount: recipients.length,
      schoolId
    });

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendTestMessage({
          to: recipient.phone,
          schoolName,
          schoolId,
          userEmail,
          supplier
        });
        results.push(result);
      } catch (error: any) {
        errors.push({
          phone: recipient.phone,
          error: error.message
        });
      }
    }

    return {
      sentCount: results.length,
      failedCount: errors.length,
      errors
    };
  }

  /**
   * Schedule bulk messages for later delivery
   */
  async scheduleBulkMessage({ gradeIds, message, scheduledAt, timezone, recipientNumbers, schoolId, schoolName, supplier = 'winsms' }: {
    gradeIds: string[];
    message: string;
    scheduledAt: string;
    timezone: string;
    recipientNumbers: string[];
    schoolId: string;
    schoolName: string;
    supplier?: 'winsms' | 'bulksms';
  }) {
    try {
      logger('INFO', 'SmsService', 'Scheduling bulk SMS', {
        scheduledAt,
        recipientCount: recipientNumbers.length,
        schoolName
      });

      const response = await fetch(`${this.baseURL}/schedule-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
        },
        body: JSON.stringify({
          gradeIds,
          message,
          scheduledAt,
          timezone,
          recipientNumbers,
          schoolId,
          schoolName,
          supplier,
          campaignType: 'SCHEDULED_INVITES',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to schedule SMS`);
      }

      return data;
    } catch (error: any) {
      logger('ERROR', 'SmsService', 'Failed to schedule bulk SMS', { error: error.message });
      throw error;
    }
  }
}

export default new SmsService();
