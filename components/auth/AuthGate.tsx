// components/auth/AuthGate.tsx
import React, { useMemo, CSSProperties } from "react";
import Head from "next/head";

interface InvitationData {
  token?: string;
  school_name?: string;
  school?: string; // Fallback field
  grade_name?: string;
  learner_name?: string;
  school_logo?: string | null;
}

interface AuthGateProps {
  invitationData?: InvitationData | null;
  returnTo?: string; // default: "/parent"
}

export default function AuthGate({
  invitationData,
  returnTo = "/parent",
}: AuthGateProps) {
  console.log('🚪 [AuthGate] Rendering with props:', {
    returnTo,
    invitationData: invitationData ? {
      ...invitationData,
      token: invitationData.token ? `${invitationData.token.substring(0, 8)}...` : 'MISSING'
    } : 'NULL'
  });

  const hasInvitation = Boolean(invitationData?.token || invitationData?.school_name || invitationData?.school);

  // Aggressive fallback for school name
  const schoolName = invitationData?.school_name ||
                     invitationData?.school ||
                     "School Head Office";

  console.log('🚪 [AuthGate] hasInvitation:', hasInvitation);
  console.log('🚪 [AuthGate] resolved schoolName:', schoolName);

  const schoolLogo = useMemo(() => {
    const logo = invitationData?.school_logo;
    if (!logo || typeof logo !== "string" || !logo.trim()) {
      console.log('🚪 [AuthGate] No valid school logo found.');
      return null;
    }
    console.log('🚪 [AuthGate] Using school logo:', logo);
    return logo;
  }, [invitationData?.school_logo]);

  const safeReturnTo = useMemo(() => {
    console.log('🚪 [AuthGate] Calculating safeReturnTo. Base:', returnTo);
    if (hasInvitation && invitationData?.token) {
      const separator = returnTo.includes('?') ? '&' : '?';
      const finalReturn = `${returnTo}${separator}token=${invitationData.token}`;
      console.log('🚪 [AuthGate] safeReturnTo with token:', finalReturn);
      return finalReturn;
    }
    console.log('🚪 [AuthGate] safeReturnTo (no token):', returnTo);
    return returnTo;
  }, [invitationData, returnTo, hasInvitation]);

  const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(safeReturnTo)}`;
  console.log('🚪 [AuthGate] Final loginUrl:', loginUrl);

  return (
    <div style={styles.container}>
      <Head>
        <title>{`${schoolName} - Parent Portal`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div style={styles.card}>
        {/* SCHOOL LOGO — inside card, above title */}
        {schoolLogo && (
          <div style={styles.logoContainer}>
            <img
              src={schoolLogo}
              alt={`${schoolName} logo`}
              style={styles.schoolLogo}
              onError={(e) => {
                console.error('❌ [AuthGate] Logo failed to load:', schoolLogo);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* TITLE */}
        <h1 style={styles.title}>
          {hasInvitation ? "Welcome! You've Been Invited" : "Welcome"}
        </h1>

        {/* SUBTITLE */}
        <div style={styles.subtitle}>
          {hasInvitation ? (
            <div>
              <p style={styles.invitationText}>
                You've been invited to join <br />
                <span style={styles.schoolName}>
                  {schoolName}
                </span>
              </p>

              {(invitationData?.learner_name || invitationData?.grade_name) && (
                <p style={styles.learnerName}>
                  This invitation is for{" "}
                  {invitationData.learner_name && (
                    <span style={styles.learnerHighlight}>
                      {invitationData.learner_name}
                    </span>
                  )}
                  {invitationData.learner_name && invitationData.grade_name && " in "}
                  {invitationData.grade_name && (
                    <span style={styles.learnerHighlight}>
                      {invitationData.grade_name}
                    </span>
                  )}
                </p>
              )}
            </div>
          ) : (
            <p>Log in to access your Parent Portal.</p>
          )}
        </div>

        {/* INVITATION DETAILS - Only shown when we have a valid token or verified data */}
        {hasInvitation && invitationData?.token && (
          <div style={styles.invitationDetails}>
            <div style={styles.detailSection}>
              <h3 style={styles.audience}>Parents/Guardians</h3>
              <h4 style={styles.eventTitle}>Parent Portal Access</h4>

              <div style={styles.detailsList}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Status:</span>
                  <span style={styles.detailValue}>Invitation Active</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Access:</span>
                  <span style={styles.detailValue}>School Notices & Progress</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>School:</span>
                  <span style={styles.detailValue}>{schoolName}</span>
                </div>
              </div>

              <div style={styles.note}>
                <strong>NB:</strong> Please use the same email address that received
                the invitation to ensure your profile is linked correctly.
              </div>
            </div>
          </div>
        )}

        {/* CTA BUTTON */}
        <a
          href={loginUrl}
          style={styles.button}
        >
          {hasInvitation ? "Accept & Continue" : "Log In"}
        </a>

        {/* Footer note */}
        {hasInvitation && (
          <p style={styles.footerNote}>
            You will be asked to log in or create an account.
          </p>
        )}

        {/* DEMO / NESTED ROUTE LINK */}
        <div style={styles.demoSection}>
          <p style={styles.demoLabel}>Test Nested Route:</p>
          <a
            href="/parent/far%20noth%20secondary%20school"
            style={styles.demoLink}
          >
            Far North Secondary School
          </a>
        </div>
      </div>
    </div>
  );
}

// Inline styles with proper TypeScript types
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  card: {
    width: '100%',
    maxWidth: '448px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '32px',
    textAlign: 'center' as const,
    border: '1px solid #f3f4f6'
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  schoolLogo: {
    width: "80px",
    height: "80px",
    objectFit: "contain" as const,
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "6px",
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '12px'
  },
  subtitle: {
    color: '#4b5563',
    marginBottom: '24px',
    lineHeight: 1.75
  },
  invitationText: {
    marginBottom: '12px'
  },
  schoolName: {
    fontWeight: 600,
    color: '#111827',
    fontSize: '18px',
    marginTop: '8px',
    display: 'inline-block'
  },
  learnerName: {
    marginTop: '8px',
    fontSize: '16px'
  },
  learnerHighlight: {
    fontWeight: 600,
    color: '#111827'
  },
  invitationDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
    textAlign: 'left' as const
  },
  detailSection: {
    width: '100%'
  },
  audience: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '8px'
  },
  eventTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '20px'
  },
  detailsList: {
    marginBottom: '20px'
  },
  detailItem: {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'flex-start'
  },
  detailLabel: {
    fontWeight: 600,
    color: '#4b5563',
    width: '70px',
    flexShrink: 0
  },
  detailValue: {
    color: '#111827',
    flex: 1
  },
  note: {
    backgroundColor: '#fef3c7',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#78350f',
    borderLeft: '4px solid #f59e0b'
  },
  button: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '8px',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out'
  },
  footerNote: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '16px'
  },
  demoSection: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
    textAlign: 'center' as const
  },
  demoLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '4px'
  },
  demoLink: {
    fontSize: '13px',
    color: '#2563eb',
    textDecoration: 'underline'
  }
};
