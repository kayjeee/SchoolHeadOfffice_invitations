export default function handler(req, res) {
    if (req.method === 'POST') {
        const { amount, item_name } = req.body;

        const paymentData = {
            merchant_id: process.env.PAYFAST_MERCHANT_ID, // Use environment variable
            merchant_key: process.env.PAYFAST_MERCHANT_KEY, // Use environment variable
            amount,
            item_name,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
            notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notify`,
        };

        // Build the PayFast URL with query parameters
        const queryString = new URLSearchParams(paymentData).toString();
        const paymentUrl = `https://www.payfast.co.za/eng/process?${queryString}`;

        res.status(200).json({ paymentUrl });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
