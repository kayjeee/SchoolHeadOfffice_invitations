import React, { useState } from 'react';
import { FiCopy, FiCheck, FiShare2, FiEdit } from 'react-icons/fi';
import { invitationService } from '../services/api';

const PRCodeDisplay = ({ invite }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customCode, setCustomCode] = useState(invite.prCode || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invite.prCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${invite.schoolId?.name} on SchoolHeadOffice`,
          text: `You've been invited to join ${invite.schoolId?.name}. Use code: ${invite.prCode}`,
          url: invite.shortUrl,
        });
      } catch (error) {
        console.log('Sharing cancelled', error);
      }
    } else {
      handleCopyCode();
    }
  };

  const handleSaveCustomCode = async () => {
    setIsUpdating(true);
    setError(null);
    
    try {
      await invitationService.updateInvite(invite.id, { 
        prCode: customCode 
      });
      
      setIsEditing(false);
      // You might want to refresh the invite data here or use a callback
    } catch (error) {
      console.error('Error updating PR code:', error);
      setError(error.response?.data?.message || 'Failed to update PR code. It might already be in use.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Referral Code</h3>
      
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter custom code"
              maxLength="20"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveCustomCode}
                disabled={isUpdating}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCustomCode(invite.prCode);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-mono text-blue-800 font-bold text-lg">
              {invite.prCode}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit code"
            >
              <FiEdit size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCopyCode}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <FiCheck className="h-4 w-4 text-green-600 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <FiCopy className="h-4 w-4 text-gray-600 mr-2" />
              Copy Code
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <FiShare2 className="h-4 w-4 mr-2" />
          Share Invitation
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">How to use this code:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Share with the recipient via any messaging platform</li>
          <li>• Recipient enters this code during registration</li>
          <li>• Track acceptance status in your invitations dashboard</li>
          <li>• Code expires in 30 days</li>
        </ul>
      </div>

      {invite.status === 'accepted' && (
        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 text-center">
            ✅ Accepted on {new Date(invite.acceptedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default PRCodeDisplay;