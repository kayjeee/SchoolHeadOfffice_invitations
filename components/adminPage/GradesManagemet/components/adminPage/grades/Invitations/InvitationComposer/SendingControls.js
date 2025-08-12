import React, { useState } from 'react';

// Import the service function
// import { sendTestWhatsAppMessage } from '../services/whatsappService';

// Or define it directly in the component (this is what you currently have)
async function sendTestWhatsAppMessage(phoneNumber) {
  console.log('🚀 Sending WhatsApp message to:', phoneNumber);
  
  const res = await fetch('/api/send-whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });

  console.log('📡 API Response status:', res.status);
  console.log('📡 API Response ok:', res.ok);

  const data = await res.json();
  console.log('📊 API Response data:', data);

  if (!res.ok) {
    throw new Error(data.error || 'Unknown error from WhatsApp API');
  }

  return data;
}

export default function SendingControls() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleTestSend = async () => {
    console.log('🔄 Starting test send process...');
    setError(null);
    setSuccess(null);

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number including country code.');
      return;
    }

    // Validate phone number format (basic check)
    if (!phoneNumber.startsWith('+')) {
      setError('Phone number must include country code (e.g., +1234567890)');
      return;
    }

    setIsSending(true);

    try {
      console.log('📞 Calling sendTestWhatsAppMessage with:', phoneNumber);
      const result = await sendTestWhatsAppMessage(phoneNumber);
      console.log('✅ Test message result:', result);
      setSuccess(`Test message sent! Message ID: ${result.messages?.[0]?.id || 'N/A'}`);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.message || 'Failed to send test message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-3">WhatsApp Sending Controls</h2>

      {/* Phone Input */}
      <label htmlFor="phone-input" className="block mb-2 text-sm font-medium">
        Test Phone Number (with country code)
      </label>
      <input
        id="phone-input"
        type="tel"
        placeholder="+15551234567"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring focus:border-green-500"
      />

      {/* Send Test Button */}
      <button
        onClick={handleTestSend}
        disabled={isSending}
        className={`w-full py-2 rounded text-white transition-colors ${
          isSending
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isSending ? 'Sending...' : 'Send Test Message'}
      </button>

      {/* Status Messages */}
      {error && <p className="text-red-500 mt-3">❌ {error}</p>}
      {success && <p className="text-green-600 mt-3">✅ {success}</p>}
    </div>
  );
}