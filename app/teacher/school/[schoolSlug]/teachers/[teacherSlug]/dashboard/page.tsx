import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import { SchoolAPI } from '@/lib/api/school-api';
import { EngagementAPI } from '@/lib/api/engagement-api';
import DashboardClient from '@/components/teacher/DashboardClient';
import { DashboardData, ActivityLog, AgentStatus } from '@/lib/types/dashboard';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    schoolSlug: string;
    teacherSlug: string;
  }>;
}

export default async function DashboardPage(props: PageProps) {
  const { params } = props;
  const { schoolSlug, teacherSlug } = await params;

  // 1. Authentication & Session
  // In Next.js 15 App Router, ensure headers and cookies are awaited to initialize request context
  // This helps @auth0/nextjs-auth0 v2.x find the request/response in AsyncLocalStorage
  await headers();
  await cookies();
  const session = await getSession();

  if (!session) {
    redirect(`/api/auth/login?returnTo=/teacher/school/${schoolSlug}/teachers/${teacherSlug}/dashboard`);
  }
  const user = session.user;

  // 2. Data Fetching
  console.log(`🔍 [App.Dashboard] Params:`, { schoolSlug, teacherSlug, auth0Id: user.sub });

  // Decode school name and teacher slug
  const decodedSchoolSlug = decodeURIComponent(schoolSlug);
  const schoolSearchName = decodedSchoolSlug.replace(/-/g, ' ').replace(/\+/g, ' ');

  const slugParts = teacherSlug.split('-');
  const shortId = slugParts[slugParts.length - 1];

  try {
    // A. School Lookup
    const schoolResponse = await SchoolAPI.getSchools({ search: schoolSearchName, limit: 10 });
    let coreSchool = schoolResponse.schools.find(s =>
      s.schoolName.toLowerCase() === schoolSearchName.toLowerCase() ||
      s.id === decodedSchoolSlug
    ) || (schoolResponse.schools.length > 0 ? schoolResponse.schools[0] : null);

    if (!coreSchool && decodedSchoolSlug !== schoolSearchName) {
      const fallbackResponse = await SchoolAPI.getSchools({ search: decodedSchoolSlug, limit: 10 });
      coreSchool = fallbackResponse.schools[0];
    }

    if (!coreSchool) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] text-white">
          <div className="text-center p-8 bg-surface-container rounded-3xl border border-white/10">
            <h1 className="text-2xl font-bold mb-2">School Not Found</h1>
            <p className="text-white/40 mb-6">We couldn't find a school matching "{schoolSlug}".</p>
            <a href="/teacher/school" className="px-6 py-3 bg-primary-fixed text-on-primary-fixed rounded-xl font-bold inline-block">Return to Browser</a>
          </div>
        </div>
      );
    }

    // B. Teacher Lookup
    const coreTeachers = await SchoolAPI.getTeachers(coreSchool.id);
    const coreTeacherBrief = coreTeachers.find(t => {
      const auth0Match = t.auth0_id === user.sub;
      const slugMatch = t.slug === teacherSlug;
      const idMatch = (shortId && t.id.endsWith(shortId));
      return auth0Match || slugMatch || idMatch;
    });

    if (!coreTeacherBrief) {
       return (
        <div className="flex items-center justify-center min-h-[60vh] text-white">
          <div className="text-center p-8 bg-surface-container rounded-3xl border border-white/10">
            <h1 className="text-2xl font-bold mb-2">Teacher Profile Not Found</h1>
            <p className="text-white/40 mb-6">We couldn't find a teacher matching "{teacherSlug}" in this school.</p>
          </div>
        </div>
      );
    }

    // Authorization check
    if (user.role !== 'admin' && user.sub !== coreTeacherBrief.auth0_id) {
       return (
        <div className="flex items-center justify-center min-h-[60vh] text-white">
          <div className="text-center p-8 bg-surface-container rounded-3xl border border-white/10">
            <h1 className="text-2xl font-bold mb-2 text-red-400">Access Denied</h1>
            <p className="text-white/40 mb-6">You do not have permission to access this dashboard.</p>
          </div>
        </div>
      );
    }

    // C. Fetch Additional Data
    const [profileData, activities, agents, assignments] = await Promise.all([
      SchoolAPI.getTeacherProfile(coreTeacherBrief.id),
      EngagementAPI.getRecentActivity(schoolSlug, teacherSlug),
      EngagementAPI.getAgentStatus(schoolSlug, teacherSlug),
      SchoolAPI.getTeacherGradeAssignments(coreTeacherBrief.id),
    ]);

    // D. Map to DashboardData interface
    const dashboardData: DashboardData = {
      school: {
        id: coreSchool.id,
        schoolName: coreSchool.schoolName,
        slug: schoolSlug,
        logo: coreSchool.logo || undefined,
        stats: {
          teachers: coreSchool.teacherCount || 0,
          students: coreSchool.learnerCount || 0,
          parents: 0,
        }
      },
      teacher: {
        id: coreTeacherBrief.id,
        name: coreTeacherBrief.name,
        slug: teacherSlug,
        avatar: coreTeacherBrief.avatar || undefined,
        auth0Id: coreTeacherBrief.auth0_id,
        email: coreTeacherBrief.email,
        bio: coreTeacherBrief.bio,
      },
      activities: activities as ActivityLog[],
      agents: agents as AgentStatus[],
      classes: assignments,
      stats: {
        totalLearners: profileData.stats.total_learners,
        activeGrades: profileData.stats.active_grades,
        pendingInvites: profileData.stats.pending_invites,
        parentConnectionRate: profileData.stats.parent_connection_rate,
      }
    };

    return (
      <DashboardClient
        initialData={dashboardData}
        schoolSlug={schoolSlug}
        teacherSlug={teacherSlug}
      />
    );

  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white">
        <div className="text-center p-8 bg-surface-container rounded-3xl border border-white/10">
          <h1 className="text-2xl font-bold mb-2 text-red-400">System Error</h1>
          <p className="text-white/40 mb-6">An error occurred while loading your dashboard. Please try again later.</p>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold">Reload Dashboard</button>
        </div>
      </div>
    );
  }
}
