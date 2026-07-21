import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { CopyButton } from './ui/CopyButton';
import { logger } from './utils/logger';
import type { Grade, Learner } from '../../types'; 
// If Channel type is needed, ensure it's exported from '../../types' or define it here:
export interface Channel {
  id: string;
  name: string;
}

interface InvitationComposerProps {
  schoolName: string;
  schoolLink: string;
  schoolId: string;
  prCode: string | null;
  selectedChannels: string[];
  channels: Channel[];
  selectedGrades: Grade[];
  selectedLearners: Learner[];
}

export const InvitationComposer: React.FC<InvitationComposerProps> = ({
  schoolName,
  schoolLink,
  schoolId,
  prCode,
  selectedChannels,
  channels,
  selectedGrades,
  selectedLearners
}) => {
  const [message, setMessage] = useState(
    `Hello 👋,

You are invited to join the ${schoolName} community on SchoolHeadOffice 🎓. 
Stay updated with school news, events, and more!

Selected Grades: ${selectedGrades.map(g => g.name).join(', ')}
Total Learners: ${selectedLearners.length}

Click here to join: ${schoolLink}`
  );

  // Get selected channel names
  const selectedChannelNames = channels
    .filter(channel => selectedChannels.includes(channel.id))
    .map(channel => channel.name);

  logger.debug('InvitationComposer', 'Rendering composer', {
    schoolName,
    selectedChannels: selectedChannelNames,
    selectedGradesCount: selectedGrades.length,
    selectedLearnersCount: selectedLearners.length,
    messageLength: message.length
  });

  return (
    <div className="p-5 border rounded-xl bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">
        ✉️ Compose Your Invitation Message for {schoolName}
      </h3>

      {/* Audience Summary */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">👥 Audience Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Grades:</strong> {selectedGrades.length}
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedGrades.map(grade => (
                <span
                  key={grade.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {grade.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <strong>Total Learners:</strong> {selectedLearners.length}
          </div>
          <div>
            <strong>Channels:</strong> {selectedChannels.length}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={8}
            placeholder="Customize your invitation message..."
          />
          <div className="mt-2 flex gap-2">
            <CopyButton text={message} variant="outline" />
            <CopyButton text={schoolLink} variant="outline" />
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center">
          <QRCode value={schoolLink} size={96} />
          <p className="mt-2 text-xs text-gray-600">Scan to join {schoolName}</p>
          <p className="text-xs text-gray-500 mt-1">School ID: {schoolId}</p>
          {prCode && (
            <p className="text-xs text-green-600 mt-1">PR Code: {prCode}</p>
          )}
          <div className="mt-2 text-xs text-center text-gray-500">
            <p>Sending to:</p>
            <p className="font-semibold">{selectedLearners.length} learners</p>
            <p>across {selectedGrades.length} grades</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationComposer;