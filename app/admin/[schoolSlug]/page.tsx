import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | SchoolHeadOffice',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminDashboardPage({ params }: { params: { schoolSlug: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">
        Welcome to the administration panel for <span className="font-semibold text-blue-600">{params.schoolSlug}</span>.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-2">School Overview</h3>
          <p className="text-sm text-gray-500">View and manage your school's general information and settings.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-2">User Management</h3>
          <p className="text-sm text-gray-500">Manage staff, teachers, and student accounts.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-2">Analytics & Reports</h3>
          <p className="text-sm text-gray-500">Track engagement and generate performance reports.</p>
        </div>
      </div>
    </div>
  );
}
