import React from "react";
import MessagingSection from "@/components/teacher/messaging/MessagingSection";
import { DashboardProps } from "../types/dashboard.types";

export interface MessagesTabProps {
  user?: any;
  profile?: DashboardProps["profile"];
  learners?: DashboardProps["learners"];
}

export default function MessagesTab({ user, profile, learners }: MessagesTabProps) {
  const currentUserId = profile?.auth0_id || user?.sub || "";
  const schoolId = profile?.school_id || learners?.[0]?.school_id || "";

  if (!currentUserId || !schoolId) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Messaging Unavailable</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Unable to resolve school or user identity for messaging. Please ensure your parent profile and learners are properly linked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <MessagingSection
          currentUserId={currentUserId}
          schoolId={schoolId}
          sendingAsRole="parent"
          skipToken={true}
          canCreateGroup={false}
          canBrowseDirectory={false}
          canRemoveParticipants={false}
          canCreateDirectConversation={false}
          canLeaveGroups={true}
        />
      </div>
    </div>
  );
}
