import React from 'react';
import Link from 'next/link';

interface JoinTeacherCTAProps {
  currentUserIsTeacher: boolean;
  schoolSlug: string;
  onJoinClick: () => void;
}

const JoinTeacherCTA: React.FC<JoinTeacherCTAProps> = ({
  currentUserIsTeacher,
  schoolSlug,
  onJoinClick,
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-gray-900">
            {currentUserIsTeacher ? 'Welcome back!' : 'Are you a teacher here?'}
          </p>
          <p className="text-xs text-gray-500">
            {currentUserIsTeacher
              ? 'Access your classroom tools.'
              : 'Join the faculty to manage your classes.'}
          </p>
        </div>

        {currentUserIsTeacher ? (
          <Link
            href="/teacher/dashboard"
            className="flex-grow sm:flex-grow-0 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-center shadow-lg shadow-blue-200"
          >
            Go to Dashboard
          </Link>
        ) : (
          <button
            onClick={onJoinClick}
            className="flex-grow sm:flex-grow-0 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-center shadow-lg shadow-green-200"
          >
            Join as Teacher
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinTeacherCTA;
