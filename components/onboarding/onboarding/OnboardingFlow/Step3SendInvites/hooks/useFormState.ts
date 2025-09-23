import { useState, useCallback } from 'react';
import { InviteChannel, InviteMessage } from '../types';

export interface UseFormStateReturn {
  // Form data
  selectedChannel: InviteChannel | null;
  inviteMessage: InviteMessage;
  
  // Form state
  isDirty: boolean;
  isValid: boolean;
  
  // Actions
  setSelectedChannel: (channel: InviteChannel | null) => void;
  setInviteMessage: (message: InviteMessage) => void;
  updateMessageField: (field: keyof InviteMessage, value: string) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

const DEFAULT_MESSAGE: InviteMessage = {
  subject: '',
  title: '',
  body: ''
};

export const useFormState = (): UseFormStateReturn => {
  // State
  const [selectedChannel, setSelectedChannelState] = useState<InviteChannel | null>(null);
  const [inviteMessage, setInviteMessageState] = useState<InviteMessage>(DEFAULT_MESSAGE);
  const [isDirty, setIsDirty] = useState(false);

  // Computed values
  const isValid = validateFormData(selectedChannel, inviteMessage);

  // Set selected channel
  const setSelectedChannel = useCallback((channel: InviteChannel | null) => {
    setSelectedChannelState(channel);
    setIsDirty(true);
    
    // Auto-populate message template based on channel
    if (channel && inviteMessage.body === '') {
      const template = getMessageTemplate(channel);
      setInviteMessageState(template);
    }
  }, [inviteMessage.body]);

  // Set invite message
  const setInviteMessage = useCallback((message: InviteMessage) => {
    setInviteMessageState(message);
    setIsDirty(true);
  }, []);

  // Update specific message field
  const updateMessageField = useCallback((field: keyof InviteMessage, value: string) => {
    setInviteMessageState(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setSelectedChannelState(null);
    setInviteMessageState(DEFAULT_MESSAGE);
    setIsDirty(false);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    return validateFormData(selectedChannel, inviteMessage);
  }, [selectedChannel, inviteMessage]);

  return {
    // Form data
    selectedChannel,
    inviteMessage,
    
    // Form state
    isDirty,
    isValid,
    
    // Actions
    setSelectedChannel,
    setInviteMessage,
    updateMessageField,
    resetForm,
    validateForm
  };
};

// Helper function to validate form data
function validateFormData(channel: InviteChannel | null, message: InviteMessage): boolean {
  if (!channel) return false;
  if (!message.body.trim()) return false;
  
  // Channel-specific validation
  switch (channel.id) {
    case 'email':
    case 'portal-message':
      return !!message.subject?.trim();
    
    case 'app-notification':
      return !!message.title?.trim();
    
    case 'sms':
      // SMS has character limit
      return message.body.length <= 160;
    
    default:
      return true;
  }
}

// Helper function to get message template based on channel
function getMessageTemplate(channel: InviteChannel): InviteMessage {
  const templates: Record<string, InviteMessage> = {
    email: {
      subject: 'You\'re invited to join our learning platform!',
      body: `Hi {{learnerName}},

You've been invited to join our learning platform. We're excited to have you as part of our learning community!

Click the link below to get started:
{{inviteLink}}

If you have any questions, feel free to reach out to us.

Best regards,
The Learning Team`
    },
    
    sms: {
      body: 'Hi {{learnerName}}! You\'re invited to join our learning platform. Get started: {{inviteLink}}'
    },
    
    'app-notification': {
      title: 'Learning Platform Invitation',
      body: 'Hi {{learnerName}}! You\'ve been invited to join our learning platform. Tap to get started.'
    },
    
    'portal-message': {
      subject: 'Welcome to the Learning Platform',
      body: `Dear {{learnerName}},

Welcome to our learning platform! We're thrilled to have you join our community of learners.

Your personalized learning journey awaits. Click here to get started:
{{inviteLink}}

Explore courses, connect with peers, and track your progress all in one place.

Happy learning!`
    }
  };

  return templates[channel.id] || DEFAULT_MESSAGE;
}

export default useFormState;

