export const processPayment = async (payment) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% chance of success
          resolve({
            success: true,
            message: 'Payment processed successfully!',
            transactionId: `txn_${Date.now()}`,
            paymentDetails: payment,
          });
        } else {
          reject(new Error('Payment failed due to a network error.'));
        }
      }, 1000); // Simulate network delay
    });
  };
  