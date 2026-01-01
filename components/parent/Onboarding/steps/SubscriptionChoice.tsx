// components/parent/Onboarding/steps/SubscriptionChoice.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface SubscriptionChoiceProps {
  onComplete: (data: {
    tier: 'standard' | 'premium';
    selectedFeatures?: string[];
    billingCycle?: 'monthly' | 'annual';
  }) => void;
  initialSelection?: 'standard' | 'premium';
  userTierInfo?: any;
}

interface Feature {
  name: string;
  included: boolean;
  description?: string;
}

interface TierInfo {
  name: string;
  price: number;
  currency: string;
  features: Feature[];
  recommended?: boolean;
  badge?: string;
}

const TIERS: Record<'standard' | 'premium', TierInfo> = {
  standard: {
    name: 'Standard',
    price: 0,
    currency: 'ZAR',
    badge: 'Free Forever',
    features: [
      { name: 'View child\'s academic progress', included: true },
      { name: 'Receive school notifications', included: true },
      { name: 'Basic attendance tracking', included: true },
      { name: 'Parent-teacher messaging', included: true },
      { name: 'View assignment due dates', included: true },
      { name: 'Monthly progress reports', included: false, description: 'Premium only' },
      { name: 'Real-time grade updates', included: false, description: 'Premium only' },
      { name: 'Advanced analytics', included: false, description: 'Premium only' },
      { name: 'Priority support', included: false, description: 'Premium only' },
      { name: 'Custom alerts & reminders', included: false, description: 'Premium only' },
    ],
  },
  premium: {
    name: 'Premium',
    price: 99,
    currency: 'ZAR',
    badge: 'Most Popular',
    recommended: true,
    features: [
      { name: 'Everything in Standard', included: true },
      { name: 'Monthly progress reports', included: true },
      { name: 'Real-time grade updates', included: true },
      { name: 'Advanced analytics & insights', included: true },
      { name: 'Priority support (24/7)', included: true },
      { name: 'Custom alerts & reminders', included: true },
      { name: 'Detailed subject breakdowns', included: true },
      { name: 'Behavioral tracking', included: true },
      { name: 'Direct teacher scheduling', included: true },
      { name: 'Export reports to PDF', included: true },
    ],
  },
};

export default function SubscriptionChoice({
  onComplete,
  initialSelection,
  userTierInfo,
}: SubscriptionChoiceProps) {
  console.log('');
  console.log('💳 ═══════════════════════════════════════');
  console.log('💳 SubscriptionChoice Component Rendered');
  console.log('💳 ═══════════════════════════════════════');
  console.log('📦 Props:', { initialSelection, hasUserTierInfo: !!userTierInfo });

  const [selectedTier, setSelectedTier] = useState<'standard' | 'premium'>(
    initialSelection || 'standard'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from session storage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('sho_subscription_choice');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📥 Loaded subscription choice from sessionStorage:', parsed);
        setSelectedTier(parsed.tier || 'standard');
        setBillingCycle(parsed.billingCycle || 'monthly');
      }
    } catch (err) {
      console.warn('Could not load subscription from sessionStorage:', err);
    }
  }, []);

  // Save to session storage when changed
  useEffect(() => {
    try {
      const data = { tier: selectedTier, billingCycle };
      sessionStorage.setItem('sho_subscription_choice', JSON.stringify(data));
      console.log('💾 Saved subscription choice to sessionStorage:', data);
    } catch (err) {
      console.warn('Could not save subscription to sessionStorage:', err);
    }
  }, [selectedTier, billingCycle]);

  // Track analytics
  useEffect(() => {
    console.log('📊 Subscription analytics:', {
      selectedTier,
      billingCycle,
      annualSavings: billingCycle === 'annual' ? TIERS.premium.price * 12 * 0.15 : 0,
    });
  }, [selectedTier, billingCycle]);

  const handleSubmit = async () => {
    console.log('');
    console.log('💳 ═══════════════════════════════════════');
    console.log('💳 SUBSCRIPTION CHOICE SUBMITTED');
    console.log('💳 ═══════════════════════════════════════');
    console.log('📦 Selection:', { selectedTier, billingCycle });

    setIsSubmitting(true);

    try {
      // Get selected features
      const selectedFeatures = TIERS[selectedTier].features
        .filter((f) => f.included)
        .map((f) => f.name);

      const data = {
        tier: selectedTier,
        selectedFeatures,
        billingCycle,
      };

      console.log('✅ Calling onComplete with data:', data);
      onComplete(data);
      console.log('💳 ═══════════════════════════════════════');
      console.log('');
    } catch (error) {
      console.error('❌ Error submitting subscription choice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPremiumPrice = () => {
    const basePrice = TIERS.premium.price;
    if (billingCycle === 'annual') {
      const annualPrice = basePrice * 12;
      const discount = annualPrice * 0.15; // 15% discount
      return {
        monthly: Math.round((annualPrice - discount) / 12),
        annual: Math.round(annualPrice - discount),
        savings: Math.round(discount),
      };
    }
    return {
      monthly: basePrice,
      annual: basePrice * 12,
      savings: 0,
    };
  };

  const premiumPrice = getPremiumPrice();

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that works best for your family
        </p>
      </div>

      {/* Billing Cycle Toggle (Only visible when Premium might be selected) */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => {
              console.log('🔄 Billing cycle changed to: monthly');
              setBillingCycle('monthly');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => {
              console.log('🔄 Billing cycle changed to: annual');
              setBillingCycle('annual');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            {premiumPrice.savings > 0 && (
              <span className="ml-2 text-green-600 font-semibold">
                Save R{premiumPrice.savings}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tier Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Standard Tier */}
        <div
          onClick={() => {
            console.log('🔘 Standard tier selected');
            setSelectedTier('standard');
          }}
          className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-xl ${
            selectedTier === 'standard'
              ? 'border-green-500 bg-green-50 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {TIERS.standard.badge && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {TIERS.standard.badge}
              </span>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {TIERS.standard.name}
            </h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900">
                R{TIERS.standard.price}
              </span>
              <span className="ml-2 text-gray-500">/month</span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {TIERS.standard.features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                {feature.included ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-gray-300 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    feature.included ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {feature.name}
                  {feature.description && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {feature.description}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {selectedTier === 'standard' && (
            <div className="flex items-center justify-center text-green-600 font-semibold">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Selected
            </div>
          )}
        </div>

        {/* Premium Tier */}
        <div
          onClick={() => {
            console.log('🔘 Premium tier selected');
            setSelectedTier('premium');
          }}
          className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-xl ${
            selectedTier === 'premium'
              ? 'border-purple-500 bg-purple-50 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {TIERS.premium.recommended && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full flex items-center shadow-lg">
                <SparklesIcon className="w-4 h-4 mr-1" />
                {TIERS.premium.badge}
              </span>
            </div>
          )}

          <div className="mb-4 mt-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {TIERS.premium.name}
            </h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900">
                R{premiumPrice.monthly}
              </span>
              <span className="ml-2 text-gray-500">/month</span>
            </div>
            {billingCycle === 'annual' && (
              <p className="text-sm text-gray-500 mt-1">
                R{premiumPrice.annual}/year • Save R{premiumPrice.savings}
              </p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {TIERS.premium.features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature.name}</span>
              </li>
            ))}
          </ul>

          {selectedTier === 'premium' && (
            <div className="flex items-center justify-center text-purple-600 font-semibold">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Selected
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Notice for Existing Users */}
      {userTierInfo && userTierInfo.currentTier === 'standard' && selectedTier === 'premium' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Upgrading to Premium:</strong> You'll be charged R
            {premiumPrice.monthly}/month starting from your next billing cycle.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Continue with {TIERS[selectedTier].name}
              {selectedTier === 'premium' && ' →'}
            </>
          )}
        </button>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div className="font-semibold text-yellow-800 mb-1">Debug Info:</div>
          <div className="text-yellow-700 space-y-1">
            <div>Selected Tier: <span className="font-mono">{selectedTier}</span></div>
            <div>Billing Cycle: <span className="font-mono">{billingCycle}</span></div>
            <div>
              Price: <span className="font-mono">R{premiumPrice.monthly}/month</span>
            </div>
            {billingCycle === 'annual' && (
              <div>
                Annual Savings: <span className="font-mono">R{premiumPrice.savings}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}