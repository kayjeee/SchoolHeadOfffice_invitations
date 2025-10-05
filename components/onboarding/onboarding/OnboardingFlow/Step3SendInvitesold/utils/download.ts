import { Invite, Learner } from '../types';

export const downloadUtils = {
  /**
   * Convert invites data to CSV format
   */
  convertInvitesToCSV(invites: Invite[]): string {
    if (invites.length === 0) {
      return 'No data to export';
    }

    // Define CSV headers
    const headers = [
      'Invite ID',
      'Learner Name',
      'Learner Email',
      'Grade',
      'Channel',
      'Status',
      'Sent At',
      'Delivered At',
      'Opened At',
      'Responded At',
      'Invite Link',
      'Error Message'
    ];

    // Convert invites to CSV rows
    const rows = invites.map(invite => [
      invite.id,
      invite.learnerName,
      invite.learnerEmail,
      invite.gradeName,
      invite.channel,
      invite.status,
      invite.sentAt ? new Date(invite.sentAt).toLocaleString() : '',
      invite.deliveredAt ? new Date(invite.deliveredAt).toLocaleString() : '',
      invite.openedAt ? new Date(invite.openedAt).toLocaleString() : '',
      invite.respondedAt ? new Date(invite.respondedAt).toLocaleString() : '',
      invite.inviteLink || '',
      invite.errorMessage || ''
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  },

  /**
   * Convert learners data to CSV format
   */
  convertLearnersToCSV(learners: Learner[]): string {
    if (learners.length === 0) {
      return 'No data to export';
    }

    // Define CSV headers
    const headers = [
      'Learner ID',
      'Name',
      'Email',
      'Grade ID',
      'Grade Name',
      'Last Active',
      'Invite Status'
    ];

    // Convert learners to CSV rows
    const rows = learners.map(learner => [
      learner.id,
      learner.name,
      learner.email,
      learner.gradeId,
      learner.gradeName,
      learner.lastActive ? new Date(learner.lastActive).toLocaleString() : '',
      learner.inviteStatus || ''
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  },

  /**
   * Download CSV data as a file
   */
  downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Download JSON data as a file
   */
  downloadJSON(data: any, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Download text content as a file
   */
  downloadText(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Generate invite summary report
   */
  generateInviteReport(invites: Invite[]): string {
    const totalInvites = invites.length;
    const statusCounts = invites.reduce((acc, invite) => {
      acc[invite.status] = (acc[invite.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const channelCounts = invites.reduce((acc, invite) => {
      acc[invite.channel] = (acc[invite.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const report = `
Invite Summary Report
Generated: ${new Date().toLocaleString()}

OVERVIEW
========
Total Invites: ${totalInvites}

STATUS BREAKDOWN
===============
${Object.entries(statusCounts)
  .map(([status, count]) => `${status.charAt(0).toUpperCase() + status.slice(1)}: ${count} (${((count / totalInvites) * 100).toFixed(1)}%)`)
  .join('\n')}

CHANNEL BREAKDOWN
================
${Object.entries(channelCounts)
  .map(([channel, count]) => `${channel.charAt(0).toUpperCase() + channel.slice(1)}: ${count} (${((count / totalInvites) * 100).toFixed(1)}%)`)
  .join('\n')}

DETAILED DATA
============
${invites.map(invite => `
${invite.learnerName} (${invite.learnerEmail})
  Status: ${invite.status}
  Channel: ${invite.channel}
  Sent: ${invite.sentAt ? new Date(invite.sentAt).toLocaleString() : 'N/A'}
  ${invite.errorMessage ? `Error: ${invite.errorMessage}` : ''}
`).join('\n')}
    `.trim();

    return report;
  },

  /**
   * Download invite report
   */
  downloadInviteReport(invites: Invite[], format: 'txt' | 'csv' | 'json' = 'txt'): void {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    switch (format) {
      case 'csv':
        const csvContent = this.convertInvitesToCSV(invites);
        this.downloadCSV(csvContent, `invite-report-${timestamp}.csv`);
        break;
      
      case 'json':
        this.downloadJSON(invites, `invite-report-${timestamp}.json`);
        break;
      
      case 'txt':
      default:
        const reportContent = this.generateInviteReport(invites);
        this.downloadText(reportContent, `invite-report-${timestamp}.txt`);
        break;
    }
  },

  /**
   * Check if browser supports file downloads
   */
  isDownloadSupported(): boolean {
    const link = document.createElement('a');
    return link.download !== undefined;
  },

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Estimate CSV file size
   */
  estimateCSVSize(data: any[]): number {
    if (data.length === 0) return 0;
    
    // Rough estimation based on JSON string length
    const sampleSize = Math.min(10, data.length);
    const sampleData = data.slice(0, sampleSize);
    const avgRowSize = JSON.stringify(sampleData).length / sampleSize;
    
    return Math.round(avgRowSize * data.length * 1.2); // Add 20% overhead for CSV formatting
  }
};

export default downloadUtils;

