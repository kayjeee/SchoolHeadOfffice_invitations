import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useStepValidation } from '../hooks/useStepValidation';
import LoadingSpinner from '../../../spinners/LoadingSpinner';
import { inviteService } from '../services/inviteService';
import { learnerService } from '../services/learnerService';
import { gradeService } from '../services/gradeService';
import { OnboardingStepProps } from '../../types';

interface InviteFormData {
  selectedLearners: string[];
  channels: string[];
  customMessage: string;
  sendImmediately: boolean;
  scheduledDate?: string;
}

interface Learner {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gradeId?: string;
}

interface Grade {
  id: string;
  name: string;
}

interface GeneratedInvite {
  id: string;
  prCode: string;
  learnerName: string;
  inviteLink: string;
  status: 'pending' | 'sent' | 'scheduled' | 'failed';
}

const Step3SendInvites: React.FC<OnboardingStepProps> = ({ 
  onComplete, 
  onSkip, 
  user, 
  onboardingStatus 
}) => {
  const { markStepCompleted, skipStep, getStepData, updateStepData } = useOnboardingFlow();
  const { validateStep, validationErrors } = useStepValidation('send_invites');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Data states
  const [learners, setLearners] = useState<Learner[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [generatedInvites, setGeneratedInvites] = useState<GeneratedInvite[]>([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'compose' | 'results'>('compose');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid }
  } = useForm<InviteFormData>({
    defaultValues: {
      selectedLearners: [],
      channels: ['whatsapp'],
      customMessage: `Hello! You've been invited to join ${user?.schools?.[0]?.name || 'our school'}. Use the code below to register.`,
      sendImmediately: true,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    },
    mode: 'onChange'
  });

  const watchedChannels = watch('channels');
  const watchedSelectedLearners = watch('selectedLearners');
  const watchedSendImmediately = watch('sendImmediately');
  const watchedCustomMessage = watch('customMessage');

  // Get school ID from user
  const schoolId = user?.schools?.[0]?.id;

  // Fetch grades
  const fetchGrades = async () => {
    if (!schoolId) {
      console.log('No schoolId provided.');
      setGrades([]);
      return;
    }

    try {
      console.log('Fetching grades for school:', schoolId);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = `http://localhost:4000/api/v1/schools/${schoolId}/grades`;
      console.log('Fetching grades from:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      const fetchedGrades = response.data.data?.grades || response.data.grades || response.data || [];
      setGrades(Array.isArray(fetchedGrades) ? fetchedGrades : []);
      
      console.log('Successfully fetched grades:', fetchedGrades.length);
    } catch (err: any) {
      console.error('Error fetching grades:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load grades';
      setError(`Failed to load grades: ${errorMessage}`);
      setGrades([]);
    }
  };

  // Fetch learners
  const fetchLearners = async () => {
    if (!schoolId) {
      console.log('No schoolId provided.');
      setLearners([]);
      return;
    }

    try {
      console.log('Fetching learners for school:', schoolId);
      
      // Try using the learnerService first
      try {
        const learnersData = await learnerService.getLearnersBySchool(schoolId);
        setLearners(Array.isArray(learnersData) ? learnersData : []);
        console.log('Successfully fetched learners via service:', learnersData.length);
        return;
      } catch (serviceError) {
        console.log('Service failed, trying direct API call:', serviceError);
      }

      // Fallback to direct API call
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = `http://localhost:4000/api/v1/schools/${schoolId}/learners`;
      console.log('Fetching learners from:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      const fetchedLearners = response.data.data?.learners || response.data.learners || response.data || [];
      setLearners(Array.isArray(fetchedLearners) ? fetchedLearners : []);
      
      console.log('Successfully fetched learners via API:', fetchedLearners.length);
    } catch (err: any) {
      console.error('Error fetching learners:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load learners';
      setError(`Failed to load learners: ${errorMessage}`);
      setLearners([]);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!schoolId) {
        setError('No school found for the current user');
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      setError(null);

      try {
        // Load both grades and learners concurrently
        await Promise.all([
          fetchGrades(),
          fetchLearners()
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [schoolId]);

  // Auto-select all learners when learners are loaded
  useEffect(() => {
    if (learners.length > 0 && watchedSelectedLearners.length === 0) {
      const learnerIds = learners.map(learner => learner.id);
      setValue('selectedLearners', learnerIds);
    }
  }, [learners, setValue, watchedSelectedLearners.length]);

  // Load existing step data if available
  useEffect(() => {
    const stepData = getStepData('send_invites');
    if (stepData && stepData.generatedInvites) {
      setGeneratedInvites(stepData.generatedInvites);
      setActiveTab('results');
    }
  }, [getStepData]);

  const generatePRCode = (learner: Learner): string => {
    const schoolCode = user?.schools?.[0]?.code || 'SCH';
    const learnerType = 'LRN';
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${schoolCode}-${learnerType}-${randomSuffix}`;
  };

  const copyToClipboard = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadQRCode = (invite: GeneratedInvite) => {
    const qrData = {
      prCode: invite.prCode,
      learnerName: invite.learnerName,
      schoolName: user?.schools?.[0]?.name,
      inviteLink: invite.inviteLink,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const blob = new Blob([JSON.stringify(qrData)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${invite.prCode}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = async (data: InviteFormData) => {
    // Validate step data
    const validationResult = await validateStep(data);
    if (!validationResult.isValid) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate invites for selected learners
      const invitePromises = data.selectedLearners.map(async (learnerId) => {
        const learner = learners.find(l => l.id === learnerId);
        if (!learner) return null;

        const prCode = generatePRCode(learner);
        const inviteLink = `${window.location.origin}/invite/${prCode}`;

        const inviteData = {
          prCode,
          learnerId: learner.id,
          learnerName: `${learner.firstName} ${learner.lastName}`,
          recipientType: 'learner' as const,
          recipientEmail: learner.email,
          recipientPhone: learner.phone,
          inviteLink,
          channels: data.channels,
          customMessage: data.customMessage,
          schoolId: schoolId!,
          createdBy: user!.auth0_id,
          status: data.sendImmediately ? 'pending' : 'scheduled',
          scheduledDate: data.sendImmediately ? null : data.scheduledDate,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        return await inviteService.createInvite(inviteData);
      });

      const createdInvites = await Promise.all(invitePromises);
      const successfulInvites: GeneratedInvite[] = createdInvites
        .filter((invite): invite is NonNullable<typeof invite> => invite !== null)
        .map(invite => ({
          id: invite.id,
          prCode: invite.prCode,
          learnerName: invite.learnerName,
          inviteLink: invite.inviteLink,
          status: invite.status
        }));

      // Send invites through selected channels
      if (data.sendImmediately) {
        const sendPromises = successfulInvites.map(invite => 
          inviteService.sendInvite(invite.id, data.channels)
        );
        await Promise.all(sendPromises);
      }

      setGeneratedInvites(successfulInvites);
      setActiveTab('results');

      // Update step data
      const stepData = {
        invitesSent: successfulInvites.length,
        channelsUsed: data.channels,
        scheduled: !data.sendImmediately,
        generatedInvites: successfulInvites
      };

      updateStepData('send_invites', stepData);

      // Complete the step
      await markStepCompleted('send_invites', stepData);

      // Call parent completion handler
      onComplete?.('send_invites', stepData);

    } catch (err: any) {
      console.error('Error sending invites:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await skipStep('send_invites', 'User chose to skip sending invites');
    onSkip?.('send_invites', 'User chose to skip sending invites');
  };

  const selectAllLearners = () => {
    const filteredLearners = getFilteredLearners();
    const learnerIds = filteredLearners.map(learner => learner.id);
    setValue('selectedLearners', [...new Set([...watchedSelectedLearners, ...learnerIds])]);
  };

  const deselectAllLearners = () => {
    const filteredLearners = getFilteredLearners();
    const filteredIds = filteredLearners.map(learner => learner.id);
    const remainingSelected = watchedSelectedLearners.filter(id => !filteredIds.includes(id));
    setValue('selectedLearners', remainingSelected);
  };

  const getFilteredLearners = () => {
    if (selectedGradeFilter === 'all') {
      return learners;
    }
    return learners.filter(learner => learner.gradeId === selectedGradeFilter);
  };

  const getGradeName = (gradeId?: string) => {
    if (!gradeId) return 'No grade assigned';
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.name : 'Unknown grade';
  };

  const getLearnerCountByGrade = (gradeId: string) => {
    return learners.filter(learner => learner.gradeId === gradeId).length;
  };

  // Icon Components
  const EnvelopeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );

  const PhoneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );

  const ChatBubbleLeftRightIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );

  const QrCodeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
  );

  const LinkIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );

  const DocumentDuplicateIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );

  const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );

  const UsersIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading learners and grades...</p>
        {schoolId && <p className="text-sm text-gray-500">School ID: {schoolId}</p>}
      </div>
    );
  }

  const filteredLearners = getFilteredLearners();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <EnvelopeIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Send Invites to Learners</h2>
        <p className="text-gray-600 mt-2">
          Invite learners to join your school using PR codes. Choose delivery channels and customize your message.
        </p>
        {schoolId && (
          <p className="text-sm text-gray-500 mt-1">
            School: {user?.schools?.[0]?.name} | {learners.length} learners | {grades.length} grades
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchGrades();
              fetchLearners();
            }}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Learners</p>
              <p className="text-2xl font-bold text-blue-600">{learners.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckIcon className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Selected</p>
              <p className="text-2xl font-bold text-green-600">{watchedSelectedLearners.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <EnvelopeIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Grades</p>
              <p className="text-2xl font-bold text-purple-600">{grades.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compose Invites
          </button>
          {generatedInvites.length > 0 && (
            <button
              onClick={() => setActiveTab('results')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invite Results ({generatedInvites.length})
            </button>
          )}
        </nav>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grade Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Grade</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedGradeFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGradeFilter === 'all'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                All Grades ({learners.length})
              </button>
              
              {grades.map((grade) => (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => setSelectedGradeFilter(grade.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGradeFilter === grade.id
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {grade.name} ({getLearnerCountByGrade(grade.id)})
                </button>
              ))}
            </div>
          </div>

          {/* Learner Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Select Learners 
                {selectedGradeFilter !== 'all' && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Filtered by: {grades.find(g => g.id === selectedGradeFilter)?.name})
                  </span>
                )}
              </h3>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={selectAllLearners}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All {selectedGradeFilter !== 'all' ? 'Filtered' : ''}
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={deselectAllLearners}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Deselect All {selectedGradeFilter !== 'all' ? 'Filtered' : ''}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {filteredLearners.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {learners.length === 0 
                      ? "No learners found. Please upload learners first." 
                      : "No learners found for the selected grade."
                    }
                  </p>
                  {learners.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        fetchLearners();
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Refresh learners
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredLearners.map((learner) => (
                    <label key={learner.id} className="flex items-start space-x-3 p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                      <input
                        type="checkbox"
                        {...register('selectedLearners')}
                        value={learner.id}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {learner.firstName} {learner.lastName}
                        </p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {getGradeName(learner.gradeId)}
                            </span>
                          </p>
                          {learner.email && (
                            <p className="flex items-center">
                              <EnvelopeIcon className="w-3 h-3 mr-1" />
                              {learner.email}
                            </p>
                          )}
                          {learner.phone && (
                            <p className="flex items-center">
                              <PhoneIcon className="w-3 h-3 mr-1" />
                              {learner.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {validationErrors.selectedLearners && (
              <p className="text-red-600 text-sm mt-2">{validationErrors.selectedLearners}</p>
            )}
          </div>

          {/* Delivery Channels */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'whatsapp', name: 'WhatsApp', icon: ChatBubbleLeftRightIcon, color: 'text-green-600', bgColor: 'peer-checked:bg-green-50 peer-checked:border-green-500' },
                { id: 'sms', name: 'SMS', icon: PhoneIcon, color: 'text-blue-600', bgColor: 'peer-checked:bg-blue-50 peer-checked:border-blue-500' },
                { id: 'email', name: 'Email', icon: EnvelopeIcon, color: 'text-purple-600', bgColor: 'peer-checked:bg-purple-50 peer-checked:border-purple-500' }
              ].map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <label key={channel.id} className="relative flex cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('channels')}
                      value={channel.id}
                      className="peer sr-only"
                    />
                    <div className={`flex-1 rounded-lg border-2 border-gray-200 p-4 hover:border-gray-300 transition-all ${channel.bgColor}`}>
                      <div className="flex items-center">
                        <IconComponent className={`w-6 h-6 ${channel.color} mr-3`} />
                        <span className="text-sm font-medium text-gray-900">{channel.name}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {validationErrors.channels && (
              <p className="text-red-600 text-sm mt-2">{validationErrors.channels}</p>
            )}
          </div>

          {/* Custom Message */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invitation Message</h3>
            <textarea
              {...register('customMessage')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Customize your invitation message..."
            />
            {validationErrors.customMessage && (
              <p className="text-red-600 text-sm mt-2">{validationErrors.customMessage}</p>
            )}
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {watchedCustomMessage?.length || 0}/500 characters
              </p>
              <div className="text-xs text-gray-400">
                Available variables: {user?.schools?.[0]?.name && '{school_name}'}, {'{pr_code}'}, {'{learner_name}'}
              </div>
            </div>
          </div>

          {/* Scheduling Options */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduling</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  {...register('sendImmediately')}
                  value="true"
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-900">Send immediately</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  {...register('sendImmediately')}
                  value="false"
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-900">Schedule for later</span>
              </label>

              {!watchedSendImmediately && (
                <div className="ml-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    {...register('scheduledDate')}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {validationErrors.scheduledDate && (
                    <p className="text-red-600 text-sm mt-2">{validationErrors.scheduledDate}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Skip This Step
            </button>

            <button
              type="submit"
              disabled={isLoading || learners.length === 0 || watchedSelectedLearners.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {isLoading && <LoadingSpinner size="small" className="mr-2" />}
              {isLoading ? 'Sending...' : `Send ${watchedSelectedLearners?.length || 0} Invites`}
            </button>
          </div>
        </form>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && generatedInvites.length > 0 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-green-800 font-medium">
              Successfully generated {generatedInvites.length} invites!
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Invites have been sent via {watchedChannels.join(', ')}. You can also share the PR codes manually.
            </p>
          </div>

          {/* Invite Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedInvites.map((invite) => (
              <div key={invite.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{invite.learnerName}</h4>
                    <p className="text-sm text-gray-500">PR Code: {invite.prCode}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    invite.status === 'sent' ? 'bg-green-100 text-green-800' :
                    invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    invite.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invite.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* PR Code Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PR Code
                    </label>
                    <div className="flex">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded-l-md font-mono text-sm">
                        {invite.prCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(invite.prCode, invite.prCode)}
                        className="bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
                        title="Copy PR Code"
                      >
                        {copiedCode === invite.prCode ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <DocumentDuplicateIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Invite Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invite Link
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={invite.inviteLink}
                        readOnly
                        className="flex-1 bg-gray-100 px-3 py-2 rounded-l-md text-sm border-0 text-gray-600"
                      />
                      <button
                        onClick={() => copyToClipboard(invite.inviteLink, `link-${invite.prCode}`)}
                        className="bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
                        title="Copy Invite Link"
                      >
                        {copiedCode === `link-${invite.prCode}` ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <LinkIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* QR Code Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadQRCode(invite)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                      title="Download QR Code Data"
                    >
                      <QrCodeIcon className="w-4 h-4 mr-2" />
                      Download QR
                    </button>
                    <button
                      onClick={() => inviteService.resendInvite(invite.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-purple-600 text-purple-600 rounded-md text-sm hover:bg-purple-50 transition-colors"
                      title="Resend Invite"
                    >
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      Resend
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Bulk Actions</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const allCodes = generatedInvites.map(invite => invite.prCode).join('\n');
                  copyToClipboard(allCodes, 'all-codes');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                {copiedCode === 'all-codes' ? '✓ Copied!' : 'Copy All PR Codes'}
              </button>
              <button
                onClick={() => {
                  const allLinks = generatedInvites.map(invite => invite.inviteLink).join('\n');
                  copyToClipboard(allLinks, 'all-links');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                {copiedCode === 'all-links' ? '✓ Copied!' : 'Copy All Links'}
              </button>
              <button
                onClick={() => {
                  const csvContent = [
                    'Learner Name,PR Code,Invite Link,Status',
                    ...generatedInvites.map(invite => 
                      `"${invite.learnerName}","${invite.prCode}","${invite.inviteLink}","${invite.status}"`
                    )
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `invites-${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
              >
                Export to CSV
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={() => onComplete?.('send_invites', { invitesSent: generatedInvites.length })}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Continue to Next Step
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3SendInvites;