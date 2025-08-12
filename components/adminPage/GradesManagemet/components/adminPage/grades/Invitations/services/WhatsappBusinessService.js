// Call the backend route that talks to the WhatsApp Business API
export async function sendTestWhatsAppMessage(phoneNumber) {
  const res = await fetch('/api/send-whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Unknown error from WhatsApp API');
  }

  return data;
}
