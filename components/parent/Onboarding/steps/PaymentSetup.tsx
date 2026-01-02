
// components/parent/Onboarding/steps/PaymentSetup.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface PaymentSetupProps {
  onComplete: (data: {
    paymentMethod: 'credit_card' | 'mobile_money' | 'bank_transfer';
    details: {
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
      cardholderName?: string;
      provider?: 'mpesa' | 'mtn' | 'airtel';
      phoneNumber?: string;
      accountNumber?: string;
      bankCode?: string;
    };
    billingAddress?: {
      country: string;
      postalCode?: string;
    };
    savePaymentMethod: boolean;
  }) => void;
  selectedTier: 'premium';
  billingAmount: number;
  currency?: string;
  supportedPaymentMethods?: string[];
}

// Unified validation schema
const paymentSchema = z.discriminatedUnion('paymentMethod', [
  z.object({
    paymentMethod: z.literal('credit_card'),
    cardNumber: z.string().min(13).max(19),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
    cvv: z.string().min(3).max(4),
    cardholderName: z.string().min(3),
    country: z.string().min(2),
    postalCode: z.string().optional(),
  }),
  z.object({
    paymentMethod: z.literal('mobile_money'),
    provider: z.enum(['mpesa', 'mtn', 'airtel']),
    phoneNumber: z.string().min(10),
  }),
  z.object({
    paymentMethod: z.literal('bank_transfer'),
    accountNumber: z.string().min(8),
    bankCode: z.string().min(3),
  }),
]);

type PaymentFormData = z.infer<typeof paymentSchema>;

type PaymentMethod = 'credit_card' | 'mobile_money' | 'bank_transfer';

export default function PaymentSetup({
  onComplete,
  selectedTier,
  billingAmount,
  currency = 'ZAR',
  supportedPaymentMethods = ['credit_card', 'mobile_money', 'bank_transfer'],
}: PaymentSetupProps) {
  console.log('');
  console.log('💰 ═══════════════════════════════════════');
  console.log('💰 PaymentSetup Component Rendered');
  console.log('💰 ═══════════════════════════════════════');
  console.log('📦 Props:', {
    selectedTier,
    billingAmount,
    currency,
    supportedPaymentMethods,
  });

  const [activeTab, setActiveTab] = useState<PaymentMethod>('credit_card');
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
  });

  // Reset form when tab changes
  useEffect(() => {
    console.log('🔄 Payment method tab changed to:', activeTab);
    reset();
    setSubmitError(null);
  }, [activeTab, reset]);

  // Watch all form values for debugging
  const watchedValues = watch();
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Form values:', watchedValues);
    }
  }, [watchedValues]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleFormSubmit = handleSubmit(async (data: PaymentFormData) => {
    console.log('');
    console.log('💰 ═══════════════════════════════════════');
    console.log('💰 PAYMENT FORM SUBMITTED');
    console.log('💰 ═══════════════════════════════════════');
    console.log('📦 Form data:', data);
    console.log('💳 Payment method:', activeTab);

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const paymentData: any = {
        paymentMethod: activeTab,
        details: {},
        savePaymentMethod,
      };

      if (data.paymentMethod === 'credit_card') {
        paymentData.details = {
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
          cardholderName: data.cardholderName,
        };
        paymentData.billingAddress = {
          country: data.country,
          postalCode: data.postalCode,
        };
      } else if (data.paymentMethod === 'mobile_money') {
        paymentData.details = {
          provider: data.provider,
          phoneNumber: data.phoneNumber,
        };
      } else if (data.paymentMethod === 'bank_transfer') {
        paymentData.details = {
          accountNumber: data.accountNumber,
          bankCode: data.bankCode,
        };
      }

      console.log('✅ Payment data prepared:', paymentData);
      console.log('🚀 Calling onComplete callback...');
      
      onComplete(paymentData);
      
      console.log('💰 ═══════════════════════════════════════');
      console.log('');
    } catch (error: any) {
      console.error('❌ Payment submission error:', error);
      setSubmitError(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  const renderCreditCardForm = () => (
    <div className="space-y-4">
      <input type="hidden" {...register('paymentMethod')} value="credit_card" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number *
        </label>
        <input
          {...register('cardNumber')}
          type="text"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          onChange={(e) => {
            const formatted = formatCardNumber(e.target.value);
            setValue('cardNumber', formatted.replace(/\s/g, ''));
            e.target.value = formatted;
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {'cardNumber' in errors && errors.cardNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date *
          </label>
          <input
            {...register('expiryDate')}
            type="text"
            placeholder="MM/YY"
            maxLength={5}
            onChange={(e) => {
              const formatted = formatExpiryDate(e.target.value);
              setValue('expiryDate', formatted);
              e.target.value = formatted;
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {'expiryDate' in errors && errors.expiryDate && (
            <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
          <input
            {...register('cvv')}
            type="password"
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {'cvv' in errors && errors.cvv && (
            <p className="text-red-500 text-xs mt-1">{errors.cvv.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name *
        </label>
        <input
          {...register('cardholderName')}
          type="text"
          placeholder="John Doe"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {'cardholderName' in errors && errors.cardholderName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.cardholderName.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            {...register('country')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select country</option>
            <option value="ZA">South Africa</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
          </select>
          {'country' in errors && errors.country && (
            <p className="text-red-500 text-xs mt-1">{errors.country.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            {...register('postalCode')}
            type="text"
            placeholder="0001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderMobileMoneyForm = () => (
    <div className="space-y-4">
      <input type="hidden" {...register('paymentMethod')} value="mobile_money" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Money Provider *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['mpesa', 'mtn', 'airtel'].map((provider) => (
            <label
              key={provider}
              className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                'provider' in watchedValues && watchedValues.provider === provider
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                {...register('provider')}
                type="radio"
                value={provider}
                className="sr-only"
              />
              <span className="font-semibold text-gray-700 uppercase">
                {provider}
              </span>
            </label>
          ))}
        </div>
        {'provider' in errors && errors.provider && (
          <p className="text-red-500 text-xs mt-1">{errors.provider.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          {...register('phoneNumber')}
          type="tel"
          placeholder="0712345678"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {'phoneNumber' in errors && errors.phoneNumber && (
          <p className="text-red-500 text-xs mt-1">
            {errors.phoneNumber.message as string}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You will receive a prompt on your phone to authorize the
          payment of <strong>{currency} {billingAmount}</strong>.
        </p>
      </div>
    </div>
  );

  const renderBankTransferForm = () => (
    <div className="space-y-4">
      <input type="hidden" {...register('paymentMethod')} value="bank_transfer" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account Number *
        </label>
        <input
          {...register('accountNumber')}
          type="text"
          placeholder="12345678901"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {'accountNumber' in errors && errors.accountNumber && (
          <p className="text-red-500 text-xs mt-1">
            {errors.accountNumber.message as string}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bank Code *
        </label>
        <select
          {...register('bankCode')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select your bank</option>
          <option value="ABSA">ABSA Bank</option>
          <option value="FNB">First National Bank (FNB)</option>
          <option value="NED">Nedbank</option>
          <option value="STD">Standard Bank</option>
          <option value="CAP">Capitec Bank</option>
        </select>
        {'bankCode' in errors && errors.bankCode && (
          <p className="text-red-500 text-xs mt-1">{errors.bankCode.message as string}</p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Bank Transfer Instructions:</strong>
        </p>
        <ol className="list-decimal list-inside text-sm text-yellow-800 mt-2 space-y-1">
          <li>We'll send you payment details via email</li>
          <li>Use your account to transfer {currency} {billingAmount}</li>
          <li>Your subscription will activate within 24 hours of payment</li>
        </ol>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Setup</h2>
        <p className="text-gray-600">
          Complete your Premium subscription for {currency} {billingAmount}/month
        </p>
      </div>

      {/* Security Badges */}
      <div className="flex justify-center items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <LockClosedIcon className="w-5 h-5 mr-2 text-green-600" />
          Secure Payment
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
          PCI Compliant
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {supportedPaymentMethods.includes('credit_card') && (
          <button
            onClick={() => setActiveTab('credit_card')}
            className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'credit_card'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCardIcon className="w-5 h-5 mr-2" />
            Credit Card
          </button>
        )}
        {supportedPaymentMethods.includes('mobile_money') && (
          <button
            onClick={() => setActiveTab('mobile_money')}
            className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'mobile_money'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <DevicePhoneMobileIcon className="w-5 h-5 mr-2" />
            Mobile Money
          </button>
        )}
        {supportedPaymentMethods.includes('bank_transfer') && (
          <button
            onClick={() => setActiveTab('bank_transfer')}
            className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bank_transfer'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BanknotesIcon className="w-5 h-5 mr-2" />
            Bank Transfer
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit}>
        {activeTab === 'credit_card' && renderCreditCardForm()}
        {activeTab === 'mobile_money' && renderMobileMoneyForm()}
        {activeTab === 'bank_transfer' && renderBankTransferForm()}

        {/* Save Payment Method Toggle */}
        <div className="mt-6 flex items-center">
          <input
            type="checkbox"
            id="savePaymentMethod"
            checked={savePaymentMethod}
            onChange={(e) => {
              console.log('💾 Save payment method toggled:', e.target.checked);
              setSavePaymentMethod(e.target.checked);
            }}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="savePaymentMethod" className="ml-2 text-sm text-gray-700">
            Save this payment method for future use
          </label>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
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
                Processing Payment...
              </>
            ) : (
              `Complete Payment - ${currency} ${billingAmount}`
            )}
          </button>
        </div>
      </form>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div className="font-semibold text-yellow-800 mb-1">Debug Info:</div>
          <div className="text-yellow-700 space-y-1">
            <div>Active Tab: <span className="font-mono">{activeTab}</span></div>
            <div>Form Valid: <span className="font-mono">{isValid ? '✅ Yes' : '❌ No'}</span></div>
            <div>Save Method: <span className="font-mono">{savePaymentMethod ? '✅ Yes' : '❌ No'}</span></div>
            <div>Billing Amount: <span className="font-mono">{currency} {billingAmount}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}