
import React from 'react';

interface StatusBadgeProps {
  status: 'completed' | 'in-progress' | 'pending' | 'skipped';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClasses = '';
  let badgeText = '';

  switch (status) {
    case 'completed':
      badgeClasses = 'bg-green-100 text-green-800';
      badgeText = 'Completed';
      break;
    case 'in-progress':
      badgeClasses = 'bg-blue-100 text-blue-800';
      badgeText = 'In Progress';
      break;
    case 'pending':
      badgeClasses = 'bg-gray-100 text-gray-800';
      badgeText = 'Pending';
      break;
    case 'skipped':
      badgeClasses = 'bg-yellow-100 text-yellow-800';
      badgeText = 'Skipped';
      break;
    default:
      badgeClasses = 'bg-gray-100 text-gray-800';
      badgeText = 'Unknown';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}
    >
      {badgeText}
    </span>
  );
};

export default StatusBadge;


