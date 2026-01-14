
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EmailInvitationParams {
  email: string;
  schoolId: string;
  userEmail?: string;
}

interface TestEmailParams {
  to: string;
  schoolName: string;
  schoolId: string;
  userEmail?: string;
}

interface BulkEmailParams {
  schoolName: string;
  recipientEmails: string[];
  schoolId: string;
  userEmail?: string;
  gradeIds?: string[];
}

interface ScheduleEmailParams {
  subject: string;
  body: string;
  scheduledAt: string | Date;
  timezone: string;
  recipientEmails: string[];
  schoolId: string;
  schoolName: string;
  gradeIds?: string[];
}

class EmailService {
  private baseURL: string;
  private invitationsURL: string;

  constructor() {
    this.baseURL = '/api/email';
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  public validateEmail(email: string): void {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  async createInvitation({ email, schoolId, userEmail }: EmailInvitationParams): Promise<string> {
    this.validateEmail(email);
    if (!schoolId) {
      throw new Error('schoolId is required');
    }

    const payload = {
      email: email,
      school_id: schoolId,
      role: 'parent',
    };

    const response = await fetch(this.invitationsURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': userEmail || 'default.user@example.com',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create email invitation');
    }

    return data.invitation?.token || data.token;
  }

  async sendTestEmail({ to, schoolName, schoolId, userEmail }: TestEmailParams): Promise<any> {
    this.validateEmail(to);

    const token = await this.createInvitation({ email: to, schoolId, userEmail });
    const magicLink = `https://www.schoolheadoffice.com/parent?token=${token}&school=${encodeURIComponent(schoolName)}`;

    const payload = {
      to,
      schoolName,
      magicLink,
      subject: `Invitation to ${schoolName} Parent Portal`,
      body: `You are invited to join the ${schoolName} community. Click here to join: ${magicLink}`,
    };

    logger.info('EmailService', 'Sending test email', payload);
    console.log('--- SENDING TEST EMAIL ---', payload);
    return Promise.resolve({ success: true, messageId: `test_${Date.now()}` });
  }

  async sendBulkEmails({ schoolName, recipientEmails, schoolId, userEmail, gradeIds }: BulkEmailParams): Promise<any> {
    if (!recipientEmails || recipientEmails.length === 0) {
      throw new Error('No recipient emails provided');
    }

    const payload = {
      schoolName,
      recipientEmails,
      schoolId,
      userEmail,
      gradeIds,
      subject: `Invitation to ${schoolName} Parent Portal`,
    };

    logger.info('EmailService', 'Sending bulk emails', payload);
    console.log('--- SENDING BULK EMAIL ---', payload);
    return Promise.resolve({ success: true, batchId: `bulk_${Date.now()}` });
  }

  async scheduleBulkEmail({ subject, body, scheduledAt, timezone, recipientEmails, schoolId, schoolName, gradeIds }: ScheduleEmailParams): Promise<any> {
    if (!recipientEmails || recipientEmails.length === 0) {
      throw new Error('No recipient emails provided');
    }

    const payload = {
      subject,
      body,
      scheduledAt: new Date(scheduledAt).toISOString(),
      timezone,
      recipientEmails,
      schoolId,
      schoolName,
      gradeIds,
    };

    logger.info('EmailService', 'Scheduling bulk email', payload);
    console.log('--- SCHEDULING BULK EMAIL ---', payload);
    return Promise.resolve({ success: true, scheduleId: `sched_${Date.now()}` });
  }
}

export default new EmailService();
