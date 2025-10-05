import React from 'react';
import { logger } from './utils/logger';
import { ChannelSelectionProps } from './types/channel';
import { usePrCode } from './hooks/usePrCode';
import { SchoolInfoHeader } from './SchoolInfoHeader';
import { ChannelCard } from './ChannelCard';
import { InvitationComposer } from './InvitationComposer';

export const ChannelSelection: React.FC<ChannelSelectionProps> = ({
  channels,
  selectedChannels,
  learners,
  schoolName,
  schools,
  school,
  onChannelSelection,
  onSelectAllChannels,
}) => {
  // Log component mount and props
  React.useEffect(() => {
    logger.info('ChannelSelection', 'Component mounted', {
      schoolName,
      schoolsCount: schools?.length || 0,
      channelsCount: channels.length,
      selectedChannelsCount: selectedChannels.length,
      learnersCount: learners.length
    });

    // Log schools analysis
    if (schools && Array.isArray(schools)) {
      logger.debug('ChannelSelection', 'Schools analysis', {
        schools: schools.map((schoolItem, index) => ({
          index,
          id: schoolItem?.id || schoolItem?._id,
          name: schoolItem?.schoolName || schoolItem?.name,
          email: schoolItem?.schoolEmail || schoolItem?.email
        }))
      });
    }
  }, []);

  // Determine actual school data
  const actualSchoolName = schoolName || school?.schoolName || school?.name || "your school";
  const schoolId = school?.id || school?._id || schools?.[0]?.id || schools?.[0]?._id;

  logger.debug('ChannelSelection', 'Resolved school data', {
    actualSchoolName,
    schoolId,
    schoolObject: school
  });

  // Use PR code hook
  const { prCode, isGenerating: isGeneratingPrCode, error: prCodeError } = 
    usePrCode(schoolId, actualSchoolName, selectedChannels);

  // Generate school link
  const schoolLink = prCode 
    ? `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}?prcode=${prCode}`
    : `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}`;

  logger.debug('ChannelSelection', 'Generated school link', {
    schoolLink,
    hasPrCode: !!prCode,
    prCode
  });

  return (
    <div className="space-y-6 mb-8">
      <SchoolInfoHeader
        schoolName={actualSchoolName}
        schoolId={schoolId}
        totalSchools={schools?.length || 0}
        prCode={prCode}
        isGeneratingPrCode={isGeneratingPrCode}
        prCodeError={prCodeError}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isSelected={selectedChannels.includes(channel.id)}
            schoolLink={schoolLink}
            onChannelSelection={onChannelSelection}
          />
        ))}
      </div>

      {selectedChannels.length > 0 && (
        <InvitationComposer
          schoolName={actualSchoolName}
          schoolLink={schoolLink}
          schoolId={schoolId}
          prCode={prCode}
        />
      )}
    </div>
  );
};