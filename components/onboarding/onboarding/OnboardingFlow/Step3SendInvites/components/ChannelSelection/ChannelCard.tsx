import React from 'react';
import { Channel } from './types/channel';
import { QrCodeWithCopy } from './QrCodeWithCopy';
import { logger } from './utils/logger';

interface ChannelCardProps {
  channel: Channel;
  isSelected: boolean;
  schoolLink: string;
  onChannelSelection: (channelId: string) => void;
  onChannelClick: (channel: Channel) => void;
  audienceCount?: number; // NEW: Add audience count
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isSelected,
  schoolLink,
  onChannelSelection,
  onChannelClick,
  audienceCount = 0
}) => {
  const handleCardClick = () => {
    logger.debug('ChannelCard', 'Channel card clicked', { 
      channelId: channel.id, 
      channelName: channel.name,
      audienceCount
    });
    onChannelClick(channel);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logger.debug('ChannelCard', 'Checkbox clicked', { 
      channelId: channel.id,
      audienceCount 
    });
    onChannelSelection(channel.id);
  };

  logger.debug('ChannelCard', 'Rendering channel card', { 
    channelId: channel.id,
    audienceCount 
  });

  return (
    <div
      className={`border rounded-2xl shadow-sm p-5 transition-all cursor-pointer ${
        isSelected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
              isSelected
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {channel.icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}} // Handled by onClick
              onClick={handleCheckboxClick}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2 font-medium text-gray-900">
              {channel.name}
            </span>
          </label>

          <p className="mt-1 text-sm text-black">{channel.description}</p>

          {/* Audience Info */}
          {audienceCount > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                📊 {audienceCount} learners
              </span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isSelected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isSelected ? 'Selected' : 'Click to view'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChannelSelection(channel.id);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {isSelected ? 'Deselect' : 'Select'}
            </button>
          </div>

          {/* Preview QR Code */}
          <div className="mt-4">
            <QrCodeWithCopy link={schoolLink} size={50} showLink={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;