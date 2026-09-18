import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { ParentService } from './parent.service';
import { ParentProfile, Learner } from '../api/parent-api';

export interface ParentDashboardPageProps {
  school_slug: string;
  schoolName: string;
  email: string;
  isAuthenticated: boolean;
  initialProfile: ParentProfile | null;
  initialLearners: Learner[];
  error?: string | null;
}

export async function resolveParentDashboardProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ParentDashboardPageProps>> {
  const { school_slug, email } = context.params as { school_slug: string; email: string };
  const session = await getSession(context.req, context.res);

  const schoolName = decodeURIComponent((school_slug || '').replace(/\+/g, ' '));
  const decodedEmail = decodeURIComponent((email || '').replace(/\+/g, ' '));

  console.log(`🏫 [resolveParentDashboardProps] slug: ${school_slug}, school: ${schoolName}, email: ${decodedEmail}`);

  if (!session?.user) {
    return {
      props: {
        school_slug: school_slug || '',
        schoolName,
        email: decodedEmail,
        isAuthenticated: false,
        initialProfile: null,
        initialLearners: [],
      },
    };
  }

  try {
    const userId = session.user.sub;
    console.log(`👤 [resolveParentDashboardProps] Authenticated user: ${userId}`);

    await ParentService.syncParentRole(userId, session.user.email, session.user.name);

    const [profile, learners] = await Promise.all([
      ParentService.getProfile(userId),
      ParentService.getLearners(userId),
    ]);

    const isOnboardingComplete = profile?.onboarding_status?.parent_onboarding_completed === true;

    if (!profile || !isOnboardingComplete) {
      console.log(`⏳ [resolveParentDashboardProps] Onboarding incomplete for ${userId}. Redirecting to gateway.`);
      const onboardingPath = `/parent?school=${encodeURIComponent(schoolName)}`;
      return {
        redirect: {
          destination: onboardingPath,
          permanent: false,
        },
      };
    }

    console.log(`✅ [resolveParentDashboardProps] Showing dashboard for ${schoolName}`);
    return {
      props: {
        school_slug: school_slug || '',
        schoolName: profile.primary_school_name || schoolName,
        email: decodedEmail,
        isAuthenticated: true,
        initialProfile: profile,
        initialLearners: learners,
      },
    };
  } catch (err: any) {
    console.error('❌ [resolveParentDashboardProps] Error loading dashboard data:', err?.message || err);
    return {
      props: {
        school_slug: school_slug || '',
        schoolName,
        email: decodedEmail,
        isAuthenticated: true,
        initialProfile: null,
        initialLearners: [],
        error: 'Failed to load dashboard data.',
      },
    };
  }
}
