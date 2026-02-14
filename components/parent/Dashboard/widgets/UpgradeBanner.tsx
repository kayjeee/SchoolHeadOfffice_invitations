import React from "react";

export default function UpgradeBanner() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-md flex justify-between items-center">
      <div>
        <h3 className="font-bold text-lg">Upgrade to Premium</h3>
        <p className="text-sm opacity-90">Unlock real-time grades, advanced analytics, and priority support.</p>
      </div>
      <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
        Learn More
      </button>
    </div>
  );
}
