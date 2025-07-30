export default function handler(req, res) {
    if (req.method === 'POST') {
        const validationString = Object.keys(req.body)
            .sort()
            .map((key) => `${key}=${req.body[key]}`)
            .join('&');

        // Log the notification data for debugging
        console.log('IPN Data:', req.body);

        // Verify payment by sending the data back to PayFast
        fetch('https://www.payfast.co.za/eng/query/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: validationString,
        })
            .then((response) => response.text())
            .then((verification) => {
                if (verification === 'VALID') {
                    console.log('Payment is valid.');
                    res.status(200).send('Payment validated');
                } else {
                    console.error('Invalid payment.');
                    res.status(400).send('Invalid payment');
                }
            })
            .catch((error) => {
                console.error('Error verifying payment:', error);
                res.status(500).send('Internal server error');
            });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
