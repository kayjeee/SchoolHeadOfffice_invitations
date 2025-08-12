/**
 * InvitationValidation - Handles validation logic for invitation data
 * Provides comprehensive validation for all invitation-related inputs
 */

export class InvitationValidation {
  /**
   * Validate recipient selection
   * @param {Array} recipients - Selected recipients
   * @returns {Object} Validation result
   */
  static validateRecipients(recipients) {
    const errors = [];

    if (!recipients || !Array.isArray(recipients)) {
      errors.push('Recipients must be an array');
      return { isValid: false, errors };
    }

    if (recipients.length === 0) {
      errors.push('At least one recipient must be selected');
    }

    if (recipients.length > 1000) {
      errors.push('Cannot send to more than 1000 recipients at once');
    }

    // Validate individual recipients
    recipients.forEach((recipient, index) => {
      if (!recipient.id) {
        errors.push(`Recipient ${index + 1}: ID is required`);
      }
      
      if (!recipient.email || !this.isValidEmail(recipient.email)) {
        errors.push(`Recipient ${index + 1}: Valid email is required`);
      }
      
      if (!recipient.name || recipient.name.trim().length === 0) {
        errors.push(`Recipient ${index + 1}: Name is required`);
      }
    });

    // Check for duplicate emails
    const emails = recipients.map(r => r.email).filter(Boolean);
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    if (duplicateEmails.length > 0) {
      errors.push(`Duplicate email addresses found: ${duplicateEmails.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate subject line
   * @param {string} subject - Email subject
   * @returns {Object} Validation result
   */
  static validateSubject(subject) {
    const errors = [];

    if (!subject || typeof subject !== 'string') {
      errors.push('Subject is required');
      return { isValid: false, errors };
    }

    const trimmedSubject = subject.trim();

    if (trimmedSubject.length === 0) {
      errors.push('Subject cannot be empty');
    }

    if (trimmedSubject.length > 200) {
      errors.push('Subject must be 200 characters or less');
    }

    if (trimmedSubject.length < 3) {
      errors.push('Subject must be at least 3 characters long');
    }

    // Check for spam-like patterns
    const spamPatterns = [
      /^(RE:|FW:|FWD:)/i,
      /\$\$\$/,
      /!!!/,
      /FREE/i,
      /URGENT/i,
      /WINNER/i
    ];

    spamPatterns.forEach(pattern => {
      if (pattern.test(trimmedSubject)) {
        errors.push('Subject contains patterns that may be flagged as spam');
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: this.getSubjectWarnings(trimmedSubject)
    };
  }

  /**
   * Validate message content
   * @param {string} message - Email message content
   * @returns {Object} Validation result
   */
  static validateMessage(message) {
    const errors = [];
    const warnings = [];

    if (!message || typeof message !== 'string') {
      errors.push('Message content is required');
      return { isValid: false, errors };
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      errors.push('Message content cannot be empty');
    }

    if (trimmedMessage.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    if (trimmedMessage.length > 50000) {
      errors.push('Message must be 50,000 characters or less');
    }

    // Check for HTML validity if message contains HTML
    if (this.containsHTML(trimmedMessage)) {
      const htmlValidation = this.validateHTML(trimmedMessage);
      if (!htmlValidation.isValid) {
        errors.push(...htmlValidation.errors);
      }
      warnings.push(...htmlValidation.warnings);
    }

    // Check for required elements
    const hasCallToAction = this.hasCallToAction(trimmedMessage);
    if (!hasCallToAction) {
      warnings.push('Consider adding a clear call-to-action to your message');
    }

    // Check for personalization
    const hasPersonalization = this.hasPersonalization(trimmedMessage);
    if (!hasPersonalization) {
      warnings.push('Consider adding personalization variables to make your message more engaging');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate scheduling options
   * @param {Object} schedulingData - Scheduling configuration
   * @returns {Object} Validation result
   */
  static validateScheduling(schedulingData) {
    const errors = [];
    const warnings = [];

    if (!schedulingData || typeof schedulingData !== 'object') {
      errors.push('Scheduling data is required');
      return { isValid: false, errors };
    }

    const { sendImmediately, scheduledDate } = schedulingData;

    if (sendImmediately === undefined || typeof sendImmediately !== 'boolean') {
      errors.push('Send immediately option must be specified');
    }

    if (!sendImmediately) {
      if (!scheduledDate) {
        errors.push('Scheduled date is required when not sending immediately');
      } else {
        const date = new Date(scheduledDate);
        const now = new Date();
        const minDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
        const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

        if (isNaN(date.getTime())) {
          errors.push('Invalid scheduled date');
        } else if (date < minDate) {
          errors.push('Scheduled date must be at least 5 minutes in the future');
        } else if (date > maxDate) {
          errors.push('Scheduled date cannot be more than 1 year in the future');
        }

        // Check for optimal sending times
        const hour = date.getHours();
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          warnings.push('Sending on weekends may result in lower open rates');
        }

        if (hour < 8 || hour > 18) {
          warnings.push('Sending outside business hours may result in lower open rates');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate complete invitation data
   * @param {Object} invitationData - Complete invitation data
   * @returns {Object} Comprehensive validation result
   */
  static validateComplete(invitationData) {
    const recipientValidation = this.validateRecipients(invitationData.recipients);
    const subjectValidation = this.validateSubject(invitationData.subject);
    const messageValidation = this.validateMessage(invitationData.message);
    const schedulingValidation = this.validateScheduling({
      sendImmediately: invitationData.sendImmediately,
      scheduledDate: invitationData.scheduledDate
    });

    const allErrors = [
      ...recipientValidation.errors,
      ...subjectValidation.errors,
      ...messageValidation.errors,
      ...schedulingValidation.errors
    ];

    const allWarnings = [
      ...(subjectValidation.warnings || []),
      ...(messageValidation.warnings || []),
      ...(schedulingValidation.warnings || [])
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      fieldValidation: {
        recipients: recipientValidation,
        subject: subjectValidation,
        message: messageValidation,
        scheduling: schedulingValidation
      }
    };
  }

  /**
   * Check if email address is valid
   * @param {string} email - Email address to validate
   * @returns {boolean} Is valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if message contains HTML
   * @param {string} message - Message content
   * @returns {boolean} Contains HTML
   */
  static containsHTML(message) {
    return /<[^>]*>/g.test(message);
  }

  /**
   * Validate HTML content
   * @param {string} html - HTML content
   * @returns {Object} HTML validation result
   */
  static validateHTML(html) {
    const errors = [];
    const warnings = [];

    // Check for unclosed tags
    const openTags = html.match(/<[^/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]*>/g) || [];

    if (openTags.length !== closeTags.length) {
      warnings.push('HTML may contain unclosed tags');
    }

    // Check for dangerous elements
    const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form'];
    dangerousElements.forEach(element => {
      const regex = new RegExp(`<${element}[^>]*>`, 'i');
      if (regex.test(html)) {
        errors.push(`Dangerous HTML element detected: ${element}`);
      }
    });

    // Check for inline styles (recommend CSS classes instead)
    if (/style\s*=/i.test(html)) {
      warnings.push('Consider using CSS classes instead of inline styles for better email compatibility');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if message has a call-to-action
   * @param {string} message - Message content
   * @returns {boolean} Has call-to-action
   */
  static hasCallToAction(message) {
    const ctaPatterns = [
      /click here/i,
      /sign up/i,
      /register/i,
      /join/i,
      /download/i,
      /get started/i,
      /learn more/i,
      /contact us/i,
      /visit/i,
      /apply/i
    ];

    return ctaPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Check if message has personalization variables
   * @param {string} message - Message content
   * @returns {boolean} Has personalization
   */
  static hasPersonalization(message) {
    return /\{\{[^}]+\}\}/.test(message);
  }

  /**
   * Get subject line warnings
   * @param {string} subject - Subject line
   * @returns {Array} Warning messages
   */
  static getSubjectWarnings(subject) {
    const warnings = [];

    if (subject.length > 50) {
      warnings.push('Subject lines over 50 characters may be truncated in some email clients');
    }

    if (!/[a-z]/.test(subject)) {
      warnings.push('Consider using mixed case instead of all caps for better readability');
    }

    if (subject.includes('?')) {
      warnings.push('Question marks in subject lines may reduce open rates');
    }

    return warnings;
  }
}

export default InvitationValidation;

