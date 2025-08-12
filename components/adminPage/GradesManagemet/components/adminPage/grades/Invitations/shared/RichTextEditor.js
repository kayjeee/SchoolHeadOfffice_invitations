import React, { useState, useRef, useEffect } from 'react';

/**
 * RichTextEditor component with basic formatting capabilities
 * Features: bold, italic, underline, lists, links, basic HTML editing
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  minHeight = '200px',
  disabled = false
}) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFocus = () => {
    setIsEditorFocused(true);
  };

  const handleBlur = () => {
    setIsEditorFocused(false);
    handleInput(); // Ensure final content is saved
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    setSelectedText(selection.toString());
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const formatBlock = (tag) => {
    execCommand('formatBlock', tag);
  };

  const isCommandActive = (command) => {
    return document.queryCommandState(command);
  };

  const toolbarButtons = [
    {
      command: 'bold',
      icon: 'B',
      title: 'Bold',
      style: { fontWeight: 'bold' }
    },
    {
      command: 'italic',
      icon: 'I',
      title: 'Italic',
      style: { fontStyle: 'italic' }
    },
    {
      command: 'underline',
      icon: 'U',
      title: 'Underline',
      style: { textDecoration: 'underline' }
    },
    {
      command: 'insertUnorderedList',
      icon: '•',
      title: 'Bullet List'
    },
    {
      command: 'insertOrderedList',
      icon: '1.',
      title: 'Numbered List'
    },
    {
      command: 'justifyLeft',
      icon: '⫷',
      title: 'Align Left'
    },
    {
      command: 'justifyCenter',
      icon: '⫸',
      title: 'Align Center'
    },
    {
      command: 'justifyRight',
      icon: '⫸',
      title: 'Align Right'
    }
  ];

  return (
    <div className={`rich-text-editor ${className} ${disabled ? 'disabled' : ''}`}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          {/* Format Dropdown */}
          <select
            onChange={(e) => formatBlock(e.target.value)}
            className="format-select"
            disabled={disabled}
          >
            <option value="div">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="p">Paragraph</option>
          </select>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          {/* Basic Formatting */}
          {toolbarButtons.map(button => (
            <button
              key={button.command}
              type="button"
              onClick={() => execCommand(button.command)}
              className={`toolbar-button ${isCommandActive(button.command) ? 'active' : ''}`}
              title={button.title}
              disabled={disabled}
              style={button.style}
            >
              {button.icon}
            </button>
          ))}
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          {/* Link and Image */}
          <button
            type="button"
            onClick={insertLink}
            className="toolbar-button"
            title="Insert Link"
            disabled={disabled || !selectedText}
          >
            🔗
          </button>
          
          <button
            type="button"
            onClick={insertImage}
            className="toolbar-button"
            title="Insert Image"
            disabled={disabled}
          >
            🖼️
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => execCommand('undo')}
            className="toolbar-button"
            title="Undo"
            disabled={disabled}
          >
            ↶
          </button>
          
          <button
            type="button"
            onClick={() => execCommand('redo')}
            className="toolbar-button"
            title="Redo"
            disabled={disabled}
          >
            ↷
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        className={`editor-content ${isEditorFocused ? 'focused' : ''}`}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Editor Status */}
      <div className="editor-status">
        <div className="status-info">
          {value && (
            <>
              <span className="word-count">
                {value.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length} words
              </span>
              <span className="char-count">
                {value.replace(/<[^>]*>/g, '').length} characters
              </span>
            </>
          )}
        </div>
        
        {selectedText && (
          <div className="selection-info">
            Selected: {selectedText.length} characters
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;

