// services/WhatsAppBusinessService.ts - HYBRID VERSION
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  userEmail?: string;
  learnerNumber?: string;
  parentName?: string;
  invitedVia?: string;
  sender_id?: string;
}

interface BuildMagicLinkParams {
  token: string;
  schoolName: string;
}

interface TestMessageParams {
  to: string;
  schoolName: string;
  schoolId: string;
  userEmail?: string;
  learnerNumber?: string;
  parentName?: string;
  invitedVia?: string;
  sender_id?: string;
}

interface BulkMessagesParams {
  schoolName: string;
  recipientNumbers: string[];
  schoolId: string;
  userEmail?: string;
  gradeIds?: string[];
}

interface ScheduleMessageParams {
  message: string;
  scheduledAt: string | Date;
  timezone: string;
  recipientNumbers: string[];
  schoolId: string;
  schoolName: string;
  gradeIds?: string[];
}

class WhatsAppBusinessService {
  private baseURL: string;
  private invitationsURL: string;

  constructor() {
    this.baseURL = '/api/whatsapp-business';
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  // ✅ Internal validator
  public validateMessageTemplate(message: string): void {
    if (typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message must be a non-empty string');
    }
    if (message.length > 4096) {
      throw new Error('Message exceeds maximum length (4096 chars)');
    }
    if (/[<>]/g.test(message)) {
      throw new Error('Message contains invalid characters: < or >');
    }
  }

  private sanitizeSchoolName(schoolName: string): string {
    return schoolName?.trim() || 'Your School';
  }

  private buildSupportEmail(schoolName: string): string {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    return `support@${domain || 'schoolportal'}.com`;
  }

  // ✅ CORRECT: Builds only the query string, NOT the full URL
  private buildMagicLink({ token, schoolName }: BuildMagicLinkParams): string {
    if (!schoolName || schoolName.trim() === '') {
      throw new Error('schoolName is required to build the magic link');
    }
    const encodedSchoolName = encodeURIComponent(schoolName.trim());
    return `?token=${token}&school=${encodedSchoolName}`; // Just the query string
  }

  // ✅ FLEXIBLE: Optional fields for development
  async createInvitation({
    phoneNumber,
    schoolId,
    userEmail,
    learnerNumber,
    parentName,
    invitedVia = 'whatsapp', // Default value
    sender_id,
  }: InvitationParams): Promise<string> {
    if (!schoolId || !phoneNumber) {
      throw new Error('schoolId and phoneNumber are required');
    }

    // Build payload with optional fields
    const payload: any = {
      phone_number: phoneNumber,
      school_id: schoolId,
      role: 'parent',
    };

    // Add optional fields if they exist
    if (learnerNumber) payload.learner_number = learnerNumber;
    if (parentName) payload.parent_name = parentName;
    if (invitedVia) payload.invited_via = invitedVia;
    if (sender_id) payload.sender_id = sender_id;

    const response = await fetch(this.invitationsURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create invitation');
    }

    return data.invitation?.token || data.token;
  }

  // ✅ REMOVED: We don't build messages in frontend anymore
  // private buildMagicLinkMessage() { ... } // DELETE THIS METHOD

  // ✅ CORRECT: Passes token query string to backend
  async sendTestMessage({
    to,
    schoolName,
    schoolId,
    userEmail,
    learnerNumber,
    parentName,
    invitedVia = 'whatsapp',
    sender_id,
  }: TestMessageParams): Promise<any> {
    const formattedNumber = to.replace(/\D/g, "");
    if (!formattedNumber.startsWith("27")) {
      throw new Error('Invalid phone number: must start with 27');
    }

    // 1. Create invitation with all provided data (optional fields)
    const token = await this.createInvitation({
      phoneNumber: formattedNumber,
      schoolId,
      userEmail,
      learnerNumber,
      parentName,
      invitedVia,
      sender_id,
    });

    // 2. Build query string (NOT full URL)
    const sanitizedSchoolName = this.sanitizeSchoolName(schoolName);
    const magicLinkQuery = this.buildMagicLink({ 
      token, 
      schoolName: sanitizedSchoolName 
    });

    const supportEmail = this.buildSupportEmail(sanitizedSchoolName);

    // 3. Send to backend proxy - it will build the final WhatsApp message
    const payload = {
      to: formattedNumber,
      schoolName: sanitizedSchoolName,
      magicLink: magicLinkQuery, // ✅ Just the query string: "?token=abc&school=xyz"
      supportEmail,
      testType: 'MAGIC_LINK',
      // Pass optional data for better personalization
      learnerNumber,
      parentName,
    };

    const response = await fetch(`${this.baseURL}/test-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('❌ WhatsApp API Error:', data);
      throw new Error(data.error || 'Failed to send WhatsApp message');
    }

    return { 
      ...data, 
      payload,
      invitationToken: token // Return token for debugging
    };
  }

  // Bulk and schedule methods remain the same...
  async sendBulkMessages({ schoolName, recipientNumbers, schoolId, userEmail, gradeIds }: BulkMessagesParams): Promise<any> {
    // ... existing implementation
  }

  async scheduleBulkMessage({ message, scheduledAt, timezone, recipientNumbers, schoolId, schoolName, gradeIds }: ScheduleMessageParams): Promise<any> {
    // ... existing implementation
  }

  getTemplateInfo() {
    return {
      templateName: 'school_invitation',
      variables: [
        { position: 1, name: 'gradename', description: 'Grade name (e.g. "1st Grade")' },
        { position: 2, name: 'magiclink', description: 'Magic link invitation URL' },
        { position: 3, name: 'supportemail', description: 'Support email for the school' },
        { position: 4, name: 'schoolname', description: 'Name of the school' },
        { position: 5, name: 'parentname', description: 'Parent name for personalization' },
        { position: 6, name: 'learnername', description: 'Learner name for personalization' },
      ],
    };
  }
}

export default new WhatsAppBusinessService();