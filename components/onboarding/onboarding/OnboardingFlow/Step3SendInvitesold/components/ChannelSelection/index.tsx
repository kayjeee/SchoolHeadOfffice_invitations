import React, { useState, useEffect } from 'react';
import { Icon } from '../UI/Icon';
import { InviteChannel } from '../../types';

interface ChannelSelectionProps {
  selectedChannel: InviteChannel | null;
  onSelectChannel: (channel: InviteChannel) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  school: {
    id: string;
    name: string;
  };
}

// Services/inviteService.ts
const inviteService = {
  async generateSchoolPrCode(schoolId: string, schoolName: string, purpose: string = "enrollment") {
    console.log('📡 Making API call to generate PR code for school:', schoolId, schoolName);
    
    const response = await fetch(`http://localhost:4000/api/v1/schools/${schoolId}/pr_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pr_code: {
          purpose: purpose,
          metadata: {
            school_name: schoolName,
            academic_year: "2024",
            generated_at: new Date().toISOString(),
            scope: "school_wide"
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Failed to generate PR code: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Success Response:', data);
    return data.pr_code;
  }
};

const AVAILABLE_CHANNELS: InviteChannel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Send invites via email with customizable message',
    icon: 'mail',
    features: ['Customizable message', 'Automatic reminders', 'Delivery tracking'],
    recommended: true
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Send invites via text message',
    icon: 'message-square',
    features: ['Instant delivery', 'High open rates', 'Character limit applies'],
    recommended: false
  },
  {
    id: 'app-notification',
    name: 'App Notification',
    description: 'Send push notifications through the mobile app',
    icon: 'smartphone',
    features: ['Real-time delivery', 'Rich media support', 'Requires app installation'],
    recommended: false
  },
  {
    id: 'portal-message',
    name: 'Portal Message',
    description: 'Send message through the learning portal',
    icon: 'monitor',
    features: ['Rich formatting', 'File attachments', 'Read receipts'],
    recommended: false
  }
];

export const ChannelSelection: React.FC<ChannelSelectionProps> = ({
  selectedChannel,
  onSelectChannel,
  onNext,
  onPrevious,
  canProceed,
  school
}) => {
  const [isGeneratingPrCode, setIsGeneratingPrCode] = useState(false);
  const [prCode, setPrCode] = useState<string | null>(null);
  const [prCodeError, setPrCodeError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);

  // Auto-generate PR code when component mounts
  useEffect(() => {
    console.log('🔄 ChannelSelection component mounted');
    console.log('🏫 School prop:', school);

    const generateSchoolPrCode = async () => {
      if (!school?.id || !school?.name) {
        console.error('❌ Missing school information:', school);
        setPrCodeError('School information is required');
        setHasAttemptedGeneration(true);
        return;
      }

      // Prevent duplicate calls
      if (hasAttemptedGeneration) {
        console.log('⏩ Skipping duplicate PR code generation');
        return;
      }

      setIsGeneratingPrCode(true);
      setPrCodeError(null);
      setHasAttemptedGeneration(true);

      try {
        console.log(`🚀 Generating PR code for school: ${school.name} (${school.id})`);
        
        const prCodeData = await inviteService.generateSchoolPrCode(
          school.id, 
          school.name, 
          "enrollment"
        );
        
        // Adjust based on your actual API response structure
        const generatedPrCode = prCodeData.code || prCodeData.data?.code || prCodeData;
        const generatedInviteLink = `https://www.schoolheadoffice.com/school/${school.id}/enroll?prcode=${generatedPrCode}`;
        
        setPrCode(generatedPrCode);
        setInviteLink(generatedInviteLink);
        
        console.log(`✅ PR code generated successfully: ${generatedPrCode}`);
        console.log(`🔗 Invite link: ${generatedInviteLink}`);
        
      } catch (error) {
        console.error('❌ Failed to generate PR code:', error);
        setPrCodeError(error instanceof Error ? error.message : 'Failed to generate invitation code. Please try again.');
      } finally {
        setIsGeneratingPrCode(false);
      }
    };

    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      generateSchoolPrCode();
    }, 100);

    return () => clearTimeout(timer);
  }, [school.id, school.name]); // Remove hasAttemptedGeneration from dependencies

  const handleRetry = async () => {
    if (!school?.id || !school?.name) {
      setPrCodeError('School information is required');
      return;
    }

    setIsGeneratingPrCode(true);
    setPrCodeError(null);

    try {
      console.log(`🔄 Retrying PR code generation for school: ${school.name}`);
      
      const prCodeData = await inviteService.generateSchoolPrCode(
        school.id, 
        school.name, 
        "enrollment"
      );
      
      const generatedPrCode = prCodeData.code || prCodeData.data?.code || prCodeData;
      const generatedInviteLink = `https://www.schoolheadoffice.com/school/${school.id}/enroll?prcode=${generatedPrCode}`;
      
      setPrCode(generatedPrCode);
      setInviteLink(generatedInviteLink);
      
      console.log(`✅ PR code generated successfully on retry: ${generatedPrCode}`);
      
    } catch (error) {
      console.error('❌ Failed to generate PR code on retry:', error);
      setPrCodeError(error instanceof Error ? error.message : 'Failed to generate invitation code. Please try again.');
    } finally {
      setIsGeneratingPrCode(false);
    }
  };

  const handleNext = () => {
    // Ensure PR code is generated before proceeding
    if (prCode) {
      onNext();
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('📊 Current state:', {
      isGeneratingPrCode,
      prCode,
      prCodeError,
      inviteLink,
      hasAttemptedGeneration,
      school
    });
  }, [isGeneratingPrCode, prCode, prCodeError, inviteLink, hasAttemptedGeneration, school]);

  return (
    <div className="channel-selection">
      <div className="selection-header">
        <h3>Choose Invitation Channel</h3>
        <p>Select how you want to send invitations to learners</p>
      </div>

      {/* Debug Info - Remove in production */}
      <div style={{ padding: '10px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '20px', fontSize: '12px' }}>
        <strong>Debug Info:</strong> 
        School: {school?.name} (ID: {school?.id}) | 
        PR Code: {prCode ? 'Generated' : 'Not Generated'} | 
        Loading: {isGeneratingPrCode ? 'Yes' : 'No'} | 
        Error: {prCodeError || 'None'}
      </div>

      {/* PR Code Generation Status */}
      <div className="pr-code-status">
        <div className={`status-card ${prCode ? 'success' : prCodeError ? 'error' : 'loading'}`}>
          <div className="status-header">
            <Icon 
              name={prCode ? 'check-circle' : prCodeError ? 'alert-circle' : 'loader'} 
              className={`status-icon ${isGeneratingPrCode ? 'spinning' : ''}`}
            />
            <h4>School Invitation Setup</h4>
          </div>
          
          <div className="status-content">
            {isGeneratingPrCode && (
              <p>Generating school-wide invitation code for <strong>{school.name}</strong>...</p>
            )}
            
            {prCode && (
              <div className="success-content">
                <p>✅ School invitation code generated successfully!</p>
                <div className="code-display">
                  <label>PR Code:</label>
                  <code className="pr-code">{prCode}</code>
                </div>
                <div className="link-display">
                  <label>Invitation Link:</label>
                  <a 
                    href={inviteLink!} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="invite-link"
                  >
                    {inviteLink}
                  </a>
                </div>
                <p className="info-text">
                  This code and link will be used for all invitations sent through selected channels.
                </p>
              </div>
            )}
            
            {prCodeError && (
              <div className="error-content">
                <p>❌ {prCodeError}</p>
                <button 
                  onClick={handleRetry}
                  className="btn btn-secondary btn-sm"
                  disabled={isGeneratingPrCode}
                >
                  {isGeneratingPrCode ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            )}

            {!isGeneratingPrCode && !prCode && !prCodeError && (
              <p>Preparing to generate invitation code...</p>
            )}
          </div>
        </div>
      </div>

      <div className="channels-grid">
        {AVAILABLE_CHANNELS.map(channel => (
          <div
            key={channel.id}
            className={`channel-card ${selectedChannel?.id === channel.id ? 'selected' : ''} ${
              !prCode ? 'disabled' : ''
            }`}
            onClick={() => prCode && onSelectChannel(channel)}
            role="button"
            tabIndex={prCode ? 0 : -1}
            onKeyDown={(e) => {
              if (prCode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelectChannel(channel);
              }
            }}
          >
            {channel.recommended && (
              <div className="recommended-badge">
                <Icon name="star" />
                Recommended
              </div>
            )}

            <div className="channel-header">
              <div className="channel-icon">
                <Icon name={channel.icon} />
              </div>
              <div className="channel-info">
                <h4>{channel.name}</h4>
                <p>{channel.description}</p>
              </div>
              <div className="selection-indicator">
                {selectedChannel?.id === channel.id ? (
                  <Icon name="check-circle" className="selected-icon" />
                ) : (
                  <Icon name="circle" className="unselected-icon" />
                )}
              </div>
            </div>

            <div className="channel-features">
              <h5>Features:</h5>
              <ul>
                {channel.features.map((feature, index) => (
                  <li key={index}>
                    <Icon name="check" className="feature-icon" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {!prCode && (
              <div className="disabled-overlay">
                <Icon name="lock" />
                <span>Awaiting invitation code...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="btn btn-primary"
          disabled={!canProceed || !prCode || !selectedChannel || isGeneratingPrCode}
        >
          {isGeneratingPrCode ? (
            <>
              <Icon name="loader" className="spinning" />
              Generating Code...
            </>
          ) : (
            'Next: Compose Message'
          )}
        </button>
      </div>

      <style jsx>{`
        .channel-selection {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .selection-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .selection-header h3 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1f2937;
        }

        .selection-header p {
          color: #6b7280;
          font-size: 16px;
        }

        .pr-code-status {
          margin-bottom: 30px;
        }

        .status-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: white;
        }

        .status-card.success {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .status-card.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .status-card.loading {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .status-header h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #1f2937;
        }

        .status-icon {
          width: 24px;
          height: 24px;
        }

        .status-icon.spinning {
          animation: spin 1s linear infinite;
        }

        .success-content,
        .error-content {
          space-y-3: 12px;
        }

        .code-display,
        .link-display {
          margin: 12px 0;
        }

        .code-display label,
        .link-display label {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
          color: #374151;
        }

        .pr-code {
          background: #1f2937;
          color: #f9fafb;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
          display: block;
          word-break: break-all;
        }

        .invite-link {
          color: #3b82f6;
          text-decoration: none;
          word-break: break-all;
          display: block;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }

        .invite-link:hover {
          text-decoration: underline;
        }

        .info-text {
          font-size: 14px;
          color: #6b7280;
          margin-top: 12px;
        }

        .channels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .channel-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          position: relative;
          overflow: hidden;
        }

        .channel-card:hover:not(.disabled) {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .channel-card.selected {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .channel-card.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .recommended-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #f59e0b;
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .channel-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .channel-icon {
          width: 48px;
          height: 48px;
          background: #3b82f6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .channel-info {
          flex: 1;
        }

        .channel-info h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #1f2937;
        }

        .channel-info p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }

        .selection-indicator {
          flex-shrink: 0;
        }

        .selected-icon {
          color: #10b981;
        }

        .unselected-icon {
          color: #d1d5db;
        }

        .channel-features h5 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #374151;
        }

        .channel-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
          space-y-2: 8px;
        }

        .channel-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .feature-icon {
          width: 16px;
          height: 16px;
          color: #10b981;
          flex-shrink: 0;
        }

        .disabled-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6b7280;
          font-weight: 500;
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 14px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChannelSelection;