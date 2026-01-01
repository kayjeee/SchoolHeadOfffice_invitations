// components/parent/Onboarding/steps/PaymentSetup.tsx
import React, { useState } from 'react';

interface PaymentSetupProps {
  onComplete: (data: { paymentMethod: 'credit_card' | 'mobile_money', details: any }) => void;
}

export default function PaymentSetup({ onComplete }: PaymentSetupProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'mobile_money'>('credit_card');

  const handleMobileMoneySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const mobileMoneyNumber = formData.get('mobile_money_number');
    console.log('📱 Mobile Money Number:', mobileMoneyNumber);
    // In a real app, you would call your backend here to initiate the STK push
    onComplete({ paymentMethod: 'mobile_money', details: { mobileMoneyNumber } });
  };

  const handleCreditCardSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you would use Stripe.js or a similar library to tokenize card details
    // For this example, we'll just simulate a successful payment
    console.log('💳 Credit Card details submitted');
    onComplete({ paymentMethod: 'credit_card', details: { token: 'tok_mock_successful_payment' } });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Payment Details</h2>

      {/* Payment method tabs */}
      <div className="flex justify-center border-b mb-6">
        <button
          onClick={() => setPaymentMethod('credit_card')}
          className={`px-6 py-2 font-semibold ${paymentMethod === 'credit_card' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Credit Card
        </button>
        <button
          onClick={() => setPaymentMethod('mobile_money')}
          className={`px-6 py-2 font-semibold ${paymentMethod === 'mobile_money' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Mobile Money
        </button>
      </div>

      {/* Credit Card Form */}
      {paymentMethod === 'credit_card' && (
        <form onSubmit={handleCreditCardSubmit} className="space-y-4">
          <div>
            <label htmlFor="card_number" className="block text-sm font-medium text-gray-700">Card Number</label>
            <input type="text" id="card_number" name="card_number" placeholder="•••• •••• •••• 1234" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input type="text" id="expiry_date" name="expiry_date" placeholder="MM / YY" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
              <input type="text" id="cvc" name="cvc" placeholder="123" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
          </div>
          <button type="submit" className="w-full mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            Start Premium Subscription
          </button>
        </form>
      )}

      {/* Mobile Money Form */}
      {paymentMethod === 'mobile_money' && (
        <form onSubmit={handleMobileMoneySubmit} className="space-y-4">
          <div>
            <label htmlFor="mobile_money_number" className="block text-sm font-medium text-gray-700">Mobile Money Number</label>
            <input type="tel" id="mobile_money_number" name="mobile_money_number" placeholder="e.g., 0712345678" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <p className="text-sm text-gray-500">You will receive a notification on your phone to confirm the payment by entering your PIN.</p>
          <button type="submit" className="w-full mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            Initiate Payment
          </button>
        </form>
      )}
    </div>
  );
}
