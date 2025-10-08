import React from 'react';
import QRCode from 'react-qr-code';
import { CopyButton } from './ui/CopyButton';
import { logger } from './utils/logger';

interface QrCodeWithCopyProps {
  link: string;
  size?: number;         // optional size in pixels
  showLink?: boolean;    // whether to show the input with the link
}

export const QrCodeWithCopy: React.FC<QrCodeWithCopyProps> = ({
  link,
  size = 128,
  showLink = true,
}) => {
  logger.debug('QrCodeWithCopy', 'Rendering QR code', { link, size, showLink });

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-center p-2 bg-white rounded-md">
        <QRCode value={link} size={size} />
      </div>

      {showLink && (
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 px-2 py-1 text-sm border-gray-300 rounded-md bg-gray-100"
          />
          <CopyButton text={link} />
        </div>
      )}
    </div>
  );
};

export default QrCodeWithCopy;
