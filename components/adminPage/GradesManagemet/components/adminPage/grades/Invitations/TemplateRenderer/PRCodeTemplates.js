import React, { useState, useCallback } from 'react';
import { 
  FiCopy, 
  FiCheck, 
  FiDownload, 
  FiMail, 
  FiMessageSquare, 
  FiSmartphone,
  FiUser,
  FiBook,
  FiCalendar,
  FiHome,
  FiPhone,
  FiGlobe,
  FiBarChart2,
  FiSettings,
  FiPlus,
  FiTrash2,
  FiEdit3
} from 'react-icons/fi';

/**
 * PRCodeTemplates Component
 * 
 * Comprehensive template management system with PR code variable support,
 * multi-channel templates, and professional messaging frameworks.
 */
const PRCodeTemplates = ({ 
  onTemplateSelect, 
  selectedSchool = {},
  user = {},
  defaultTemplates = []
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([
    ...defaultTemplates,
    {
      id: 'welcome-pr-code',
      name: 'Welcome with PR Code',
      description: 'Professional welcome message with PR code integration',
      category: 'welcome',
      channels: ['whatsapp', 'sms', 'email'],
      subject: 'Welcome to {{schoolName}} - Your PR Code: {{prCode}}',
      content: `Dear {{parentName}},

🎉 Welcome to {{schoolName}}! We're thrilled to have {{learnerName}} join our {{grade}} class.

**Your Personal Referral Code: {{prCode}}**

Use this code for:
• Parent portal access
• Enrollment confirmation  
• School communications
• Event registrations

📱 Quick Access: {{shortUrl}}
📧 Email: {{contactEmail}}
📞 Phone: {{contactNumber}}

We look forward to partnering with you in {{learnerName}}'s educational journey.

Best regards,
{{principalName}}
Principal, {{schoolName}}`,
      variables: ['parentName', 'learnerName', 'schoolName', 'grade', 'prCode', 'shortUrl', 'contactEmail', 'contactNumber', 'principalName'],
      isDefault: true
    },
    {
      id: 'event-invitation-pr',
      name: 'Event Invitation with PR',
      description: 'Event invitation with PR code tracking',
      category: 'events',
      channels: ['whatsapp', 'email'],
      subject: 'You\'re Invited: {{eventName}} at {{schoolName}}',
      content: `Hello {{parentName}}!

You're invited to our special event:

🎉 **{{eventName}}**
📅 Date: {{eventDate}}
⏰ Time: {{eventTime}}
📍 Location: {{eventLocation}}

**Your PR Code: {{prCode}}**
Please bring this code for quick check-in.

{{eventDescription}}

We can't wait to see you there!

Best regards,
{{schoolName}} Team`,
      variables: ['parentName', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'eventDescription', 'prCode', 'schoolName'],
      isDefault: true
    },
    {
      id: 'academic-update-pr',
      name: 'Academic Update with PR',
      description: 'Academic progress report with PR code reference',
      category: 'academic',
      channels: ['email', 'whatsapp'],
      subject: 'Academic Update for {{learnerName}} - {{schoolName}}',
      content: `Dear {{parentName}},

Here's the latest academic update for {{learnerName}}:

📚 **Current Grade: {{currentGrade}}**
📊 **Overall Performance: {{performanceRating}}**
🎯 **Key Achievements:**
{{achievements}}

**Next Steps:**
{{nextSteps}}

**Your PR Code: {{prCode}}**
Use this code to access detailed reports on our parent portal.

Please don't hesitate to reach out if you have any questions.

Warm regards,
{{teacherName}}
{{subject}} Teacher
{{schoolName}}`,
      variables: ['parentName', 'learnerName', 'currentGrade', 'performanceRating', 'achievements', 'nextSteps', 'prCode', 'teacherName', 'subject', 'schoolName'],
      isDefault: true
    },
    {
      id: 'emergency-alert-pr',
      name: 'Emergency Alert with PR',
      description: 'Urgent notifications with PR code verification',
      category: 'emergency',
      channels: ['whatsapp', 'sms'],
      subject: 'URGENT: {{alertType}} - {{schoolName}}',
      content: `🚨 URGENT ALERT: {{alertType}}

{{alertMessage}}

**Verification Code: {{prCode}}**
Please use this code when responding to this alert.

🛑 Action Required: {{actionRequired}}

For more information: {{contactNumber}}

This is an automated message from {{schoolName}} emergency system.`,
      variables: ['alertType', 'alertMessage', 'prCode', 'actionRequired', 'contactNumber', 'schoolName'],
      isDefault: true
    },
    {
      id: 'fee-reminder-pr',
      name: 'Fee Reminder with PR',
      description: 'Fee payment reminder with PR code reference',
      category: 'financial',
      channels: ['email', 'whatsapp'],
      subject: 'Fee Reminder for {{learnerName}} - {{schoolName}}',
      content: `Dear {{parentName}},

This is a friendly reminder regarding the fee payment for {{learnerName}}:

💰 **Amount Due: {{amountDue}}**
📅 **Due Date: {{dueDate}}**
💳 **Payment Methods: {{paymentMethods}}**

**Your PR Code: {{prCode}}**
Include this code with your payment for quick processing.

You can make payments through:
• Online portal: {{portalUrl}}
• Bank transfer: {{bankDetails}}
• In-person: {{officeHours}}

Thank you for your prompt attention to this matter.

Best regards,
Finance Department
{{schoolName}}`,
      variables: ['parentName', 'learnerName', 'amountDue', 'dueDate', 'paymentMethods', 'prCode', 'portalUrl', 'bankDetails', 'officeHours', 'schoolName'],
      isDefault: true
    }
  ]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const allTemplates = [...templates, ...customTemplates];

  const templateCategories = [
    { id: 'all', name: 'All Templates', icon: FiBook, count: allTemplates.length },
    { id: 'welcome', name: 'Welcome', icon: FiUser, count: allTemplates.filter(t => t.category === 'welcome').length },
    { id: 'academic', name: 'Academic', icon: FiBook, count: allTemplates.filter(t => t.category === 'academic').length },
    { id: 'events', name: 'Events', icon: FiCalendar, count: allTemplates.filter(t => t.category === 'events').length },
    { id: 'financial', name: 'Financial', icon: FiBarChart2, count: allTemplates.filter(t => t.category === 'financial').length },
    { id: 'emergency', name: 'Emergency', icon: FiSettings, count: allTemplates.filter(t => t.category === 'emergency').length },
    { id: 'custom', name: 'My Templates', icon: FiEdit3, count: customTemplates.length }
  ];

  const channelIcons = {
    whatsapp: FiMessageSquare,
    sms: FiSmartphone,
    email: FiMail
  };

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    if (typeof onTemplateSelect === 'function') {
      onTemplateSelect(template);
    }
  }, [onTemplateSelect]);

  const handleCreateTemplate = useCallback(() => {
    setEditingTemplate({
      id: `custom-${Date.now()}`,
      name: 'New Template',
      description: '',
      category: 'custom',
      channels: ['whatsapp'],
      subject: '',
      content: '',
      variables: [],
      isDefault: false
    });
    setShowTemplateEditor(true);
  }, []);

  const handleEditTemplate = useCallback((template) => {
    setEditingTemplate({ ...template });
    setShowTemplateEditor(true);
  }, []);

  const handleSaveTemplate = useCallback((template) => {
    if (template.isDefault) {
      // Update existing template
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    } else {
      // Save custom template
      setCustomTemplates(prev => {
        const existingIndex = prev.findIndex(t => t.id === template.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = template;
          return updated;
        }
        return [...prev, template];
      });
    }
    setShowTemplateEditor(false);
    setEditingTemplate(null);
  }, []);

  const handleDeleteTemplate = useCallback((templateId) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
  }, []);

  const renderTemplatePreview = (template) => {
    const previewData = {
      parentName: 'Sarah Johnson',
      learnerName: 'Emma Johnson',
      schoolName: selectedSchool?.name || 'Prestige Academy',
      grade: 'Grade 5',
      prCode: 'PAC-L-ABC123',
      shortUrl: 'prestige.edu/join/ABC123',
      contactEmail: 'admin@prestige.edu',
      contactNumber: '+27 11 123 4567',
      principalName: 'Dr. James Wilson',
      eventName: 'Annual Science Fair',
      eventDate: '15 March 2024',
      eventTime: '14:00 - 17:00',
      eventLocation: 'School Auditorium',
      eventDescription: 'Join us for our annual science fair showcasing student projects and innovations.',
      currentGrade: 'Grade 5B',
      performanceRating: 'Excellent',
      achievements: '- Top scorer in Mathematics\n- Excellent participation in Science Club\n- Improved reading comprehension',
      nextSteps: '- Continue with current study routine\n- Attend extra math classes\n- Participate in upcoming science competition',
      teacherName: 'Mrs. Thompson',
      subject: 'Mathematics',
      alertType: 'Weather Alert',
      alertMessage: 'School will close early today due to severe weather conditions. Please pick up your children by 1:00 PM.',
      actionRequired: 'Pick up your child by 1:00 PM',
      amountDue: 'R2,500.00',
      dueDate: '30 March 2024',
      paymentMethods: 'EFT, Credit Card, Cash',
      portalUrl: 'portal.prestige.edu',
      bankDetails: 'Prestige Academy, Bank: FNB, Acc: 1234567890, Ref: Student Name',
      officeHours: 'Mon-Fri 8:00-16:00'
    };

    const previewContent = template.content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return previewData[key] || `{{${key}}}`;
    });

    const previewSubject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return previewData[key] || `{{${key}}}`;
    });

    return { content: previewContent, subject: previewSubject };
  };

  const TemplateCard = ({ template }) => {
    const preview = renderTemplatePreview(template);
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <div
        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100 shadow-lg'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
        }`}
        onClick={() => handleTemplateSelect(template)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{template.name}</h4>
            <p className="text-gray-600 text-xs mt-1">{template.description}</p>
          </div>
          <div className="flex space-x-1 ml-2">
            {template.channels.map(channel => {
              const Icon = channelIcons[channel];
              return Icon ? <Icon key={channel} className="h-4 w-4 text-gray-400" /> : null;
            })}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-1">Subject:</div>
          <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg font-mono">
            {preview.subject}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-1">Preview:</div>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg max-h-20 overflow-y-auto">
            {preview.content.substring(0, 120)}...
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {template.variables.slice(0, 3).map(variable => (
              <span
                key={variable}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full"
              >
                {variable}
              </span>
            ))}
            {template.variables.length > 3 && (
              <span className="text-xs text-gray-500">
                +{template.variables.length - 3} more
              </span>
            )}
          </div>

          {!template.isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditTemplate(template);
              }}
              className="text-gray-400 hover:text-blue-600 p-1"
            >
              <FiEdit3 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const TemplateEditor = ({ template, onSave, onCancel }) => {
    const [formData, setFormData] = useState(template);
    const [availableVariables] = useState([
      'parentName', 'learnerName', 'schoolName', 'grade', 'prCode', 'shortUrl',
      'contactEmail', 'contactNumber', 'principalName', 'eventName', 'eventDate',
      'eventTime', 'eventLocation', 'eventDescription', 'currentGrade', 'performanceRating',
      'achievements', 'nextSteps', 'teacherName', 'subject', 'alertType', 'alertMessage',
      'actionRequired', 'amountDue', 'dueDate', 'paymentMethods', 'portalUrl',
      'bankDetails', 'officeHours'
    ]);

    const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVariableInsert = (variable, field) => {
      const currentValue = formData[field] || '';
      const newValue = `${currentValue}{{${variable}}}`;
      handleChange(field, newValue);
    };

    const extractVariables = (text) => {
      const matches = text.match(/\{\{(\w+)\}\}/g) || [];
      return [...new Set(matches.map(match => match.replace(/\{\{|\}\}/g, '')))];
    };

    const handleContentChange = (content) => {
      handleChange('content', content);
      // Auto-extract variables from content
      const extractedVars = extractVariables(content);
      const subjectVars = extractVariables(formData.subject || '');
      const allVars = [...new Set([...extractedVars, ...subjectVars])];
      handleChange('variables', allVars);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {template.isDefault ? 'Edit' : 'Create'} Template
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(formData)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Template
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={2}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channels
                  </label>
                  <div className="flex space-x-4">
                    {['whatsapp', 'sms', 'email'].map(channel => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={(e) => {
                            const newChannels = e.target.checked
                              ? [...formData.channels, channel]
                              : formData.channels.filter(c => c !== channel);
                            handleChange('channels', newChannels);
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {channel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email subject line..."
                  />
                </div>
              </div>

              {/* Right Column - Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={8}
                  className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter your message template..."
                />

                {/* Variables Panel */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Variables
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableVariables.map(variable => (
                      <button
                        key={variable}
                        onClick={() => handleVariableInsert(variable, 'content')}
                        className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <span className="font-mono text-purple-600">{`{{${variable}}}`}</span>
                        <div className="text-gray-500 mt-1">{variable}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">PR Code Templates</h2>
          <p className="text-sm text-gray-600">Professional templates with PR code integration</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="h-4 w-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
        {templateCategories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              <span>{category.name}</span>
              <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {allTemplates.length === 0 && (
        <div className="text-center py-12">
          <FiBook className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first template to get started with PR code messaging</p>
          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Template
          </button>
        </div>
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowTemplateEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default PRCodeTemplates;