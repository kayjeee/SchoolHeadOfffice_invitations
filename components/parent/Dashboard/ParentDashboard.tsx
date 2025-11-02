// components/parent/Dashboard/ParentDashboard.tsx
import React from 'react';

export default function ParentDashboard({ user, profile, learners }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {profile?.first_name}</h1>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Your Learners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {learners.map((learner) => (
            <div key={learner.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">{learner.first_name} {learner.last_name}</h3>
              <p className="text-gray-600">{learner.grade}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
