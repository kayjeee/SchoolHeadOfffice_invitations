import React, { useEffect, useState } from 'react';
import { FiCopy, FiDownload, FiQrCode, FiLink, FiUsers } from 'react-icons/fi';
import PRCodeDisplay from './PRCodeDisplay';
import QRCodeGenerator from './QRCodeGenerator';
import InviteLinkManager from './InviteLinkManager';

// Services
import { invitationService } from '../../../../../services/invitation/invitationService';
import { prCodeService } from '../services/prCodeService';

const PRCodeGenerator = ({ school, user, onInviteCreated }) => {
  const [recipientType, setRecipientType] = useState('learner');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [channels, setChannels] = useState(['whatsapp']);
  const [customMessage, setCustomMessage] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /** ----------------- Lifecycle Logging ----------------- */
  useEffect(() => {
    console.group('[PRCodeGenerator] Lifecycle: mount');
    console.log('props:', { school, user, onInviteCreated: typeof onInviteCreated });
    console.groupEnd();
  }, []);

  useEffect(() => {
    console.log('[PRCodeGenerator] Lifecycle: school prop updated', school);
  }, [school]);

  useEffect(() => {
    console.log('[PRCodeGenerator] Lifecycle: user prop updated', user);
  }, [user]);

  console.log('[PRCodeGenerator] Lifecycle: render');

  /** ----------------- Helpers ----------------- */
  const resolveSchoolId = (s) => s?._id || s?.id || null;
  const resolveUserId = (u) => u?.id || u?.sub || u?.userId || 'system';

  const generateLocalPRCode = () => {
    const schoolName = school?.name || school?.schoolName || 'GEN';
    const initials = schoolName
      .split(' ')
      .map(part => part[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 3);
    const typeCode = (recipientType || 'L').substring(0, 1).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const localCode = `${initials}-${typeCode}-${rand}`;
    
    console.log('[PRCodeGenerator] Local PR code generated:', localCode);
    return localCode;
  };

  /** ----------------- Service Resolver ----------------- */
  const resolveService = async (serviceType) => {
    const svc = serviceType === 'prCode' ? prCodeService : invitationService;
    const expectedFn = serviceType === 'prCode' ? 'createPRCode' : 'createInvite';

    if (svc && typeof svc[expectedFn] === 'function') {
      console.log(`[PRCodeGenerator] Resolved ${serviceType} service via static import`);
      return svc;
    }

    console.warn(`[PRCodeGenerator] ${serviceType} service not available via static import`);
    return null;
  };

  /** ----------------- Main Handler ----------------- */
  const handleGenerateInvite = async () => {
    console.group('================ handleGenerateInvite START ================');
    console.log('Current state:', {
      school, user, recipientType, recipientName, recipientEmail,
      recipientPhone, channels, customMessage,
    });

    const schoolId = resolveSchoolId(school);
    const userId = resolveUserId(user);
    console.log('Resolved IDs:', { schoolId, userId });

    if (!schoolId) {
      setError('School information is missing. Please select a school and try again.');
      console.warn('Aborting: no schoolId');
      console.groupEnd();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // --- Step 1: Create Invite ---
      const inviteSvc = await resolveService('invite');
      if (!inviteSvc) throw new Error('Invitation service unavailable');

      const invitePayload = {
        recipientType,
        recipientEmail,
        recipientPhone,
        recipientName,
        channels,
        customMessage,
        schoolId,
        userId,
        user,
        sendImmediately: false,
      };
      console.log('[PRCodeGenerator] Invite Payload:', invitePayload);

      const inviteResponse = await inviteSvc.createInvite(invitePayload);
      console.log('[PRCodeGenerator] Invite Response:', inviteResponse);

      const inviteId = inviteResponse?.invite?._id ||
                       inviteResponse?.invite?.id ||
                       inviteResponse?._id ||
                       inviteResponse?.id;
      if (!inviteId) throw new Error('Missing inviteId in response');

      console.log('[PRCodeGenerator] Extracted inviteId:', inviteId);

      // --- Step 2: Create PR Code ---
      const prSvc = await resolveService('prCode');
      let finalPRCode = generateLocalPRCode();

      if (prSvc) {
        const prCodePayload = {
          code: finalPRCode,
          recipientType,
          recipientName,
          recipientEmail,
          recipientPhone,
          schoolId,
          userId,
          inviteId,
          metadata: { customMessage, generatedBy: userId, channels, createdByUser: user },
        };
        console.log('[PRCodeGenerator] PR Code Payload:', prCodePayload);

        const prCodeResponse = await prSvc.createPRCode(prCodePayload);
        console.log('[PRCodeGenerator] PR Code Response:', prCodeResponse);

        finalPRCode = prCodeResponse?.pr_code?.code ||
                      prCodeResponse?.code ||
                      prCodeResponse?._id ||
                      finalPRCode;
      }

      // --- Step 3: Update Invite ---
      if (!inviteSvc.updateInvite) throw new Error('Invitation service updateInvite unavailable');

      const updatePayload = { pr_code: finalPRCode, send_immediately: true };
      console.log('[PRCodeGenerator] Update Payload:', updatePayload);

      const updatedInviteResponse = await inviteSvc.updateInvite(inviteId, updatePayload);
      console.log('[PRCodeGenerator] Updated Invite Response:', updatedInviteResponse);

      const inviteToStore = updatedInviteResponse?.invite || updatedInviteResponse || { id: inviteId, pr_code: finalPRCode };
      setGeneratedInvite(inviteToStore);
      console.log('[PRCodeGenerator] Final Invite Stored:', inviteToStore);

      if (typeof onInviteCreated === 'function') {
        onInviteCreated(inviteToStore);
        console.log('[PRCodeGenerator] onInviteCreated callback executed');
      }

      console.groupEnd();
    } catch (err) {
      console.group('================ handleGenerateInvite ERROR ================');
      console.error('Error object:', err);
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to create invitation');
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  };

  /** ----------------- Render ----------------- */
  if (!school) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Personal Invitation</h2>
        <p className="text-gray-600">Loading school data... (select a school to enable)</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Generate Personal Invitation</h2>
        <p className="text-gray-600">Create personalized invitation codes for learners, teachers, or parents</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recipient Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Recipient Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invite Type</label>
            <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="learner">Learner</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Full Name"
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Email"
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          <input type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="Phone with country code"
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Delivery Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Delivery Options</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send Via</label>
            {['whatsapp', 'sms', 'email'].map(channel => (
              <label key={channel} className="flex items-center">
                <input type="checkbox"
                  checked={channels.includes(channel)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setChannels(prev =>
                      checked ? [...new Set([...prev, channel])] : prev.filter(c => c !== channel)
                    );
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {channel}{channel === 'whatsapp' && ' (Recommended)'}
                </span>
              </label>
            ))}
          </div>
          <textarea rows={4} value={customMessage} onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal message"
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          <button onClick={handleGenerateInvite}
            disabled={isLoading || (!recipientEmail && !recipientPhone)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                       disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Generating Invite...' : 'Generate Personal Invitation'}
          </button>
        </div>
      </div>

      {/* Children */}
      {generatedInvite && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Invitation is Ready!</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => { console.log('[PRCodeGenerator] Rendering PRCodeDisplay with invite'); return <PRCodeDisplay invite={generatedInvite} />; })()}
            {(() => { console.log('[PRCodeGenerator] Rendering QRCodeGenerator with invite'); return <QRCodeGenerator invite={generatedInvite} />; })()}
            {(() => { console.log('[PRCodeGenerator] Rendering InviteLinkManager with invite'); return <InviteLinkManager invite={generatedInvite} />; })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PRCodeGenerator;
