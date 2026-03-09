import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  hasQuery?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasQuery }) => {
  return (
    <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mt-8">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {hasQuery ? "No matching schools found" : "No schools registered yet"}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg leading-relaxed">
        {hasQuery
          ? "We couldn't find any schools that match your search. Please try a different name or city."
          : "Join our community of educational excellence and connect with your students and parents."}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/school/register"
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          Register your school
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default EmptyState;
