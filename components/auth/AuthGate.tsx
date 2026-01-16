import React, { useMemo, CSSProperties } from "react";

interface InvitationData {
  token?: string;
  school_name?: string;
  learner_name?: string;
}

interface AuthGateProps {
  invitationData?: InvitationData | null;
  returnTo?: string;
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
        {/* GREETING */}
        <h1 style={styles.title}>Good Day Parents</h1>

        {/* MAIN MESSAGE */}
        <div style={styles.messageBox}>
          <p style={styles.requestText}>
            Parents are requested to come and collect the following items{" "}
            <strong style={styles.highlight}>Tomorrow 17th January</strong>
          </p>

          {/* ITEMS LIST */}
          <div style={styles.itemsList}>
            <div style={styles.item}>1. Pants</div>
            <div style={styles.item}>2. Shirts</div>
            <div style={styles.item}>3. Skirts</div>
          </div>

          {/* TIME */}
          <div style={styles.timeSection}>
            <span style={styles.timeLabel}>Time:</span>
            <span style={styles.timeValue}>08h00 - 12h00</span>
          </div>

          {/* IMPORTANT NOTE */}
          <div style={styles.note}>
            <strong>NB:</strong> BRING UNIFORM LIST AND POP to clear payment
          </div>
        </div>

        {/* SIGNATURE */}
        <div style={styles.signature}>
          <p style={styles.regards}>Kind regards</p>
          <p style={styles.name}>Mr Maropeng PS</p>
        </div>

        {/* CTA BUTTON */}
        <a href={loginUrl} style={styles.button}>
          {hasInvitation ? "Accept & Continue" : "Log In"}
        </a>

        {hasInvitation && (
          <p style={styles.footerNote}>
            You will be asked to log in or create an account.
          </p>
        )}
      </div>
    </div>
  );
}

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
    maxWidth: '500px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '40px',
    border: '1px solid #f3f4f6'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  messageBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
    textAlign: 'left' as const
  },
  requestText: {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '20px',
    lineHeight: 1.6
  },
  highlight: {
    color: '#2563eb',
    fontWeight: 700
  },
  itemsList: {
    marginBottom: '20px',
    paddingLeft: '8px'
  },
  item: {
    fontSize: '16px',
    color: '#111827',
    marginBottom: '8px',
    fontWeight: 500
  },
  timeSection: {
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  timeLabel: {
    fontWeight: 600,
    color: '#4b5563',
    marginRight: '8px'
  },
  timeValue: {
    color: '#111827',
    fontWeight: 600,
    fontSize: '16px'
  },
  note: {
    backgroundColor: '#fef3c7',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#78350f',
    borderLeft: '4px solid #f59e0b',
    lineHeight: 1.6
  },
  signature: {
    textAlign: 'left' as const,
    marginBottom: '24px',
    paddingLeft: '8px'
  },
  regards: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '4px'
  },
  name: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827'
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
    marginTop: '16px',
    textAlign: 'center' as const
  }
};