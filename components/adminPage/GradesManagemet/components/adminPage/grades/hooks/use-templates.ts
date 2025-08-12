import { useState, useEffect } from 'react';
import axios from 'axios';
import { InvitationTemplate } from '../shared/schema'; // Assuming InvitationTemplate schema exists

export function useTemplates(schoolId?: string) {
  const [data, setData] = useState<InvitationTemplate[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!schoolId) {
        setData(undefined); // Clear data if schoolId is not provided
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null); // Clear previous errors

      try {
        const response = await axios.get<InvitationTemplate[]>(`/api/templates?schoolId=${schoolId}`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch invitation templates:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [schoolId]); // Re-run effect when schoolId changes

  return {
    data,
    isLoading,
    error,
  };
}

export function useDefaultTemplates() {
  // Default templates when none are loaded from API
  const defaultTemplates: Partial<InvitationTemplate>[] = [
    {
      id: 'welcome-learner',
      name: 'Welcome New Learner',
      description: 'Welcomes new learners and their parents to the school community',
      subject: 'Welcome to {{schoolName}} - {{learnerName}}',
      channels: ['whatsapp', 'email'],
      content: {
        whatsapp: `Hello {{parentName}}! 👋

Your child {{learnerName}} has been enrolled at {{schoolName}}.

Welcome to our school community! 🎓

Best regards,
{{schoolName}} Team`,
        email: `Dear {{parentName}},

We are pleased to inform you that {{learnerName}} has been successfully enrolled at {{schoolName}}.

Welcome to our school community!

Best regards,
{{schoolName}} Administration`
      },
      variables: ['parentName', 'learnerName', 'schoolName', 'grade'],
      is_default: true,
    },
    {
      id: 'grade-assignment',
      name: 'Grade Assignment',
      description: 'Notifies parents about their child\'s grade assignment',
      subject: 'Grade Assignment - {{learnerName}}',
      channels: ['sms', 'email'],
      content: {
        sms: 'Hi {{parentName}}, {{learnerName}} has been assigned to {{grade}} at {{schoolName}}.',
        email: `Dear {{parentName}},

We are pleased to inform you that {{learnerName}} has been assigned to {{grade}}.

Best regards,
{{schoolName}} Administration`
      },
      variables: ['parentName', 'learnerName', 'schoolName', 'grade'],
      is_default: true,
    },
    {
      id: 'portal-access',
      name: 'Parent Portal Access',
      description: 'Provides parent portal login credentials and instructions',
      subject: 'Your Parent Portal Access Details',
      channels: ['whatsapp', 'email'],
      content: {
        whatsapp: 'Hi {{parentName}}! 📱 Your parent portal is ready. Login: {{portalUrl}} Username: {{username}}',
        email: `Dear {{parentName}},

Your parent portal access is now ready.

Login URL: {{portalUrl}}
Username: {{username}}

Best regards,
{{schoolName}} IT Team`
      },
      variables: ['parentName', 'portalUrl', 'username', 'schoolName'],
      is_default: true,
    },
  ];

  return { data: defaultTemplates, isLoading: false, error: null }; // Added error: null for consistency
}