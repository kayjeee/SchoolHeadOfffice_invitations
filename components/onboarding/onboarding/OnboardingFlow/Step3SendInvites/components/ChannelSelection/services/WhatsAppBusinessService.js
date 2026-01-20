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