import React, { useState, useCallback } from 'react';
import { 
  FiCopy, 
  FiCheck, 
  FiUser, 
  FiBook, 
  FiCalendar,
  FiHome,
  FiPhone,
  FiMail,
  FiGlobe,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiAlertTriangle,
  FiHeart,
  FiStar,
  FiClock,
  FiMapPin,
  FiBookOpen,
  FiAward,
  FiTarget,
  FiTrendingUp,
  FiShield,
  FiLock,
  FiUnlock,
  FiPercent,
  FiHash,
  FiType,
  FiList,
  FiGrid,
  FiLayout
} from 'react-icons/fi';

/**
 * TemplateVariables Component
 * 
 * Comprehensive variable management system for PR code templates with
 * categorization, search, and easy insertion functionality.
 */
const TemplateVariables = ({ 
  onVariableInsert, 
  selectedSchool = {},
  currentTemplate = null 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedVariable, setCopiedVariable] = useState(null);

  const variableCategories = [
    {
      id: 'personal',
      name: 'Personal Information',
      icon: FiUser,
      color: 'blue',
      variables: [
        { 
          name: 'parentName', 
          displayName: 'Parent/Guardian Name',
          description: 'Full name of the parent or guardian',
          example: 'Sarah Johnson',
          icon: FiUser,
          usage: 'Dear {{parentName}},...'
        },
        { 
          name: 'learnerName', 
          displayName: 'Learner Name',
          description: 'Full name of the student/learner',
          example: 'Emma Johnson',
          icon: FiUser,
          usage: 'Progress report for {{learnerName}}'
        },
        { 
          name: 'teacherName', 
          displayName: 'Teacher Name',
          description: 'Name of the teacher or staff member',
          example: 'Mrs. Thompson',
          icon: FiUser,
          usage: 'From: {{teacherName}}'
        },
        { 
          name: 'principalName', 
          displayName: 'Principal Name',
          description: 'Name of the school principal',
          example: 'Dr. James Wilson',
          icon: FiUser,
          usage: 'Best regards, {{principalName}}'
        }
      ]
    },
    {
      id: 'school',
      name: 'School Information',
      icon: FiHome,
      color: 'green',
      variables: [
        { 
          name: 'schoolName', 
          displayName: 'School Name',
          description: 'Full name of the school',
          example: 'Prestige Academy',
          icon: FiHome,
          usage: 'Welcome to {{schoolName}}'
        },
        { 
          name: 'grade', 
          displayName: 'Grade/Class',
          description: 'Student\'s grade or class name',
          example: 'Grade 5B',
          icon: FiBook,
          usage: '{{grade}} class update'
        },
        { 
          name: 'subject', 
          displayName: 'Subject',
          description: 'Academic subject or course',
          example: 'Mathematics',
          icon: FiBookOpen,
          usage: '{{subject}} assignment'
        },
        { 
          name: 'contactEmail', 
          displayName: 'Contact Email',
          description: 'School contact email address',
          example: 'admin@prestige.edu',
          icon: FiMail,
          usage: 'Email us at {{contactEmail}}'
        },
        { 
          name: 'contactNumber', 
          displayName: 'Contact Number',
          description: 'School contact phone number',
          example: '+27 11 123 4567',
          icon: FiPhone,
          usage: 'Call {{contactNumber}}'
        }
      ]
    },
    {
      id: 'pr-codes',
      name: 'PR Code Variables',
      icon: FiStar,
      color: 'purple',
      variables: [
        { 
          name: 'prCode', 
          displayName: 'PR Code',
          description: 'Personal Referral Code for tracking',
          example: 'PAC-L-ABC123',
          icon: FiStar,
          usage: 'Your code: {{prCode}}',
          required: true
        },
        { 
          name: 'shortUrl', 
          displayName: 'Short URL',
          description: 'Shortened invitation URL with tracking',
          example: 'prestige.edu/join/ABC123',
          icon: FiLink,
          usage: 'Visit: {{shortUrl}}',
          required: true
        },
        { 
          name: 'portalUrl', 
          displayName: 'Portal URL',
          description: 'Parent portal website address',
          example: 'portal.prestige.edu',
          icon: FiGlobe,
          usage: 'Login at {{portalUrl}}'
        },
        { 
          name: 'trackingId', 
          displayName: 'Tracking ID',
          description: 'Unique tracking identifier',
          example: 'TRK-123456',
          icon: FiBarChart2,
          usage: 'Reference: {{trackingId}}'
        }
      ]
    },
    {
      id: 'academic',
      name: 'Academic Information',
      icon: FiBook,
      color: 'orange',
      variables: [
        { 
          name: 'currentGrade', 
          displayName: 'Current Grade',
          description: 'Student\'s current academic grade',
          example: 'Grade 5B',
          icon: FiBook,
          usage: 'Current grade: {{currentGrade}}'
        },
        { 
          name: 'performanceRating', 
          displayName: 'Performance Rating',
          description: 'Academic performance assessment',
          example: 'Excellent',
          icon: FiAward,
          usage: 'Rating: {{performanceRating}}'
        },
        { 
          name: 'achievements', 
          displayName: 'Achievements',
          description: 'Student accomplishments and successes',
          example: 'Top scorer in Mathematics',
          icon: FiTrendingUp,
          usage: 'Achievements: {{achievements}}'
        },
        { 
          name: 'nextSteps', 
          displayName: 'Next Steps',
          description: 'Recommended actions or next steps',
          example: 'Continue current study routine',
          icon: FiTarget,
          usage: 'Next: {{nextSteps}}'
        }
      ]
    },
    {
      id: 'events',
      name: 'Event Information',
      icon: FiCalendar,
      color: 'red',
      variables: [
        { 
          name: 'eventName', 
          displayName: 'Event Name',
          description: 'Name of the school event',
          example: 'Annual Science Fair',
          icon: FiCalendar,
          usage: 'Event: {{eventName}}'
        },
        { 
          name: 'eventDate', 
          displayName: 'Event Date',
          description: 'Date of the event',
          example: '15 March 2024',
          icon: FiCalendar,
          usage: 'Date: {{eventDate}}'
        },
        { 
          name: 'eventTime', 
          displayName: 'Event Time',
          description: 'Time of the event',
          example: '14:00 - 17:00',
          icon: FiClock,
          usage: 'Time: {{eventTime}}'
        },
        { 
          name: 'eventLocation', 
          displayName: 'Event Location',
          description: 'Location of the event',
          example: 'School Auditorium',
          icon: FiMapPin,
          usage: 'Location: {{eventLocation}}'
        },
        { 
          name: 'eventDescription', 
          displayName: 'Event Description',
          description: 'Detailed description of the event',
          example: 'Join us for our annual science fair...',
          icon: FiBookOpen,
          usage: 'Details: {{eventDescription}}'
        }
      ]
    },
    {
      id: 'financial',
      name: 'Financial Information',
      icon: FiDollarSign,
      color: 'green',
      variables: [
        { 
          name: 'amountDue', 
          displayName: 'Amount Due',
          description: 'Outstanding payment amount',
          example: 'R2,500.00',
          icon: FiDollarSign,
          usage: 'Amount: {{amountDue}}'
        },
        { 
          name: 'dueDate', 
          displayName: 'Due Date',
          description: 'Payment deadline date',
          example: '30 March 2024',
          icon: FiCalendar,
          usage: 'Due: {{dueDate}}'
        },
        { 
          name: 'paymentMethods', 
          displayName: 'Payment Methods',
          description: 'Available payment options',
          example: 'EFT, Credit Card, Cash',
          icon: FiCreditCard,
          usage: 'Pay via: {{paymentMethods}}'
        },
        { 
          name: 'bankDetails', 
          displayName: 'Bank Details',
          description: 'Bank account information',
          example: 'Bank: FNB, Acc: 1234567890',
          icon: FiDollarSign,
          usage: 'Bank: {{bankDetails}}'
        },
        { 
          name: 'officeHours', 
          displayName: 'Office Hours',
          description: 'School office operating hours',
          example: 'Mon-Fri 8:00-16:00',
          icon: FiClock,
          usage: 'Office hours: {{officeHours}}'
        }
      ]
    },
    {
      id: 'system',
      name: 'System Variables',
      icon: FiSettings,
      color: 'gray',
      variables: [
        { 
          name: 'currentDate', 
          displayName: 'Current Date',
          description: 'Automatically populated current date',
          example: '15 March 2024',
          icon: FiCalendar,
          usage: 'Date: {{currentDate}}',
          auto: true
        },
        { 
          name: 'currentTime', 
          displayName: 'Current Time',
          description: 'Automatically populated current time',
          example: '14:30',
          icon: FiClock,
          usage: 'Time: {{currentTime}}',
          auto: true
        },
        { 
          name: 'schoolYear', 
          displayName: 'School Year',
          description: 'Current academic year',
          example: '2024',
          icon: FiCalendar,
          usage: 'School year: {{schoolYear}}',
          auto: true
        },
        { 
          name: 'term', 
          displayName: 'Academic Term',
          description: 'Current academic term',
          example: 'Term 1',
          icon: FiBook,
          usage: 'Term: {{term}}',
          auto: true
        }
      ]
    }
  ];

  const allVariables = variableCategories.flatMap(category => category.variables);

  const filteredVariables = allVariables.filter(variable => {
    const matchesSearch = variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           variableCategories.find(cat => cat.id === selectedCategory)?.variables.includes(variable);
    
    return matchesSearch && matchesCategory;
  });

  const handleVariableInsert = useCallback((variableName) => {
    if (typeof onVariableInsert === 'function') {
      onVariableInsert(variableName);
    }
  }, [onVariableInsert]);

  const handleCopyVariable = useCallback(async (variableName) => {
    try {
      await navigator.clipboard.writeText(`{{${variableName}}}`);
      setCopiedVariable(variableName);
      setTimeout(() => setCopiedVariable(null), 2000);
    } catch (error) {
      console.error('Failed to copy variable:', error);
    }
  }, []);

  const VariableCard = ({ variable, category }) => {
    const Icon = variable.icon || FiType;
    const isCopied = copiedVariable === variable.name;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${category.color}-100`}>
              <Icon className={`h-5 w-5 text-${category.color}-600`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {variable.displayName}
              </h4>
              <div className="font-mono text-xs text-gray-500 mt-1">
                {`{{${variable.name}}}`}
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handleCopyVariable(variable.name)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Copy variable"
            >
              {isCopied ? <FiCheck className="h-4 w-4 text-green-500" /> : <FiCopy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {variable.description}
        </p>

        {variable.example && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Example:</div>
            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {variable.example}
            </div>
          </div>
        )}

        {variable.usage && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Usage:</div>
            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">
              {variable.usage}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {variable.required && (
            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              <FiAlertTriangle className="h-3 w-3 mr-1" />
              Required
            </span>
          )}
          
          {variable.auto && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              <FiClock className="h-3 w-3 mr-1" />
              Auto-filled
            </span>
          )}

          <button
            onClick={() => handleVariableInsert(variable.name)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Insert
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Template Variables</h2>
        <p className="text-sm text-gray-600">
          Insert dynamic variables into your templates. These will be automatically replaced with actual values when sending messages.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {variableCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {variableCategories.map(category => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const count = category.variables.length;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? `bg-${category.color}-100 text-${category.color}-800 border-${category.color}-200`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                isActive ? `bg-${category.color}-200 text-${category.color}-800` : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Variables Grid */}
      {filteredVariables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVariables.map(variable => {
            const category = variableCategories.find(cat => 
              cat.variables.includes(variable)
            );
            return (
              <VariableCard 
                key={variable.name} 
                variable={variable} 
                category={category} 
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No variables found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `No variables match "${searchTerm}". Try a different search term.`
              : 'No variables available in this category.'
            }
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => {
              const prVariables = variableCategories.find(cat => cat.id === 'pr-codes')?.variables || [];
              prVariables.forEach(variable => handleVariableInsert(variable.name));
            }}
            className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md"
          >
            <FiStar className="h-5 w-5 text-purple-600" />
            <span className="text-sm">Insert All PR Variables</span>
          </button>
          
          <button
            onClick={() => {
              const requiredVars = allVariables.filter(v => v.required);
              requiredVars.forEach(variable => handleVariableInsert(variable.name));
            }}
            className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md"
          >
            <FiAlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm">Insert Required Variables</span>
          </button>
          
          <button
            onClick={() => {
              const personalVars = variableCategories.find(cat => cat.id === 'personal')?.variables || [];
              personalVars.forEach(variable => handleVariableInsert(variable.name));
            }}
            className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md"
          >
            <FiUser className="h-5 w-5 text-blue-600" />
            <span className="text-sm">Insert Personal Variables</span>
          </button>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Usage Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Variables are automatically replaced with actual values when messages are sent</li>
          <li>• Required variables must be included for proper message delivery</li>
          <li>• Auto-filled variables are populated by the system automatically</li>
          <li>• PR code variables enable tracking and analytics for your invitations</li>
          <li>• Use the copy button to easily share variable syntax with colleagues</li>
        </ul>
      </div>
    </div>
  );
};

// Add missing icon component
const FiCreditCard = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

// Add missing icon component
const FiSearch = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default TemplateVariables;