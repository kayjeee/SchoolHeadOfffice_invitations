import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Send, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle,
  Users,
  Globe
} from 'lucide-react';

const SchedulingOptions = ({ 
  selectedGrade,
  sendImmediately = true, 
  scheduledDate, 
  onSendImmediatelyChange, 
  onScheduledDateChange,
  onBack,
  onSend,
  isSending = false
}) => {
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [localDate, setLocalDate] = useState(scheduledDate || '');
  const [sendOptions, setSendOptions] = useState({
    batchSize: 50,
    delayBetweenBatches: 30,
    testMode: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update local date when prop changes
  useEffect(() => {
    if (scheduledDate) {
      const date = new Date(scheduledDate);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setLocalDate(localDateTime);
    }
  }, [scheduledDate]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setLocalDate(date);
    if (date) {
      onScheduledDateChange?.(new Date(date).toISOString());
    } else {
      onScheduledDateChange?.(null);
    }
  };

  const handleSendModeChange = (immediate) => {
    onSendImmediatelyChange?.(immediate);
    if (immediate) {
      onScheduledDateChange?.(null);
      setLocalDate('');
    }
  };

  const handleBulkSend = () => {
    const sendConfig = {
      immediately: sendImmediately,
      scheduledDate: scheduledDate,
      ...sendOptions
    };
    onSend?.(sendConfig);
  };

  const getMinDateTime = () => {
    return new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    return new Date(Date.now() + 365 * 24 * 60 * 60000).toISOString().slice(0, 16);
  };

  const isValidSchedule = () => {
    if (sendImmediately) return true;
    if (!scheduledDate) return false;
    
    const scheduleTime = new Date(scheduledDate);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    
    return scheduleTime > fiveMinutesFromNow;
  };

  const recipientCount = selectedGrade?.parentCount || selectedGrade?.studentCount || 0;
  const estimatedDuration = Math.ceil(recipientCount / sendOptions.batchSize) * sendOptions.delayBetweenBatches;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Clock className="text-blue-600" size={24} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Schedule Your Bulk Send</h2>
          <p className="text-gray-600">Choose when and how to send invitations to {selectedGrade?.name}</p>
        </div>
      </div>

      {/* Grade Summary */}
      {selectedGrade && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="text-blue-600" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedGrade.name}</h3>
                <p className="text-sm text-gray-600">
                  {recipientCount} recipients ready for invitation
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimated duration</p>
              <p className="font-medium text-gray-900">{estimatedDuration} seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="mr-2" size={18} />
          When to Send
        </h3>

        <div className="space-y-4">
          {/* Send Immediately Option */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              id="send-now"
              checked={sendImmediately}
              onChange={() => handleSendModeChange(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-1"
            />
            <div className="flex-1">
              <label htmlFor="send-now" className="block cursor-pointer">
                <div className="flex items-center space-x-2 mb-1">
                  <Send size={16} className="text-green-600" />
                  <span className="font-medium text-gray-900">Send immediately</span>
                </div>
                <p className="text-sm text-gray-600">
                  Invitations will be sent as soon as you click "Start Bulk Send"
                </p>
              </label>
            </div>
            {sendImmediately && (
              <CheckCircle className="text-green-600 mt-1" size={16} />
            )}
          </div>

          {/* Schedule for Later Option */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              id="schedule"
              checked={!sendImmediately}
              onChange={() => handleSendModeChange(false)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-1"
            />
            <div className="flex-1">
              <label htmlFor="schedule" className="block cursor-pointer">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock size={16} className="text-blue-600" />
                  <span className="font-medium text-gray-900">Schedule for later</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Choose a specific date and time to send invitations
                </p>
              </label>
              
              {!sendImmediately && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date and Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduled-date"
                      value={localDate}
                      onChange={handleDateChange}
                      min={getMinDateTime()}
                      max={getMaxDateTime()}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Globe size={12} />
                    <span>Timezone: {timezone}</span>
                  </div>

                  {/* Validation Messages */}
                  {!sendImmediately && localDate && !isValidSchedule() && (
                    <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <AlertCircle size={14} />
                      <span>Schedule time must be at least 5 minutes from now</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {!sendImmediately && isValidSchedule() && (
              <CheckCircle className="text-green-600 mt-1" size={16} />
            )}
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900">Advanced Options</h3>
          <span className="text-sm text-blue-600">{showAdvanced ? 'Hide' : 'Show'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Size
                </label>
                <select
                  value={sendOptions.batchSize}
                  onChange={(e) => setSendOptions(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={25}>25 messages per batch</option>
                  <option value={50}>50 messages per batch</option>
                  <option value={100}>100 messages per batch</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Number of messages to send at once
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delay Between Batches
                </label>
                <select
                  value={sendOptions.delayBetweenBatches}
                  onChange={(e) => setSendOptions(prev => ({ ...prev, delayBetweenBatches: Number(e.target.value) }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={120}>2 minutes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Wait time between message batches
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="test-mode"
                checked={sendOptions.testMode}
                onChange={(e) => setSendOptions(prev => ({ ...prev, testMode: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <label htmlFor="test-mode" className="text-sm text-gray-700">
                Test mode (send to administrators only)
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Panel */}
      {!sendImmediately && scheduledDate && isValidSchedule() && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="text-green-600" size={16} />
            <span className="font-medium text-green-800">Scheduled Send Confirmed</span>
          </div>
          <p className="text-sm text-green-700">
            {recipientCount} invitations will be sent on{' '}
            <span className="font-medium">
              {new Date(scheduledDate).toLocaleDateString()} at{' '}
              {new Date(scheduledDate).toLocaleTimeString()}
            </span>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button 
          onClick={onBack}
          disabled={isSending}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Message
        </button>
        
        <button 
          onClick={handleBulkSend}
          disabled={isSending || (!sendImmediately && !isValidSchedule()) || recipientCount === 0}
          className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {sendImmediately ? 'Sending...' : 'Scheduling...'}
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              {sendImmediately ? 'Start Bulk Send' : 'Schedule Send'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SchedulingOptions;