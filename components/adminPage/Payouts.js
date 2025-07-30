import React from 'react';

const Payouts = () => {
  const payouts = [
    { id: 1, date: '2025-01-03', amount: '$150', method: 'Bank Transfer' },
    { id: 2, date: '2025-01-07', amount: '$300', method: 'PayPal' },
    { id: 3, date: '2025-01-12', amount: '$80', method: 'Check' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payouts</h1>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Method</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.id}>
              <td className="border border-gray-300 px-4 py-2">{payout.date}</td>
              <td className="border border-gray-300 px-4 py-2">{payout.amount}</td>
              <td className="border border-gray-300 px-4 py-2">{payout.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payouts;
