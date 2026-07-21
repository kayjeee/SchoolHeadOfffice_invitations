import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { logger } from './utils/logger';
import { ChannelModalProps } from './types/channel';
import { Modal } from './ui/Modal';
import { QrCodeWithCopy } from './QrCodeWithCopy';
import { CopyButton } from './ui/CopyButton';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useAudienceData } from './hooks/useAudienceData';

// NEW WHATSAPP IMPORTS
import { WhatsAppModalContent } from './WhatsAppModalContent';
import { SmsModalContent } from './SmsModalContent';
import { EmailModalContent } from './EmailModalContent';

export const ChannelModal: React.FC<ChannelModalProps> = ({
  channel,
  isOpen,
  onClose,
  schoolLink,
  schoolName,
  schoolId,
  prCode,
  onChannelSelect,
  isSelected,
  selectedGrades = [],
  selectedLearners = [],
  school
}) => {
  const { user } = useUser();
  console.log('🎯 [ChannelModal] Props received:', {
    channel: channel?.name,
    isOpen,
    schoolId,
    selectedGradesCount: selectedGrades?.length || 0,
    selectedGrades: selectedGrades?.map(g => g.name) || []
  });

  // Load audience data when modal opens
  const { grades, learners, isLoading, error, totalLearners } = useAudienceData({
    schoolId,
    selectedGrades,
    channelId: channel.id,
    isOpen
  });

  const [customMessage, setCustomMessage] = useState(`Hi {{1}},

Your new account has been created successfully. 

Please verify {{2}} to complete your profile.`);

  // Country code helper function
  const getCountryCode = (country?: string): string => {
    if (!country) return '27'; // Default to South Africa
    const countryMap: { [key: string]: string } = {
      'South Africa': '27', 'ZA': '27', 'Uganda': '256', 'UG': '256',
      'Kenya': '254', 'KE': '254', 'Botswana': '267', 'BW': '267',
      'Nigeria': '234', 'NG': '234',
    };
    if (countryMap[country || '']) return countryMap[country || ''];
    const normalizedCountry = (country || '').trim().toLowerCase();
    const match = Object.keys(countryMap).find(key => key.toLowerCase() === normalizedCountry);
    if (match) return countryMap[match];
    if (/^\d+$/.test(country || '')) return country || '';
    return '27';
  };

  const handleSelectChannel = () => {
    logger.info('ChannelModal', 'Channel selected', {
      channelId: channel.id, channelName: channel.name, wasSelected: isSelected, audienceSize: totalLearners, gradeCount: grades.length
    });
    onChannelSelect(channel.id);
  };

  // Generate channel-specific invitation message
  const invitationMessage = `Hello 👋,

You are invited to join the ${schoolName} community on SchoolHeadOffice 🎓. 
Stay updated with school news, events, and more via ${channel.name}!

${grades.length > 0 ? `Grades: ${grades.map(g => g.name).join(', ')}` : ''}
${totalLearners > 0 ? `Total Learners: ${totalLearners}` : ''}

Click here to join: ${schoolLink}`;

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(invitationMessage);
    logger.debug('ChannelModal', 'Invitation message copied', { audienceSize: totalLearners });
  };

  const selectedGrade = selectedGrades.length === 1 ? selectedGrades[0] : null;

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${channel.icon} ${channel.name} Channel`}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Channel Description */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl flex items-center justify-center mx-auto mb-4">
            {channel.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {channel.name}
          </h3>
          <p className="text-gray-600">{channel.description}</p>
        </div>

        {/* Audience Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            👥 Audience Overview
            {isLoading && (
              <LoadingSpinner size="sm" text="Loading..." className="ml-2" />
            )}
          </h4>

          {error ? (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              ❌ Error loading audience data: {error}
            </div>
          ) : isLoading ? (
            <div className="text-center py-4">
              <LoadingSpinner size="md" text="Loading audience data..." />
              <p className="text-sm text-blue-600 mt-2">Fetching grades and learners...</p>
            </div>
          ) : (
            <>
              {/* Grades Summary */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Selected Grades:</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {grades.length} grade{grades.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {grades.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {grades.map((grade) => (
                      <span
                        key={grade.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium border border-blue-200"
                      >
                        {grade.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-600 italic">No grades selected</p>
                )}
              </div>

              {/* Learners Summary */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Total Learners:</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {totalLearners} learner{totalLearners !== 1 ? 's' : ''}
                  </span>
                </div>

                {totalLearners === 0 && !isLoading && (
                  <p className="text-sm text-blue-600 italic">No learners found in selected grades</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Channel Specific Content */}
        {channel.id === 'whatsapp' && (
          <WhatsAppModalContent
            learners={learners}
            grades={grades}
            schoolId={schoolId}
            schoolName={schoolName}
            userEmail={school?.userEmail}
            senderId={user?.sub}
            customMessage={customMessage}
            onMessageChange={setCustomMessage}
            selectedGrade={selectedGrade}
            selectedGrades={selectedGrades}
            getCountryCode={getCountryCode}
            school={school}
          />
        )}
        {channel.id === 'sms' && (
          <SmsModalContent
            learners={learners}
            grades={grades}
            schoolId={schoolId}
            schoolName={schoolName}
            userEmail={school?.userEmail}
            senderId={user?.sub}
            customMessage={customMessage}
            onMessageChange={setCustomMessage}
            selectedGrade={selectedGrade}
            selectedGrades={selectedGrades}
          />
        )}
        {channel.id === 'email' && (
          <EmailModalContent
            learners={learners}
            grades={grades}
            schoolId={schoolId}
            schoolName={schoolName}
            userEmail={school?.userEmail}
          />
        )}

        {/* School Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">🏫 School Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>School:</strong> {schoolName}</p>
            <p><strong>ID:</strong> {schoolId}</p>
            {prCode && <p><strong>PR Code:</strong> {prCode}</p>}
          </div>
        </div>

        {/* QR Code and Link */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">🔗 Share Invitation</h4>
          <QrCodeWithCopy
            link={schoolLink}
            size={120}
            showLink={true}
          />
        </div>

        {/* Invitation Message */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            ✉️ Invitation Message for {channel.name}
          </h4>
          <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {invitationMessage}
            </p>
          </div>
          <CopyButton
            text={invitationMessage}
            variant="outline"
            size="md"
            className="w-full justify-center"
            onClick={handleCopyMessage}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSelectChannel}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
              isSelected
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" text="Loading..." />
            ) : isSelected ? (
              <span className="flex items-center justify-center">
                ✅ Selected • {totalLearners} learners
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Select Channel • {totalLearners} learners
              </span>
            )}
          </button>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="text-xs text-gray-400 border-t pt-2">
          <p>Debug: Channel={channel.id} | School={schoolId} | Grades={grades.length} | Learners={totalLearners}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ChannelModal;