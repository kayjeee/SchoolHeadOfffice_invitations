import React from "react";

export default function PremiumTab() {
  const features = [
    { title: "Real-time grade updates", description: "See marks as soon as they are entered by teachers." },
    { title: "Advanced analytics", description: "Deep dive into performance trends and subject mastery." },
    { title: "PDF exports", description: "Download and print any report or analysis." },
    { title: "Priority support", description: "24/7 access to our dedicated support team." },
    { title: "Teacher scheduling", description: "Book meetings with teachers directly from the dashboard." },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Go Beyond Standard</h2>
        <p className="text-lg text-gray-600">
          Empower your child's education with tools designed for proactive parenting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-2">Ready to upgrade?</h3>
          <p className="opacity-90">Join thousands of parents making the most of SchoolHeadOffice.</p>
        </div>
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
          Upgrade Now - $9.99/mo
        </button>
      </div>
    </div>
  );
}
