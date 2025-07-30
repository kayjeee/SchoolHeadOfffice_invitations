import React from 'react';

const Transactions = () => {
  const transactions = [
    { id: 1, date: '2025-01-01', amount: '$100', status: 'Completed' },
    { id: 2, date: '2025-01-05', amount: '$200', status: 'Pending' },
    { id: 3, date: '2025-01-10', amount: '$50', status: 'Failed' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="border border-gray-300 px-4 py-2">{tx.date}</td>
              <td className="border border-gray-300 px-4 py-2">{tx.amount}</td>
              <td className={`border border-gray-300 px-4 py-2 ${tx.status === 'Failed' ? 'text-red-500' : ''}`}>
                {tx.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
