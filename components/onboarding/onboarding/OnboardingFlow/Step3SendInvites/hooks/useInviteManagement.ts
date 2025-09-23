import { useState, useCallback } from 'react';
import { Invite, Learner, InviteChannel, InviteMessage } from '../types';
import { inviteService, SendInviteRequest } from '../services/inviteService';
import { downloadUtils } from '../utils/download';
import { clipboardUtils } from '../utils/clipboard';

export interface UseInviteManagementReturn {
  // Data
  invites: Invite[];
  
  // Loading states
  sendingInvites: boolean;
  resendingInvites: Record<string, boolean>;
  cancelingInvites: Record<string, boolean>;
  
  // Error states
  sendError: string | null;
  resendErrors: Record<string, string>;
  cancelErrors: Record<string, string>;
  
  // Actions
  sendInvites: (request: SendInviteRequest) => Promise<void>;
  resendInvite: (inviteId: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  downloadInviteData: () => Promise<void>;
  copyInviteLinks: () => Promise<void>;
  clearErrors: () => void;
  refreshInvites: (batchId?: string) => Promise<void>;
}

export const useInviteManagement = (): UseInviteManagementReturn => {
  // State
  const [invites, setInvites] = useState<Invite[]>([]);
  
  // Loading states
  const [sendingInvites, setSendingInvites] = useState(false);
  const [resendingInvites, setResendingInvites] = useState<Record<string, boolean>>({});
  const [cancelingInvites, setCancelingInvites] = useState<Record<string, boolean>>({});
  
  // Error states
  const [sendError, setSendError] = useState<string | null>(null);
  const [resendErrors, setResendErrors] = useState<Record<string, string>>({});
  const [cancelErrors, setCancelErrors] = useState<Record<string, string>>({});

  // Send invites
  const sendInvites = useCallback(async (request: SendInviteRequest) => {
    setSendingInvites(true);
    setSendError(null);
    
    try {
      const response = await inviteService.sendInvites(request);
      setInvites(response.invites);
      
      // Show success notification if needed
      console.log(`Successfully sent ${response.successCount} invites`);
      if (response.failureCount > 0) {
        console.warn(`Failed to send ${response.failureCount} invites`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invites';
      setSendError(errorMessage);
      console.error('Error sending invites:', err);
      throw err; // Re-throw to allow component to handle
    } finally {
      setSendingInvites(false);
    }
  }, []);

  // Resend a specific invite
  const resendInvite = useCallback(async (inviteId: string) => {
    setResendingInvites(prev => ({ ...prev, [inviteId]: true }));
    setResendErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[inviteId];
      return newErrors;
    });
    
    try {
      const updatedInvite = await inviteService.resendInvite(inviteId);
      
      // Update the invite in the list
      setInvites(prev => 
        prev.map(invite => 
          invite.id === inviteId ? updatedInvite : invite
        )
      );
      
      console.log(`Successfully resent invite to ${updatedInvite.learnerName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend invite';
      setResendErrors(prev => ({ ...prev, [inviteId]: errorMessage }));
      console.error('Error resending invite:', err);
    } finally {
      setResendingInvites(prev => {
        const newState = { ...prev };
        delete newState[inviteId];
        return newState;
      });
    }
  }, []);

  // Cancel a specific invite
  const cancelInvite = useCallback(async (inviteId: string) => {
    setCancelingInvites(prev => ({ ...prev, [inviteId]: true }));
    setCancelErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[inviteId];
      return newErrors;
    });
    
    try {
      await inviteService.cancelInvite(inviteId);
      
      // Update the invite status in the list
      setInvites(prev => 
        prev.map(invite => 
          invite.id === inviteId 
            ? { ...invite, status: 'cancelled' as any }
            : invite
        )
      );
      
      console.log('Successfully cancelled invite');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel invite';
      setCancelErrors(prev => ({ ...prev, [inviteId]: errorMessage }));
      console.error('Error canceling invite:', err);
    } finally {
      setCancelingInvites(prev => {
        const newState = { ...prev };
        delete newState[inviteId];
        return newState;
      });
    }
  }, []);

  // Download invite data as CSV
  const downloadInviteData = useCallback(async () => {
    try {
      const csvData = downloadUtils.convertInvitesToCSV(invites);
      downloadUtils.downloadCSV(csvData, 'invite-data.csv');
      console.log('Invite data downloaded successfully');
    } catch (err) {
      console.error('Error downloading invite data:', err);
      throw err;
    }
  }, [invites]);

  // Copy all invite links to clipboard
  const copyInviteLinks = useCallback(async () => {
    try {
      const inviteLinks = invites
        .filter(invite => invite.inviteLink)
        .map(invite => `${invite.learnerName}: ${invite.inviteLink}`)
        .join('\n');
      
      await clipboardUtils.copyToClipboard(inviteLinks);
      console.log('Invite links copied to clipboard');
    } catch (err) {
      console.error('Error copying invite links:', err);
      throw err;
    }
  }, [invites]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setSendError(null);
    setResendErrors({});
    setCancelErrors({});
  }, []);

  // Refresh invites from server
  const refreshInvites = useCallback(async (batchId?: string) => {
    try {
      const data = await inviteService.getInvites(batchId);
      setInvites(data);
    } catch (err) {
      console.error('Error refreshing invites:', err);
      throw err;
    }
  }, []);

  return {
    // Data
    invites,
    
    // Loading states
    sendingInvites,
    resendingInvites,
    cancelingInvites,
    
    // Error states
    sendError,
    resendErrors,
    cancelErrors,
    
    // Actions
    sendInvites,
    resendInvite,
    cancelInvite,
    downloadInviteData,
    copyInviteLinks,
    clearErrors,
    refreshInvites
  };
};

export default useInviteManagement;

