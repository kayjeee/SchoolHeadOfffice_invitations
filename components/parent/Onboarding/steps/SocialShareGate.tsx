// components/parent/Onboarding/steps/SocialShareGate.tsx
import React, { useState } from 'react';
import { 
  FaFacebook, 
  FaLinkedin, 
  FaTwitter, 
  FaWhatsapp,
  FaCheckCircle,
  FaShareAlt,
  FaHeart
} from 'react-icons/fa';
import { 
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface SocialShareGateProps {
  onComplete: (data: {
    facebook: boolean;
    linkedin: boolean;
    twitter: boolean;
    whatsapp: boolean;
    shareCount: number;
    completionTime: string;
    skipped: boolean;
  }) => void;
  tier?: 'standard' | 'basic';
}

interface SocialPlatform {
  id: keyof SocialShareState;
  name: string;
  icon: React.ComponentType;
  color: string;
  shareUrl: string;
  description: string;
  order: number;
}

interface SocialShareState {
  facebook: boolean;
  linkedin: boolean;
  twitter: boolean;
  whatsapp: boolean;
}

export default function SocialShareGate({ 
  onComplete, 
  tier = 'standard'
}: SocialShareGateProps) {
  const [socialShares, setSocialShares] = useState<SocialShareState>({
    facebook: false,
    linkedin: false,
    twitter: false,
    whatsapp: false,
  });

  const [shareStartTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Platform configuration
  const platforms: SocialPlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://learnconnect.education')}&quote=Amazing educational platform for parents and learners! Join me! 🎓`,
      description: 'Share with your Facebook friends',
      order: 1
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-500 hover:bg-blue-600',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://learnconnect.education')}`,
      description: 'Share with your professional network',
      order: 2
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent('https://learnconnect.education')}&text=Check+out+this+amazing+educational+platform!`,
      description: 'Tweet about our platform',
      order: 3
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      shareUrl: `https://wa.me/?text=${encodeURIComponent('Check out this educational platform: https://learnconnect.education')}`,
      description: 'Share with WhatsApp contacts',
      order: 4
    }
  ];

  const completedCount = Object.values(socialShares).filter(Boolean).length;
  const progressPercentage = (completedCount / platforms.length) * 100;

  const handleShare = (platform: SocialPlatform) => {
    console.log(`📤 Sharing on ${platform.name}...`);
    
    // Open share window
    const shareWindow = window.open(
      platform.shareUrl, 
      '_blank', 
      'width=600,height=400'
    );
    
    // Mark as shared immediately (optimistic update)
    setTimeout(() => {
      if (shareWindow) {
        shareWindow.close();
      }
      
      setSocialShares(prev => ({
        ...prev,
        [platform.id]: true
      }));
      
      console.log(`✅ Marked ${platform.name} as shared`);
    }, 2000);
  };

  const handleComplete = async (skipped: boolean = false) => {
    console.log('📱 Completing social sharing...', { skipped, completedCount });
    
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const shareData = {
        ...socialShares,
        shareCount: completedCount,
        completionTime: new Date().toISOString(),
        skipped
      };

      console.log('✅ Share data:', shareData);
      onComplete(shareData);
      
    } catch (error) {
      console.error('❌ Error completing social sharing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ User chose to skip social sharing');
    handleComplete(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FaShareAlt className="text-3xl text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Share & Help Us Grow 🚀
        </h1>
        <p className="text-gray-600 text-lg">
          Share our platform and help other parents discover us (Optional)
        </p>
        
        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-gray-700">
              <span className="font-bold text-blue-600">{completedCount}</span> of{' '}
              <span className="font-bold">{platforms.length}</span> platforms shared
            </div>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Why Sharing Banner */}
      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
        <div className="flex items-start">
          <SparklesIcon className="h-6 w-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2 text-lg">
              Why We Ask For Sharing (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
              <div className="flex items-center">
                <FaHeart className="h-4 w-4 text-pink-500 mr-2" />
                <span>Help us grow organically</span>
              </div>
              <div className="flex items-center">
                <FaShareAlt className="h-4 w-4 text-green-500 mr-2" />
                <span>Connect with other parents</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🎓</span>
                <span>Build a supportive community</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🤝</span>
                <span>No obligation - completely optional!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Share on Your Favorite Platforms
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms
            .sort((a, b) => a.order - b.order)
            .map((platform) => {
              const Icon = platform.icon;
              const isShared = socialShares[platform.id];
              
              return (
                <div 
                  key={platform.id}
                  className={`border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
                    isShared
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${platform.color} mr-3`}>
                        <Icon className="text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {platform.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                      </div>
                    </div>
                    
                    {isShared && (
                      <FaCheckCircle className="text-2xl text-green-600" />
                    )}
                  </div>
                  
                  <button
                    onClick={() => !isShared && handleShare(platform)}
                    disabled={isShared}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all ${
                      isShared
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : `${platform.color.split(' ')[0]} text-white`
                    }`}
                  >
                    {isShared ? (
                      <span className="flex items-center justify-center">
                        <FaCheckCircle className="mr-2" />
                        Shared Successfully
                      </span>
                    ) : (
                      `Share on ${platform.name}`
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-8 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-semibold text-green-900 mb-3 text-lg flex items-center">
          <span className="mr-2">🎁</span>
          Your Standard Plan is Already Active!
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            Full access to standard features
          </div>
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            View child's academic progress
          </div>
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            Receive school notifications
          </div>
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            Parent-teacher messaging
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleComplete(false)}
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              {completedCount > 0 ? 'Continue with Sharing' : 'Continue to Next Step'}
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </span>
          )}
        </button>

        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="w-full py-3 px-6 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          Skip Sharing for Now
        </button>

        <p className="text-center text-sm text-gray-500">
          You can always share later from your dashboard
        </p>
      </div>
    </div>
  );
}