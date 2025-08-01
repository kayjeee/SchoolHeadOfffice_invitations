import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCopy, FiEye, FiMail, FiFileText, FiMessageSquare, FiSmartphone, FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers, FiZap, FiClock, FiStar } from 'react-icons/fi';

// Enhanced TemplateManager Component
const TemplateManager = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'WhatsApp Welcome - New Learner',
      subject: 'Welcome to {{schoolName}} - {{gradeName}} 🎓',
      type: 'welcome',
      channels: ['whatsapp'],
      isDefault: true,
      lastModified: '2024-01-15',
      usageCount: 145,
      engagement: 98,
      content: `🎉 Welcome to {{schoolName}}!

Hi {{parentName}}, we're excited to have {{learnerName}} join our {{gradeName}} class!

📋 Quick Details:
• Start Date: {{startDate}}
• Teacher: {{teacherName}}
• School Hours: 8:00 AM - 3:00 PM

✅ Next Steps:
Please ensure all enrollment documents are complete.

Questions? Reply to this message anytime!

Best regards,
{{schoolName}} Team 📚`
    },
    {
      id: 2,
      name: 'Multi-Channel Grade Assignment',
      subject: '{{learnerName}} has been assigned to {{gradeName}}',
      type: 'assignment',
      channels: ['whatsapp', 'sms', 'email'],
      isDefault: false,
      lastModified: '2024-01-10',
      usageCount: 89,
      engagement: 94,
      content: `Dear {{parentName}},

{{learnerName}} has been successfully assigned to {{gradeName}} at {{schoolName}}.

Class Details:
- Grade: {{gradeName}}
- Teacher: {{teacherName}}
- Room: {{classroomNumber}}
- Academic Year: {{academicYear}}

For questions, contact us at {{contactEmail}}.

Best regards,
{{schoolName}} Administration`
    },
    {
      id: 3,
      name: 'WhatsApp Parent Portal Access',
      subject: 'Your Parent Portal Access 🔐',
      type: 'portal',
      channels: ['whatsapp', 'email'],
      isDefault: false,
      lastModified: '2024-01-08',
      usageCount: 267,
      engagement: 96,
      content: `🔐 Your {{schoolName}} Parent Portal is ready!

Hi {{parentName}},

Your account details:
🌐 Website: {{portalUrl}}
👤 Username: {{username}}
🔑 Temp Password: {{tempPassword}}

⚠️ Please log in and change your password immediately.

Need help? Just reply to this message!

{{schoolName}} IT Team 💻`
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const templateTypes = [
    { value: 'welcome', label: 'Welcome Message', color: 'bg-blue-100 text-blue-800', icon: FiUsers },
    { value: 'assignment', label: 'Grade Assignment', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
    { value: 'portal', label: 'Portal Access', color: 'bg-purple-100 text-purple-800', icon: FiZap },
    { value: 'reminder', label: 'Reminder', color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
    { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800', icon: FiFileText }
  ];

  const availableVariables = [
    '{{schoolName}}', '{{gradeName}}', '{{learnerName}}', '{{parentName}}',
    '{{teacherName}}', '{{startDate}}', '{{academicYear}}', '{{classroomNumber}}',
    '{{portalUrl}}', '{{username}}', '{{tempPassword}}', '{{contactEmail}}',
    '{{contactPhone}}', '{{schoolAddress}}'
  ];

  const channelOptions = [
    { id: 'whatsapp', name: 'WhatsApp', icon: FiMessageSquare, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'sms', name: 'SMS', icon: FiSmartphone, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'email', name: 'Email', icon: FiMail, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ];

  // Filter templates based on search and type
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

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

  const getTypeConfig = (type) => {
    return templateTypes.find(t => t.value === type) || templateTypes[templateTypes.length - 1];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const getEngagementColor = (engagement) => {
    if (engagement >= 95) return 'text-green-600';
    if (engagement >= 90) return 'text-blue-600';
    if (engagement >= 85) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2">
              📧 Email Templates
            </h3>
            <p className="text-blue-100 text-lg">
              Create powerful, multi-channel templates with WhatsApp prioritization
            </p>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            New Template
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {templateTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const typeConfig = getTypeConfig(template.type);
            const TypeIcon = typeConfig.icon;
            
            return (
              <div key={template.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
                        <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{template.name}</h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                      {template.isDefault && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          <FiStar className="mr-1 h-3 w-3" />
                          Default
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEngagementColor(template.engagement)} bg-opacity-10`}>
                        {template.engagement}% engagement
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.subject}</p>

                    {/* Channel Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">{template.channels.map(channelId => {
                        const channel = channelOptions.find(c => c.id === channelId);
                        if (!channel) return null;
                        const ChannelIcon = channel.icon;
                        
                        return (
                          <div key={channelId} className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${channel.bgColor} ${channel.color}`}>
                            <ChannelIcon className="mr-1 h-3 w-3" />
                            {channel.name}
                            {channelId === 'whatsapp' && <span className="ml-1">🚀</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Modified: {formatDate(template.lastModified)}</span>
                      <span>Used: {template.usageCount} times</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <FiCopy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Create your first template to get started.'}
            </p>
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Create Template
            </button>
          </div>
        )}

        {/* Available Variables Panel */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <FiZap className="mr-2 text-blue-600" />
            Available Variables
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Click any variable to copy it. These will be automatically replaced with real data when sending.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableVariables.map((variable) => (
              <button
                key={variable}
                className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-mono bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer transform hover:scale-105"
                onClick={() => navigator.clipboard.writeText(variable)}
                title="Click to copy"
              >
                {variable}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <TemplateModal
          template={selectedTemplate}
          templateTypes={templateTypes}
          availableVariables={availableVariables}
          channelOptions={channelOptions}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onSave={(templateData) => {
            if (selectedTemplate) {
              setTemplates(templates.map(t => 
                t.id === selectedTemplate.id 
                  ? { ...t, ...templateData, lastModified: new Date().toISOString().split('T')[0] }
                  : t
              ));
            } else {
              const newTemplate = {
                ...templateData,
                id: Math.max(...templates.map(t => t.id)) + 1,
                usageCount: 0,
                engagement: templateData.channels.includes('whatsapp') ? 98 : 85,
                lastModified: new Date().toISOString().split('T')[0]
              };
              setTemplates([...templates, newTemplate]);
            }
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {showPreviewModal && selectedTemplate && (
        <PreviewModal
          template={selectedTemplate}
          channelOptions={channelOptions}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Enhanced Template Modal Component
const TemplateModal = ({ template, templateTypes, availableVariables, channelOptions, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    type: template?.type || 'custom',
    content: template?.content || '',
    channels: template?.channels || ['whatsapp'],
    isDefault: template?.isDefault || false
  });

  const [characterCount, setCharacterCount] = useState(0);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    setCharacterCount(formData.content.length);
  }, [formData.content]);

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
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const handleChannelToggle = (channelId) => {
    const newChannels = formData.channels.includes(channelId)
      ? formData.channels.filter(id => id !== channelId)
      : [...formData.channels, channelId];
    
    // Ensure at least one channel is selected
    if (newChannels.length > 0) {
      setFormData({ ...formData, channels: newChannels });
    }
  };

  const getCharacterLimitForChannels = () => {
    if (formData.channels.includes('sms')) return 160;
    if (formData.channels.includes('whatsapp')) return 4096;
    return 2000;
  };

  const characterLimit = getCharacterLimitForChannels();
  const isOverLimit = characterCount > characterLimit;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {template ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button type="button" onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
                {[
                  { id: 'content', label: 'Content', icon: FiFileText },
                  { id: 'channels', label: 'Channels', icon: FiMessageSquare },
                  { id: 'settings', label: 'Settings', icon: FiUsers }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <TabIcon className="mr-2 h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  {activeTab === 'content' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Template Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., WhatsApp Welcome Message"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Subject Line</label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Use variables like {{schoolName}} and {{learnerName}}"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-bold text-gray-900">Message Content</label>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${isOverLimit ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                              {characterCount}/{characterLimit} characters
                            </span>
                            {formData.channels.includes('whatsapp') && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                WhatsApp optimized
                              </span>
                            )}
                          </div>
                        </div>
                        <textarea
                          id="template-content"
                          rows={12}
                          required
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent resize-none ${
                            isOverLimit 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-200 focus:ring-blue-500'
                          }`}
                          placeholder="Write your message template here. Use variables to personalize content."
                        />
                        {isOverLimit && (
                          <p className="mt-2 text-sm text-red-600">
                            Message exceeds character limit for selected channels
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'channels' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Select Delivery Channels</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {channelOptions.map(channel => {
                            const ChannelIcon = channel.icon;
                            const isSelected = formData.channels.includes(channel.id);
                            
                            return (
                              <div
                                key={channel.id}
                                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleChannelToggle(channel.id)}
                              >
                                {channel.id === 'whatsapp' && (
                                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    RECOMMENDED
                                  </div>
                                )}
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${channel.bgColor}`}>
                                    <ChannelIcon className={`h-6 w-6 ${channel.color}`} />
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-gray-900">{channel.name}</h5>
                                    <p className="text-sm text-gray-500">
                                      {channel.id === 'whatsapp' && 'FREE • 98% open rate'}
                                      {channel.id === 'sms' && '0.15 credits • 94% open rate'}
                                      {channel.id === 'email' && '0.08 credits • 85% open rate'}
                                    </p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleChannelToggle(channel.id)}
                                    className="ml-auto h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Template Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {templateTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={formData.isDefault}
                          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor="isDefault" className="font-medium text-gray-900">
                            Set as default template
                          </label>
                          <p className="text-sm text-gray-500">
                            This template will be pre-selected when creating new invitations
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Variable Helper Sidebar */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <FiZap className="mr-2 text-blue-600" />
                    Insert Variables
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableVariables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="w-full text-left px-3 py-2 text-xs font-mono bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                  
                  {/* WhatsApp Tips */}
                  {formData.channels.includes('whatsapp') && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="text-sm font-bold text-green-800 mb-2">💡 WhatsApp Tips</h5>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Use emojis to increase engagement</li>
                        <li>• Keep messages personal and friendly</li>
                        <li>• Break text into short paragraphs</li>
                        <li>• Use bullet points for clarity</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FiMessageSquare className="h-4 w-4" />
                  <span>{formData.channels.length} channel{formData.channels.length !== 1 ? 's' : ''} selected</span>
                </div>
                {formData.channels.includes('whatsapp') && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <FiCheckCircle className="h-4 w-4" />
                    <span>WhatsApp optimized</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOverLimit}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    isOverLimit
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {template ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Enhanced Preview Modal Component
const PreviewModal = ({ template, channelOptions, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState(template.channels[0] || 'whatsapp');
  
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
      preview = preview.replace(new RegExp(variable.replace(/[{}]/g, '\\                  <div className="space-y-2 max-h-96 overflow-y'), 'g'), value);
    });
    return preview;
  };

  const getChannelPreviewStyle = (channelId) => {
    switch (channelId) {
      case 'whatsapp':
        return 'bg-green-500 text-white rounded-2xl rounded-bl-sm p-4 max-w-sm ml-auto';
      case 'sms':
        return 'bg-blue-100 border border-blue-300 rounded-lg p-4';
      case 'email':
        return 'bg-white border border-gray-300 rounded-lg p-6 shadow-sm';
      default:
        return 'bg-gray-100 rounded-lg p-4';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                📱 Template Preview: {template.name}
              </h3>
              <button type="button" onClick={onClose} className="text-white hover:text-gray-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Channel Selector */}
            {template.channels.length > 1 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Preview Channel:</h4>
                <div className="flex space-x-2">
                  {template.channels.map(channelId => {
                    const channel = channelOptions.find(c => c.id === channelId);
                    if (!channel) return null;
                    const ChannelIcon = channel.icon;
                    
                    return (
                      <button
                        key={channelId}
                        onClick={() => setSelectedChannel(channelId)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                          selectedChannel === channelId
                            ? `${channel.bgColor} ${channel.color} ring-2 ring-blue-200`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ChannelIcon className="h-4 w-4" />
                        <span>{channel.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subject Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-2">
                <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-bold text-gray-700">Subject:</span>
              </div>
              <p className="text-gray-900 font-medium">{renderPreview(template.subject)}</p>
            </div>

            {/* Message Preview */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-bold text-gray-700">Message Preview:</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {selectedChannel.toUpperCase()}
                </span>
              </div>
              
              {/* Channel-specific preview styling */}
              <div className={`${selectedChannel === 'whatsapp' ? 'bg-gray-100 p-6 rounded-2xl' : ''}`}>
                <div className={getChannelPreviewStyle(selectedChannel)}>
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                    {renderPreview(template.content)}
                  </pre>
                  {selectedChannel === 'whatsapp' && (
                    <div className="text-xs text-gray-300 mt-2 text-right">
                      ✓✓ Read {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Template Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{template.engagement}%</div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{template.usageCount}</div>
                <div className="text-sm text-gray-600">Times Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{template.channels.length}</div>
                <div className="text-sm text-gray-600">Channel{template.channels.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>* This preview uses sample data. Actual messages will use real learner and school information.</p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;