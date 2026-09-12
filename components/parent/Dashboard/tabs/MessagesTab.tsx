import React from "react";
import MessagingSection from "@/components/teacher/messaging/MessagingSection";

interface MessagesTabProps {
  user?: any;
  profile?: any;
  learners?: any[];
}

export default function MessagesTab({ user, profile, learners }: MessagesTabProps) {
  const currentUserId = profile?.auth0_id || user?.sub || profile?._id || user?.id || "parent-123";
  const schoolId = profile?.primary_school_id || profile?.school_id || (learners && learners.length > 0 ? learners[0]?.school_id : "") || "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Parent Communications Hub</h2>
          <p className="text-xs text-gray-500">Connect with teachers and school staff in real-time.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <MessagingSection
          currentUserId={currentUserId}
          schoolId={schoolId}
          godMode={false}
          skipToken={true}
        />
      </div>
    </div>
  );
}
