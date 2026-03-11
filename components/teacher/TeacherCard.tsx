import React from 'react';
import Link from 'next/link';
import { Teacher } from '../../lib/api/school-api';

interface TeacherCardProps {
  teacher: Teacher;
  schoolSlug: string;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, schoolSlug }) => {
  const initials = teacher.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4 overflow-hidden">
        {teacher.avatar ? (
          <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{teacher.name}</h3>

      {/* Grades Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {teacher.grades && teacher.grades.length > 0 ? (
          teacher.grades.map((grade, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md"
            >
              {grade}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-xs italic">No grades assigned</span>
        )}
      </div>

      <Link
        href={`/school/${schoolSlug}/teachers/${teacher.slug}`}
        className="mt-auto w-full py-2 px-4 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors text-sm"
      >
        View Profile
      </Link>
    </div>
  );
};

export default TeacherCard;
