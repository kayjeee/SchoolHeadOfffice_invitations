import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    '/teacher/school/:schoolSlug/teachers/:teacherSlug/dashboard',
  ],
};
