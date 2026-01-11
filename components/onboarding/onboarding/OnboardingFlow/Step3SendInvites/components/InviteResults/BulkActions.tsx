import React, { useState } from 'react';
import { Users, Send, AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

interface BulkActionsProps {
  personalizedMessages: Array<{
    to: string;
    message: string;
    gradeName: string;
    magicLink: string;
  }>;
  schoolName: string;
  gradeIds?: string[];
  onSuccess?: (results: any) => void;
  onError?: (error: string) => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  personalizedMessages,
  schoolName,
  gradeIds,
  onSuccess,
  onError
}) => {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState<{
    sent: number;
    failed: number;
    total: number;
    invalidCount?: number;
    details: any[];
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const handleBulkSend = async () => {
    if (!personalizedMessages || personalizedMessages.length === 0) {
      onError?.('No recipients to send to');
      return;
    }

    setIsSending(true);
    setProgress(null);
    setValidationWarning(null);

    try {
      const response = await fetch('/api/whatsapp-business/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          personalizedMessages,
          schoolName,
          gradeIds,
          defaultCountryCode: '27' // Add default country code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bulk send failed');
      }

      setProgress({
        sent: data.results.sentCount,
        failed: data.results.failedCount,
        total: data.results.totalCount,
        invalidCount: data.results.invalidCount || 0,
        details: data.results.details
      });

      // Show warning if some numbers were invalid
      if (data.results.invalidCount > 0) {
        setValidationWarning(
          `${data.results.invalidCount} phone number(s) were invalid and skipped`
        );
      }

      onSuccess?.(data);
    } catch (error: any) {
      console.error('Bulk send error:', error);
      onError?.(error.message || 'Failed to send bulk messages');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle size={16} /> : <XCircle size={16} />;
  };

  return (
    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Message Actions</h3>
            <p className="text-sm text-gray-600">
              Send messages to {personalizedMessages?.length || 0} recipients
            </p>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {validationWarning && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-orange-800">{validationWarning}</p>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {progress && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Send Results</h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-green-600">{progress.sent}</p>
              <p className="text-xs text-gray-600">Sent</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <XCircle className="text-red-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-red-600">{progress.failed}</p>
              <p className="text-xs text-gray-600">Failed</p>
            </div>
            {progress.invalidCount && progress.invalidCount > 0 && (
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <AlertCircle className="text-orange-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-orange-600">{progress.invalidCount}</p>
                <p className="text-xs text-gray-600">Invalid</p>
              </div>
            )}
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Users className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-blue-600">{progress.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Success Rate</span>
              <span>{Math.round((progress.sent / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.sent / progress.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Detailed Results */}
          {showDetails && (
            <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {progress.details.map((detail, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900">{detail.to}</td>
                      <td className={`px-3 py-2 ${getStatusColor(detail.success)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(detail.success)}
                          <span className="text-xs">
                            {detail.success ? 'Sent' : detail.error || 'Failed'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 text-xs">
                        {new Date(detail.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Information Banner */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Before sending bulk messages:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Verify your message template is approved by WhatsApp</li>
              <li>Test with a single recipient first</li>
              <li>Messages are rate-limited to prevent spam flags</li>
              <li>Failed messages can be retried individually</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleBulkSend}
        disabled={isSending || !personalizedMessages || personalizedMessages.length === 0}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {isSending ? (
          <>
            <Loader className="animate-spin mr-2" size={20} />
            Sending to {personalizedMessages?.length || 0} recipients...
          </>
        ) : (
          <>
            <Send size={20} className="mr-2" />
            Send to {personalizedMessages?.length || 0} Recipients
          </>
        )}
      </button>

      {/* Timing Info */}
      {personalizedMessages && personalizedMessages.length > 0 && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Clock size={14} />
          <span>
            Estimated time: ~{Math.ceil(personalizedMessages.length / 10)} minutes
          </span>
        </div>
      )}
    </div>
  );
};