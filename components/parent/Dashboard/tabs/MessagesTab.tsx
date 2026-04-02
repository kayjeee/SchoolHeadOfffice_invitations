import React, { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import MessagingSection from "@/components/teacher/MessagingSection";

interface MessagesTabProps {
  schoolId?: string;
}

export default function MessagesTab({ schoolId }: MessagesTabProps) {
  const { user } = useUser();

  if (!schoolId || !user?.sub) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <p>Unable to load messaging system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Parent-Teacher Messaging</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[700px]">
        {/* Re-use the MessagingSection logic but we might want to restyle it for light mode if needed */}
        <div className="h-full dark:bg-transparent">
           <MessagingSection
             schoolId={schoolId}
             currentUserId={user.sub}
             godMode={false}
           />
        </div>
      </div>
    </div>
  );
}
