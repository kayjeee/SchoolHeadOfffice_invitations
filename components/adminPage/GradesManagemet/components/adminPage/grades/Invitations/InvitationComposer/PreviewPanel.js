import React from 'react';
import { CheckCircle, ChevronLeft, AlertCircle, Users, Clock, Mail } from 'lucide-react';

const PreviewPanel = ({ 
  invitation, 
  results, 
  mode = 'preview', // 'preview' or 'results'
  onBack 
}) => {
  if (mode === 'results') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <CheckCircle className="mr-2" size={24} />
            Bulk Send Results
          </h2>
          <button 
            onClick={onBack} 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </button>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" size={20} />
              <div>
                <p className="text-sm font-medium text-green-800">Successful</p>
                <p className="text-2xl font-bold text-green-900">{results?.successful || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-2" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Failed</p>
                <p className="text-2xl font-bold text-red-900">{results?.failed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="text-blue-600 mr-2" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-800">Total</p>
                <p className="text-2xl font-bold text-blue-900">{results?.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {results?.details && results.details.length > 0 && (
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-medium">Detailed Results</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {results.details.map((result, index) => (
                <div 
                  key={index} 
                  className="px-4 py-3 border-b last:border-b-0 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {result.status === 'success' ? (
                      <CheckCircle className="text-green-500 mr-3" size={16} />
                    ) : (
                      <AlertCircle className="text-red-500 mr-3" size={16} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {result.recipient}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Preview mode
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center">
          <Mail className="mr-2" size={18} />
          Invitation Preview
        </h3>
        <p className="text-sm text-gray-500">How your invitation will appear</p>
      </div>

      {/* Message Preview */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="border-b pb-3 mb-4">
          <h4 className="font-medium text-gray-900">
            {invitation?.subject || '(No subject)'}
          </h4>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {invitation?.message || 'Your message content will appear here...'}
        </div>
      </div>

      {/* Invitation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Users className="text-gray-600 mr-2" size={16} />
            <h4 className="text-sm font-medium text-gray-700">Recipients</h4>
          </div>
          <p className="text-sm text-gray-600">
            {invitation?.recipients?.length > 0 
              ? `${invitation.recipients.length} recipients selected` 
              : 'No recipients selected'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Clock className="text-gray-600 mr-2" size={16} />
            <h4 className="text-sm font-medium text-gray-700">Delivery</h4>
          </div>
          <p className="text-sm text-gray-600">
            {invitation?.sendImmediately 
              ? 'Will be sent immediately' 
              : invitation?.scheduledDate 
                ? `Scheduled for ${new Date(invitation.scheduledDate).toLocaleString()}` 
                : 'No send time specified'}
          </p>
        </div>
      </div>

      {/* Preview Note */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="text-sm font-medium text-yellow-800 flex items-center mb-2">
          <AlertCircle className="mr-2" size={14} />
          Preview Note
        </h4>
        <p className="text-sm text-yellow-700">
          This is an approximate preview. Actual rendering may vary slightly based on recipient's email client or messaging platform.
        </p>
      </div>

      {/* Sample Recipient Preview */}
      {invitation?.recipients?.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Sample Recipients</h4>
          <div className="space-y-1">
            {invitation.recipients.slice(0, 3).map((recipient, index) => (
              <p key={index} className="text-xs text-blue-700">
                {recipient.name || recipient.email || recipient}
              </p>
            ))}
            {invitation.recipients.length > 3 && (
              <p className="text-xs text-blue-600">
                ... and {invitation.recipients.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;