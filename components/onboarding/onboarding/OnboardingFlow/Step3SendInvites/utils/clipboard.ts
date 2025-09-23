import { Invite, Learner } from '../types';

export const clipboardUtils = {
  /**
   * Copy text to clipboard using modern Clipboard API
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use modern Clipboard API
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        await this.fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Failed to copy to clipboard');
    }
  },

  /**
   * Fallback method for copying to clipboard
   */
  async fallbackCopyToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      try {
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (error) {
        document.body.removeChild(textArea);
        reject(error);
      }
    });
  },

  /**
   * Read text from clipboard
   */
  async readFromClipboard(): Promise<string> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return await navigator.clipboard.readText();
      } else {
        throw new Error('Clipboard read not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      throw new Error('Failed to read from clipboard');
    }
  },

  /**
   * Copy invite links to clipboard
   */
  async copyInviteLinks(invites: Invite[], format: 'simple' | 'detailed' = 'simple'): Promise<void> {
    const validInvites = invites.filter(invite => invite.inviteLink);
    
    if (validInvites.length === 0) {
      throw new Error('No invite links available to copy');
    }

    let content: string;
    
    if (format === 'detailed') {
      content = validInvites
        .map(invite => `${invite.learnerName} (${invite.learnerEmail}): ${invite.inviteLink}`)
        .join('\n');
    } else {
      content = validInvites
        .map(invite => invite.inviteLink)
        .join('\n');
    }

    await this.copyToClipboard(content);
  },

  /**
   * Copy learner emails to clipboard
   */
  async copyLearnerEmails(learners: Learner[], format: 'emails' | 'names-emails' = 'emails'): Promise<void> {
    if (learners.length === 0) {
      throw new Error('No learners selected to copy');
    }

    let content: string;
    
    if (format === 'names-emails') {
      content = learners
        .map(learner => `${learner.name} <${learner.email}>`)
        .join(', ');
    } else {
      content = learners
        .map(learner => learner.email)
        .join(', ');
    }

    await this.copyToClipboard(content);
  },

  /**
   * Copy invite summary to clipboard
   */
  async copyInviteSummary(invites: Invite[]): Promise<void> {
    const totalInvites = invites.length;
    const statusCounts = invites.reduce((acc, invite) => {
      acc[invite.status] = (acc[invite.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summary = `
Invite Summary (${new Date().toLocaleString()})
Total Invites: ${totalInvites}

Status Breakdown:
${Object.entries(statusCounts)
  .map(([status, count]) => `• ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`)
  .join('\n')}

Successful: ${statusCounts.accepted || 0}
Pending: ${(statusCounts.sent || 0) + (statusCounts.delivered || 0) + (statusCounts.opened || 0)}
Failed: ${statusCounts.failed || 0}
    `.trim();

    await this.copyToClipboard(summary);
  },

  /**
   * Copy formatted table data to clipboard
   */
  async copyTableData(data: any[], headers: string[]): Promise<void> {
    if (data.length === 0) {
      throw new Error('No data to copy');
    }

    // Create tab-separated values (TSV) format for better paste compatibility
    const headerRow = headers.join('\t');
    const dataRows = data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        return String(value).replace(/\t/g, ' '); // Replace tabs with spaces
      }).join('\t')
    );

    const content = [headerRow, ...dataRows].join('\n');
    await this.copyToClipboard(content);
  },

  /**
   * Copy invite data as CSV to clipboard
   */
  async copyInviteDataAsCSV(invites: Invite[]): Promise<void> {
    if (invites.length === 0) {
      throw new Error('No invite data to copy');
    }

    const headers = ['Name', 'Email', 'Grade', 'Status', 'Channel', 'Sent At'];
    const csvRows = invites.map(invite => [
      invite.learnerName,
      invite.learnerEmail,
      invite.gradeName,
      invite.status,
      invite.channel,
      invite.sentAt ? new Date(invite.sentAt).toLocaleString() : ''
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    await this.copyToClipboard(csvContent);
  },

  /**
   * Check if clipboard API is supported
   */
  isClipboardSupported(): boolean {
    return !!(navigator.clipboard || document.execCommand);
  },

  /**
   * Check if clipboard read is supported
   */
  isClipboardReadSupported(): boolean {
    return !!(navigator.clipboard && window.isSecureContext);
  },

  /**
   * Copy multiple items with custom formatting
   */
  async copyMultipleItems(items: Array<{ label: string; value: string }>): Promise<void> {
    const content = items
      .map(item => `${item.label}: ${item.value}`)
      .join('\n');

    await this.copyToClipboard(content);
  },

  /**
   * Copy invite statistics
   */
  async copyInviteStats(invites: Invite[]): Promise<void> {
    const stats = this.calculateInviteStats(invites);
    
    const content = `
Invite Statistics
================
Total Invites: ${stats.total}
Success Rate: ${stats.successRate}%
Delivery Rate: ${stats.deliveryRate}%
Open Rate: ${stats.openRate}%

By Status:
${Object.entries(stats.byStatus)
  .map(([status, count]) => `• ${status}: ${count}`)
  .join('\n')}

By Channel:
${Object.entries(stats.byChannel)
  .map(([channel, count]) => `• ${channel}: ${count}`)
  .join('\n')}
    `.trim();

    await this.copyToClipboard(content);
  },

  /**
   * Calculate invite statistics
   */
  calculateInviteStats(invites: Invite[]) {
    const total = invites.length;
    const byStatus = invites.reduce((acc, invite) => {
      acc[invite.status] = (acc[invite.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byChannel = invites.reduce((acc, invite) => {
      acc[invite.channel] = (acc[invite.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const successCount = byStatus.accepted || 0;
    const deliveredCount = (byStatus.delivered || 0) + (byStatus.opened || 0) + successCount;
    const openedCount = (byStatus.opened || 0) + successCount;

    return {
      total,
      byStatus,
      byChannel,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
      deliveryRate: total > 0 ? Math.round((deliveredCount / total) * 100) : 0,
      openRate: total > 0 ? Math.round((openedCount / total) * 100) : 0
    };
  }
};

export default clipboardUtils;

