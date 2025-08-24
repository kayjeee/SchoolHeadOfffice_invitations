export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Build validation string
      const validationString = Object.keys(req.body)
        .sort()
        .map((key) => `${key}=${req.body[key]}`)
        .join('&');

      // Log notification for debugging
      console.log('IPN Data:', req.body);

      // Send back to PayFast for verification
      const response = await fetch('https://www.payfast.co.za/eng/query/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: validationString,
      });

      const verification = await response.text();

      if (verification.trim() === 'VALID') {
        console.log('Payment is valid.');
        return res.status(200).send('Payment validated');
      } else {
        console.error('Invalid payment.');
        return res.status(400).send('Invalid payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).send('Internal server error');
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
