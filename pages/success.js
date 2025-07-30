import { useEffect, useState } from 'react';

export default function SuccessPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Get the query parameters from the URL (payment data or transaction ID)
        const params = new URLSearchParams(window.location.search);
        const transactionId = params.get('transaction_id'); // Assuming you pass transaction ID from PayFast

        // Send payment confirmation to the backend
        const confirmPayment = async () => {
            try {
                const response = await fetch(`/api/transactions/${transactionId}/process-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'completed' })  // You can send additional data if needed
                });
                const data = await response.json();
                if (response.ok) {
                    setMessage('Payment successfully processed!');
                } else {
                    setMessage('There was an issue processing your payment.');
                }
            } catch (error) {
                setMessage('Error confirming payment.');
            } finally {
                setIsLoading(false);
            }
        };

        if (transactionId) {
            confirmPayment();
        } else {
            setMessage('No transaction data found.');
            setIsLoading(false);
        }
    }, []);

    if (isLoading) return <div>Loading...</div>;
    return <div>{message}</div>;
}

