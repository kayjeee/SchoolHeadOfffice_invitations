import React from 'react';

const PaymentRequests = () => {
  const paymentRequests = [
    { id: 1, date: '2025-01-02', amount: '$250', recipient: 'John Doe', status: 'Pending' },
    { id: 2, date: '2025-01-06', amount: '$150', recipient: 'Jane Smith', status: 'Completed' },
    { id: 3, date: '2025-01-09', amount: '$300', recipient: 'Company XYZ', status: 'Rejected' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment Requests</h1>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Recipient</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {paymentRequests.map((request) => (
            <tr key={request.id}>
              <td className="border border-gray-300 px-4 py-2">{request.date}</td>
              <td className="border border-gray-300 px-4 py-2">{request.amount}</td>
              <td className="border border-gray-300 px-4 py-2">{request.recipient}</td>
              <td
                className={`border border-gray-300 px-4 py-2 ${
                  request.status === 'Rejected' ? 'text-red-500' : ''
                }`}
              >
                {request.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentRequests;
