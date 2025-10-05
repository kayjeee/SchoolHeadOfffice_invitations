
import React from 'react';
import QRCode from 'react-qr-code';
import { CopyButton } from './ui/CopyButton';
import { logger } from './utils/logger';

interface QrCodeWithCopyProps {
  link: string;
}

export const QrCodeWithCopy: React.FC<QrCodeWithCopyProps> = ({ link }) => {
  logger.debug('QrCodeWithCopy', 'Rendering QR code', { link });

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-center p-2 bg-white rounded-md">
        <QRCode value={link} size={128} />
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={link}
          readOnly
          className="flex-1 px-2 py-1 text-sm border-gray-300 rounded-md bg-gray-100"
        />
        <CopyButton text={link} />
      </div>
    </div>
  );
};

export default QrCodeWithCopy;