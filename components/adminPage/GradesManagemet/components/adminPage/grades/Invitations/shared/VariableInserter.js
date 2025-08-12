import React, { useState } from 'react';
import SearchInput from './SearchInput';

/**
 * VariableInserter component for inserting dynamic variables into text
 * Features: variable categories, search, preview, descriptions
 */
const VariableInserter = ({
  variables = [],
  onVariableInsert,
  onClose,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Group variables by category
  const getVariablesByCategory = () => {
    const grouped = variables.reduce((acc, variable) => {
      const category = variable.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(variable);
      return acc;
    }, {});

    return grouped;
  };

  // Filter variables based on search and category
  const getFilteredVariables = () => {
    let filtered = variables;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => (v.category || 'general') === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(variables.map(v => v.category || 'general'))];
    return categories;
  };

  const handleVariableClick = (variable) => {
    onVariableInsert(variable);
  };

  const variablesByCategory = getVariablesByCategory();
  const filteredVariables = getFilteredVariables();
  const categories = getCategories();

  return (
    <div className={`variable-inserter ${className}`}>
      <div className="inserter-header">
        <h4>Insert Variables</h4>
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close variable inserter"
        >
          ×
        </button>
      </div>

      <div className="inserter-controls">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search variables..."
          className="variable-search"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : 
               category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="variables-content">
        {filteredVariables.length === 0 ? (
          <div className="no-variables">
            {searchTerm || selectedCategory !== 'all'
              ? 'No variables match your search criteria'
              : 'No variables available'
            }
          </div>
        ) : (
          <div className="variables-list">
            {filteredVariables.map(variable => (
              <VariableItem
                key={variable.key}
                variable={variable}
                onClick={() => handleVariableClick(variable)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="inserter-footer">
        <div className="usage-info">
          <h5>How to use variables:</h5>
          <ul>
            <li>Click on a variable to insert it at the cursor position</li>
            <li>Variables are replaced with actual data when emails are sent</li>
            <li>Use variables to personalize your messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual variable item component
 */
const VariableItem = ({ variable, onClick }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getVariableTag = () => {
    return `{{${variable.key}}}`;
  };

  const getExampleValue = () => {
    return variable.example || 'Sample Value';
  };

  return (
    <div className="variable-item">
      <div className="variable-main" onClick={onClick}>
        <div className="variable-info">
          <div className="variable-name">{variable.name}</div>
          <div className="variable-key">{getVariableTag()}</div>
          {variable.description && (
            <div className="variable-description">{variable.description}</div>
          )}
        </div>
        
        <div className="variable-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(!showPreview);
            }}
            className="preview-button"
            title="Preview variable"
          >
            👁️
          </button>
          
          <button
            onClick={onClick}
            className="insert-button"
            title="Insert variable"
          >
            +
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="variable-preview">
          <div className="preview-label">Preview:</div>
          <div className="preview-value">
            {getExampleValue()}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Quick variable buttons for common variables
 */
export const QuickVariables = ({ variables, onVariableInsert }) => {
  const commonVariables = variables.filter(v => v.isCommon);

  if (commonVariables.length === 0) return null;

  return (
    <div className="quick-variables">
      <div className="quick-variables-label">Quick Insert:</div>
      <div className="quick-variables-buttons">
        {commonVariables.map(variable => (
          <button
            key={variable.key}
            onClick={() => onVariableInsert(variable)}
            className="quick-variable-button"
            title={variable.description}
          >
            {variable.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariableInserter;

