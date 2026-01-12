// services/WhatsAppBusinessService.ts - HYBRID + MULTI-COUNTRY VERSION
import { logger } from '../utils/logger';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  userEmail?: string;
  learnerNumber?: string;
  parentName?: string;
  invitedVia?: string;
  sender_id?: string;
  countryCode?: string;
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
  countryCode?: string;
}

interface BulkMessagesParams {
  schoolName: string;
  recipientNumbers: string[];
  schoolId: string;
  userEmail?: string;
  gradeIds?: string[];
  personalizedMessages?: { to: string; message: string; gradeName: string; magicLink: string }[];
  countryCode?: string;
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

interface CountryConfig {
  code: string;
  name: string;
  regex: RegExp;
  whatsappSupported: boolean;
  example: string;
  minLength: number;
  maxLength: number;
}

/* ------------------------------------------------------------------ */
/* Service                                                            */
/* ------------------------------------------------------------------ */

class WhatsAppBusinessService {
  private baseURL: string;
  private invitationsURL: string;

  /* ---------------- Country Configuration ---------------- */

  private readonly SUPPORTED_COUNTRIES: CountryConfig[] = [
    {
      code: '27',
      name: 'South Africa',
      regex: /^27[1-9][0-9]{8}$/,
      whatsappSupported: true,
      example: '+27821234567',
      minLength: 11,
      maxLength: 11,
    },
    {
      code: '256',
      name: 'Uganda',
      regex: /^256(7[0-9]|20|3[0-9])\d{7}$/,
      whatsappSupported: true,
      example: '+256758642938',
      minLength: 12,
      maxLength: 12,
    },
    {
      code: '254',
      name: 'Kenya',
      regex: /^254(7[0-9]|1[0-9])\d{7}$/,
      whatsappSupported: true,
      example: '+254712345678',
      minLength: 12,
      maxLength: 12,
    },
    {
      code: '267',
      name: 'Botswana',
      regex: /^267(7[0-9]|6[0-9])\d{6}$/,
      whatsappSupported: true,
      example: '+26771234567',
      minLength: 11,
      maxLength: 11,
    },
    {
      code: '234',
      name: 'Nigeria',
      regex: /^234[7-9][0-1][0-9]{8}$/,
      whatsappSupported: true,
      example: '+2348123456789',
      minLength: 13,
      maxLength: 14,
    },
  ];

  constructor() {
    this.baseURL = '/api/whatsapp-business';
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  /* ------------------------------------------------------------------ */
  /* Backward Compatibility                                             */
  /* ------------------------------------------------------------------ */

  /**
   * ⚠️ NO-OP METHOD
   * Kept only so legacy UI code does not crash.
   * Frontend no longer validates WhatsApp templates.
   */
  public validateMessageTemplate(_message: string): void {
    return;
  }

  /* ------------------------------------------------------------------ */
  /* Utilities                                                          */
  /* ------------------------------------------------------------------ */

  private sanitizeSchoolName(schoolName: string): string {
    return schoolName?.trim() || 'Your School';
  }

  private buildSupportEmail(schoolName: string): string {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    return `support@${domain || 'schoolportal'}.com`;
  }

  private buildMagicLink({ token, schoolName }: BuildMagicLinkParams): string {
    if (!schoolName?.trim()) {
      throw new Error('schoolName is required');
    }
    return `?token=${token}&school=${encodeURIComponent(schoolName.trim())}`;
  }

  /* ------------------------------------------------------------------ */
  /* Phone Validation                                                   */
  /* ------------------------------------------------------------------ */

  private getCountryConfig(phone: string): CountryConfig | null {
    const digits = phone.replace(/\D/g, '');
    return (
      [...this.SUPPORTED_COUNTRIES]
        .sort((a, b) => b.code.length - a.code.length)
        .find((c) => digits.startsWith(c.code)) || null
    );
  }

  public validatePhoneNumber(
    phone: string,
    countryCode?: string
  ): {
    isValid: boolean;
    formattedNumber: string;
    country: CountryConfig | null;
    error?: string;
  } {
    let digits = phone.replace(/\D/g, '');

    if (countryCode && !digits.startsWith(countryCode)) {
      digits = digits.startsWith('0')
        ? countryCode + digits.slice(1)
        : countryCode + digits;
    }

    const country = this.getCountryConfig(digits);
    if (!country) {
      return {
        isValid: false,
        formattedNumber: digits,
        country: null,
        error: 'Unsupported country code',
      };
    }

    if (
      digits.length < country.minLength ||
      digits.length > country.maxLength
    ) {
      return {
        isValid: false,
        formattedNumber: digits,
        country,
        error: `Invalid ${country.name} number length`,
      };
    }

    if (!country.regex.test(digits)) {
      return {
        isValid: false,
        formattedNumber: digits,
        country,
        error: `Invalid ${country.name} number format`,
      };
    }

    return { isValid: true, formattedNumber: digits, country };
  }

  /* ------------------------------------------------------------------ */
  /* Invitations                                                        */
  /* ------------------------------------------------------------------ */

  async createInvitation(params: InvitationParams): Promise<string> {
    const validation = this.validatePhoneNumber(
      params.phoneNumber,
      params.countryCode
    );

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const payload: any = {
      phone_number: validation.formattedNumber,
      school_id: params.schoolId,
      role: 'parent',
      invited_via: params.invitedVia || 'whatsapp',
    };

    if (params.learnerNumber) payload.learner_number = params.learnerNumber;
    if (params.parentName) payload.parent_name = params.parentName;
    if (params.sender_id) payload.sender_id = params.sender_id;
    if (validation.country) {
      payload.country_code = validation.country.code;
      payload.country_name = validation.country.name;
    }

    const res = await fetch(this.invitationsURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': params.userEmail || 'system@schoolheadoffice.com',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invitation failed');
    }

    return data.invitation?.token || data.token;
  }

  /* ------------------------------------------------------------------ */
  /* Test Message                                                       */
  /* ------------------------------------------------------------------ */

  async sendTestMessage(params: TestMessageParams): Promise<any> {
    const validation = this.validatePhoneNumber(
      params.to,
      params.countryCode
    );

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const token = await this.createInvitation({
      phoneNumber: validation.formattedNumber,
      schoolId: params.schoolId,
      userEmail: params.userEmail,
      learnerNumber: params.learnerNumber,
      parentName: params.parentName,
      invitedVia: params.invitedVia,
      sender_id: params.sender_id,
      countryCode: validation.country?.code,
    });

    const schoolName = this.sanitizeSchoolName(params.schoolName);

    const payload = {
      to: validation.formattedNumber,
      schoolName,
      magicLink: this.buildMagicLink({ token, schoolName }),
      supportEmail: this.buildSupportEmail(schoolName),
      testType: 'MAGIC_LINK',
      parentName: params.parentName,
      learnerNumber: params.learnerNumber,
      country: validation.country?.name,
    };

    const res = await fetch(`${this.baseURL}/test-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'WhatsApp send failed');
    }

    return { ...data, invitationToken: token };
  }

  /* ------------------------------------------------------------------ */
  /* Bulk & Scheduled Messages                                          */
  /* ------------------------------------------------------------------ */

  async sendBulkMessages(params: BulkMessagesParams): Promise<any> {
    const personalizedMessages = await Promise.all(
      params.recipientNumbers.map(async (to) => {
        const validation = this.validatePhoneNumber(to, params.countryCode);

        if (!validation.isValid) {
          logger.warn('sendBulkMessages', 'Skipping invalid phone number', {
            number: to,
            error: validation.error,
          });
          return null;
        }

        const token = await this.createInvitation({
          phoneNumber: validation.formattedNumber,
          schoolId: params.schoolId,
          userEmail: params.userEmail,
          countryCode: validation.country?.code,
        });

        return {
          to: validation.formattedNumber,
          magicLink: this.buildMagicLink({ token, schoolName: params.schoolName }),
          gradeName: 'Selected Grade',
        };
      })
    );

    const validMessages = personalizedMessages.filter(Boolean);

    const payload = {
      gradeIds: params.gradeIds,
      schoolName: this.sanitizeSchoolName(params.schoolName),
      personalizedMessages: validMessages,
    };

    const res = await fetch(`${this.baseURL}/send-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'WhatsApp bulk send failed');
    }
    return data;
  }

  async scheduleBulkMessage(params: ScheduleMessageParams): Promise<any> {
    const payload = {
      gradeIds: params.gradeIds,
      message: params.message,
      scheduledAt: params.scheduledAt,
      timezone: params.timezone,
      recipientNumbers: params.recipientNumbers,
      schoolId: params.schoolId,
      schoolName: this.sanitizeSchoolName(params.schoolName),
    };

    const res = await fetch(`${this.baseURL}/schedule-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'WhatsApp schedule failed');
    }
    return data;
  }

  /* ------------------------------------------------------------------ */
  /* Info                                                               */
  /* ------------------------------------------------------------------ */

  getSupportedCountries() {
    return this.SUPPORTED_COUNTRIES;
  }
}

export default new WhatsAppBusinessService();
