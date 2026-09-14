import React, { useState, useEffect } from "react";
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

  const isValidSchoolId = (id: any) => typeof id === "string" && id.trim().length > 0 && !id.includes(" ");

  const initialSchoolId = isValidSchoolId(rawSchoolId) ? rawSchoolId : "";

  const [resolvedSchoolId, setResolvedSchoolId] = useState<string>(initialSchoolId);
  const [isLoadingSchool, setIsLoadingSchool] = useState<boolean>(!initialSchoolId);

  useEffect(() => {
    // If we already have a valid schoolId from props, sync it
    if (isValidSchoolId(rawSchoolId)) {
      setResolvedSchoolId(rawSchoolId);
      setIsLoadingSchool(false);
      return;
    }

    const auth0Id = user?.sub || profile?.auth0_id || profile?.sub;
    if (!auth0Id) {
      setIsLoadingSchool(false);
      return;
    }

    let isMounted = true;
    setIsLoadingSchool(true);

    async function fetchSchoolFallback() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
        const cleanBase = apiBase.endsWith('/api/v1')
          ? apiBase.replace(/\/api\/v1$/, '')
          : apiBase.startsWith('http')
          ? apiBase
          : '';

        const endpoint = `${cleanBase}/api/v1/users/schools?auth0_id=${encodeURIComponent(auth0Id)}`;
        const res = await fetch(endpoint);

        if (res.ok) {
          const json = await res.json();
          const schoolsList = json?.data?.schools || json?.schools || (Array.isArray(json?.data) ? json.data : []);

          if (Array.isArray(schoolsList) && schoolsList.length > 0 && isMounted) {
            const firstSchool = schoolsList[0];
            const fetchedId = firstSchool?.id || firstSchool?._id || firstSchool?.school_id;

            if (isValidSchoolId(fetchedId)) {
              setResolvedSchoolId(fetchedId);
            }
          }
        }
      } catch (err) {
        console.error("❌ [MessagesTab] Error fetching fallback user schools:", err);
      } finally {
        if (isMounted) {
          setIsLoadingSchool(false);
        }
      }
    }

    fetchSchoolFallback();

    return () => {
      isMounted = false;
    };
  }, [rawSchoolId, user?.sub, profile?.auth0_id, profile?.sub]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Parent-Teacher Messaging</h2>
      </div>

      {isLoadingSchool ? (
        <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl text-gray-600">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading school information...</p>
        </div>
      ) : !resolvedSchoolId ? (
        <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl text-gray-600">
          <p className="font-semibold text-base mb-1">School information is unavailable</p>
          <p className="text-xs text-gray-400">
            We could not resolve an active school enrollment ID for your account.
          </p>
        </div>
      ) : (
        <MessagingSection
          currentUserId={currentUserId}
          schoolId={resolvedSchoolId}
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
