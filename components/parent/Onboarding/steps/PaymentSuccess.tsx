// components/parent/Onboarding/steps/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface PaymentSuccessProps {
  transactionId?: string;
  onContinue?: () => void;
}

interface TransactionData {
  id: string;
  amount: number;
  status: string;
  subscription_tier?: string;
  subscription_billing_cycle?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_activated?: boolean;
  payfast_payment_id?: string;
  created_at?: string;
}

export default function PaymentSuccess({ transactionId, onContinue }: PaymentSuccessProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'processing'>('loading');
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      try {
        // Get transaction ID from props, query params, or localStorage
        const id = transactionId || 
                   router.query.transaction_id || 
                   localStorage.getItem('pending_transaction_id');
        
        console.log('📥 Fetching transaction status:', { id, pollCount });
        
        if (!id) {
          setError('No transaction ID found');
          setStatus('failed');
          return;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shobackendv2-production.up.railway.app';
        const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`);
        console.log('📡 Response status:', response.status);
        
        const result = await response.json();
        console.log('📦 Transaction data:', result);

        if (result.success && result.data) {
          setTransaction(result.data);
          
          if (result.data.status === 'completed') {
            console.log('✅ Payment completed successfully!');
            setStatus('success');
            
            // Clear pending transaction from localStorage
            localStorage.removeItem('pending_transaction_id');
            
            // Stop polling
            return;
          } else if (result.data.status === 'pending' || result.data.status === 'processing') {
            console.log('⏳ Payment still processing...');
            setStatus('processing');
            
            // Poll for status updates (max 20 times = ~60 seconds)
            if (pollCount < 20) {
              setPollCount(prev => prev + 1);
              setTimeout(fetchTransactionStatus, 3000);
            } else {
              console.log('⚠️ Polling timeout reached');
              setError('Payment verification is taking longer than expected. Please check your email for confirmation.');
              setStatus('processing');
            }
          } else if (result.data.status === 'failed') {
            console.log('❌ Payment failed');
            setStatus('failed');
            setError('Payment was declined or cancelled');
          } else if (result.data.status === 'cancelled') {
            console.log('🚫 Payment cancelled by user');
            setStatus('failed');
            setError('Payment was cancelled');
          }
        } else {
          console.error('❌ API error:', result.error);
          setError(result.error || 'Failed to fetch transaction status');
          setStatus('failed');
        }
      } catch (err: any) {
        console.error('❌ Error fetching transaction:', err);
        setError(err.message || 'Network error occurred');
        setStatus('failed');
      }
    };

    fetchTransactionStatus();
  }, [transactionId, router.query, pollCount]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push('/parent/dashboard');
    }
  };

  const handleRetry = () => {
    // Clear error and go back to payment step
    localStorage.removeItem('pending_transaction_id');
    router.back();
  };

  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Your Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your transaction with PayFast...
          </p>
        </div>
      </div>
    );
  }

  // Processing State (waiting for IPN)
  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Processing
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment is being processed. This may take a few moments.
            </p>
            
            {transaction && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Transaction Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{transaction.id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">ZAR {transaction.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-blue-600 font-semibold">Processing</span>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Status
              </button>
              
              <button
                onClick={handleContinue}
                className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">
              You'll receive an email confirmation once your payment is processed.
              If this takes too long, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for subscribing! Your payment has been processed successfully.
            </p>
            
            {transaction && (
              <div className="bg-green-50 rounded-lg p-4 mb-6 text-left border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">Subscription Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Plan:</span>
                    <span className="font-semibold text-green-900 capitalize">
                      {transaction.subscription_tier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount Paid:</span>
                    <span className="font-semibold text-green-900">
                      ZAR {transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Billing Cycle:</span>
                    <span className="font-semibold text-green-900 capitalize">
                      {transaction.subscription_billing_cycle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Status:</span>
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-semibold">
                      Active
                    </span>
                  </div>
                  {transaction.subscription_end_date && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Next Billing:</span>
                      <span className="font-semibold text-green-900">
                        {new Date(transaction.subscription_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                ✓ Subscription activated<br/>
                ✓ Receipt sent to your email<br/>
                ✓ Full access unlocked
              </p>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Dashboard
            </button>
            
            {transaction?.payfast_payment_id && (
              <p className="mt-4 text-xs text-gray-500">
                PayFast Payment ID: {transaction.payfast_payment_id}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Failed State
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Your payment could not be processed. No charges have been made to your account.'}
          </p>
          
          {transaction && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Transaction Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{transaction.id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>ZAR {transaction.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-red-600 font-semibold capitalize">{transaction.status}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Payment Again
            </button>
            
            <button
              onClick={handleContinue}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Without Payment
            </button>
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Need help?</strong> Contact our support team at support@example.com
              or call us at +27 (0)12 345 6789
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}