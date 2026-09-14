import React from "react";
import MessagingSection from "@/components/teacher/messaging/MessagingSection";

interface MessagesTabProps {
  user?: any;
  profile?: any;
  learners?: any[];
}

export default function MessagesTab({ user, profile, learners }: MessagesTabProps) {
  const currentUserId = profile?.id || profile?.user_id || user?.sub || user?.id || "";
  const schoolId =
    learners?.[0]?.school_id ||
    learners?.[0]?.schoolId ||
    profile?.school_id ||
    profile?.schoolId ||
    "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Parent-Teacher Messaging</h2>
      </div>

      <MessagingSection
        currentUserId={currentUserId}
        schoolId={schoolId}
        godMode={false}
        canCreateGroup={false}
        canBrowseDirectory={false}
        canRemoveParticipants={false}
        canLeaveGroups={true}
        canCreateDirectConversation={false}
      />
    </div>
  );
}
