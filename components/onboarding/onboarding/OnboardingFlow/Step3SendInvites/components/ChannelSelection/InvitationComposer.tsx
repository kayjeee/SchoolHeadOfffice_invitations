import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { CopyButton } from './ui/CopyButton';
import { logger } from './utils/logger';

interface InvitationComposerProps {
  schoolName: string;
  schoolLink: string;
  schoolId: string;
  prCode: string | null;
}

export const InvitationComposer: React.FC<InvitationComposerProps> = ({
  schoolName,
  schoolLink,
  schoolId,
  prCode
}) => {
  const [message, setMessage] = useState(
    `Hello 👋,

You are invited to join the ${schoolName} community on SchoolHeadOffice 🎓. 
Stay updated with school news, events, and more!

Click here to join: ${schoolLink}`
  );

  logger.debug('InvitationComposer', 'Rendering composer', {
    schoolName,
    messageLength: message.length
  });

  return (
    <div className="p-5 border rounded-xl bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">
        ✉️ Compose Your Invitation Message for {schoolName}
      </h3>

      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
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
        </div>
      </div>
    </div>
  );
};