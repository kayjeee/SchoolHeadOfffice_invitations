import { InviteMessage, InviteChannel, Learner } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validationUtils = {
  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format (basic validation)
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate invite message based on channel requirements
   */
  validateInviteMessage(message: InviteMessage, channel: InviteChannel): string[] {
    const errors: string[] = [];

    // Common validation
    if (!message.body || !message.body.trim()) {
      errors.push('Message body is required');
    }

    // Channel-specific validation
    switch (channel.id) {
      case 'email':
      case 'portal-message':
        if (!message.subject || !message.subject.trim()) {
          errors.push('Subject is required for email messages');
        }
        if (message.subject && message.subject.length > 200) {
          errors.push('Subject must be 200 characters or less');
        }
        break;

      case 'app-notification':
        if (!message.title || !message.title.trim()) {
          errors.push('Title is required for app notifications');
        }
        if (message.title && message.title.length > 100) {
          errors.push('Title must be 100 characters or less');
        }
        if (message.body && message.body.length > 200) {
          errors.push('Notification message must be 200 characters or less');
        }
        break;

      case 'sms':
        if (message.body && message.body.length > 160) {
          errors.push('SMS message must be 160 characters or less');
        }
        break;
    }

    // Check for required variables
    if (message.body && !message.body.includes('{{learnerName}}')) {
      errors.push('Message should include {{learnerName}} variable for personalization');
    }

    if (message.body && !message.body.includes('{{inviteLink}}')) {
      errors.push('Message should include {{inviteLink}} variable');
    }

    return errors;
  },

  /**
   * Validate learner data
   */
  validateLearner(learner: Partial<Learner>): ValidationResult {
    const errors: string[] = [];

    if (!learner.name || !learner.name.trim()) {
      errors.push('Learner name is required');
    }

    if (!learner.email || !learner.email.trim()) {
      errors.push('Learner email is required');
    } else if (!this.validateEmail(learner.email)) {
      errors.push('Invalid email format');
    }

    if (!learner.gradeId) {
      errors.push('Grade is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate learner selection for invites
   */
  validateLearnerSelection(learners: Learner[]): ValidationResult {
    const errors: string[] = [];

    if (learners.length === 0) {
      errors.push('At least one learner must be selected');
    }

    if (learners.length > 100) {
      errors.push('Cannot select more than 100 learners at once');
    }

    // Check for duplicate emails
    const emails = learners.map(l => l.email.toLowerCase());
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate email addresses: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Validate each learner
    learners.forEach((learner, index) => {
      const validation = this.validateLearner(learner);
      if (!validation.isValid) {
        errors.push(`Learner ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate message variables and replace them with sample data
   */
  validateAndPreviewMessage(message: string, variables: Record<string, string> = {}): string {
    const defaultVariables = {
      learnerName: 'John Doe',
      inviteLink: 'https://platform.example.com/invite/abc123',
      gradeName: 'Grade 10',
      platformName: 'Learning Platform',
      ...variables
    };

    let previewMessage = message;
    
    // Replace variables
    Object.entries(defaultVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewMessage = previewMessage.replace(regex, value);
    });

    return previewMessage;
  },

  /**
   * Extract variables from message template
   */
  extractVariables(message: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(message)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  },

  /**
   * Validate required variables are present in message
   */
  validateRequiredVariables(message: string, requiredVariables: string[]): string[] {
    const errors: string[] = [];
    const presentVariables = this.extractVariables(message);

    requiredVariables.forEach(variable => {
      if (!presentVariables.includes(variable)) {
        errors.push(`Required variable {{${variable}}} is missing from message`);
      }
    });

    return errors;
  },

  /**
   * Sanitize text input to prevent XSS
   */
  sanitizeText(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Validate file upload (for future use with attachments)
   */
  validateFile(file: File, allowedTypes: string[], maxSizeMB: number): ValidationResult {
    const errors: string[] = [];

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate date range
   */
  validateDateRange(startDate: Date, endDate: Date): ValidationResult {
    const errors: string[] = [];

    if (startDate >= endDate) {
      errors.push('Start date must be before end date');
    }

    if (startDate < new Date()) {
      errors.push('Start date cannot be in the past');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default validationUtils;

