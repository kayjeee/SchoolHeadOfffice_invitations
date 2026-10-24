import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { SchoolAPI } from '@/lib/api/school-api';
import { EngagementAPI } from '@/lib/api/engagement-api';
import DashboardClient from '@/components/teacher/DashboardClient';
import DashboardLayoutWrapper from '@/components/teacher/DashboardLayoutWrapper';
import { DashboardData, ActivityLog, AgentStatus } from '@/lib/types/dashboard';

interface DashboardPageProps {
  initialData: DashboardData;
  schoolSlug: string;
  teacherSlug: string;
}

export default function DashboardPage({ initialData, schoolSlug, teacherSlug }: DashboardPageProps) {
  if (!initialData) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-white p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Error Loading Dashboard</h2>
          <p className="text-white/40">We couldn't retrieve your dashboard data. Please try refreshing or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutWrapper
      schoolSlug={schoolSlug}
      teacherSlug={teacherSlug}
      userId={initialData.teacher?.id?.toString()}
    >
      <DashboardClient
        initialData={initialData}
        schoolSlug={schoolSlug}
        teacherSlug={teacherSlug}
      />
    </DashboardLayoutWrapper>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context.req, context.res);
  const { schoolSlug, teacherSlug } = context.params as { schoolSlug: string, teacherSlug: string };

  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/login?returnTo=/teacher/school/${schoolSlug}/teachers/${teacherSlug}/dashboard`,
        permanent: false,
      },
    };
  }

  const user = session.user;
  console.log(`🔍 [Pages.Dashboard] Params:`, { schoolSlug, teacherSlug, auth0Id: user.sub });

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
      return { notFound: true };
    }

    // B. Teacher Lookup - Prioritize matching by Auth0 ID to handle name collisions correctly
    const coreTeachers = await SchoolAPI.getTeachers(coreSchool.id);

    // Find teacher: try Auth0 ID first, then slug, then short ID
    const coreTeacherBrief =
      coreTeachers.find(t => t.auth0_id === user.sub) ||
      coreTeachers.find(t => t.slug === teacherSlug) ||
      coreTeachers.find(t => shortId && t.id.endsWith(shortId));

    if (!coreTeacherBrief) {
       return { notFound: true };
    }

    // Authorization check
    if (user.role !== 'admin' && user.sub !== coreTeacherBrief.auth0_id) {
       return {
         redirect: {
           destination: '/teacher/school',
           permanent: false,
         }
       };
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
        logo: coreSchool.logo || null,
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
        avatar: coreTeacherBrief.avatar || null,
        auth0Id: coreTeacherBrief.auth0_id || null,
        email: coreTeacherBrief.email || null,
        bio: coreTeacherBrief.bio || null,
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

    return {
      props: {
        initialData: JSON.parse(JSON.stringify(dashboardData)),
        schoolSlug,
        teacherSlug,
      },
    };

  } catch (error) {
    console.error('Error loading dashboard:', error);
    return {
      props: {
        error: 'Failed to load dashboard',
      }
    };
  }
};
