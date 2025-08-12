import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import WhatsAppBusinessService from '../../services/WhatsAppBusinessService';
import { invitationService } from '../../../../../services/invitation/invitationService';

const TemplateSelector = ({ selectedTemplate, onTemplateSelect, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: 'parent_invitation_v2',
    category: 'utility',
    language: 'en',
    components: [{ type: 'body', text: '' }]
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load both traditional templates and WhatsApp Business templates
      const [traditionalTemplates, whatsappTemplates] = await Promise.all([
        invitationService.getInvitationTemplates().catch(() => []),
        WhatsAppBusinessService.getTemplates().catch(() => [])
      ]);

      // Merge and format templates
      const allTemplates = [
        ...traditionalTemplates.map(t => ({ ...t, source: 'traditional' })),
        ...whatsappTemplates.map(t => ({ 
          ...t, 
          source: 'whatsapp',
          content: t.components?.find(c => c.type === 'body')?.text || '',
          subject: t.name.replace(/_/g, ' ').toUpperCase()
        }))
      ];

      setTemplates(allTemplates);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(templates.map(t => t.category).filter(Boolean))];
    return categories;
  };

  const getFilteredTemplates = () => {
    let filtered = templates;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleTemplateSelect = (template) => {
    onTemplateSelect?.(template);
    onClose?.();
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleCreateTemplate = async () => {
    try {
      setIsCreating(true);
      
      if (newTemplate.components[0].text.trim()) {
        // Create WhatsApp Business template
        await WhatsAppBusinessService.createTemplate(newTemplate);
        
        // Reload templates
        await loadTemplates();
        
        // Reset form
        setNewTemplate({
          name: 'parent_invitation_v2',
          category: 'utility',
          language: 'en',
          components: [{ type: 'body', text: '' }]
        });
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Failed to create template');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        if (template.source === 'whatsapp') {
          await WhatsAppBusinessService.deleteTemplate(template.name);
        } else {
          await invitationService.deleteTemplate(template.id);
        }
        await loadTemplates();
      } catch (err) {
        console.error('Error deleting template:', err);
        setError('Failed to delete template');
      }
    }
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Template Manager</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Create Template
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-gray-600">Loading templates...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12">
              <AlertCircle className="text-red-500 mb-4" size={32} />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadTemplates}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 text-lg">No templates found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search or create a new template</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map(template => (
                    <TemplateCard
                      key={`${template.source}-${template.id || template.name}`}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id || selectedTemplate?.name === template.name}
                      onSelect={() => handleTemplateSelect(template)}
                      onPreview={() => handlePreview(template)}
                      onDelete={() => handleDeleteTemplate(template)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Template Modal */}
        {showCreateForm && (
          <CreateTemplateModal
            template={newTemplate}
            onTemplateChange={setNewTemplate}
            onSave={handleCreateTemplate}
            onCancel={() => setShowCreateForm(false)}
            isCreating={isCreating}
          />
        )}

        {/* Template Preview Modal */}
        {showPreview && previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onClose={() => setShowPreview(false)}
            onSelect={() => {
              handleTemplateSelect(previewTemplate);
              setShowPreview(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Individual template card component
 */
const TemplateCard = ({ template, isSelected, onSelect, onPreview, onDelete }) => {
  return (
    <div className={`bg-white border-2 rounded-lg p-4 transition-all hover:shadow-md ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
              {template.category || 'General'}
            </span>
            {template.source === 'whatsapp' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                WhatsApp
              </span>
            )}
            {template.isCustom && (
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                Custom
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Preview template"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete template"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">
          {template.subject || template.name.replace(/_/g, ' ')}
        </p>
        <p className="text-xs text-gray-500 line-clamp-3">
          {template.description || template.content?.substring(0, 100) + '...' || 'No description'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={onSelect}
          className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
            isSelected
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSelected ? (
            <span className="flex items-center justify-center">
              <CheckCircle size={14} className="mr-1" />
              Selected
            </span>
          ) : (
            'Use Template'
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Template preview modal component
 */
const TemplatePreviewModal = ({ template, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Subject:</h4>
              <div className="p-3 bg-gray-50 rounded border text-sm">
                {template.subject || template.name.replace(/_/g, ' ')}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Message Content:</h4>
              <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                {template.content || 'No content available'}
              </div>
            </div>
            
            {template.variables && template.variables.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Variables:</h4>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map(variable => (
                    <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onSelect}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Create template modal component
 */
const CreateTemplateModal = ({ template, onTemplateChange, onSave, onCancel, isCreating }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Create New Template</h3>
          <button 
            onClick={onCancel} 
            className="p-1 text-gray-400 hover:text-gray-600"
            disabled={isCreating}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => onTemplateChange({ ...template, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., parent_invitation_v2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={template.category}
              onChange={(e) => onTemplateChange({ ...template, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="utility">Utility</option>
              <option value="marketing">Marketing</option>
              <option value="authentication">Authentication</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              rows={8}
              value={template.components[0].text}
              onChange={(e) => onTemplateChange({
                ...template,
                components: [{ type: 'body', text: e.target.value }]
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your template message..."
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            disabled={isCreating || !template.components[0].text.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Creating...
              </>
            ) : (
              'Create Template'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;