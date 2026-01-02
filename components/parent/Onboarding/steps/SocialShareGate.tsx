// components/parent/Onboarding/steps/SocialShareGate.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaFacebook, 
  FaLinkedin, 
  FaTwitter, 
  FaTiktok,
  FaCheckCircle 
} from 'react-icons/fa';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface SocialShareGateProps {
  onComplete: (data: any) => void;
}

interface SocialPlatform {
  id: keyof SocialShareState;
  name: string;
  icon: React.ComponentType;
  shareUrl: string;
  color: string;
  description: string;
}

interface SocialShareState {
  facebook: boolean;
  linkedin: boolean;
  twitter: boolean;
  tiktok: boolean;
}

export default function SocialShareGate({ onComplete }: SocialShareGateProps) {
  const [socialShares, setSocialShares] = useState<SocialShareState>({
    facebook: false,
    linkedin: false,
    twitter: false,
    tiktok: false,
  });

  const [showTooltip, setShowTooltip] = useState(false);
  const [shareAttempts, setShareAttempts] = useState(0);

  const platforms: SocialPlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FaFacebook,
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://your-platform.com')}&quote=Join me on this amazing educational platform for parents and learners!`,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Share with your Facebook friends'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: FaLinkedin,
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://your-platform.com')}`,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Share with your professional network'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: FaTwitter,
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent('https://your-platform.com')}&text=Check out this amazing educational platform!&hashtags=Education,Learning,Parents`,
      color: 'bg-sky-500 hover:bg-sky-600',
      description: 'Tweet about our platform'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: FaTiktok,
      shareUrl: 'https://www.tiktok.com/upload',
      color: 'bg-gray-900 hover:bg-black',
      description: 'Create a TikTok video about us'
    }
  ];

  const handleShareClick = async (platform: SocialPlatform) => {
    try {
      // Open share window
      window.open(platform.shareUrl, '_blank', 'width=600,height=400');
      
      // Simulate successful share after a delay
      setTimeout(() => {
        setSocialShares(prev => ({
          ...prev,
          [platform.id]: true
        }));
        setShareAttempts(prev => prev + 1);
      }, 2000);
      
    } catch (error) {
      console.error(`Error sharing to ${platform.name}:`, error);
      // Even if there's an error, mark as shared for demo purposes
      setSocialShares(prev => ({
        ...prev,
        [platform.id]: true
      }));
    }
  };

  const allShared = Object.values(socialShares).every(Boolean);
  const completedCount = Object.values(socialShares).filter(Boolean).length;
  const progressPercentage = (completedCount / platforms.length) * 100;

  // Auto-complete after 4 attempts (for demo/testing)
  useEffect(() => {
    if (shareAttempts >= 4 && !allShared) {
      const autoCompleteShares = platforms.reduce((acc, platform) => ({
        ...acc,
        [platform.id]: true
      }), {} as SocialShareState);
      
      setSocialShares(autoCompleteShares);
    }
  }, [shareAttempts, allShared, platforms]);

  const handleContinue = () => {
    console.log('📱 Social shares completed:', socialShares);
    onComplete({
      ...socialShares,
      sharedAt: new Date().toISOString(),
      platformsShared: platforms.filter(p => socialShares[p.id]).map(p => p.name)
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Share Our Platform 🚀</h1>
        <p className="text-gray-600">
          Help us grow by sharing on your social media. All 4 platforms are required for the free plan.
        </p>
        
        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedCount} of {platforms.length} completed
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">Why we ask for this?</p>
            <p className="text-sm text-blue-700">
              Sharing helps us reach more families who could benefit from our platform. 
              The free plan is supported by community growth!
            </p>
          </div>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isShared = socialShares[platform.id];
          
          return (
            <div 
              key={platform.id}
              className={`border rounded-lg p-4 transition-all duration-300 ${
                isShared 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${platform.color} mr-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{platform.name}</h3>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </div>
                </div>
                
                {isShared ? (
                  <FaCheckCircle className="h-6 w-6 text-green-500" />
                ) : null}
              </div>
              
              <button
                onClick={() => handleShareClick(platform)}
                disabled={isShared}
                className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                  isShared
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : `${platform.color} text-white hover:opacity-90`
                }`}
              >
                {isShared ? '✓ Shared Successfully' : `Share on ${platform.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Requirements Info */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Requirements for Free Plan:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center">
            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Share on all 4 social media platforms
          </li>
          <li className="flex items-center">
            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Each share helps us reach new users
          </li>
          <li className="flex items-center">
            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Complete this step to unlock free features
          </li>
        </ul>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={!allShared}
          className={`w-full max-w-md py-3 px-6 rounded-lg font-semibold text-lg transition ${
            allShared 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {allShared ? (
            <span className="flex items-center justify-center">
              Continue to Next Step 
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          ) : (
            `Complete All ${platforms.length - completedCount} Remaining Shares`
          )}
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Having trouble sharing? <button 
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Get help
          </button>
        </p>
        
        {showTooltip && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <p className="font-medium mb-1">Troubleshooting tips:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Make sure pop-ups are enabled in your browser</li>
              <li>You can manually share the link: https://your-platform.com</li>
              <li>For TikTok, create a video mentioning our platform</li>
              <li>Contact support if you continue having issues</li>
            </ul>
          </div>
        )}

        {/* Demo Mode Note */}
        <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-700">
            <span className="font-semibold">Demo Mode:</span> Click each platform 4 times to auto-complete all shares.
            Current attempts: <span className="font-bold">{shareAttempts}</span>/4
          </p>
        </div>
      </div>
    </div>
  );
}