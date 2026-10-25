// lib/services/resolveStudentDashboardProps.ts
import { GetServerSidePropsContext } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { StudentService, StudentProfile } from './student.service';

export interface StudentDashboardPageProps {
  school_slug: string;
  schoolName: string;
  email: string;
  isAuthenticated: boolean;
  initialProfile?: StudentProfile | null;
  error?: string | null;
}

export async function resolveStudentDashboardProps(
  context: GetServerSidePropsContext
): Promise<{ props: StudentDashboardPageProps }> {
  const { req, res, params } = context;

  const school_slug = (params?.school_slug as string) || (params?.schoolSlug as string) || 'School';
  const emailParam = (params?.email as string) || '';

  const decodedSchoolSlug = decodeURIComponent(school_slug);
  const decodedEmail = decodeURIComponent(emailParam);

  console.log(`📡 [resolveStudentDashboardProps] Resolving for school_slug: "${school_slug}" (${decodedSchoolSlug}), email: "${emailParam}" (${decodedEmail})`);

  const session = await getSession(req, res);

  if (!session?.user) {
    return {
      props: {
        school_slug: decodedSchoolSlug,
        schoolName: decodedSchoolSlug,
        email: decodedEmail,
        isAuthenticated: false,
        error: null,
      },
    };
  }

  try {
    const userSub = session.user.sub;
    await StudentService.syncStudentRole(userSub, session.user.email, session.user.name);
    const profile = await StudentService.getProfile(userSub);

    const schoolName = profile?.primary_school_name || profile?.school_name || decodedSchoolSlug;

    return {
      props: {
        school_slug: decodedSchoolSlug,
        schoolName: schoolName,
        email: decodedEmail || session.user.email || '',
        isAuthenticated: true,
        initialProfile: profile || null,
        error: null,
      },
    };
  } catch (err: any) {
    console.error('❌ [resolveStudentDashboardProps] Error:', err);
    return {
      props: {
        school_slug: decodedSchoolSlug,
        schoolName: decodedSchoolSlug,
        email: decodedEmail,
        isAuthenticated: true,
        error: 'Failed to resolve student profile.',
      },
    };
  }
}
