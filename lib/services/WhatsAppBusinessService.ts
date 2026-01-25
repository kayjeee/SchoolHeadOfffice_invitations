// services/WhatsAppBusinessService.ts - CONSOLIDATED MULTI-COUNTRY VERSION
import { nasaLog as logger } from '../nasaLogger';
import InvitationService from './invitationService';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  learnerNumbers?: string[];
  parentName?: string;
  gradeId?: string;
  sender: string;
  userEmail?: string;
  invitedVia?: string;
  countryCode?: string;
}

interface ScheduleBulkParams {
  gradeIds: string[];
  message: string;
  scheduledAt: string | Date;
  timezone?: string;
  recipientNumbers: string[];
  schoolId: string;
  schoolName: string;
}

interface TestMessageParams {
  to: string;
  schoolName: string;
  grade?: { id?: string; name?: string };
  schoolId: string;
  userEmail?: string;
  learnerNumber?: string;
  parentName?: string;
  sender_id?: string;
  countryCode?: string;
}

interface BulkMessagesParams {
  gradeIds?: string[];
  schoolName: string;
  recipientNumbers: any[];
  schoolId: string;
  userEmail?: string;
  senderId?: string;
  countryCode?: string;
}

interface BuildMagicLinkParams {
  token: string;
  schoolName: string;
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

interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber: string;
  country: CountryConfig | null;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Service                                                            */
/* ------------------------------------------------------------------ */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://shobackendv2-production.up.railway.app';

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

  /* ============================================================
   🔹 COUNTRY CONFIGURATION & VALIDATION
  ============================================================ */

  /**
   * Get country configuration for a phone number
   */
  private getCountryConfig(phone: string): CountryConfig | null {
    const digits = phone.replace(/\D/g, '');
    return (
      [...this.SUPPORTED_COUNTRIES]
        .sort((a, b) => b.code.length - a.code.length)
        .find((c) => digits.startsWith(c.code)) || null
    );
  }

  /**
   * Validate phone number with country-specific rules
   */
  public validatePhoneNumber(
    phone: string,
    countryCode?: string
  ): PhoneValidationResult {
    try {
      let digits = phone.replace(/\D/g, '');

      // Apply country code if provided
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

      // Validate length
      if (digits.length < country.minLength || digits.length > country.maxLength) {
        return {
          isValid: false,
          formattedNumber: digits,
          country,
          error: `Invalid ${country.name} number length. Expected ${country.minLength}-${country.maxLength} digits`,
        };
      }

      // Validate format
      if (!country.regex.test(digits)) {
        return {
          isValid: false,
          formattedNumber: digits,
          country,
          error: `Invalid ${country.name} number format. Example: ${country.example}`,
        };
      }

      return {
        isValid: true,
        formattedNumber: digits,
        country,
      };
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Phone validation failed', {
        error: error.message,
        phone,
      });
      return {
        isValid: false,
        formattedNumber: phone.replace(/\D/g, ''),
        country: null,
        error: 'Validation error',
      };
    }
  }

  /**
   * Get all supported countries
   */
  public getSupportedCountries(): CountryConfig[] {
    return this.SUPPORTED_COUNTRIES;
  }

  /* ============================================================
   🔹 STEP 1 – CREATE INVITATION (GET TOKEN)
  ============================================================ */

  async createInvitation({
    phoneNumber,
    schoolId,
    learnerNumbers = [],
    parentName,
    gradeId,
    sender,
    userEmail,
    invitedVia = 'whatsapp',
    countryCode,
  }: InvitationParams): Promise<string> {
    try {
      logger('INFO', 'WhatsAppService', 'Creating invitation token', {
        phoneNumber,
        schoolId,
      });

      if (!schoolId) throw new Error('schoolId is required');
      if (!phoneNumber) throw new Error('phoneNumber is required');

      // Validate phone number
      const validation = this.validatePhoneNumber(phoneNumber, countryCode);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const payload: any = {
        phone_number: validation.formattedNumber,
        school_id: schoolId,
        learner_numbers: learnerNumbers,
        role: 'parent',
        parent_name: parentName || null,
        grade_id: gradeId || null,
        invited_via: invitedVia,
        sender,
      };

      // Add country metadata if available
      if (validation.country) {
        payload.country_code = validation.country.code;
        payload.country_name = validation.country.name;
      }

      const response = await fetch(this.invitationsURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'system@schoolheadoffice.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      const token = data.invitation?.token || data.token;

      if (!token) {
        throw new Error('No token returned from API');
      }

      logger('INFO', 'WhatsAppService', 'Token created', {
        token: token.slice(0, 8) + '...',
        country: validation.country?.name,
      });

      return token;
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Create invitation failed', {
        error: error.message,
        phoneNumber,
        schoolId,
      });
      throw error;
    }
  }

  /* ============================================================
   🔹 STEP 2 – BUILD MAGIC LINK (UPDATED TO MATCH FIRST FILE)
  ============================================================ */

  buildMagicLink({ token, schoolName }: BuildMagicLinkParams): string {
    if (!token) throw new Error('Token missing');
    if (!schoolName?.trim()) throw new Error('School name missing');

    // ⚡ UPDATED: Returns only query parameters as in first file
    return `?token=${token}&school=${encodeURIComponent(schoolName.trim())}`;
  }

  /**
   * Alternative: Build full URL with GitHub Pages base
   */
  buildMagicLinkFullUrl({ token, schoolName }: BuildMagicLinkParams): string {
    if (!token) throw new Error('Token missing');
    if (!schoolName?.trim()) throw new Error('School name missing');

    const baseUrl = 'https://kayjeee.github.io/Far-North-school/';
    const queryParams = this.buildMagicLink({ token, schoolName });
    return `${baseUrl}${queryParams}`;
  }

  /* ============================================================
   🔹 STEP 3 – BUILD MESSAGE (KEPT FROM SECOND FILE)
  ============================================================ */

  buildMagicLinkMessage({
    schoolName,
    gradeName,
    magicLink,
  }: {
    schoolName: string;
    gradeName: string;
    magicLink: string;
  }): string {
    return `🏫 ${schoolName} - Important Notice

Dear Parent,

Please collect the following uniform items tomorrow:

📅 Date: 17th January 2025
⏰ Time: 08h00 - 12h00

Items to collect:
✓ Pants
✓ Shirts
✓ Skirts

⚠️ IMPORTANT: Please bring:
• Uniform list
• Proof of Payment (POP)

🔗 View full details: ${magicLink}

Kind Regards,
Mr Maropeng PS
${schoolName}`;
  }

  /* ============================================================
   🔹 STEP 4 – VALIDATE MESSAGE TEMPLATE
  ============================================================ */

  validateMessageTemplate(message: string): boolean {
    if (typeof message !== 'string') {
      throw new Error('Message must be string');
    }

    if (message.length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 4096) {
      throw new Error('Message too long (max 4096 characters)');
    }

    if (message.match(/[<>]/g)) {
      throw new Error('Invalid characters found (<> not allowed)');
    }

    return true;
  }

  /* ============================================================
   🔹 STEP 5 – SEND TEST MESSAGE
  ============================================================ */

  async sendTestMessage({
    to,
    schoolName,
    grade,
    schoolId,
    userEmail,
    learnerNumber,
    parentName,
    sender_id,
    countryCode,
  }: TestMessageParams): Promise<any> {
    try {
      logger('INFO', 'WhatsAppService', 'Sending test message', {
        to,
        schoolName,
      });

      if (!to || !schoolName || !schoolId) {
        throw new Error('Missing required fields: to, schoolName, schoolId');
      }

      // Validate phone number
      const phoneValidation = this.validatePhoneNumber(to, countryCode);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.error);
      }

      // Create invitation token
      const token = await this.createInvitation({
        phoneNumber: to,
        schoolId,
        learnerNumbers: learnerNumber ? [learnerNumber] : [],
        parentName: parentName || 'Parent',
        gradeId: grade?.id,
        sender: sender_id || userEmail || 'system',
        userEmail,
        countryCode: phoneValidation.country?.code,
      });

      // Build magic link (query parameters only)
      const magicLink = this.buildMagicLink({
        token,
        schoolName,
      });

      // Build message template
      const message = this.buildMagicLinkMessage({
        schoolName,
        gradeName: grade?.name || "your child's class",
        magicLink,
      });

      // Validate message
      this.validateMessageTemplate(message);

      const response = await fetch(`${this.baseURL}/test-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          to: phoneValidation.formattedNumber,
          message,
          magicLink,
          testType: 'MAGIC_LINK',
          schoolName,
          country: phoneValidation.country?.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test message');
      }

      logger('INFO', 'WhatsAppService', 'Test message sent successfully', {
        to: phoneValidation.formattedNumber,
        country: phoneValidation.country?.name,
      });

      return {
        ...data,
        token,
        magicLink,
        formattedPhone: phoneValidation.formattedNumber,
        country: phoneValidation.country?.name,
      };
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Test send failed', {
        error: error.message,
        to,
        schoolName,
      });
      throw error;
    }
  }

 /* ============================================================
   🔹 STEP 6 – BULK SEND (WITH DETAILED LOGGING)
  ============================================================ */

async sendBulkMessages({
  gradeIds,
  schoolName,
  recipientNumbers,
  schoolId,
  userEmail,
  senderId,
  countryCode = '27', // ✅ ADD THIS - defaults to South Africa
}: BulkMessagesParams): Promise<any> {
  console.log('🚀 ========================================');
  console.log('🚀 BULK SEND INITIATED');
  console.log('🚀 ========================================');
  console.log('📋 Input Parameters:', {
    schoolId,
    schoolName,
    recipientCount: recipientNumbers.length,
    gradeIds,
    userEmail,
    senderId,
    countryCode, // ✅ LOG IT
    timestamp: new Date().toISOString()
  });

  try {
    logger('INFO', 'WhatsAppService', 'Starting bulk send', {
      schoolId,
      recipientCount: recipientNumbers.length,
      countryCode, // ✅ LOG IT
    });

    // Validation
    if (!schoolId || !schoolName) {
      console.error('❌ Missing required fields:', { schoolId, schoolName });
      throw new Error('schoolId & schoolName are required');
    }

    // Prepare invitations
    const invitations = recipientNumbers.map((recipient: any) => ({
      phone_number: recipient.phone,
      parent_name: recipient.name || 'Parent',
      learner_number: recipient.learner_number,
    }));

    console.log('📞 Prepared invitations:', {
      count: invitations.length,
      sample: invitations.slice(0, 2),
      allPhones: invitations.map(i => i.phone_number)
    });

    // Create bulk invitations
    console.log('🔄 Creating bulk invitations...');
    const bulk = await InvitationService.createBulkInvitations({
      invitations,
      school_id: schoolId,
      sender_id: senderId,
      userEmail,
    });

    console.log('✅ Bulk invitations response:', {
      success: bulk.success,
      invitationCount: bulk.invitations?.length || 0,
      stats: bulk.stats,
      sample: bulk.invitations?.[0]
    });

    if (!bulk.success || !bulk.invitations) {
      console.error('❌ Bulk invitation creation failed:', bulk);
      throw new Error('Bulk invitation creation failed');
    }

    // Process invitations into personalized messages
    console.log('🔄 Processing invitations into messages...');
    const personalizedMessages = await Promise.all(
      bulk.invitations.map(async (inv: any, index: number) => {
        console.log(`📝 Processing invitation ${index + 1}/${bulk.invitations.length}:`, {
          phone: inv.phone_number,
          name: inv.parent_name,
          token: inv.token?.substring(0, 10) + '...',
          hasToken: !!inv.token
        });

        try {
          // ✅ FIX: Pass countryCode to validation
          const phoneValidation = this.validatePhoneNumber(inv.phone_number, countryCode);
          
          console.log(`📱 Phone validation result for ${inv.phone_number}:`, {
            isValid: phoneValidation.isValid,
            formattedNumber: phoneValidation.formattedNumber,
            country: phoneValidation.country?.name,
            error: phoneValidation.error
          });

          if (!phoneValidation.isValid) {
            logger('WARN', 'WhatsAppService', 'Invalid phone in bulk', {
              phone: inv.phone_number,
              error: phoneValidation.error,
            });
            return null;
          }

          const token = inv.token;
          if (!token) {
            console.error('❌ Missing token for:', inv.phone_number);
            logger('WARN', 'WhatsAppService', 'Missing token for invitation', {
              phone: inv.phone_number,
            });
            return null;
          }

          // Build magic link
          const magicLink = this.buildMagicLink({
            token,
            schoolName,
          });

          console.log(`🔗 Magic link created for ${inv.phone_number}:`, {
            link: magicLink.substring(0, 60) + '...',
            fullLength: magicLink.length
          });

          const message = {
            to: phoneValidation.formattedNumber,
            message: this.buildMagicLinkMessage({
              schoolName,
              gradeName: 'Selected Grade',
              magicLink,
            }),
            magicLink,
            country: phoneValidation.country?.name,
            parentName: inv.parent_name,
            learnerNumber: inv.learner_number,
          };

          console.log(`✅ Message created for ${phoneValidation.formattedNumber}`);
          return message;

        } catch (error: any) {
          console.error(`❌ Failed to process invitation for ${inv.phone_number}:`, {
            error: error.message,
            stack: error.stack
          });
          logger('ERROR', 'WhatsAppService', 'Failed to process invitation', {
            phone: inv.phone_number,
            error: error.message,
          });
          return null;
        }
      })
    );

    // Filter valid messages
    const validMessages = personalizedMessages.filter(msg => msg !== null);

    console.log('📊 Message processing results:', {
      total: personalizedMessages.length,
      valid: validMessages.length,
      invalid: personalizedMessages.length - validMessages.length,
      validMessages: validMessages.map(m => ({
        to: m?.to,
        hasLink: !!m?.magicLink,
        hasMessage: !!m?.message
      }))
    });

    if (validMessages.length === 0) {
      console.error('❌ No valid messages to send');
      throw new Error('No valid messages to send. Check that phone numbers include country code or pass countryCode parameter.');
    }

    // Prepare API request
    const endpoint = `${this.baseURL}/send-bulk`;
    const requestBody = {
      gradeIds,
      schoolName,
      personalizedMessages: validMessages,
      totalRecipients: validMessages.length,
      failedRecipients: personalizedMessages.length - validMessages.length,
    };

    console.log('🌐 ========================================');
    console.log('🌐 CALLING WHATSAPP API ENDPOINT');
    console.log('🌐 ========================================');
    console.log('📍 Endpoint:', endpoint);
    console.log('📦 Request body:', {
      gradeIds: requestBody.gradeIds,
      schoolName: requestBody.schoolName,
      messageCount: requestBody.personalizedMessages.length,
      totalRecipients: requestBody.totalRecipients,
      failedRecipients: requestBody.failedRecipients,
      firstMessage: requestBody.personalizedMessages[0]
    });

    // Make the API call
    console.log('⏳ Fetching endpoint...');
    const fetchStartTime = Date.now();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(requestBody),
    });

    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`⏱️ Fetch completed in ${fetchDuration}ms`);

    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: fetchDuration + 'ms'
    });

    const data = await response.json();

    console.log('📄 Response data:', {
      success: data.success,
      stats: data.stats,
      message: data.message,
      error: data.error,
    });

    if (!response.ok) {
      console.error('❌ API returned error:', {
        status: response.status,
        error: data.error,
        message: data.message,
      });
      throw new Error(data.error || data.message || 'Bulk send failed');
    }

    console.log('✅ ========================================');
    console.log('✅ BULK SEND COMPLETED SUCCESSFULLY');
    console.log('✅ ========================================');
    console.log('📊 Final stats:', {
      sent: data.stats?.sent || 0,
      failed: data.stats?.failed || 0,
      total: personalizedMessages.length
    });

    logger('INFO', 'WhatsAppService', 'Bulk send completed', {
      successCount: data.stats?.sent || 0,
      failedCount: data.stats?.failed || 0,
    });

    return {
      success: true,
      ...data,
      stats: {
        total: personalizedMessages.length,
        successful: data.stats?.sent || 0,
        failed: data.stats?.failed || 0,
        invalidNumbers: data.stats?.invalidNumbers || 0,
      },
      sentCount: data.stats?.sent || 0,
      failedCount: data.stats?.failed || 0,
    };

  } catch (error: any) {
    console.error('💥 ========================================');
    console.error('💥 BULK SEND FAILED');
    console.error('💥 ========================================');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    logger('ERROR', 'WhatsAppService', 'Bulk send failed', {
      error: error.message,
      schoolId,
    });
    throw error;
  }
}

  /* ============================================================
   🔹 STEP 7 – SCHEDULE BULK MESSAGE
  ============================================================ */

  async scheduleBulkMessage({
    gradeIds,
    message,
    scheduledAt,
    timezone,
    recipientNumbers,
    schoolId,
    schoolName,
  }: ScheduleBulkParams): Promise<any> {
    try {
      logger('INFO', 'WhatsAppService', 'Scheduling bulk message', {
        schoolId,
        recipientCount: recipientNumbers.length,
      });

      // Validate all phone numbers
      const validatedNumbers = recipientNumbers.map(phone => {
        const validation = this.validatePhoneNumber(phone);
        if (!validation.isValid) {
          logger('WARN', 'WhatsAppService', 'Invalid phone in schedule', {
            phone,
            error: validation.error,
          });
        }
        return {
          original: phone,
          validated: validation,
        };
      });

      // Filter valid numbers
      const validNumbers = validatedNumbers
        .filter(item => item.validated.isValid)
        .map(item => item.validated.formattedNumber);

      if (validNumbers.length === 0) {
        throw new Error('No valid phone numbers to schedule');
      }

      const response = await fetch(`${this.baseURL}/schedule-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          gradeIds,
          message,
          scheduledAt,
          timezone,
          recipientNumbers: validNumbers,
          schoolId,
          schoolName,
          validCount: validNumbers.length,
          invalidCount: validatedNumbers.length - validNumbers.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Schedule bulk message failed');
      }

      logger('INFO', 'WhatsAppService', 'Bulk message scheduled', {
        schoolId,
        scheduledCount: validNumbers.length,
      });

      return {
        ...data,
        stats: {
          total: validatedNumbers.length,
          valid: validNumbers.length,
          invalid: validatedNumbers.length - validNumbers.length,
        },
      };
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Schedule bulk failed', {
        error: error.message,
        schoolId,
      });
      throw error;
    }
  }

  /* ============================================================
   🔹 HELPER METHODS
  ============================================================ */

  /**
   * Format phone number with plus sign
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  /**
   * Backward compatibility method
   */
  getCountryByCode(code: string): CountryConfig | undefined {
    return this.SUPPORTED_COUNTRIES.find(c => c.code === code);
  }

  /**
   * Check if country is supported
   */
  isCountrySupported(code: string): boolean {
    return this.SUPPORTED_COUNTRIES.some(c => c.code === code);
  }
}

export default new WhatsAppBusinessService();