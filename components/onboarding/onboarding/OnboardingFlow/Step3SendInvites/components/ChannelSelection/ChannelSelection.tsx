import React, { useState } from 'react';
import { logger } from './utils/logger';
import { ChannelSelectionProps, Channel } from './types/channel';
import { usePrCode } from './hooks/usePrCode';
import { SchoolInfoHeader } from './SchoolInfoHeader';
import { ChannelCard } from './ChannelCard';
import { ChannelModal } from './ChannelModal';
import { InvitationComposer } from './InvitationComposer';

export const ChannelSelection: React.FC<ChannelSelectionProps> = ({
  channels,
  selectedChannels,
  learners,
  selectedGrades, // NEW: Receive selected grades
  schoolName,
  schools,
  school,
  user,
  onChannelSelection,
  onSelectAllChannels,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Log component mount and props
  React.useEffect(() => {
    logger.info('ChannelSelection', 'Component mounted', {
      schoolName,
      schoolsCount: schools?.length || 0,
      channelsCount: channels.length,
      selectedChannelsCount: selectedChannels.length,
      selectedGradesCount: selectedGrades.length,
      learnersCount: learners.length
    });

    // Log detailed audience information
    logger.debug('ChannelSelection', 'Audience Details', {
      selectedGrades: selectedGrades.map(g => ({ id: g.id, name: g.name })),
      learnersBreakdown: {
        total: learners.length,
        withEmail: learners.filter(l => l.email).length,
        withPhone: learners.filter(l => l.phone).length
      }
    });
  }, []);

  // Determine actual school data
  const actualSchoolName = schoolName || school?.schoolName || school?.name || "your school";
  const schoolId = school?.id || school?._id || schools?.[0]?.id || schools?.[0]?._id;

  // Use PR code hook
  const { prCode, isGenerating: isGeneratingPrCode, error: prCodeError } = 
    usePrCode(schoolId, actualSchoolName, selectedChannels);

  // Generate school link
  const schoolLink = prCode 
    ? `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}?prcode=${prCode}`
    : `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}`;

  // Modal handlers
  const handleChannelClick = (channel: Channel) => {
    logger.info('ChannelSelection', 'Channel clicked for modal', {
      channelId: channel.id,
      channelName: channel.name,
      selectedGradesCount: selectedGrades.length,
      learnersCount: learners.length
    });
    setSelectedChannel(channel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    logger.debug('ChannelSelection', 'Closing channel modal');
    setIsModalOpen(false);
    setSelectedChannel(null);
  };

  const handleChannelSelectFromModal = (channelId: string) => {
    logger.info('ChannelSelection', 'Channel selected from modal', { 
      channelId,
      audience: `${selectedGrades.length} grades, ${learners.length} learners`
    });
    onChannelSelection(channelId);
  };

  logger.debug('ChannelSelection', 'Component state', {
    isModalOpen,
    selectedChannel: selectedChannel?.name,
    schoolLink,
    hasPrCode: !!prCode,
    audience: {
      grades: selectedGrades.length,
      learners: learners.length
    }
  });

  return (
    <div className="space-y-6 mb-8">
      {/* School Info Header */}
      <SchoolInfoHeader
        schoolName={actualSchoolName}
        schoolId={schoolId}
        totalSchools={schools?.length || 0}
        prCode={prCode}
        isGeneratingPrCode={isGeneratingPrCode}
        prCodeError={prCodeError}
      />

      {/* Audience Summary Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">👥 Selected Audience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <strong>Grades:</strong> {selectedGrades.length}
            {selectedGrades.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedGrades.map(grade => (
                  <span
                    key={grade.id}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                  >
                    {grade.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <strong>Total Learners:</strong> {learners.length}
          </div>
        </div>
      </div>

      {/* Select All Channels Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Select Communication Channels
          </h3>
          <p className="text-sm text-gray-600">
            Choose how to send invites to {learners.length} learners across {selectedGrades.length} grades
          </p>
        </div>
        <button
          onClick={onSelectAllChannels}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {selectedChannels.length === channels.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isSelected={selectedChannels.includes(channel.id)}
            schoolLink={schoolLink}
            onChannelSelection={onChannelSelection}
            onChannelClick={handleChannelClick}
            audienceCount={learners.length} // Pass audience count to card
          />
        ))}
      </div>

      {/* Channel Modal */}
      {selectedChannel && (
        <ChannelModal
          channel={selectedChannel}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          schoolLink={schoolLink}
          schoolName={actualSchoolName}
          schoolId={schoolId}
          prCode={prCode}
          onChannelSelect={handleChannelSelectFromModal}
          isSelected={selectedChannels.includes(selectedChannel.id)}
            selectedGrades={selectedGrades || []} // Ensure this is passed and has fallback
          selectedLearners={learners}
            school={school} // Pass school prop for API calls
            user={user}
            
        />
      )}

      {/* Invitation Composer (when channels are selected) */}
      {selectedChannels.length > 0 && (
        <InvitationComposer
          schoolName={actualSchoolName}
          schoolLink={schoolLink}
          schoolId={schoolId}
          prCode={prCode}
          selectedChannels={selectedChannels}
          channels={channels}
          selectedGrades={selectedGrades}
          selectedLearners={learners}
        />
      )}
    </div>
  );
};

export default ChannelSelection;