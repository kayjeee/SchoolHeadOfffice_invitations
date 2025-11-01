// lib/utils/error-handler.ts
import * as Sentry from '@sentry/nextjs';

export function trackError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error, context);

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context });
  }
}
