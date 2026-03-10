import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-w-[120px]">
      {icon && <div className="mb-2 text-blue-600">{icon}</div>}
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default StatCard;
