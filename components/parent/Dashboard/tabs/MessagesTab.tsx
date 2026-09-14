import React from "react";
import MessagingSection from "@/components/teacher/messaging/MessagingSection";

interface MessagesTabProps {
  user?: any;
  profile?: any;
  learners?: any[];
}

export default function MessagesTab({ user, profile, learners }: MessagesTabProps) {
  const currentUserId = profile?.id || profile?.user_id || user?.sub || user?.id || "";

  // Helper to verify if candidate string looks like a BSON ObjectId / BSON hex string or valid database ID
  // Database school IDs in MongoDB / Rails are 24-character hex strings or UUIDs/numeric strings, not school names.
  const rawSchoolId =
    learners?.[0]?.school_id ||
    learners?.[0]?.schoolId ||
    profile?.school_id ||
    profile?.schoolId;

  const isValidSchoolId = typeof rawSchoolId === "string" && rawSchoolId.trim().length > 0 && !rawSchoolId.includes(" ");
  const schoolId = isValidSchoolId ? rawSchoolId : "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Parent-Teacher Messaging</h2>
      </div>

      {!schoolId ? (
        <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl text-gray-600">
          <p className="font-semibold text-base mb-1">School information is unavailable</p>
          <p className="text-xs text-gray-400">
            We could not resolve an active school enrollment ID for your account.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
