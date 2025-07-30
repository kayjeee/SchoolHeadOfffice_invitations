import React from 'react';

const Reports = () => {
  const reports = [
    { id: 1, name: 'Monthly Summary', date: '2025-01-01', downloadLink: '#' },
    { id: 2, name: 'Yearly Overview', date: '2025-01-05', downloadLink: '#' },
    { id: 3, name: 'Custom Report', date: '2025-01-10', downloadLink: '#' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <ul className="list-disc pl-5">
        {reports.map((report) => (
          <li key={report.id} className="mb-2">
            <span className="font-semibold">{report.name}</span> ({report.date}){' '}
            <a href={report.downloadLink} className="text-blue-500 underline">
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;
