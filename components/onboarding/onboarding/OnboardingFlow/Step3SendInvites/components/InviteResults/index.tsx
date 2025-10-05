import React from "react";
import { Learner } from "../../types";

interface InviteResultsProps {
  selectedChannels: string[];
  learners: Learner[];
  inviteMessage: string;
}

export const InviteResults: React.FC<InviteResultsProps> = ({
  selectedChannels,
  learners,
  inviteMessage,
}) => {
  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-medium text-gray-900">Invitation Results Summary</h3>
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-700 mb-2">
          Invitations will be sent to <strong>{learners.length} learners</strong> via 
          <strong>{selectedChannels.length} channel(s)</strong>.
        </p>
        <p className="text-sm text-blue-600">
          Message content: "{inviteMessage.substring(0, 100)}{inviteMessage.length > 100 ? '...' : ''}"
        </p>
      </div>
      <p className="text-gray-600">
        Further details on individual invite status and bulk actions would be displayed here.
      </p>
      {/* Placeholder for InviteCard and BulkActions */}
      {/* <InviteCard /> */}
      {/* <BulkActions /> */}
    </div>
  );
};
