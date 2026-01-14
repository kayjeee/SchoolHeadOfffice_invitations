// components/auth/AuthGate.tsx
import React, { useMemo, CSSProperties } from "react";

interface InvitationData {
  token?: string;
  school_name?: string;
  learner_name?: string;
}

interface AuthGateProps {
  invitationData?: InvitationData | null;
  returnTo?: string; // default: "/parent"
}

export default function AuthGate({
  invitationData,
  returnTo = "/parent",
}: AuthGateProps) {
  const hasInvitation = Boolean(invitationData?.token);

  const safeReturnTo = useMemo(() => {
    if (hasInvitation) {
      const separator = returnTo.includes('?') ? '&' : '?';
      return `${returnTo}${separator}token=${invitationData!.token}`;
    }
    return returnTo;
  }, [invitationData, returnTo, hasInvitation]);

  const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(safeReturnTo)}`;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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
                  {invitationData?.school_name || "Far North Secondary School"}
                </span>
              </p>

              {invitationData?.learner_name && (
                <p style={styles.learnerName}>
                  This invitation is for{" "}
                  <span style={styles.learnerHighlight}>
                    {invitationData.learner_name}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p>Log in to access your Parent Portal.</p>
          )}
        </div>

        {/* INVITATION DETAILS - Only shown when hasInvitation is true */}
        {hasInvitation && (
          <div style={styles.invitationDetails}>
            <div style={styles.detailSection}>
              <h3 style={styles.audience}>Parents/Guardians</h3>
              <h4 style={styles.eventTitle}>Induction for Grade 8 2026</h4>

              <div style={styles.detailsList}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Date:</span>
                  <span style={styles.detailValue}>8th January 2026</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Time:</span>
                  <span style={styles.detailValue}>08H00</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Venue:</span>
                  <span style={styles.detailValue}>Far North Secondary School</span>
                </div>
              </div>

              <div style={styles.note}>
                <strong>NB:</strong> Please come with the required documents to further
                the admission process if you have not done so.
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
  }
};