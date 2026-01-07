// components/parent/Onboarding/steps/PaymentSetup.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface PaymentSetupProps {
  onComplete: (data: any) => void;
  selectedTier: 'premium' | 'standard';
  billingCycle?: 'monthly' | 'annual';
  billingAmount: number;
  currency?: string;
  user?: any;
}

const premiumPaymentSchema = z.object({
  paymentMethod: z.enum(['payfast']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
});

type PremiumFormData = z.infer<typeof premiumPaymentSchema>;

export default function PaymentSetup({
  onComplete,
  selectedTier,
  billingCycle = 'monthly',
  billingAmount,
  currency = 'ZAR',
  user,
}: PaymentSetupProps) {
  console.log('💰 PaymentSetup rendered:', {
    selectedTier,
    billingCycle,
    billingAmount,
    currency,
    hasUser: !!user
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PremiumFormData>({
    resolver: zodResolver(premiumPaymentSchema),
    mode: 'onChange',
    defaultValues: {
      paymentMethod: 'payfast',
      agreeToTerms: false,
    }
  });

  const handlePayFastPayment = handleSubmit(async (data: PremiumFormData) => {
    console.log('💳 Initiating PayFast payment...');
    
    if (!user?.sub && !user?.email) {
      setSubmitError('User information required. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare payment data
      const paymentData = {
        amount: billingAmount,
        item_name: `${selectedTier.toUpperCase()} Plan - ${billingCycle}`,
        user_id: user?.sub || user?.email,
        billing_cycle: billingCycle,
        tier: selectedTier
      };

      console.log('📤 Sending payment request:', paymentData);

      // Call your Next.js API endpoint
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment');
      }

      console.log('✅ Payment URL received:', result.paymentUrl);

      // Store payment info for when user returns
      if (user?.sub) {
        localStorage.setItem('pending_payment', JSON.stringify({
          user_id: user.sub,
          tier: selectedTier,
          billing_cycle: billingCycle,
          amount: billingAmount,
          timestamp: new Date().toISOString()
        }));
      }

      // Redirect to PayFast
      if (result.paymentUrl) {
        console.log('🔀 Redirecting to PayFast...');
        window.location.href = result.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setSubmitError(error.message || 'Failed to initialize payment. Please try again.');
      setIsSubmitting(false);
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Your Payment
        </h2>
        <p className="text-gray-600">
          You'll be redirected to PayFast to securely complete your payment
        </p>
        <div className="mt-4 inline-block rounded-lg px-6 py-3 border bg-green-50 border-green-200">
          <p className="text-lg font-semibold text-gray-900">
            {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan
          </p>
          <p className="text-2xl font-bold mt-1 text-green-900">
            {currency} {billingAmount.toFixed(2)}
            <span className="text-sm font-normal text-gray-600">
              /{billingCycle === 'monthly' ? 'month' : 'year'}
            </span>
          </p>
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex justify-center items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <LockClosedIcon className="w-5 h-5 mr-2 text-green-600" />
          256-bit SSL Encryption
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
          PCI DSS Compliant
        </div>
      </div>

      {/* PayFast Info */}
      <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-12 h-12" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="60" fill="#00A651" rx="8"/>
              <text x="100" y="35" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">PayFast</text>
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Secure Payment with PayFast
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ South Africa's leading payment gateway</li>
              <li>✓ Supports all major credit cards</li>
              <li>✓ Bank-level security and encryption</li>
              <li>✓ Instant payment confirmation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handlePayFastPayment}>
        <input type="hidden" {...register('paymentMethod')} value="payfast" />

        {/* Terms Agreement */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <input
              {...register('agreeToTerms')}
              type="checkbox"
              id="agreeToTerms"
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-green-600 hover:underline font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-green-600 hover:underline font-medium">
                Privacy Policy
              </a>
              . I authorize recurring {billingCycle} charges of {currency} {billingAmount.toFixed(2)} to my payment method.
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-xs mt-2 ml-7">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> You will be redirected to PayFast's secure payment page. 
            After completing your payment, you'll be automatically returned to our platform.
          </p>
        </div>

        {/* Plan Features Reminder */}
        <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">
            🎁 Premium Plan Includes:
          </h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>✓ Real-time grade updates</li>
            <li>✓ Advanced analytics and insights</li>
            <li>✓ Priority parent-teacher messaging</li>
            <li>✓ Detailed attendance reports</li>
            <li>✓ Homework tracking and reminders</li>
            <li>✓ Progress trend analysis</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            ← Go Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="flex-1 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting to PayFast...
              </>
            ) : (
              <>
                Pay with PayFast
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Debug Info (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-gray-900 text-white rounded text-xs font-mono">
          <div className="font-bold mb-1">💳 Payment Debug:</div>
          <div>Tier: {selectedTier}</div>
          <div>Cycle: {billingCycle}</div>
          <div>Amount: {currency} {billingAmount}</div>
          <div>Form Valid: {isValid ? '✅' : '❌'}</div>
          <div>Has User: {!!user ? '✅' : '❌'}</div>
        </div>
      )}
    </div>
  );
}