import React from 'react';
import { logger } from './utils/logger';
import { ChannelModalProps } from './types/channel';
import { useAudienceData } from './hooks/useAudienceData';

// Debug each import
console.log('🔍 [ChannelModal] Debugging imports:');
try {
  const ModalModule = require('./ui/Modal');
  console.log('✅ Modal:', ModalModule.Modal, ModalModule.default);
} catch (error) {
  console.error('❌ Modal import failed:', error);
}

try {
  const QrCodeModule = require('./QrCodeWithCopy');
  console.log('✅ QrCodeWithCopy:', QrCodeModule.QrCodeWithCopy, QrCodeModule.default);
} catch (error) {
  console.error('❌ QrCodeWithCopy import failed:', error);
}

try {
  const CopyButtonModule = require('./ui/CopyButton');
  console.log('✅ CopyButton:', CopyButtonModule.CopyButton, CopyButtonModule.default);
} catch (error) {
  console.error('❌ CopyButton import failed:', error);
}

try {
  const LoadingSpinnerModule = require('./ui/LoadingSpinner');
  console.log('✅ LoadingSpinner:', LoadingSpinnerModule.LoadingSpinner, LoadingSpinnerModule.default);
} catch (error) {
  console.error('❌ LoadingSpinner import failed:', error);
}

// Use the components with fallbacks
const Modal = (await import('./ui/Modal')).Modal || (await import('./ui/Modal')).default;
const QrCodeWithCopy = (await import('./QrCodeWithCopy')).QrCodeWithCopy || (await import('./QrCodeWithCopy')).default;
const CopyButton = (await import('./ui/CopyButton')).CopyButton || (await import('./ui/CopyButton')).default;
const LoadingSpinner = (await import('./ui/LoadingSpinner')).LoadingSpinner || (await import('./ui/LoadingSpinner')).default;

// Fallback components in case imports fail
const FallbackModal = ({ isOpen, children, onClose, title }: any) => 
  isOpen ? <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-500">✕</button>
      </div>
      {children}
    </div>
  </div> : null;

const FallbackLoadingSpinner = ({ text }: any) => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-sm">{text}</span>
  </div>
);

const FallbackCopyButton = ({ text, onClick }: any) => (
  <button 
    onClick={onClick}
    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
  >
    Copy
  </button>
);

const FallbackQrCode = ({ link }: any) => (
  <div className="bg-gray-100 p-4 rounded text-center">
    <div className="text-sm text-gray-600 mb-2">QR Code Placeholder</div>
    <div className="text-xs break-all">{link}</div>
  </div>
);

// Use fallbacks if components are undefined
const SafeModal = Modal || FallbackModal;
const SafeLoadingSpinner = LoadingSpinner || FallbackLoadingSpinner;
const SafeCopyButton = CopyButton || FallbackCopyButton;
const SafeQrCodeWithCopy = QrCodeWithCopy || FallbackQrCode;

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
  selectedGrades,
  school
}) => {
  // Rest of your component logic remains the same...
  const { grades, learners, isLoading, error, totalLearners } = useAudienceData({
    schoolId,
    selectedGrades,
    channelId: channel.id
  });

  const handleSelectChannel = () => {
    logger.info('ChannelModal', 'Channel selected', {
      channelId: channel.id,
      channelName: channel.name,
      wasSelected: isSelected,
      audienceSize: totalLearners,
      gradeCount: grades.length
    });
    onChannelSelect(channel.id);
  };

  const invitationMessage = `Hello 👋,

You are invited to join the ${schoolName} community on SchoolHeadOffice 🎓. 
Stay updated with school news, events, and more via ${channel.name}!

${grades.length > 0 ? `Grades: ${grades.map(g => g.name).join(', ')}` : ''}
${totalLearners > 0 ? `Total Learners: ${totalLearners}` : ''}

Click here to join: ${schoolLink}`;

  const getLearnersCountByGrade = () => {
    const countByGrade: { [gradeId: string]: { grade: any; count: number } } = {};
    
    learners.forEach(learner => {
      if (learner.gradeId) {
        const grade = grades.find((g: any) => g.id === learner.gradeId);
        if (grade) {
          if (!countByGrade[grade.id]) {
            countByGrade[grade.id] = { grade, count: 0 };
          }
          countByGrade[grade.id].count++;
        }
      }
    });
    
    return Object.values(countByGrade);
  };

  const learnersByGrade = getLearnersCountByGrade();

  return (
    <SafeModal
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
              <SafeLoadingSpinner size="sm" text="Loading..." className="ml-2" />
            )}
          </h4>
          
          {error ? (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              ❌ Error loading audience data: {error}
            </div>
          ) : isLoading ? (
            <div className="text-center py-4">
              <SafeLoadingSpinner size="md" text="Loading audience data..." />
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
                    {grades.map((grade: any) => (
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
                
                {learnersByGrade.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-blue-700">Breakdown by Grade:</p>
                    <div className="space-y-1">
                      {learnersByGrade.map(({ grade, count }) => (
                        <div key={grade.id} className="flex justify-between items-center text-xs">
                          <span className="text-blue-600">{grade.name}:</span>
                          <span className="bg-white text-blue-800 px-2 py-1 rounded font-medium">
                            {count} learner{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalLearners === 0 && !isLoading && (
                  <p className="text-sm text-blue-600 italic">No learners found in selected grades</p>
                )}
              </div>
            </>
          )}
        </div>

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
          <SafeQrCodeWithCopy 
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
          <SafeCopyButton 
            text={invitationMessage} 
            variant="outline"
            size="md"
            className="w-full justify-center"
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
              <SafeLoadingSpinner size="sm" text="Loading..." />
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
      </div>
    </SafeModal>
  );
};

export default ChannelModal;