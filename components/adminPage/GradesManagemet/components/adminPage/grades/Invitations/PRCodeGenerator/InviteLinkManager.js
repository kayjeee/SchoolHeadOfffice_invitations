import React, { useState } from 'react';
import { FiCopy, FiCheck, FiExternalLink, FiBarChart2, FiClock } from 'react-icons/fi';
import { analyticsService } from '../services/api';

const InviteLinkManager = ({ invite }) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invite.prCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invite.shortUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(invite.shortUrl, '_blank');
  };

  const handleLoadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await analyticsService.getPRCodeAnalytics({
        code: invite.prCode,
        detailed: true
      });
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const getExpirationStatus = () => {
    const now = new Date();
    const expiration = new Date(invite.expiration);
    const daysRemaining = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      return { status: 'expired', text: 'Expired', color: 'text-red-600' };
    } else if (daysRemaining <= 7) {
      return { status: 'warning', text: `${daysRemaining} days left`, color: 'text-amber-600' };
    } else {
      return { status: 'valid', text: `${daysRemaining} days left`, color: 'text-green-600' };
    }
  };

  const expirationStatus = getExpirationStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Invitation Link</h3>
      
      {/* Short URL Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shareable Link
        </label>
        <div className="flex items-center">
          <input
            type="text"
            readOnly
            value={invite.shortUrl}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300"
            title="Copy link"
          >
            {linkCopied ? <FiCheck className="h-4 w-4 text-green-600" /> : <FiCopy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* PR Code Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Personal Referral Code
        </label>
        <div className="flex items-center">
          <input
            type="text"
            readOnly
            value={invite.prCode}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
          />
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300"
            title="Copy code"
          >
            {copied ? <FiCheck className="h-4 w-4 text-green-600" /> : <FiCopy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleOpenLink}
          className="flex items-center justify-center px-3 py-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
        >
          <FiExternalLink className="h-4 w-4 mr-1" />
          Test Link
        </button>
        <button
          onClick={handleLoadAnalytics}
          disabled={loadingAnalytics}
          className="flex items-center justify-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 text-sm disabled:opacity-50"
        >
          <FiBarChart2 className="h-4 w-4 mr-1" />
          {loadingAnalytics ? 'Loading...' : 'Analytics'}
        </button>
      </div>

      {/* Analytics Display */}
      {analytics && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Analytics:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Views: {analytics.viewCount}</div>
            <div>Clicks: {analytics.clickCount}</div>
            <div>Conversion: {analytics.conversionRate}%</div>
            {analytics.lastViewed && (
              <div>Last viewed: {new Date(analytics.lastViewed).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      )}

      {/* Status Information */}
      <div className="border-t pt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Invitation Status</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`text-sm font-medium ${
              invite.status === 'accepted' ? 'text-green-600' :
              invite.status === 'sent' ? 'text-blue-600' :
              invite.status === 'expired' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {invite.status?.charAt(0).toUpperCase() + invite.status?.slice(1)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Expires:</span>
            <span className={`text-sm font-medium ${expirationStatus.color} flex items-center`}>
              <FiClock className="h-3 w-3 mr-1" />
              {expirationStatus.text}
            </span>
          </div>
          
          {invite.viewCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Views:</span>
              <span className="text-sm font-medium text-gray-800">
                {invite.viewCount} time{invite.viewCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {invite.lastViewedAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last viewed:</span>
              <span className="text-sm text-gray-600">
                {new Date(invite.lastViewedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Best Practices:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Share the link directly for digital communication</li>
          <li>• Use the QR code for printed materials</li>
          <li>• Include the PR code for verbal referrals</li>
          <li>• Track engagement through the analytics dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default InviteLinkManager;