/**
 * Communication Providers Index
 * 
 * Centralized export for all communication service providers.
 * This allows for easy importing and management of different providers.
 */

import TwilioService from './TwilioService';
import WinSMSService from './WinSMSService';
import SendGridService from './SendGridService';

/**
 * Provider factory function
 * Creates and configures provider instances based on configuration
 * 
 * @param {string} providerType - Type of provider ('twilio', 'winsms', 'sendgrid')
 * @param {Object} config - Provider configuration
 * @returns {Object} Provider instance
 */
export const createProvider = (providerType, config = {}) => {
  switch (providerType.toLowerCase()) {
    case 'twilio':
      return new TwilioService(config);
    case 'winsms':
      return new WinSMSService(config);
    case 'sendgrid':
      return new SendGridService(config);
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }
};

/**
 * Get all available providers
 * @returns {Array} Array of provider information
 */
export const getAvailableProviders = () => {
  return [
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS and WhatsApp messaging via Twilio',
      capabilities: ['sms', 'whatsapp', 'bulk_sms', 'bulk_whatsapp'],
      regions: ['Global'],
      pricing: 'Pay-per-message'
    },
    {
      id: 'winsms',
      name: 'WinSMS',
      description: 'SMS messaging for South African networks',
      capabilities: ['sms', 'bulk_sms', 'status_check', 'account_info'],
      regions: ['South Africa'],
      pricing: 'Credits-based'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Email delivery and marketing platform',
      capabilities: ['email', 'bulk_email', 'templated_email', 'attachments', 'statistics'],
      regions: ['Global'],
      pricing: 'Freemium + Pay-per-email'
    }
  ];
};

/**
 * Provider configuration validator
 * Validates provider configuration before creating instances
 * 
 * @param {string} providerType - Provider type
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
export const validateProviderConfig = (providerType, config) => {
  const validations = {
    twilio: {
      required: ['accountSid', 'authToken', 'fromNumber'],
      optional: ['whatsappNumber']
    },
    winsms: {
      required: ['apiKey'],
      optional: ['username', 'password', 'defaultSender']
    },
    sendgrid: {
      required: ['apiKey', 'fromEmail'],
      optional: ['fromName', 'templateId']
    }
  };

  const validation = validations[providerType.toLowerCase()];
  if (!validation) {
    return {
      valid: false,
      errors: [`Unknown provider type: ${providerType}`]
    };
  }

  const errors = [];
  const missing = validation.required.filter(field => !config[field]);
  
  if (missing.length > 0) {
    errors.push(`Missing required fields: ${missing.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    requiredFields: validation.required,
    optionalFields: validation.optional
  };
};

/**
 * Multi-provider message sender
 * Sends messages using multiple providers with fallback support
 * 
 * @param {Array} providers - Array of configured provider instances
 * @param {Object} message - Message to send
 * @param {Array} recipients - Recipients array
 * @returns {Promise<Object>} Send results
 */
export const sendWithFallback = async (providers, message, recipients) => {
  const results = {
    success: false,
    attempts: [],
    finalResult: null,
    totalRecipients: recipients.length,
    successfulDeliveries: 0
  };

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    
    try {
      console.log(`Attempting delivery with provider: ${provider.constructor.name}`);
      
      let result;
      if (message.type === 'sms') {
        result = await provider.sendBulkSMS(recipients, message.content, message.metadata);
      } else if (message.type === 'whatsapp') {
        result = await provider.sendBulkWhatsApp(recipients, message.content, message.metadata);
      } else if (message.type === 'email') {
        result = await provider.sendBulkEmail(
          recipients, 
          message.subject, 
          message.content, 
          message.contentType,
          message.attachments,
          message.metadata
        );
      }

      const successCount = Array.isArray(result) 
        ? result.filter(r => r.success).length 
        : (result.success ? 1 : 0);

      results.attempts.push({
        provider: provider.constructor.name,
        success: successCount > 0,
        successCount,
        result
      });

      if (successCount > 0) {
        results.success = true;
        results.finalResult = result;
        results.successfulDeliveries = successCount;
        break;
      }

    } catch (error) {
      console.error(`Provider ${provider.constructor.name} failed:`, error);
      results.attempts.push({
        provider: provider.constructor.name,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

// Export individual providers
export {
  TwilioService,
  WinSMSService,
  SendGridService
};

// Default export for convenience
export default {
  TwilioService,
  WinSMSService,
  SendGridService,
  createProvider,
  getAvailableProviders,
  validateProviderConfig,
  sendWithFallback
};

