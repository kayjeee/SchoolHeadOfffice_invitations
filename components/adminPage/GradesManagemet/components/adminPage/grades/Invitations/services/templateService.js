import api from './api';

/**
 * Template Service - Handles PR code template management
 */
export const templateService = {
  // Get all templates
  getTemplates: async (filters = {}) => {
    try {
      const response = await api.get('/pr_code_templates', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get a specific template
  getTemplate: async (templateId) => {
    try {
      const response = await api.get(`/pr_code_templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  // Create a new template
  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/pr_code_templates', {
        pr_code_template: {
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          channels: templateData.channels,
          subject: templateData.subject,
          content: templateData.content,
          variables: templateData.variables,
          school_id: templateData.schoolId,
          is_default: templateData.isDefault,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update a template
  updateTemplate: async (templateId, updates) => {
    try {
      const response = await api.put(`/pr_code_templates/${templateId}`, {
        pr_code_template: updates
      });
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/pr_code_templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Preview template with sample data
  previewTemplate: async (templateId, sampleData = {}) => {
    try {
      const response = await api.post(`/pr_code_templates/${templateId}/preview`, {
        sample_data: sampleData
      });
      return response.data;
    } catch (error) {
      console.error('Error previewing template:', error);
      throw error;
    }
  },

  // Apply template to generate actual content
  applyTemplate: async (templateId, variables) => {
    try {
      const response = await api.post(`/pr_code_templates/${templateId}/apply`, {
        variables: variables
      });
      return response.data;
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  }
};

export default templateService;