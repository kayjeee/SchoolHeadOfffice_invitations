import React, { useState, useEffect } from "react";
import { gradeService } from "./services/gradeService";
import { learnerService } from "./services/learnerService";
import { inviteService } from "./services/inviteService";

// Types
export type StepState = "grade-selection" | "learner-confirmation" | "channel-selection" | "message-composer" | "results";

interface Grade {
  id: string;
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  learnerCount?: number;
}

interface Learner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gradeId: string;
  isActive?: boolean;
}

interface InviteChannel {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'whatsapp';
}

interface Step3SendInvitesProps {
  schoolId: string; // Required for API calls
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: {
    selectedGrades: Grade[];
    selectedLearners: Learner[];
    channel: InviteChannel;
    message: string;
    prCode: string;
  }) => void;
}

// Available communication channels
const AVAILABLE_CHANNELS: InviteChannel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Send invites via email to learners with email addresses',
    type: 'email'
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Send invites via SMS/text message to learners with phone numbers',
    type: 'sms'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Send invites via WhatsApp to learners with phone numbers',
    type: 'whatsapp'
  }
];

// Custom hook for validation
const useStepValidation = (
  currentStep: StepState,
  selectedGrades: Grade[],
  selectedLearners: Learner[],
  selectedChannel: InviteChannel | null,
  inviteMessage: string
) => {
  const getStepErrors = (step: StepState): string[] => {
    switch (step) {
      case "grade-selection":
        if (selectedGrades.length === 0) {
          return ["Please select at least one grade"];
        }
        return [];
      
      case "learner-confirmation":
        if (selectedLearners.length === 0) {
          return ["No learners found in selected grades"];
        }
        return [];
      
      case "channel-selection":
        if (!selectedChannel) {
          return ["Please select an invitation channel"];
        }
        return [];
      
      case "message-composer":
        if (!inviteMessage?.trim()) {
          return ["Message cannot be empty"];
        }
        return [];
      
      case "results":
        return [];
      
      default:
        return [];
    }
  };

  const currentErrors = getStepErrors(currentStep);
  const canProceedToNext = currentErrors.length === 0;

  return { validationErrors: currentErrors, canProceedToNext };
};

const Step3SendInvites: React.FC<Step3SendInvitesProps> = ({
  schoolId,
  onNext,
  onBack,
  isLoading,
  onUpdateData,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<StepState>("grade-selection");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<InviteChannel | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [prCode, setPrCode] = useState<string>("");
  const [inviteResults, setInviteResults] = useState<any>(null);
  
  // Loading states
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [generatingPrCode, setGeneratingPrCode] = useState(false);
  const [sendingInvites, setSendingInvites] = useState(false);

  // Validation
  const { canProceedToNext, validationErrors } = useStepValidation(
    currentStep,
    selectedGrades,
    learners,
    selectedChannel,
    inviteMessage
  );

  // Fetch grades on component mount
  useEffect(() => {
    const fetchGrades = async () => {
      if (!schoolId) return;
      
      setLoadingGrades(true);
      try {
        const gradesData = await gradeService.getActiveGrades(schoolId);
        
        // Fetch learner counts for each grade
        const gradesWithCounts = await Promise.all(
          gradesData.map(async (grade) => {
            try {
              const stats = await gradeService.getGradeStats(schoolId, grade.id);
              return { ...grade, learnerCount: stats.learnerCount };
            } catch (error) {
              console.error(`Error fetching stats for grade ${grade.id}:`, error);
              return { ...grade, learnerCount: 0 };
            }
          })
        );
        
        setGrades(gradesWithCounts);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoadingGrades(false);
      }
    };

    fetchGrades();
  }, [schoolId]);

  // Fetch learners when grades are selected
  useEffect(() => {
    if (selectedGrades.length === 0) {
      setLearners([]);
      return;
    }

    const fetchLearners = async () => {
      setLoadingLearners(true);
      try {
        const gradeIds = selectedGrades.map(g => g.id);
        const learnersData = await learnerService.getLearnersByGrades(schoolId, gradeIds);
        setLearners(learnersData);
      } catch (error) {
        console.error('Error fetching learners:', error);
      } finally {
        setLoadingLearners(false);
      }
    };

    fetchLearners();
  }, [selectedGrades, schoolId]);

  // Generate PR code when moving to message composer
  useEffect(() => {
    if (currentStep === "message-composer" && !prCode) {
      const generatePrCode = async () => {
        setGeneratingPrCode(true);
        try {
          // Try to call your PR code generation API
          const response = await fetch(`${gradeService.config?.apiBaseUrl || 'http://localhost:4000/api/v1'}/pr_codes`, { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const { code } = await response.json();
            setPrCode(code);
          } else {
            throw new Error('Failed to generate PR code from API');
          }
        } catch (error) {
          console.error('Error generating PR code:', error);
          // Fallback PR code generation
          const fallbackCode = `PR${Date.now().toString().slice(-6)}`;
          setPrCode(fallbackCode);
        } finally {
          setGeneratingPrCode(false);
        }
      };

      generatePrCode();
    }
  }, [currentStep, prCode]);

  // Handlers
  const handleGradeSelection = (grade: Grade) => {
    setSelectedGrades(prev => {
      const isSelected = prev.some(g => g.id === grade.id);
      if (isSelected) {
        return prev.filter(g => g.id !== grade.id);
      } else {
        return [...prev, grade];
      }
    });
  };

  const handleSendInvites = async () => {
    if (!selectedChannel || !inviteMessage || !prCode) return;

    setSendingInvites(true);
    try {
      const messageWithPrCode = `${inviteMessage}\n\nYour PR Code: ${prCode}`;
      
      const result = await inviteService.sendInvites({
        learners,
        channel: selectedChannel,
        message: {
          content: messageWithPrCode,
          prCode: prCode
        }
      });

      setInviteResults(result);
      
      // Update parent component with data
      if (onUpdateData) {
        onUpdateData({
          selectedGrades,
          selectedLearners: learners,
          channel: selectedChannel,
          message: messageWithPrCode,
          prCode
        });
      }
    } catch (error) {
      console.error('Error sending invites:', error);
    } finally {
      setSendingInvites(false);
    }
  };

  const goNext = async () => {
    if (!canProceedToNext) return;

    switch (currentStep) {
      case "grade-selection":
        setCurrentStep("learner-confirmation");
        break;
      case "learner-confirmation":
        setCurrentStep("channel-selection");
        break;
      case "channel-selection":
        setCurrentStep("message-composer");
        break;
      case "message-composer":
        await handleSendInvites();
        setCurrentStep("results");
        if (onNext) onNext();
        break;
      default:
        break;
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case "learner-confirmation":
        setCurrentStep("grade-selection");
        break;
      case "channel-selection":
        setCurrentStep("learner-confirmation");
        break;
      case "message-composer":
        setCurrentStep("channel-selection");
        break;
      case "results":
        setCurrentStep("message-composer");
        break;
      default:
        if (onBack) onBack();
        break;
    }
  };

  // Get step title and description
  const getStepInfo = () => {
    switch (currentStep) {
      case "grade-selection":
        return {
          title: "Select Grades",
          description: "Choose which grades to invite. All learners in selected grades will be invited.",
        };
      case "learner-confirmation":
        return {
          title: "Confirm Learners",
          description: "Review the learners that will be invited from your selected grades.",
        };
      case "channel-selection":
        return {
          title: "Choose Channel",
          description: "Select how you want to send the invitations.",
        };
      case "message-composer":
        return {
          title: "Compose Message",
          description: "Write your invitation message. A PR code will be automatically included.",
        };
      case "results":
        return {
          title: "Invites Sent!",
          description: "Your learner invites have been successfully sent.",
        };
      default:
        return { title: "", description: "" };
    }
  };

  // Filter learners based on selected channel
  const getEligibleLearners = () => {
    if (!selectedChannel) return learners;
    
    return learners.filter(learner => {
      switch (selectedChannel.type) {
        case 'email':
          return learner.email && learner.email.trim() !== '';
        case 'sms':
        case 'whatsapp':
          return learner.phone && learner.phone.trim() !== '';
        default:
          return true;
      }
    });
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "grade-selection":
        return (
          <div className="space-y-4 mb-8">
            {loadingGrades ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading grades...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {grades.map((grade) => (
                    <label
                      key={grade.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedGrades.some(g => g.id === grade.id)}
                          onChange={() => handleGradeSelection(grade)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="font-medium text-gray-900">{grade.name}</span>
                          {grade.description && (
                            <p className="text-sm text-gray-500">{grade.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {grade.learnerCount || 0} learners
                      </span>
                    </label>
                  ))}
                </div>
                
                {selectedGrades.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Summary</h4>
                    <p className="text-blue-700">
                      {selectedGrades.length} grade(s) selected: {selectedGrades.map(g => g.name).join(', ')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "learner-confirmation":
        return (
          <div className="space-y-4 mb-8">
            {loadingLearners ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading learners...</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-50 rounded-lg mb-4">
                  <h4 className="font-medium text-green-900 mb-2">Learners to Invite</h4>
                  <p className="text-green-700">
                    {learners.length} learners will be invited from {selectedGrades.length} grade(s)
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {learners.map((learner, index) => (
                    <div key={learner.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{learner.name}</p>
                        <div className="text-sm text-gray-500">
                          {learner.email && <span>📧 {learner.email}</span>}
                          {learner.email && learner.phone && <span className="mx-2">|</span>}
                          {learner.phone && <span>📱 {learner.phone}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        Grade: {grades.find(g => g.id === learner.gradeId)?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case "channel-selection":
        const eligibleLearners = getEligibleLearners();
        
        return (
          <div className="space-y-4 mb-8">
            <div className="grid gap-4">
              {AVAILABLE_CHANNELS.map((channel) => {
                const channelLearners = learners.filter(learner => {
                  switch (channel.type) {
                    case 'email':
                      return learner.email && learner.email.trim() !== '';
                    case 'sms':
                    case 'whatsapp':
                      return learner.phone && learner.phone.trim() !== '';
                    default:
                      return true;
                  }
                });

                return (
                  <label
                    key={channel.id}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={channel.id}
                      checked={selectedChannel?.id === channel.id}
                      onChange={(e) => setSelectedChannel(channel)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{channel.name}</span>
                        <span className="text-sm text-gray-500">
                          {channelLearners.length} eligible learners
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{channel.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedChannel && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {getEligibleLearners().length} out of {learners.length} learners have the required contact information for {selectedChannel.name}.
                </p>
              </div>
            )}
          </div>
        );

      case "message-composer":
        return (
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Message
              </label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder={`Hi! You're invited to join our school portal. Use your PR code to register and access your learning materials.`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={5}
              />
            </div>
            
            {generatingPrCode ? (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Generating PR Code...</p>
              </div>
            ) : prCode ? (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>PR Code:</strong> {prCode} (will be automatically included in each invite)
                </p>
              </div>
            ) : null}

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Preview:</strong> This message will be sent to {getEligibleLearners().length} learners 
                via {selectedChannel?.name}.
              </p>
            </div>
          </div>
        );

      case "results":
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Invites Sent Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Invitations have been sent to {getEligibleLearners().length} learners via {selectedChannel?.name}.
            </p>
            
            {inviteResults && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">Successful: {inviteResults.successCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">Failed: {inviteResults.failureCount || 0}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              <p>PR Code: <strong>{prCode}</strong></p>
              <p className="mt-2">Learners can use this code to register on your portal.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepInfo = getStepInfo();
  const steps = ["grade-selection", "learner-confirmation", "channel-selection", "message-composer", "results"];

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{stepInfo.title}</h2>
        <p className="text-gray-600">{stepInfo.description}</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep === step 
                ? "bg-blue-600 text-white" 
                : index < steps.indexOf(currentStep)
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-600"
              }
            `}>
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-8 h-1 mx-2
                ${index < steps.indexOf(currentStep)
                  ? "bg-green-600"
                  : "bg-gray-300"
                }
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 space-y-1">
            {validationErrors.map((err, idx) => (
              <div key={idx} className="text-sm">• {err}</div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          disabled={!canProceedToNext || isLoading || loadingLearners || sendingInvites || generatingPrCode}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sendingInvites
            ? "Sending Invites..."
            : generatingPrCode
            ? "Generating Code..."
            : isLoading
            ? "Loading..."
            : currentStep === "message-composer"
            ? "Send Invites →"
            : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default Step3SendInvites;