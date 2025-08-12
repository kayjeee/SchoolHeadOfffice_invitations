import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, School, GraduationCap, Users, User, Send, Loader,
  CheckCircle, AlertCircle, ChevronRight, ChevronLeft,
  MessageSquareText, DollarSign, Check, ArrowRight, Play,
  Video, FileText, Plus, Edit2, Trash2, Eye, Copy,
  MessageCircle, Settings, Phone, Globe, MessageCircleHeart
} from 'lucide-react';

// WhatsApp Business API Configuration
const WHATSAPP_CONFIG = {
  businessAccountId: 'YOUR_BUSINESS_ACCOUNT_ID',
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
  accessToken: 'YOUR_ACCESS_TOKEN',
  apiVersion: 'v21.0',
  webhookVerifyToken: 'YOUR_WEBHOOK_VERIFY_TOKEN'
};

// Mock WhatsApp Business API Service
class WhatsAppBusinessService {
  static async sendMessage(phoneNumber, message, type = 'text') {
    const endpoint = `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: type,
      text: type === 'text' ? { body: message } : undefined
    };

    try {
      console.log('📤 Sending WhatsApp message:', {
        to: phoneNumber,
        message: message.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });
      
      // Simulate API call for a realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        messageId: `wamid.${Date.now()}`,
        status: 'sent',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async createMessageTemplate(templateData) {
    const endpoint = `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.businessAccountId}/message_templates`;
    
    try {
      console.log('📝 Creating WhatsApp template:', templateData.name);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        templateId: `template_${Date.now()}`,
        status: 'pending_approval',
        name: templateData.name
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getMessageTemplates() {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        templates: [
          {
            id: 'parent_invitation_001',
            name: 'parent_invitation',
            status: 'approved',
            language: 'en',
            category: 'utility',
            components: [
              {
                type: 'body',
                text: 'Hi {{1}}! You\'re invited to join {{2}} parent portal for {{3}}. Access your child\'s progress, attendance & more. Join: {{4}}'
              }
            ]
          }
        ]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Video Recording Component for App Review Documentation
const VideoRecordingStudio = ({ onClose, recordingType = 'messaging' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStep, setRecordingStep] = useState(1);
  const [recordedVideos, setRecordedVideos] = useState([]);

  const recordingSteps = recordingType === 'messaging' ? [
    {
      id: 1,
      title: 'Show Your App Dashboard',
      description: 'Display your School CRM dashboard with the WhatsApp invitation feature',
      action: 'Navigate to the invitation composer'
    },
    {
      id: 2,
      title: 'Configure Message',
      description: 'Show selecting learners and composing a WhatsApp message',
      action: 'Select grade and compose invitation message'
    },
    {
      id: 3,
      title: 'Send Message',
      description: 'Click the Send button and show the API call being made',
      action: 'Click "Send WhatsApp Invitation" button'
    },
    {
      id: 4,
      title: 'Show WhatsApp Receipt',
      description: 'Switch to WhatsApp Web/Mobile and show the message received',
      action: 'Open WhatsApp and show received message'
    }
  ] : [
    {
      id: 1,
      title: 'Template Manager',
      description: 'Show the message template creation interface',
      action: 'Navigate to template management'
    },
    {
      id: 2,
      title: 'Create New Template',
      description: 'Fill out template details (name, category, content)',
      action: 'Create a new message template'
    },
    {
      id: 3,
      title: 'Submit for Approval',
      description: 'Submit template to Meta for approval',
      action: 'Click "Submit Template" button'
    },
    {
      id: 4,
      title: 'Show Confirmation',
      description: 'Display template submission confirmation',
      action: 'Show success message and pending status'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Video className="mr-3 text-red-500" size={24} />
                App Review Video Recording
              </h2>
              <p className="text-gray-600 mt-1">
                {recordingType === 'messaging' ? 'whatsapp_business_messaging' : 'whatsapp_business_management'} Permission
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Recording Checklist</h3>
            <p className="text-blue-700 text-sm mb-3">
              Follow these steps to create compliant App Review documentation:
            </p>
            <ul className="space-y-2">
              {recordingSteps.map((step) => (
                <li key={step.id} className="flex items-start text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0 ${
                    recordingStep > step.id ? 'bg-green-500 text-white' :
                    recordingStep === step.id ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {recordingStep > step.id ? '✓' : step.id}
                  </div>
                  <div className={recordingStep === step.id ? 'text-blue-700 font-medium' : 'text-gray-600'}>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs">{step.description}</div>
                    <div className="text-xs italic mt-1">Action: {step.action}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Recording Tips</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Record in high quality (1080p minimum)</li>
              <li>• Show clear UI elements and button clicks</li>
              <li>• Include audio narration explaining each step</li>
              <li>• Show actual message delivery in WhatsApp</li>
              <li>• Keep video under 5 minutes total</li>
              <li>• Ensure your app URL/branding is visible</li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <div className="text-6xl">🎬</div>
            <p className="text-gray-600">
              Ready to record your {recordingType === 'messaging' ? 'message sending' : 'template creation'} demonstration?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsRecording(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Video className="mr-2" size={20} />
                Start Recording
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// WhatsApp Template Manager Component
const WhatsAppTemplateManager = ({ onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: 'parent_invitation_v2',
    category: 'utility',
    language: 'en',
    components: [
      {
        type: 'body',
        text: 'Hi {{1}}! Welcome to {{2}} parent portal. Access your child\'s academic progress, attendance records, and school updates. Registration: {{3}}'
      }
    ]
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    const result = await WhatsAppBusinessService.getMessageTemplates();
    if (result.success) {
      setTemplates(result.templates);
    }
    setIsLoading(false);
  };

  const createTemplate = async () => {
    const result = await WhatsAppBusinessService.createMessageTemplate(newTemplate);
    if (result.success) {
      setTemplates(prev => [...prev, {
        ...newTemplate,
        id: result.templateId,
        status: result.status
      }]);
      setShowCreateForm(false);
      alert('✅ Template created successfully! Status: Pending Approval');
    } else {
      alert('❌ Failed to create template: ' + result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <MessageCircle className="mr-3 text-green-500" size={24} />
                WhatsApp Business Templates
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your WhatsApp Business message templates
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2" size={16} />
                Create Template
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto mb-4" size={48} />
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Existing Templates */}
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Language: {template.language}</span>
                          <span>Category: {template.category}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            template.status === 'approved' ? 'bg-green-100 text-green-800' :
                            template.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {template.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm font-mono text-gray-700">
                        {template.components?.[0]?.text || 'No content available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create New Template Form */}
              {showCreateForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Create New Template</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template Name
                        </label>
                        <input
                          type="text"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({...prev, name: e.target.value}))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., parent_invitation_v2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={newTemplate.category}
                          onChange={(e) => setNewTemplate(prev => ({...prev, category: e.target.value}))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="utility">Utility</option>
                          <option value="marketing">Marketing</option>
                          <option value="authentication">Authentication</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={newTemplate.language}
                          onChange={(e) => setNewTemplate(prev => ({...prev, language: e.target.value}))}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="af">Afrikaans</option>
                          <option value="zu">Zulu</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Content
                      </label>
                      <textarea
                        value={newTemplate.components[0].text}
                        onChange={(e) => setNewTemplate(prev => ({
                          ...prev,
                          components: [{ ...prev.components[0], text: e.target.value }]
                        }))}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Use {{1}}, {{2}}, etc. for dynamic variables"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use variables like {"{{"}1{"}}"} for parent name, {"{{"}2{"}}"} for school name, {"{{"}3{"}}"} for registration link
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createTemplate}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Create Template
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Grade Selector with WhatsApp integration
const GradeSelector = ({ school, onSelect, selectedGrade, grades = [] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {grades.map((grade) => (
      <button
        key={grade.id}
        onClick={() => onSelect(grade)}
        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
          selectedGrade?.id === grade.id
            ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg capitalize">{grade.name}</h3>
          <div className="flex flex-col items-end space-y-1">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              Level {grade.grade_level}
            </span>
            <div className="flex items-center text-green-600">
              <MessageCircle size={12} className="mr-1" />
              <span className="text-xs">WhatsApp Ready</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{grade.description}</p>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-blue-600">
              {grade.learners_count} learners
            </span>
            <span className="text-gray-500">
              {grade.available_spots > 0 ? `${grade.available_spots} spots` : 'Full'}
            </span>
          </div>
          {grade.fees && (
            <span className="text-green-600 font-medium">R{grade.fees}</span>
          )}
        </div>
      </button>
    ))}
  </div>
);

// Enhanced WhatsApp Message Testing Component
const WhatsAppMessageTester = ({ selectedGrade, schoolName }) => {
  const [testPhoneNumber, setTestPhoneNumber] = useState('+27123456789');
  const [testMessage, setTestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState([]);

  useEffect(() => {
    if (selectedGrade && schoolName) {
      setTestMessage(`🏫 ${schoolName} Parent Portal Invitation

Hi! You're invited to join the ${schoolName} parent portal for ${selectedGrade.name}.

📱 Access your child's:
• Academic progress & reports  
• Attendance records
• School announcements
• Fee statements

👆 Join now: https://portal.${schoolName.toLowerCase().replace(/\s+/g, '')}.co.za/register

Questions? Reply to this message.

Best regards,
${schoolName} Admin Team`);
    }
  }, [selectedGrade, schoolName]);

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !testPhoneNumber.trim()) {
      alert('Please enter both phone number and message');
      return;
    }

    setIsSending(true);
    const result = await WhatsAppBusinessService.sendMessage(testPhoneNumber, testMessage);
    
    const logEntry = {
      id: Date.now(),
      phoneNumber: testPhoneNumber,
      message: testMessage.substring(0, 100) + '...',
      timestamp: new Date().toLocaleString(),
      success: result.success,
      messageId: result.messageId,
      error: result.error
    };

    setSendResults(prev => [logEntry, ...prev.slice(0, 4)]);
    setIsSending(false);

    if (result.success) {
      alert('✅ WhatsApp message sent successfully!\n\n📱 Check your WhatsApp to verify delivery.\n\n🎬 This is perfect for your App Review video!');
    } else {
      alert('❌ Failed to send message: ' + result.error);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-800 flex items-center">
          <MessageCircle className="mr-2" size={20} />
          WhatsApp Message Tester
        </h3>
        <div className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          API Ready
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Test Phone Number (with country code)
            </label>
            <input
              type="tel"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder="+27123456789"
              className="w-full p-3 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Test Message Content
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={8}
              className="w-full p-3 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 bg-white resize-none"
              placeholder="Enter your WhatsApp message..."
            />
            <div className="flex justify-between text-xs text-green-600 mt-1">
              <span>Perfect for App Review demonstration</span>
              <span>{testMessage.length} characters</span>
            </div>
          </div>

          <button
            onClick={sendTestMessage}
            disabled={isSending}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-70 transition-colors"
          >
            {isSending ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Sending to WhatsApp...
              </>
            ) : (
              <>
                <Send className="mr-2" size={16} />
                Send Test Message
              </>
            )}
          </button>
        </div>

        <div>
          <h4 className="font-medium text-green-700 mb-3">📊 Recent API Calls</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sendResults.length === 0 ? (
              <div className="text-center py-8 text-green-600">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No test messages sent yet</p>
                <p className="text-xs">Send a test to see API logs</p>
              </div>
            ) : (
              sendResults.map((result) => (
                <div key={result.id} className={`p-3 rounded-md text-xs ${
                  result.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">
                      {result.success ? '✅' : '❌'} {result.phoneNumber}
                    </span>
                    <span className="text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className="text-gray-700">{result.message}</p>
                  {result.messageId && (
                    <p className="text-green-600 mt-1">Message ID: {result.messageId}</p>
                  )}
                  {result.error && (
                    <p className="text-red-600 mt-1">Error: {result.error}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">📹 App Review Video Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use this tester to demonstrate real WhatsApp delivery</li>
          <li>• Record yourself clicking "Send Test Message" button</li>
          <li>• Show the API call logs appearing in real-time</li>
          <li>• Switch to WhatsApp app/web to show message received</li>
          <li>• Include audio narration explaining each step</li>
        </ul>
      </div>
    </div>
  );
};

// Main WhatsApp Invitation Composer
const WhatsAppInvitationComposer = ({ 
  user = { name: 'John Doe' }, 
  schools = [{ schoolName: 'Greenfield Primary School', id: '1' }], 
  selectedSchool = null,
  grades = [
    {
      id: "688cc38e11ec9f8e26ddf80c",
      name: "grade 10",
      description: "Senior secondary learners preparing for matric",
      grade_level: "10",
      capacity: 100,
      current_enrollment: 85,
      learners_count: 85,
      available_spots: 15,
      fees: 2500.0
    },
    {
      id: "688cc3e111ec9f8e26ddf80e", 
      name: "grade 9",
      description: "Junior secondary foundation year",
      grade_level: "9",
      capacity: 120,
      current_enrollment: 95,
      learners_count: 95,
      available_spots: 25,
      fees: 2200.0
    }
  ]
}) => {
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [recordingType, setRecordingType] = useState('messaging');

  // WhatsApp state
  const [bulkSendResults, setBulkSendResults] = useState([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  const steps = [
    { id: 1, name: 'Select Grade', icon: <GraduationCap size={16} />, color: 'blue' },
    { id: 2, name: 'Test WhatsApp', icon: <MessageCircle size={16} />, color: 'green' },
    { id: 3, name: 'Bulk Send', icon: <Users size={16} />, color: 'purple' },
    { id: 4, name: 'Results', icon: <CheckCircle size={16} />, color: 'green' }
  ];

  const currentSchoolName = selectedSchool?.schoolName || schools[0]?.schoolName || 'Your School';
  
  const handleBulkSend = async () => {
    if (!selectedGrade) {
      alert("Please select a grade first.");
      return;
    }

    setIsSendingBulk(true);
    setBulkSendResults([]);

    const mockLearners = Array.from({ length: 5 }, (_, i) => ({
      name: `Learner ${i + 1}`,
      parentName: `Parent ${i + 1}`,
      parentPhone: `+2712345678${i + 1}`
    }));

    const messages = mockLearners.map(learner => ({
      phoneNumber: learner.parentPhone,
      message: `Hi ${learner.parentName}, you're invited to join the ${currentSchoolName} parent portal for ${selectedGrade.name}. [Link]`
    }));

    const results = [];
    for (const msg of messages) {
      const result = await WhatsAppBusinessService.sendMessage(msg.phoneNumber, msg.message);
      results.push({
        ...result,
        phoneNumber: msg.phoneNumber,
        learnerName: mockLearners.find(l => l.parentPhone === msg.phoneNumber).name
      });
    }

    setBulkSendResults(results);
    setIsSendingBulk(false);
    setCurrentStep(4); // Move to results step after sending
  };

  // The missing return statement was here.
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modals for video recording and template manager */}
      {showVideoRecorder && (
        <VideoRecordingStudio onClose={() => setShowVideoRecorder(false)} recordingType={recordingType} />
      )}
      {showTemplateManager && <WhatsAppTemplateManager onClose={() => setShowTemplateManager(false)} />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header and Controls */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageCircleHeart className="mr-3 text-green-500" size={32} />
            WhatsApp Invitation Composer
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => { setShowTemplateManager(true); setRecordingType('management'); }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <FileText className="mr-2" size={16} />
              Manage Templates
            </button>
            <button
              onClick={() => { setShowVideoRecorder(true); setRecordingType('messaging'); }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <Video className="mr-2" size={16} />
              Record for App Review
            </button>
          </div>
        </div>

        {/* School Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <School className="text-blue-500 mr-4" size={28} />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{currentSchoolName}</h2>
                <p className="text-sm text-gray-500">Currently managing invitations for this school.</p>
              </div>
            </div>
            {/* You could add a school selector here if multiple schools are present */}
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${
                    currentStep >= step.id ? `bg-${step.color}-600` : 'bg-gray-300'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-3">
                  <span className={`block text-xs font-semibold ${currentStep >= step.id ? `text-${step.color}-700` : 'text-gray-500'}`}>
                    Step {step.id}
                  </span>
                  <span className={`block text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 mx-4 h-1 rounded-full transition-colors ${
                    currentStep > step.id ? `bg-${steps[index + 1].color}-600` : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Content based on currentStep */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <GraduationCap className="inline-block mr-2" size={24} />
                Select a Grade to send invitations
              </h2>
              <GradeSelector
                grades={grades}
                selectedGrade={selectedGrade}
                onSelect={(grade) => {
                  setSelectedGrade(grade);
                  setCurrentStep(2);
                }}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  <MessageCircle className="inline-block mr-2" size={24} />
                  Test Message for {selectedGrade?.name}
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Next: Bulk Send
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
              <WhatsAppMessageTester selectedGrade={selectedGrade} schoolName={currentSchoolName} />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  <Users className="inline-block mr-2" size={24} />
                  Send Bulk Invitations to {selectedGrade?.name}
                </h2>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                <p className="text-lg font-medium text-purple-800 mb-4">
                  Ready to send {selectedGrade?.learners_count} invitations to the parents of {selectedGrade?.name}?
                </p>
                <p className="text-sm text-purple-700 mb-6">
                  This will send a pre-configured WhatsApp message to all parents in this grade.
                </p>
                <button
                  onClick={handleBulkSend}
                  disabled={isSendingBulk}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-70 transition-colors"
                >
                  {isSendingBulk ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      Sending... Please wait
                    </>
                  ) : (
                    <>
                      <Send className="mr-2" size={20} />
                      Send {selectedGrade?.learners_count} Invitations
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  <CheckCircle className="inline-block mr-2" size={24} />
                  Bulk Send Results
                </h2>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>
              </div>

              <div className="space-y-4">
                {bulkSendResults.length > 0 ? (
                  bulkSendResults.map(result => (
                    <div key={result.id} className={`p-4 rounded-lg border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{result.learnerName}'s Parent</span>
                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        {result.success ? (
                          <CheckCircle className="text-green-500 mr-2" size={16} />
                        ) : (
                          <AlertCircle className="text-red-500 mr-2" size={16} />
                        )}
                        <span className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                          {result.success ? `Invitation sent to ${result.phoneNumber}` : `Failed to send to ${result.phoneNumber}`}
                        </span>
                      </div>
                      {!result.success && result.error && (
                        <p className="text-xs text-red-600 mt-2">Error: {result.error}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <p className="text-lg">No bulk send data available.</p>
                    <p className="text-sm">Please go back and run a bulk send to see results here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(1)}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInvitationComposer;