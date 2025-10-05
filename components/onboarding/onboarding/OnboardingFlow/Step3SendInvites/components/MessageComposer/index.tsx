import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";

interface ChannelStatus {
  channel: string;
  status: "Pending" | "Sent" | "Delivered" | "Failed";
}

interface MessageComposerProps {
  inviteMessage: string;
  setInviteMessage: (message: string) => void;
  validationErrors: { [key: string]: string };
  channels: string[]; // ✅ pass selected channels here
  schoolName: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  inviteMessage,
  setInviteMessage,
  validationErrors,
  channels = [],
  schoolName,
}) => {
  const [channelStatuses, setChannelStatuses] = useState<ChannelStatus[]>([]);

  // initialize statuses when channels change
  useEffect(() => {
    if (channels.length > 0) {
      setChannelStatuses(
        channels.map((ch) => ({ channel: ch, status: "Pending" }))
      );
    }
  }, [channels]);

  // simulate sending invites
  const sendInvites = () => {
    setChannelStatuses((prev) =>
      prev.map((ch) => ({ ...ch, status: "Sent" }))
    );

    // step 2: Delivered with delay
    setTimeout(() => {
      setChannelStatuses((prev) =>
        prev.map((ch) => ({ ...ch, status: "Delivered" }))
      );
    }, 2000);
  };

  // link + QR
  const schoolLink = `https://www.schoolheadoffice.com/${encodeURIComponent(
    schoolName
  )}`;

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-medium text-gray-900">
        Compose Your Invitation Message
      </h3>

      {/* Textarea for message */}
      <textarea
        className={`w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
          validationErrors.inviteMessage ? "border-red-500" : "border-gray-300"
        }`}
        rows={6}
        placeholder="Enter your invitation message here..."
        value={inviteMessage}
        onChange={(e) => setInviteMessage(e.target.value)}
      />

      {validationErrors.inviteMessage && (
        <p className="text-red-500 text-sm">
          {validationErrors.inviteMessage}
        </p>
      )}

      {/* Preview box with QR code */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <p className="text-sm text-black whitespace-pre-line">
          {inviteMessage || "Hi! Join our school on SchoolHeadOffice."}
        </p>

        <div className="flex items-center space-x-4 mt-3">
          <QRCode value={schoolLink} size={72} />
          <div>
            <p className="text-xs text-gray-600">Scan or click:</p>
            <a
              href={schoolLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm break-all"
            >
              {schoolLink}
            </a>
          </div>
        </div>
      </div>

      {/* Tracking Status */}
      {channelStatuses.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Tracking Status</h4>
          <ul className="divide-y divide-gray-200">
            {channelStatuses.map((ch) => (
              <li
                key={ch.channel}
                className="flex justify-between items-center py-2"
              >
                <span className="font-medium text-gray-800">{ch.channel}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium
                    ${
                      ch.status === "Pending"
                        ? "bg-gray-100 text-gray-700"
                        : ch.status === "Sent"
                        ? "bg-blue-100 text-blue-600"
                        : ch.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                >
                  {ch.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={sendInvites}
        disabled={!inviteMessage || channels.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
      >
        Send Invites
      </button>
    </div>
  );
};
