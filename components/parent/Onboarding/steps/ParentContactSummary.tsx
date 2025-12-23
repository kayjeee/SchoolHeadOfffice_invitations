// components/parent/Onboarding/steps/ParentContactSummary.tsx
import React from 'react';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, PencilIcon } from '@heroicons/react/24/outline';
import { FaWhatsapp } from 'react-icons/fa';
import { Learner } from '../../../../lib/api/parent-api';

interface ParentContactSummaryProps {
  parent: {
    name: string;
    email: string;
    phone: string;
  };
  learners: Learner[];
  school: {
    name: string;
    whatsappNumber?: string;
  };
  onComplete: () => void;
}

export default function ParentContactSummary({ parent, learners, school, onComplete }: ParentContactSummaryProps) {
  const parentName = parent.name;
  const schoolName = school.name;

  const handleWhatsAppContact = () => {
    const message = `Hello ${schoolName}, this is ${parentName}. I'm a parent of a student at your school and have a question.`;
    const encodedMessage = encodeURIComponent(message);

    // Fallback to a default or hide button if no number is available
    const whatsAppNumber = school.whatsappNumber || '';

    if (whatsAppNumber) {
      const url = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Parent Contact Information</h3>

      <div className="space-y-4 mb-8">
        <div className="flex items-center">
          <UserCircleIcon className="h-6 w-6 text-gray-500 mr-4" />
          <span className="text-gray-700">{parent.name || 'Name not available'}</span>
        </div>
        <div className="flex items-center">
          <EnvelopeIcon className="h-6 w-6 text-gray-500 mr-4" />
          <span className="text-gray-700">{parent.email || 'Email not available'}</span>
        </div>
        <div className="flex items-center">
          <PhoneIcon className="h-6 w-6 text-gray-500 mr-4" />
          <span className="text-gray-700">{parent.phone || 'Phone not available'}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleWhatsAppContact}
          disabled={!school.whatsappNumber}
          className="flex-1 inline-flex items-center justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Contact school via WhatsApp"
        >
          <FaWhatsapp className="h-5 w-5 mr-2" />
          Contact School via WhatsApp
        </button>
        <button
          onClick={() => { /* Placeholder for edit profile functionality */ }}
          className="flex-1 inline-flex items-center justify-center py-3 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          aria-label="Edit your profile"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Edit Profile
        </button>
      </div>

      <div className="mt-8 text-right">
        <button
          onClick={onComplete}
          className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
