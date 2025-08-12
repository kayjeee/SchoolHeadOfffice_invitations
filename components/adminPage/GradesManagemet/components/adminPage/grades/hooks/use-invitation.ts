import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InvitationData, ValidationError } from '@/types/invitation';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useInvitation() {
  const [invitationData, setInvitationData] = useState<InvitationData>({
    subject: '',
    content: {},
    channels: ['whatsapp'],
    recipientType: 'all',
    recipients: [],
    scheduleType: 'now',
    priority: 'normal',
    deliverySettings: {
      readReceipts: true,
      includeAttachments: false,
    },
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateInvitation = useCallback((updates: Partial<InvitationData>) => {
    setInvitationData(prev => ({ ...prev, ...updates }));
    setErrors([]); // Clear errors when data changes
  }, []);

  const updateContent = useCallback((channel: string, content: string) => {
    setInvitationData(prev => ({
      ...prev,
      content: { ...prev.content, [channel]: content }
    }));
  }, []);

  const toggleChannel = useCallback((channelId: string) => {
    setInvitationData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(id => id !== channelId)
        : [...prev.channels, channelId]
    }));
  }, []);

  const validateInvitation = useCallback((): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (invitationData.channels.length === 0) {
      validationErrors.push({
        field: 'channels',
        message: 'Please select at least one delivery channel'
      });
    }

    const hasContent = invitationData.channels.some(channel => 
      invitationData.content[channel]?.trim()
    );

    if (!hasContent) {
      validationErrors.push({
        field: 'content',
        message: 'Please add content for at least one selected channel'
      });
    }

    if (invitationData.channels.includes('email') && !invitationData.subject.trim()) {
      validationErrors.push({
        field: 'subject',
        message: 'Subject line is required for email invitations'
      });
    }

    if (invitationData.scheduleType === 'later') {
      if (!invitationData.scheduledDate) {
        validationErrors.push({
          field: 'scheduledDate',
          message: 'Scheduled date is required'
        });
      }
      if (!invitationData.scheduledTime) {
        validationErrors.push({
          field: 'scheduledTime',
          message: 'Scheduled time is required'
        });
      }
    }

    return validationErrors;
  }, [invitationData]);

  const sendInvitationMutation = useMutation({
    mutationFn: async (data: InvitationData) => {
      const response = await apiRequest('POST', '/api/invitations', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Invitations sent successfully!',
        description: `${data.recipientCount} invitations sent via ${invitationData.channels.join(', ')}`,
      });
      
      // Reset form
      setInvitationData({
        subject: '',
        content: {},
        channels: ['whatsapp'],
        recipientType: 'all',
        recipients: [],
        scheduleType: 'now',
        priority: 'normal',
        deliverySettings: {
          readReceipts: true,
          includeAttachments: false,
        },
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/invitations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send invitations',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendInvitation = useCallback(() => {
    const validationErrors = validateInvitation();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Validation errors',
        description: 'Please fix the errors before sending',
        variant: 'destructive',
      });
      return;
    }

    sendInvitationMutation.mutate(invitationData);
  }, [validateInvitation, sendInvitationMutation, invitationData, toast]);

  return {
    invitationData,
    updateInvitation,
    updateContent,
    toggleChannel,
    sendInvitation,
    isLoading: sendInvitationMutation.isPending,
    errors,
    isPreviewOpen,
    setIsPreviewOpen,
    validateInvitation,
  };
}
