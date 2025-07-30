import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiEye, FiMail, FiFileText } from 'react-icons/fi';

const TemplateManager = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome New Learner',
      subject: 'Welcome to {{schoolName}} - {{gradeName}}',
      type: 'welcome',
      isDefault: true,
      lastModified: '2024-01-15',
      usageCount: 45,
      content: `Dear {{parentName}},

Welcome to {{schoolName}}! We are excited to have {{learnerName}} join our {{gradeName}} class.

Here are the important details:
- Start Date: {{startDate}}
- Class Teacher: {{teacherName}}
- School Hours: 8:00 AM - 3:00 PM

Please ensure you have completed all enrollment requirements.

Best regards,
{{schoolName}} Administration`
    },
    {
      id: 2,
      name: 'Grade Assignment Notification',
      subject: '{{learnerName}} has been assigned to {{gradeName}}',
      type: 'assignment',
      isDefault: false,
      lastModified: '2024-01-10',
      usageCount: 23,
      content: `Dear {{parentName}},

This is to inform you that {{learnerName}} has been successfully assigned to {{gradeName}} at {{schoolName}}.

Class Details:
- Grade: {{gradeName}}
- Class Teacher: {{teacherName}}
- Classroom: {{classroomNumber}}
- Academic Year: {{academicYear}}

If you have any questions, please contact us.

Best regards,
{{schoolName}} Administration`
    },
    {
      id: 3,
      name: 'Parent Portal Access',
      subject: 'Your Parent Portal Access for {{schoolName}}',
      type: 'portal',
      isDefault: false,
      lastModified: '2024-01-08',
      usageCount: 67,
      content: `Dear {{parentName}},

Your parent portal account has been created for {{schoolName}}.

Login Details:
- Website: {{portalUrl}}
- Username: {{username}}
- Temporary Password: {{tempPassword}}

Please log in and change your password immediately.

Best regards,
{{schoolName}} IT Support`
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const templateTypes = [
    { value: 'welcome', label: 'Welcome Message', color: 'bg-blue-100 text-blue-800' },
    { value: 'assignment', label: 'Grade Assignment', color: 'bg-green-100 text-green-800' },
    { value: 'portal', label: 'Portal Access', color: 'bg-purple-100 text-purple-800' },
    { value: 'reminder', label: 'Reminder', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800' }
  ];

  const availableVariables = [
    '{{schoolName}}', '{{gradeName}}', '{{learnerName}}', '{{parentName}}',
    '{{teacherName}}', '{{startDate}}', '{{academicYear}}', '{{classroomNumber}}',
    '{{portalUrl}}', '{{username}}', '{{tempPassword}}', '{{contactEmail}}',
    '{{contactPhone}}', '{{schoolAddress}}'
  ];

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDuplicateTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Math.max(...templates.map(t => t.id)) + 1,
      name: `${template.name} (Copy)`,
      isDefault: false,
      usageCount: 0,
      lastModified: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const getTypeColor = (type) => {
    const typeConfig = templateTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Email Templates
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage invitation and notification email templates
            </p>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            New Template
          </button>
        </div>

        {/* Templates List */}
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                      {templateTypes.find(t => t.value === template.type)?.label || template.type}
                    </span>
                    {template.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{template.subject}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Modified: {formatDate(template.lastModified)}</span>
                    <span>Used: {template.usageCount} times</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Preview"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Duplicate"
                  >
                    <FiCopy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Available Variables */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables</h4>
          <p className="text-xs text-gray-500 mb-3">
            Use these variables in your templates. They will be replaced with actual values when sending invitations.
          </p>
          <div className="flex flex-wrap gap-2">
            {availableVariables.map((variable) => (
              <span
                key={variable}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                onClick={() => navigator.clipboard.writeText(variable)}
                title="Click to copy"
              >
                {variable}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <TemplateModal
          template={selectedTemplate}
          templateTypes={templateTypes}
          availableVariables={availableVariables}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onSave={(templateData) => {
            if (selectedTemplate) {
              // Edit existing template
              setTemplates(templates.map(t => 
                t.id === selectedTemplate.id 
                  ? { ...t, ...templateData, lastModified: new Date().toISOString().split('T')[0] }
                  : t
              ));
            } else {
              // Create new template
              const newTemplate = {
                ...templateData,
                id: Math.max(...templates.map(t => t.id)) + 1,
                usageCount: 0,
                lastModified: new Date().toISOString().split('T')[0]
              };
              setTemplates([...templates, newTemplate]);
            }
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Preview Template Modal */}
      {showPreviewModal && selectedTemplate && (
        <PreviewModal
          template={selectedTemplate}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Template Creation/Edit Modal Component
const TemplateModal = ({ template, templateTypes, availableVariables, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    type: template?.type || 'custom',
    content: template?.content || '',
    isDefault: template?.isDefault || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = formData.content.substring(0, start) + variable + formData.content.substring(end);
    setFormData({ ...formData, content: newContent });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {template ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {templateTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                        Set as default template
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Use variables like {{schoolName}} and {{learnerName}}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Content</label>
                    <textarea
                      id="template-content"
                      rows={12}
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Write your email template here. Use variables to personalize the content."
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Insert Variables</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableVariables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="w-full text-left px-3 py-2 text-xs font-mono bg-gray-100 hover:bg-gray-200 rounded border"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {template ? 'Update Template' : 'Create Template'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ template, onClose }) => {
  const sampleData = {
    '{{schoolName}}': 'Greenwood Primary School',
    '{{gradeName}}': 'Grade 5A',
    '{{learnerName}}': 'Sarah Johnson',
    '{{parentName}}': 'David Johnson',
    '{{teacherName}}': 'Mrs. Smith',
    '{{startDate}}': '2024-02-01',
    '{{academicYear}}': '2024',
    '{{classroomNumber}}': 'Room 15',
    '{{portalUrl}}': 'https://portal.greenwoodprimary.edu',
    '{{username}}': 'djohnson@email.com',
    '{{tempPassword}}': 'TempPass123',
    '{{contactEmail}}': 'admin@greenwoodprimary.edu',
    '{{contactPhone}}': '+27 21 123 4567',
    '{{schoolAddress}}': '123 Education Street, Cape Town'
  };

  const renderPreview = (text) => {
    let preview = text;
    Object.entries(sampleData).forEach(([variable, value]) => {
      preview = preview.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return preview;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Template Preview: {template.name}
              </h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Subject:</span>
              </div>
              <p className="text-sm text-gray-900 font-medium">{renderPreview(template.subject)}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Email Content:</span>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                  {renderPreview(template.content)}
                </pre>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>* This preview uses sample data. Actual emails will use real learner and school information.</p>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;

