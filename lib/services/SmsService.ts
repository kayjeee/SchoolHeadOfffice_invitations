// lib/services/SmsService.ts
import { nasaLog as logger } from '../nasaLogger';
import InvitationService from './invitationService';

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
  async sendTestMessage({
    to,
    schoolName,
    schoolId,
    userEmail,
    supplier = 'winsms',
    scheduledTime,
    learnerNumber,
    parentName,
    gradeId,
    sender_id,
  }: {
    to: string;
    schoolName: string;
    schoolId: string;
    userEmail?: string;
    supplier?: 'winsms' | 'bulksms';
    scheduledTime?: string;
    learnerNumber?: string;
    parentName?: string;
    gradeId?: string;
    sender_id?: string;
  }) {
    const token = await this.createInvitation({
      phoneNumber: to,
      schoolId,
      sender: sender_id || userEmail || 'kagiso.killagram@gmail.com',
      userEmail,
      learnerNumbers: learnerNumber ? [learnerNumber] : [],
      parentName,
      gradeId,
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
  async sendBulkMessages({
    schoolName,
    recipients,
    schoolId,
    userEmail,
    supplier = 'winsms',
    scheduledTime,
    gradeIds,
    senderId,
  }: {
    schoolName: string;
    recipients: {
      phone: string;
      name: string;
      learner_number?: string;
      grade?: string;
    }[];
    schoolId: string;
    userEmail?: string;
    supplier?: 'winsms' | 'bulksms';
    scheduledTime?: string;
    gradeIds?: string[];
    senderId?: string;
  }) {
    logger('INFO', 'SmsService', 'Sending bulk SMS with magic links', {
      recipientCount: recipients.length,
      schoolId,
      scheduledTime,
    });

    try {
      // 1. Create bulk invitations
      const bulkInvitations = recipients.map((r) => ({
        phone_number: r.phone,
        parent_name: r.name,
        learner_numbers: r.learner_number ? [r.learner_number] : [],
        grade_id: gradeIds && gradeIds.length > 0 ? gradeIds[0] : undefined,
      }));

      const bulkResponse = await InvitationService.createBulkInvitations({
        invitations: bulkInvitations,
        school_id: schoolId,
        sender_id: senderId,
        userEmail,
        invitedVia: 'sms',
      });

      if (!bulkResponse.success || !bulkResponse.invitations) {
        throw new Error('Bulk invitation creation failed');
      }

      // 2. Process invitations into messages
      const personalizedMessages = bulkResponse.invitations.map((inv: any) => {
        const token = inv.token;
        if (!token) return null;

        const magicLink = this.buildMagicLink({ token, schoolName });
        const message = this.buildInductionMessage({ schoolName, magicLink });

        return {
          phone: inv.phone_number,
          name: inv.parent_name,
          message: message,
          token: token,
        };
      }).filter((msg: any) => msg !== null);

      if (personalizedMessages.length === 0) {
        throw new Error('No valid invitations created');
      }

      // 3. Send bulk SMS via provider
      const bulkResult = await this.sendBulkSms({
        recipients: personalizedMessages,
        message: personalizedMessages[0].message,
        schoolId,
        supplier,
        scheduledTime,
        testType: 'MAGIC_LINK_BULK',
        userEmail,
      });

      return {
        ...bulkResult,
        totalCount: recipients.length,
        processedCount: personalizedMessages.length,
      };
    } catch (error: any) {
      logger('ERROR', 'SmsService', 'Failed to send bulk SMS', {
        error: error.message,
        schoolId,
      });
      throw error;
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