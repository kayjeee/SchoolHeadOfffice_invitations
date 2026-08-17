'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Download,
  Upload,
  UserPlus,
  ArrowUpRight,
  GraduationCap,
  ClipboardList,
  Calendar,
  BookOpen,
  PieChart,
  ChevronRight,
  ChevronLeft,
  SearchX,
  Loader2,
  Mail,
  Phone,
  LayoutGrid,
  List,
  AlertCircle,
  TrendingUp,
  Eye,
  Edit2,
  CheckCircle2,
  X,
  Send,
  AlertTriangle,
  Check,
  HelpCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SchoolAPI, Grade, Learner } from '@/lib/api/school-api';
import { apiClient } from '@/lib/api/api-client';
import { useSchoolContext } from '@/components/context/SchoolContext';
import { z } from 'zod';
import { useUser } from '@auth0/nextjs-auth0/client';

/**
 * Utility: Standard Tailwind merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Guardrail 2: Full Name Representation Mismatch
 */
const getLearnerFullName = (learner: any): string => {
  if (learner?.full_name) return learner.full_name;
  if (learner?.fullName) return learner.fullName;
  const fName = learner?.firstName || learner?.first_name || '';
  const lName = learner?.lastName || learner?.last_name || '';
  return `${fName} ${lName}`.trim() || 'Unnamed Learner';
};

const getLearnerWhatsAppPhone = (learner: any): string => {
  if (!learner) return '';
  const phoneFields = [
    learner.parent_phone,
    learner.phone,
    learner.whatsapp,
    learner.mobile,
    learner.cell,
    learner.contact_number,
    learner.contact?.phone,
    learner.contact?.whatsapp,
    learner.contact?.tel_home,
    learner.contact?.tel_emergency,
  ];

  for (const phone of phoneFields) {
    if (phone && typeof phone === 'string') {
      const cleanPhone = phone.trim();
      if (cleanPhone !== '' && !cleanPhone.startsWith('011')) {
        const digitCount = (cleanPhone.match(/\d/g) || []).length;
        if (digitCount >= 7) {
          return cleanPhone;
        }
      }
    }
  }
  return '';
};

export default function LearnerDirectoryPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  // Guardrail 3: Resolve slug into MongoDB ObjectId
  const { schoolSlug } = use(params);
  const { currentSchool } = useSchoolContext();
  const schoolId = currentSchool?.id || currentSchool?._id;
  const { user } = useUser();

  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'directory' | 'invitations' | 'management' | 'academic'>('directory');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Invitations CRM State
  const [invitations, setInvitations] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [isInvitationsLoading, setIsInvitationsLoading] = useState(false);
  const [invitationSearchQuery, setInvitationSearchQuery] = useState('');
  const [invitationFilterStatus, setInvitationFilterStatus] = useState<string>('all');

  // New Invitation Wizard Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<'single' | 'bulk'>('single');

  const [singleInvite, setSingleInvite] = useState({
    learnerId: '',
    accessionNumber: '',
    learnerName: '',
    parentName: '',
    gradeId: '',
    parentPhone: '',
    parentEmail: '',
    channel: 'WhatsApp' as 'WhatsApp' | 'SMS' | 'Email'
  });
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  const [bulkGradeId, setBulkGradeId] = useState('');
  const [bulkChannel, setBulkChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');

  // --- Bulk Learner Picker State variables ---
  const [bulkScope, setBulkScope] = useState<'whole-school' | 'grade' | 'class'>('whole-school');
  const [bulkPickerLearners, setBulkPickerLearners] = useState<Learner[]>([]);
  const [bulkLearnersRegistry, setBulkLearnersRegistry] = useState<Record<string, Learner>>({});
  const [selectedBulkLearnerIds, setSelectedBulkLearnerIds] = useState<Set<string>>(new Set());
  const [selectedBulkClassId, setSelectedBulkClassId] = useState<string>('');
  const [bulkClasses, setBulkClasses] = useState<Class[]>([]);
  const [isBulkClassesLoading, setIsBulkClassesLoading] = useState(false);
  const [isBulkLearnersLoading, setIsBulkLearnersLoading] = useState(false);
  const [bulkPickerPage, setBulkPickerPage] = useState(1);
  const [bulkPickerTotal, setBulkPickerTotal] = useState(0);
  const bulkPickerPerPage = 50;

  // Autocomplete UI State for Enrolled Learners
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 100;

  // Mock Modal State for Enrollment
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

  // --- Data Fetching ---
  const fetchInvitations = async () => {
    if (!schoolId) return;
    setIsInvitationsLoading(true);
    setInvitationsError(null);
    try {
      const [invitesData, requestsData] = await Promise.all([
        SchoolAPI.getLearnerInvitations(schoolId),
        SchoolAPI.getRequestAccesses(schoolId)
      ]);

      setInvitations(invitesData || []);
      setAccessRequests(requestsData || []);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      setInvitationsError("Couldn't load invitations — try refreshing");
    } finally {
      setIsInvitationsLoading(false);
    }
  };

  const handleResendInvitation = async (token: string) => {
    toast.loading('Resending invitation...', { id: `resend-${token}` });
    try {
      await SchoolAPI.resendLearnerInvitation(token);
      toast.success('Invitation resent successfully!', { id: `resend-${token}` });
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to resend invitation.', { id: `resend-${token}` });
    }
  };

  const handleCancelInvitation = async (token: string) => {
    toast.loading('Cancelling invitation...', { id: `cancel-${token}` });
    try {
      await SchoolAPI.cancelLearnerInvitation(token);
      toast.success('Invitation cancelled.', { id: `cancel-${token}` });
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to cancel invitation.', { id: `cancel-${token}` });
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    toast.loading('Accepting invitation and linking learner account...', { id: `accept-${token}` });
    try {
      await SchoolAPI.acceptLearnerInvitation(token);
      toast.success('Invitation accepted and account linked!', { id: `accept-${token}` });
      fetchInvitations();
      fetchData();
    } catch (error: any) {
      console.error('Accept invitation error:', error);
      const errorMsg = error.details?.message || error.details?.error || error.message || 'Failed to accept invitation.';
      toast.error(errorMsg, { id: `accept-${token}` });
    }
  };

  const handleApproveAccessRequest = async (id: string) => {
    toast.loading('Approving access request...', { id: `approve-${id}` });
    try {
      await SchoolAPI.approveRequestAccess(id);
      toast.success('Access request approved!', { id: `approve-${id}` });
      fetchInvitations();
      fetchData(); // Instantly update directory with newly linked/created learner!
    } catch (error) {
      toast.error('Failed to approve request.', { id: `approve-${id}` });
    }
  };

  const handleRejectAccessRequest = async (id: string) => {
    toast.loading('Rejecting access request...', { id: `reject-${id}` });
    try {
      await SchoolAPI.rejectRequestAccess(id);
      toast.success('Access request rejected.', { id: `reject-${id}` });
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to reject request.', { id: `reject-${id}` });
    }
  };

  const fetchData = async (targetPage: number = page) => {
    if (!schoolId) {
      console.log('⏳ [LearnerDirectory] Waiting for schoolId resolution...');
      return;
    }

    console.log(`🚀 [LearnerDirectory] Hydrating directory for school: ${schoolId} (Page ${targetPage})`);
    setIsLoading(true);

    try {
      const [learnersResponse, gradesData, stats] = await Promise.all([
        SchoolAPI.getSchoolLearners(schoolId, targetPage, perPage),
        SchoolAPI.getGrades(schoolId),
        SchoolAPI.getLearnerStatistics(schoolId)
      ]);

      console.log(`✅ [LearnerDirectory] Received ${learnersResponse.learners.length} learners. Total: ${learnersResponse.total}`);

      setLearners(learnersResponse.learners);
      setTotal(learnersResponse.total || learnersResponse.learners.length);
      setGrades(gradesData);
      setStatsData(stats);

      // Initialize dropdown selections
      if (gradesData.length > 0) {
        setSingleInvite(prev => ({ ...prev, gradeId: prev.gradeId || gradesData[0].id }));
        setBulkGradeId(prev => prev || gradesData[0].id);
      }
    } catch (error: any) {
      console.error('❌ [LearnerDirectory] Critical Hydration Error:', error);
      toast.error(error.message || 'Failed to load learner directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchInvitations();
  }, [schoolId, page]);

  // --- Bulk Learner Picker Fetching and Caching Effects ---

  // 1. Fetch bulk picker learners
  const fetchBulkPickerLearners = async (targetPage = 1, append = false) => {
    if (!schoolId) return;
    setIsBulkLearnersLoading(true);
    try {
      if (bulkScope === 'whole-school') {
        const response = await SchoolAPI.getSchoolLearners(schoolId, targetPage, bulkPickerPerPage);
        if (append) {
          setBulkPickerLearners(prev => [...prev, ...response.learners]);
        } else {
          setBulkPickerLearners(response.learners);
        }
        setBulkPickerTotal(response.total || response.learners.length);
        setBulkPickerPage(targetPage);
      } else if (bulkScope === 'grade') {
        if (!bulkGradeId) {
          setBulkPickerLearners([]);
          setBulkPickerTotal(0);
          setBulkPickerPage(1);
          return;
        }
        const learnersData = await SchoolAPI.getGradeLearners(schoolId, bulkGradeId, targetPage, bulkPickerPerPage);
        setBulkPickerLearners(learnersData);
        setBulkPickerTotal(learnersData.length);
        setBulkPickerPage(1);
      } else if (bulkScope === 'class') {
        if (!bulkGradeId || !selectedBulkClassId) {
          setBulkPickerLearners([]);
          setBulkPickerTotal(0);
          setBulkPickerPage(1);
          return;
        }
        const learnersData = await SchoolAPI.getClassLearners(schoolId, bulkGradeId, selectedBulkClassId);
        setBulkPickerLearners(learnersData);
        setBulkPickerTotal(learnersData.length);
        setBulkPickerPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch bulk picker learners', err);
      toast.error('Failed to fetch learners for selection.');
    } finally {
      setIsBulkLearnersLoading(false);
    }
  };

  // 2. Fetch classes when scope is 'class' and bulkGradeId changes
  useEffect(() => {
    if (schoolId && bulkGradeId && bulkScope === 'class') {
      setIsBulkClassesLoading(true);
      SchoolAPI.getClasses(schoolId, bulkGradeId)
        .then(data => {
          setBulkClasses(data);
          if (data.length > 0) {
            setSelectedBulkClassId(data[0].id);
          } else {
            setSelectedBulkClassId('');
          }
        })
        .catch(err => {
          console.error('Failed to load classes', err);
          toast.error('Failed to load classes for this grade.');
        })
        .finally(() => {
          setIsBulkClassesLoading(false);
        });
    } else {
      setBulkClasses([]);
      setSelectedBulkClassId('');
    }
  }, [schoolId, bulkGradeId, bulkScope]);

  // 3. Clear bulk selections when scope changes
  useEffect(() => {
    setSelectedBulkLearnerIds(new Set());
    setBulkPickerLearners([]);
    setBulkPickerTotal(0);
    setBulkPickerPage(1);
  }, [bulkScope]);

  // 4. Trigger learner fetching on criteria changes when bulk invite wizard is active
  useEffect(() => {
    if (isInviteModalOpen && inviteTab === 'bulk') {
      fetchBulkPickerLearners(1, false);
    }
  }, [bulkScope, bulkGradeId, selectedBulkClassId, isInviteModalOpen, inviteTab]);

  // 5. Build and keep a registry of all loaded learners to keep their references across pagination
  useEffect(() => {
    if (bulkPickerLearners.length > 0) {
      setBulkLearnersRegistry(prev => {
        const next = { ...prev };
        bulkPickerLearners.forEach(l => {
          if (l.id) next[l.id] = l;
        });
        return next;
      });
    }
  }, [bulkPickerLearners]);

  // --- Filtered Data ---
  const filteredLearners = useMemo(() => {
    return learners.filter(learner => {
      const nameMatch = getLearnerFullName(learner).toLowerCase().includes(searchQuery.toLowerCase());
      const admissionMatch = (learner.admission_number || learner.accession_number || (learner as any).accessionNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

      const currentGradeId = learner.gradeId || (learner as any).grade_id;
      const gradeMatch = filterGrade === 'all' || currentGradeId === filterGrade;

      return (nameMatch || admissionMatch) && gradeMatch;
    });
  }, [learners, searchQuery, filterGrade]);

  // --- Stats ---
  const stats = useMemo(() => {
    if (statsData) {
      return {
        total: statsData.total || total,
        active: statsData.by_status?.['active'] || statsData.by_status?.['Linked'] || 0,
        unassigned: learners.filter(l => !((l as any).class_id || (l as any).classId)).length,
      };
    }
    return {
      total: total,
      active: learners.filter(l => l.status === 'active' || l.status === 'Linked').length,
      unassigned: learners.filter(l => !((l as any).class_id || (l as any).classId)).length,
    };
  }, [learners, total, statsData]);

  // --- Autocomplete Filtered Learners ---
  const autocompleteSuggestions = useMemo(() => {
    if (!singleInvite.learnerName.trim()) return [];
    return learners.filter(l =>
      getLearnerFullName(l).toLowerCase().includes(singleInvite.learnerName.toLowerCase())
    ).slice(0, 5);
  }, [learners, singleInvite.learnerName]);

  const handleSelectSuggestedLearner = (learner: Learner) => {
    const fullName = getLearnerFullName(learner);
    const accessionNo = learner.accession_number || (learner as any).accessionNumber || learner.admission_number || (learner as any).admissionNumber || '';
    setSingleInvite(prev => ({
      ...prev,
      learnerId: learner.id,
      accessionNumber: accessionNo,
      learnerName: fullName,
      gradeId: learner.grade_id || learner.gradeId || prev.gradeId,
      parentPhone: learner.parent_phone || prev.parentPhone,
      parentEmail: (learner as any).parent_email || prev.parentEmail
    }));
    setShowSuggestions(false);
    toast.success(`Selected enrolled student: ${fullName}`, { icon: '🎓' });
  };


  // --- Handlers for Sending New Invitations ---
  const handleSendSingleInvite = async () => {
    if (!singleInvite.learnerName.trim()) {
      toast.error('Please enter the learner name.');
      return;
    }
    if (!singleInvite.learnerId) {
      toast.error('Please select a learner from the auto-suggested list.');
      return;
    }
    if (singleInvite.channel === 'Email' && !singleInvite.parentEmail.trim()) {
      toast.error('Please enter the recipient email address.');
      return;
    }
    if (singleInvite.channel !== 'Email' && !singleInvite.parentPhone.trim()) {
      toast.error('Please enter the recipient phone number.');
      return;
    }

    const payload = {
      phone_number: singleInvite.parentPhone,
      school_id: schoolId,
      role: 'parent',
      invited_via: 'whatsapp',
      learner_number: singleInvite.accessionNumber,
      learner_numbers: [singleInvite.accessionNumber],
      parent_name: singleInvite.parentName || 'Parent',
      grade_id: singleInvite.gradeId,
      sender_id: user?.sub || 'system'
    };

    setIsProcessing('sending-invite');
    const toastId = toast.loading('Sending invitation...');

    try {
      await apiClient.post('/api/v1/invitations', payload, z.any());
      toast.success('Invitation dispatched successfully!', { id: toastId });
      setIsInviteModalOpen(false);

      // Reset Single Invite state
      setSingleInvite({
        learnerId: '',
        accessionNumber: '',
        learnerName: '',
        parentName: '',
        gradeId: grades[0]?.id || '',
        parentPhone: '',
        parentEmail: '',
        channel: 'WhatsApp'
      });

      fetchInvitations();
    } catch (err: any) {
      toast.error(`Dispatch failed: ${err.message}`, { id: toastId });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSendBulkInvites = async () => {
    if (selectedBulkLearnerIds.size === 0) {
      toast.error('Please select at least one learner to invite.');
      return;
    }

    const selectedLearnersList = Array.from(selectedBulkLearnerIds)
      .map(id => bulkLearnersRegistry[id])
      .filter(Boolean);

    if (selectedLearnersList.length === 0) {
      toast.error('Selected learners details not found.');
      return;
    }

    const payload = {
      invitations: selectedLearnersList.map(l => {
        const accNo = l.admission_number || l.accession_number || (l as any).accessionNumber || '';
        return {
          phone_number: getLearnerWhatsAppPhone(l),
          parent_name: l.parent_name || 'Parent',
          learner_numbers: accNo ? [accNo] : [],
          grade_id: l.grade_id || l.gradeId || ''
        };
      }),
      school_id: schoolId,
      sender_id: user?.sub || 'system',
      sender: user?.email || 'system',
      invited_via: 'whatsapp'
    };

    setIsProcessing('sending-invite');
    const toastId = toast.loading(`Creating ${selectedLearnersList.length} invitations...`);

    // Step 1: Create invitations via bulk_create
    let bulkResponse: any;
    try {
      bulkResponse = await apiClient.post('/api/v1/invitations/bulk_create', payload, z.any());
    } catch (err: any) {
      toast.error(`Invitation creation failed: ${err.message}`, { id: toastId });
      setIsProcessing(null);
      return;
    }

    // Step 2: Extract created invitations & handle partial creation failure
    const createdInvites: any[] =
      bulkResponse?.invitations ||
      bulkResponse?.learner_invitations ||
      bulkResponse?.data?.invitations ||
      bulkResponse?.data?.learner_invitations ||
      (Array.isArray(bulkResponse) ? bulkResponse : []);

    const totalRequested = selectedLearnersList.length;
    const createdCount = createdInvites.length;
    const creationFailedCount = Math.max(0, totalRequested - createdCount);

    if (!bulkResponse || createdCount === 0) {
      toast.error(`Failed to create invitations for any of the ${totalRequested} selected learners.`, { id: toastId });
      setIsProcessing(null);
      return;
    }

    // Step 3: Turn EVERY created invitation into a distinct entry in personalizedMessages
    const schoolName = currentSchool?.schoolName || 'School';
    const personalizedMessages = createdInvites.map((inv: any) => {
      const phone = inv.learner_phone || inv.phone_number || inv.recipient_phone_number || inv.parent_phone || inv.phone || '';
      const token = inv.token || inv.id || inv._id || '';
      const parentName = inv.parent_name || inv.parentName || 'Parent';
      const magicLink = `?token=${token}&school=${encodeURIComponent(schoolName.trim())}`;

      return {
        to: phone,
        parentName: parentName,
        magicLink: magicLink,
        message: `Hello ${parentName}, you are invited to join the Parent Portal for ${schoolName}. Click here: ${magicLink}`
      };
    }).filter(msg => !!msg.to);

    if (personalizedMessages.length === 0) {
      toast.error(`Created ${createdCount} invitation(s), but none had valid phone numbers for WhatsApp.`, { id: toastId });
      setIsInviteModalOpen(false);
      setSelectedBulkLearnerIds(new Set());
      fetchInvitations();
      setIsProcessing(null);
      return;
    }

    // Step 4: Dispatch WhatsApp messages via same-origin relative fetch to Next.js API route
    toast.loading(`Sending ${personalizedMessages.length} WhatsApp messages...`, { id: toastId });

    let sendBulkStats = { sent: 0, failed: 0 };
    try {
      const sendBulkRaw = await fetch('/api/whatsapp-business/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizedMessages,
          schoolName
        })
      });

      const sendBulkRes = await sendBulkRaw.json();

      if (sendBulkRaw.ok && sendBulkRes?.stats) {
        sendBulkStats.sent = sendBulkRes.stats.sent || 0;
        sendBulkStats.failed = sendBulkRes.stats.failed || 0;
      } else if (sendBulkRaw.ok) {
        sendBulkStats.sent = personalizedMessages.length;
      } else {
        sendBulkStats.failed = personalizedMessages.length;
      }
    } catch (err: any) {
      console.error('WhatsApp send-bulk error:', err);
      sendBulkStats.failed = personalizedMessages.length;
    }

    // Step 5: Surface combined detailed result
    let resultMsg = `Created ${createdCount}/${totalRequested} invitation(s). WhatsApp: ${sendBulkStats.sent} sent`;
    if (sendBulkStats.failed > 0) {
      resultMsg += `, ${sendBulkStats.failed} failed`;
    }
    if (creationFailedCount > 0) {
      resultMsg += ` (${creationFailedCount} creation failed)`;
    }

    if (sendBulkStats.sent > 0) {
      toast.success(resultMsg, { id: toastId, duration: 6000 });
    } else {
      toast.error(resultMsg, { id: toastId, duration: 6000 });
    }

    setIsInviteModalOpen(false);
    setSelectedBulkLearnerIds(new Set());
    fetchInvitations();
    setIsProcessing(null);
  };

  // --- Phase 2 Actions ---
  const handleImportData = async () => {
    console.log('📂 [Action] Triggering Bulk Excel Import');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsProcessing('import');
      toast.loading(`Processing ${file.name}...`, { id: 'import-toast' });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('school_id', schoolId!);

        await apiClient.post('/api/v1/import_export/import_learners', formData, z.any(), {
          headers: { 'Content-Type': 'multipart/form-data' } as any
        });

        toast.success('Learners imported successfully!', { id: 'import-toast' });
        fetchData();
      } catch (error: any) {
        toast.error(`Import failed: ${error.message}`, { id: 'import-toast' });
      } finally {
        setIsProcessing(null);
      }
    };
    input.click();
  };

  const handleStartEnrollment = () => {
    console.log('👤 [Action] Opening Enrollment Flow');
    setIsEnrollmentOpen(true);
  };

  const handlePromotion = async (learnerId?: string) => {
    console.log(`📈 [Action] Triggering Promotion System ${learnerId ? `for ${learnerId}` : '(Global)'}`);
    if (learnerId) {
      setIsProcessing(`promote-${learnerId}`);
      try {
        await apiClient.patch(`/api/v1/learners/${learnerId}/graduate`, {}, z.any());
        toast.success('Learner promoted/graduated!');
        fetchData();
      } catch (error: any) {
        toast.error(`Promotion failed: ${error.message}`);
      } finally {
        setIsProcessing(null);
      }
    } else {
      toast('Global promotion system engaged. Targeting term-end bulk transitions.', { icon: '🎓' });
    }
  };

  const handleViewMetrics = async () => {
    console.log('📊 [Action] Fetching Academic Metrics');
    setIsProcessing('metrics');
    try {
      toast.loading('Synthesizing grade statistics...', { id: 'metrics-toast' });
      await apiClient.get('/api/v1/dashboard/grade_statistics', z.any());
      toast.success('Metrics updated.', { id: 'metrics-toast' });
    } catch (error: any) {
      toast.dismiss('metrics-toast');
      setActiveTab('academic');
      console.warn('Dashboard stats route pending. Redirecting to Academic View.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header & Main Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-school-primary rounded-full"></div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Learner Directory</h2>
          </div>
          <p className="text-slate-500 font-medium">
            Central repository for student records at <span className="text-slate-900 font-bold">{currentSchool?.schoolName || 'your school'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={handleStartEnrollment}
            className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-sm font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20"
          >
            <UserPlus className="w-4 h-4" />
            Enroll New Learner
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Enrolled', value: stats.total, sub: 'Registered Students', icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Learners', value: stats.active, sub: 'Currently Attending', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Unassigned', value: stats.unassigned, sub: 'Needs Class Allocation', icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
            </div>
            <h4 className="text-3xl font-black text-slate-900">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-200" /> : stat.value}</h4>
            <p className="text-sm font-bold text-slate-500 mt-1">{stat.label}</p>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon className="w-24 h-24 rotate-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-px">
        <div className="flex gap-8">
          {[
            { id: 'directory', label: 'Directory', icon: Users },
            { id: 'invitations', label: 'Invitations CRM', icon: ClipboardList },
            { id: 'management', label: 'Management Hub', icon: LayoutGrid },
            { id: 'academic', label: 'Academic Modules', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                console.log(`📑 [TabSwitch] Navigating to: ${tab.id}`);
                setActiveTab(tab.id as any);
              }}
              className={cn(
                "flex items-center gap-2 pb-4 text-sm font-bold transition-all relative",
                activeTab === tab.id ? "text-school-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-school-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'directory' && (
          <div className="flex p-1 bg-slate-100 rounded-lg mb-4 sm:mb-0">
            <button
              onClick={() => setViewMode('table')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'table' ? "bg-white shadow-sm text-school-primary" : "text-slate-400")}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-school-primary" : "text-slate-400")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or admission number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none appearance-none text-slate-900 min-w-[160px]"
                    >
                      <option value="all">All Grades</option>
                      {grades.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Display */}
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <Loader2 className="w-10 h-10 animate-spin text-school-primary mb-4" />
                  <p className="font-bold tracking-tight">Syncing Learner Records...</p>
                </div>
              ) : filteredLearners.length > 0 ? (
                <>
                {viewMode === 'table' ? (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission #</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade / Class</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredLearners.map((learner) => {
                            const fullName = getLearnerFullName(learner);
                            const grade = grades.find(g => g.id === (learner.gradeId || (learner as any).grade_id));
                            const className = learner.className || (learner as any).class_name || 'Unallocated';

                            return (
                              <tr key={learner.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-sm">
                                      {fullName[0]}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{fullName}</p>
                                      <p className="text-xs text-slate-500">{learner.gender_text || learner.gender || 'Not specified'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                                  {learner.admission_number || learner.accession_number || (learner as any).accessionNumber || '---'}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 text-sm">{grade?.name || '---'}</span>
                                    <span className="text-[10px] font-black text-school-primary uppercase tracking-wider">{className}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <Phone className="w-3 h-3" />
                                      {learner.parent_phone || '---'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <Mail className="w-3 h-3" />
                                      {learner.email || (learner as any).parent_email || '---'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                    learner.status === 'Linked' || learner.status === 'active' || learner.status === 'Accepted'
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : learner.status === 'graduated'
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : learner.status === 'invited' || learner.status === 'pending' || learner.status === 'Sent' || learner.status === 'Delivered'
                                      ? "bg-amber-50 text-amber-700 border-amber-100"
                                      : "bg-slate-50 text-slate-500 border-slate-100"
                                  )}>
                                    {learner.status || 'inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-slate-400 hover:text-school-primary hover:bg-slate-50 rounded-lg transition-all" title="View Profile">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handlePromotion(learner.id)}
                                      disabled={isProcessing === `promote-${learner.id}`}
                                      className="p-2 text-slate-400 hover:text-school-primary hover:bg-slate-50 rounded-lg transition-all"
                                      title="Promote Learner"
                                    >
                                      {isProcessing === `promote-${learner.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-school-primary hover:bg-slate-50 rounded-lg transition-all">
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredLearners.map((learner) => {
                      const fullName = getLearnerFullName(learner);
                      const grade = grades.find(g => g.id === (learner.gradeId || (learner as any).grade_id));
                      return (
                        <div key={learner.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-school-primary/30 transition-all group relative overflow-hidden">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg">
                              {fullName[0]}
                            </div>
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                              learner.status === 'Linked' || learner.status === 'active' || learner.status === 'Accepted'
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : learner.status === 'invited' || learner.status === 'pending' || learner.status === 'Sent' || learner.status === 'Delivered'
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-slate-50 text-slate-500 border-slate-100"
                            )}>
                              {learner.status || 'inactive'}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 mb-1 truncate">{fullName}</h5>
                          <p className="text-xs font-black text-school-primary uppercase tracking-wider mb-4">
                            {grade?.name || 'No Grade'} • {learner.className || (learner as any).class_name || 'Unallocated'}
                          </p>
                          <div className="space-y-2 pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-bold uppercase">Admission</span>
                              <span className="text-slate-900 font-mono font-bold">{learner.admission_number || learner.accession_number || (learner as any).accessionNumber || '---'}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-bold uppercase">Contact</span>
                              <span className="text-slate-900 font-bold">{learner.parent_phone || '---'}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 flex gap-2">
                             <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-600 rounded-xl transition-all uppercase tracking-widest">
                                Profile
                             </button>
                             <button className="p-2 bg-slate-50 hover:bg-school-primary hover:text-white text-slate-400 rounded-xl transition-all">
                               <ArrowUpRight className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400">
                    Showing <span className="text-slate-900 font-black">{((page - 1) * perPage) + 1}</span> to <span className="text-slate-900 font-black">{Math.min(page * perPage, total)}</span> of <span className="text-slate-900 font-black">{total}</span> learners
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1 || isLoading}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    <div className="hidden md:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(total / perPage)) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                              page === pageNum
                                ? "bg-school-primary text-white shadow-md shadow-school-primary/20"
                                : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {Math.ceil(total / perPage) > 5 && (
                        <span className="px-2 text-slate-300 font-black text-xs">...</span>
                      )}
                    </div>

                    <button
                      disabled={page * perPage >= total || isLoading}
                      onClick={() => setPage(p => p + 1)}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-widest"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                </>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                  <SearchX className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold text-lg text-slate-900">No learners found</p>
                  <p className="text-sm font-medium">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

              {invitationsError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{invitationsError}</span>
                  <button onClick={() => fetchInvitations()} className="ml-auto underline hover:text-rose-900">Retry</button>
                </div>
              )}

              {/* Premium Quick Help Banner */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-emerald-100/50">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight">Multi-Channel Invitations & Request Access</h4>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">
                      Invite parents of enrolled students to link their portal accounts via SMS, WhatsApp templates, or SMTP emails. Alternatively, review, link, and automatically create learner records directly from parent portal sign-up requests.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-md shadow-school-primary/10 uppercase tracking-widest"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Launch Invite Wizard
                </button>
              </div>

              {/* Stats / KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Invitations Sent', value: invitations.length, sub: 'All channels', icon: Users, color: 'bg-indigo-50 text-blue-600' },
                  { label: 'Pending Response', value: invitations.filter(inv => inv.status === 'pending').length, sub: 'Waiting for parent', icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
                  { label: 'Accepted & Onboarded', value: invitations.filter(inv => inv.status === 'accepted').length, sub: 'Fully Linked', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Conversion Rate', value: `${invitations.length > 0 ? Math.round((invitations.filter(inv => inv.status === 'accepted').length / invitations.length) * 100) : 0}%`, sub: 'Sign-up success', icon: TrendingUp, color: 'bg-pink-50 text-pink-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-xl", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">{isInvitationsLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-200" /> : stat.value}</h4>
                    <p className="text-sm font-bold text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Filter / Search for Invitations */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student, parent, or contact info..."
                    value={invitationSearchQuery}
                    onChange={(e) => setInvitationSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900"
                  />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <select
                    value={invitationFilterStatus}
                    onChange={(e) => setInvitationFilterStatus(e.target.value)}
                    className="flex-1 md:flex-initial px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900 min-w-[160px]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-school-primary text-white text-sm font-black rounded-2xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Invite Parents / Learners
                  </button>
                </div>
              </div>

              {/* Invitations Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Parent</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Channel</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {invitations
                        .filter(inv => {
                          const query = invitationSearchQuery.toLowerCase();
                          const resolvedNamesStr = Array.isArray(inv.resolved_learner_names)
                            ? inv.resolved_learner_names.join(', ')
                            : (inv.resolved_learner_names || inv.learner_name || '');
                          const matchesSearch =
                            resolvedNamesStr.toLowerCase().includes(query) ||
                            inv.learner_name?.toLowerCase().includes(query) ||
                            inv.parent_name?.toLowerCase().includes(query) ||
                            inv.parent_phone?.toLowerCase().includes(query) ||
                            inv.parent_email?.toLowerCase().includes(query);
                          const matchesStatus = invitationFilterStatus === 'all' || inv.status === invitationFilterStatus;
                          return matchesSearch && matchesStatus;
                        })
                        .map((inv) => {
                          const learnerDisplayName = (() => {
                            if (Array.isArray(inv.resolved_learner_names) && inv.resolved_learner_names.length > 0) {
                              return inv.resolved_learner_names.join(', ');
                            }
                            if (typeof inv.resolved_learner_names === 'string' && inv.resolved_learner_names.trim()) {
                              return inv.resolved_learner_names;
                            }
                            if (inv.learner_name && inv.learner_name.trim()) {
                              return inv.learner_name;
                            }
                            return 'Unknown learner';
                          })();

                          const gradeDisplayName = inv.grade_name || (inv.grade_id ? grades.find(g => g.id === inv.grade_id)?.name : null) || 'No Grade';

                          return (
                            <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                  {learnerDisplayName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{learnerDisplayName}</p>
                                  <p className="text-xs text-slate-500">{gradeDisplayName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                              {inv.parent_name}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                              {inv.channel === 'Email' ? inv.parent_email : inv.parent_phone}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                              {new Date(inv.created_at).toLocaleDateString()} at {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border",
                                inv.channel === 'WhatsApp'
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : inv.channel === 'Email'
                                  ? "bg-pink-50 text-pink-600 border-pink-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                              )}>
                                {inv.channel || 'WhatsApp'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                inv.status === 'accepted'
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : inv.status === 'pending'
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : inv.status === 'cancelled' || inv.status === 'expired'
                                  ? "bg-slate-50 text-slate-500 border-slate-200"
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                              )}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {inv.status !== 'accepted' && inv.status !== 'cancelled' && (
                                  <>
                                    <button
                                      onClick={() => handleAcceptInvitation(inv.token || inv.id)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-wider"
                                      title="Manually Accept & Link"
                                    >
                                      Accept & Link
                                    </button>
                                    <button
                                      onClick={() => handleResendInvitation(inv.token || inv.id)}
                                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-wider"
                                      title="Resend Invite"
                                    >
                                      Resend
                                    </button>
                                    <button
                                      onClick={() => handleCancelInvitation(inv.token || inv.id)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[10px] font-bold rounded-xl transition-all"
                                      title="Cancel Invite"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {inv.status === 'accepted' && (
                                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Linked
                                  </span>
                                )}
                                {inv.status === 'cancelled' && (
                                  <span className="text-xs text-slate-400 italic">Cancelled</span>
                                )}
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      {invitations.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                            No invitations sent yet. Click "Invite Parents / Learners" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Incoming Access Requests and Parent Registrations */}
              <div className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Parent Portal Access Requests & Registrations</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  Parents who signed up directly or requested manual linkage to their child's academic record. Approve to link or automatically create learner record.
                </p>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Child / Learner</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Date</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {accessRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                              {req.parent_name}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                              {req.parent_email}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 text-sm">{req.learner_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                req.status === 'approved'
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : req.status === 'pending'
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                              )}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {req.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveAccessRequest(req.id)}
                                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-wider"
                                    >
                                      Approve & Link
                                    </button>
                                    <button
                                      onClick={() => handleRejectAccessRequest(req.id)}
                                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[10px] font-bold rounded-xl transition-all"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {req.status === 'approved' && (
                                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Linked
                                  </span>
                                )}
                                {req.status === 'rejected' && (
                                  <span className="text-xs text-slate-400 italic">Rejected</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {accessRequests.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                              No manual registrations or access requests pending.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'management' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Bulk Excel Import',
                  desc: 'Ingest thousands of learners using our standard template.',
                  icon: Upload,
                  phase: 2,
                  action: 'Import Data',
                  handler: handleImportData,
                  loading: isProcessing === 'import'
                },
                {
                  title: 'Bulk Enrollment',
                  desc: 'Process admissions for multiple students simultaneously.',
                  icon: UserPlus,
                  phase: 2,
                  action: 'Start Enrollment',
                  handler: handleStartEnrollment
                },
                {
                  title: 'Promotion System',
                  desc: 'Transition learners between grades at the end of the term.',
                  icon: TrendingUp,
                  phase: 2,
                  action: 'Manage Promotions',
                  handler: () => handlePromotion()
                },
                {
                  title: 'Capacity Planning',
                  desc: 'Monitor class occupancy and balance student distributions.',
                  icon: PieChart,
                  phase: 2,
                  action: 'View Metrics',
                  handler: handleViewMetrics,
                  loading: isProcessing === 'metrics'
                },
              ].map((card, i) => (
                <ManagementCard key={i} {...card} />
              ))}
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Attendance Tracking', desc: 'Daily registers and automated absence reporting.', icon: Calendar, phase: 3 },
                { title: 'Subject Management', desc: 'Link teachers and learners to specific academic subjects.', icon: BookOpen, phase: 3 },
                { title: 'Timetable Hub', desc: 'Generate and manage class schedules across the school.', icon: ClipboardList, phase: 3 },
                { title: 'Academic Reports', desc: 'Automated report card generation and grade tracking.', icon: PieChart, phase: 3 },
              ].map((card, i) => (
                <ManagementCard key={i} {...card} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Enroll New Learner Modal */}
      <AnimatePresence>
        {isEnrollmentOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-250">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900">New Enrollment</h3>
                <button onClick={() => setIsEnrollmentOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
                   <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900" placeholder="e.g. John Smith" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Grade</label>
                     <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900">
                        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admission #</label>
                     <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900" placeholder="LNR-000" />
                   </div>
                 </div>
                 <button
                  onClick={() => {
                    toast.success('Learner enrollment initialized! (POST /api/v1/learners)');
                    setIsEnrollmentOpen(false);
                  }}
                  className="w-full py-4 bg-school-primary text-white font-black rounded-2xl shadow-lg shadow-school-primary/20 hover:bg-school-primary/90 transition-all uppercase tracking-widest text-xs"
                 >
                   Complete Enrollment
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Learner & Parent Multi-Channel Invitation Wizard Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-250">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-school-primary/10 text-school-primary rounded-xl">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Parent Portal Invitations</h3>
                    <p className="text-xs font-medium text-slate-500">Send custom invitation links via SMS, WhatsApp, or Email templates.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-2 hover:bg-slate-200/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Wizard Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50/30 px-6">
                {[
                  { id: 'single', label: 'Single Invite' },
                  { id: 'bulk', label: 'Bulk Paste Contact List' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInviteTab(tab.id as any)}
                    className={cn(
                      "px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all relative border-b-2",
                      inviteTab === tab.id ? "border-school-primary text-school-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Panels */}
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6 relative">
                {inviteTab === 'single' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">

                      {/* Learner Full Name Input + Autocomplete Suggestions */}
                      <div className="space-y-2 relative">
                        <label htmlFor="learnerNameInput" className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                          <span>Learner Full Name <span className="text-rose-500 font-bold">*</span></span>
                          <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">Auto-suggests real students</span>
                        </label>
                        <div className="relative">
                          <input
                            id="learnerNameInput"
                            type="text"
                            required
                            value={singleInvite.learnerName}
                            onChange={(e) => {
                              setSingleInvite(prev => ({
                                ...prev,
                                learnerName: e.target.value,
                                learnerId: '',
                                accessionNumber: ''
                              }));
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                            placeholder="e.g. Lethabo Manana"
                          />
                          {singleInvite.learnerName && (
                            <button
                              type="button"
                              onClick={() => setSingleInvite(prev => ({
                                ...prev,
                                learnerName: '',
                                learnerId: '',
                                accessionNumber: ''
                              }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {singleInvite.learnerName && !singleInvite.learnerId && (
                          <p className="text-xs text-amber-600 font-bold mt-1">Select a learner from the list</p>
                        )}

                        {/* Suggestions Dropdown Card */}
                        <AnimatePresence>
                          {showSuggestions && autocompleteSuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                            >
                              <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Matching enrolled students</span>
                                <button type="button" onClick={() => setShowSuggestions(false)} className="text-[10px] text-slate-400 font-bold hover:text-slate-600">Close</button>
                              </div>
                              <ul className="divide-y divide-slate-50">
                                {autocompleteSuggestions.map(suggestion => {
                                  const fullName = getLearnerFullName(suggestion);
                                  const grade = grades.find(g => g.id === suggestion.grade_id);
                                  return (
                                    <li key={suggestion.id}>
                                      <button
                                        type="button"
                                        onClick={() => handleSelectSuggestedLearner(suggestion)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between"
                                      >
                                        <div>
                                          <p className="text-sm font-bold text-slate-900">{fullName}</p>
                                          <p className="text-[10px] text-slate-400 font-medium">ADM: {suggestion.admission_number || '---'}</p>
                                        </div>
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase">
                                          {grade?.name || 'Enrolled'}
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Parent / Guardian Name
                        </label>
                        <input
                          type="text"
                          value={singleInvite.parentName}
                          onChange={(e) => setSingleInvite(prev => ({ ...prev, parentName: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                          placeholder="e.g. Mrs Manana (Optional)"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Grade Level
                        </label>
                        <select
                          value={singleInvite.gradeId}
                          onChange={(e) => setSingleInvite(prev => ({ ...prev, gradeId: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                        >
                          {grades.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Contact Channel
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'WhatsApp', label: 'WhatsApp', desc: 'Meta Template' },
                            { id: 'SMS', label: 'SMS', desc: 'Coming soon' },
                            { id: 'Email', label: 'Email', desc: 'Coming soon' }
                          ].map(ch => (
                            <button
                              key={ch.id}
                              type="button"
                              disabled={ch.id !== 'WhatsApp'}
                              onClick={() => setSingleInvite(prev => ({ ...prev, channel: ch.id as any }))}
                              className={cn(
                                "p-3.5 border rounded-2xl text-left transition-all relative flex flex-col justify-between h-[85px]",
                                singleInvite.channel === ch.id
                                  ? "border-school-primary bg-school-primary/5 text-school-primary"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500",
                                ch.id !== 'WhatsApp' && "opacity-50 cursor-not-allowed bg-slate-150 border-slate-200"
                              )}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-black text-[10px] uppercase tracking-wider text-slate-800">{ch.label}</span>
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                                  singleInvite.channel === ch.id ? "border-school-primary bg-school-primary text-white" : "border-slate-300"
                                )}>
                                  {singleInvite.channel === ch.id && <Check className="w-2.5 h-2.5" />}
                                </div>
                              </div>
                              <span className="text-[9px] text-slate-400 mt-2 font-medium leading-none">{ch.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {singleInvite.channel === 'Email' ? (
                        <div className="space-y-2">
                          <label htmlFor="parentEmailInput" className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            Parent Email Address
                            <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            id="parentEmailInput"
                            type="email"
                            required
                            value={singleInvite.parentEmail}
                            onChange={(e) => setSingleInvite(prev => ({ ...prev, parentEmail: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                            placeholder="e.g. parent@example.com"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label htmlFor="parentPhoneInput" className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            Mobile / WhatsApp Number
                            <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            id="parentPhoneInput"
                            type="tel"
                            required
                            value={singleInvite.parentPhone}
                            onChange={(e) => setSingleInvite(prev => ({ ...prev, parentPhone: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                            placeholder="e.g. 0721234567 or +27..."
                          />
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                            Accepts local formats (e.g. 070...) and international prefixes.
                          </p>
                        </div>
                      )}

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Message Preview</span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {singleInvite.channel === 'WhatsApp' ? (
                            <span>Meta Template <b>"parent_invite"</b>: <i>"Hello, {singleInvite.parentName || 'Parent'}. You are invited to join the Parent Portal for {currentSchool?.schoolName || 'Far North Secondary School'}..."</i></span>
                          ) : singleInvite.channel === 'Email' ? (
                            <span>Email SMTP: <i>"Hi, you've been invited by {currentSchool?.schoolName || 'Far North Secondary School'} to join our Parent Portal! Click here to sign up..."</i></span>
                          ) : (
                            <span>SMS: <i>"Hi {singleInvite.parentName || 'Parent'}! You are invited to join the Parent Portal for {currentSchool?.schoolName || 'Far North Secondary School'} on SchoolHeadOffice. Register at: https://schoolheadoffice.co.za/parent"</i></span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Scope Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Recipient Selection Scope</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'whole-school', label: 'Whole School' },
                          { id: 'grade', label: 'By Grade' },
                          { id: 'class', label: 'By Class' }
                        ].map(scope => (
                          <button
                            key={scope.id}
                            type="button"
                            onClick={() => setBulkScope(scope.id as any)}
                            className={cn(
                              "py-3 border rounded-2xl text-xs font-black uppercase tracking-wider transition-all",
                              bulkScope === scope.id
                                ? "border-school-primary bg-school-primary/5 text-school-primary"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                            )}
                          >
                            {scope.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scope-dependent Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Grade Selector (needed for 'grade' and 'class') */}
                      {(bulkScope === 'grade' || bulkScope === 'class') && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Grade</label>
                          <select
                            value={bulkGradeId}
                            onChange={(e) => setBulkGradeId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                          >
                            <option value="">Select a Grade</option>
                            {grades.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Class Selector (needed for 'class') */}
                      {bulkScope === 'class' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Class</label>
                          <select
                            value={selectedBulkClassId}
                            disabled={!bulkGradeId || isBulkClassesLoading}
                            onChange={(e) => setSelectedBulkClassId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900 disabled:opacity-50"
                          >
                            {isBulkClassesLoading ? (
                              <option>Loading classes...</option>
                            ) : bulkClasses.length > 0 ? (
                              bulkClasses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))
                            ) : (
                              <option value="">No classes found</option>
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Channel Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Bulk Contact Channel</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'WhatsApp', label: 'WhatsApp', desc: 'Meta Template' },
                          { id: 'SMS', label: 'SMS', desc: 'Coming soon' },
                          { id: 'Email', label: 'Email', desc: 'Coming soon' }
                        ].map(ch => (
                          <button
                            key={ch.id}
                            type="button"
                            disabled={ch.id !== 'WhatsApp'}
                            onClick={() => setBulkChannel(ch.id as any)}
                            className={cn(
                              "p-3.5 border rounded-2xl text-left transition-all relative flex flex-col justify-between h-[85px]",
                              bulkChannel === ch.id
                                ? "border-school-primary bg-school-primary/5 text-school-primary"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500",
                              ch.id !== 'WhatsApp' && "opacity-50 cursor-not-allowed bg-slate-150 border-slate-200"
                            )}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-black text-[10px] uppercase tracking-wider text-slate-800">{ch.label}</span>
                              <div className={cn(
                                "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                                bulkChannel === ch.id ? "border-school-primary bg-school-primary text-white" : "border-slate-300"
                              )}>
                                {bulkChannel === ch.id && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-400 mt-2 font-medium leading-none">{ch.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Checkbox List of Learners */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Select Recipients ({selectedBulkLearnerIds.size} Selected)
                        </span>
                        {bulkScope === 'whole-school' && (
                          <span className="text-[10px] font-bold text-slate-400">
                            Showing {bulkPickerPage * bulkPickerPerPage - bulkPickerPerPage + 1} - {Math.min(bulkPickerPage * bulkPickerPerPage, bulkPickerTotal)} of {bulkPickerTotal}
                          </span>
                        )}
                      </div>

                      {isBulkLearnersLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl">
                          <Loader2 className="w-8 h-8 animate-spin text-school-primary mb-2" />
                          <span className="text-xs font-bold text-slate-500">Loading learners list...</span>
                        </div>
                      ) : bulkPickerLearners.length > 0 ? (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                          <div className="max-h-[240px] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 z-10">
                                <tr>
                                  <th className="p-3 w-12 text-center">
                                    <input
                                      type="checkbox"
                                      checked={
                                        bulkPickerLearners.filter(l => !!getLearnerWhatsAppPhone(l)).length > 0 &&
                                        bulkPickerLearners.filter(l => !!getLearnerWhatsAppPhone(l)).every(l => selectedBulkLearnerIds.has(l.id))
                                      }
                                      onChange={() => {
                                        const phoneHavingInView = bulkPickerLearners.filter(l => !!getLearnerWhatsAppPhone(l));
                                        const allSelectedInView = phoneHavingInView.every(l => selectedBulkLearnerIds.has(l.id));
                                        const next = new Set(selectedBulkLearnerIds);
                                        if (allSelectedInView) {
                                          phoneHavingInView.forEach(l => next.delete(l.id));
                                        } else {
                                          phoneHavingInView.forEach(l => next.add(l.id));
                                        }
                                        setSelectedBulkLearnerIds(next);
                                      }}
                                      className="rounded border-slate-300 text-school-primary focus:ring-school-primary h-4 w-4 cursor-pointer"
                                    />
                                  </th>
                                  <th className="px-4 py-3 font-black text-[9px] text-slate-500 uppercase">Learner Name</th>
                                  <th className="px-4 py-3 font-black text-[9px] text-slate-500 uppercase">Grade / Class</th>
                                  <th className="px-4 py-3 font-black text-[9px] text-slate-500 uppercase">WhatsApp Number</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 bg-white">
                                {bulkPickerLearners.map(learner => {
                                  const phone = getLearnerWhatsAppPhone(learner);
                                  const isSelected = selectedBulkLearnerIds.has(learner.id);
                                  const isSelectable = !!phone;

                                  return (
                                    <tr
                                      key={learner.id}
                                      className={cn(
                                        "hover:bg-slate-50 transition-colors",
                                        !isSelectable && "bg-slate-50/50 opacity-60"
                                      )}
                                    >
                                      <td className="p-3 text-center">
                                        <input
                                          type="checkbox"
                                          disabled={!isSelectable}
                                          checked={isSelected}
                                          onChange={() => {
                                            const next = new Set(selectedBulkLearnerIds);
                                            if (next.has(learner.id)) {
                                              next.delete(learner.id);
                                            } else {
                                              next.add(learner.id);
                                            }
                                            setSelectedBulkLearnerIds(next);
                                          }}
                                          className="rounded border-slate-300 text-school-primary focus:ring-school-primary h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <p className="font-bold text-slate-900">{getLearnerFullName(learner)}</p>
                                        <p className="text-[10px] text-slate-400">ADM: {learner.admission_number || '---'}</p>
                                      </td>
                                      <td className="px-4 py-3 text-slate-600 font-medium">
                                        {grades.find(g => g.id === (learner.gradeId || learner.grade_id))?.name || '---'}
                                        {learner.class_name && ` • ${learner.class_name}`}
                                      </td>
                                      <td className="px-4 py-3 font-mono font-bold text-slate-700">
                                        {phone ? (
                                          <span className="text-emerald-700">{phone}</span>
                                        ) : (
                                          <span className="text-rose-500 flex items-center gap-1 text-[10px] font-sans">
                                            <AlertTriangle className="w-3.5 h-3.5" /> No Usable Phone
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Local Pagination Controls */}
                          {bulkScope === 'whole-school' && bulkPickerTotal > bulkPickerPerPage && (
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-t border-slate-200">
                              <button
                                type="button"
                                disabled={bulkPickerPage === 1}
                                onClick={() => fetchBulkPickerLearners(bulkPickerPage - 1, false)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Prev
                              </button>
                              <span className="text-[10px] font-bold text-slate-500">
                                Page {bulkPickerPage} of {Math.ceil(bulkPickerTotal / bulkPickerPerPage)}
                              </span>
                              <button
                                type="button"
                                disabled={bulkPickerPage * bulkPickerPerPage >= bulkPickerTotal}
                                onClick={() => fetchBulkPickerLearners(bulkPickerPage + 1, false)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-widest"
                              >
                                Next
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl border-dashed">
                          <Users className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                          <span className="text-xs font-bold text-slate-500">
                            {bulkScope === 'grade' && !bulkGradeId ? "Please select a grade first." :
                             bulkScope === 'class' && (!bulkGradeId || !selectedBulkClassId) ? "Please select a grade and class first." :
                             "No learners found for this selection."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 text-xs font-black rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>

                {inviteTab === 'single' ? (
                  <button
                    type="button"
                    onClick={handleSendSingleInvite}
                    disabled={isProcessing === 'sending-invite' || !singleInvite.learnerId}
                    className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 disabled:opacity-50 transition-all shadow-md shadow-school-primary/10 uppercase tracking-widest"
                  >
                    {isProcessing === 'sending-invite' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Invitation
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendBulkInvites}
                    disabled={isProcessing === 'sending-invite' || selectedBulkLearnerIds.size === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 disabled:opacity-50 transition-all shadow-md shadow-school-primary/10 uppercase tracking-widest"
                  >
                    {isProcessing === 'sending-invite' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send {selectedBulkLearnerIds.size} Invitations
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ManagementCard({ title, desc, icon: Icon, phase, action, handler, loading }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-school-primary/30 transition-all">
      <div className="absolute top-4 right-4">
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase tracking-widest">
          Phase {phase}
        </span>
      </div>

      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-school-primary/10 group-hover:text-school-primary flex items-center justify-center mb-6 transition-all">
        {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Icon className="w-7 h-7" />}
      </div>

      <h4 className="text-xl font-black text-slate-900 mb-2">{title}</h4>
      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 h-10">
        {desc}
      </p>

      {action ? (
        <button
          onClick={handler}
          disabled={loading}
          className="w-full py-3 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {loading ? 'Processing...' : action}
          {!loading && <ChevronRight className="w-3 h-3" />}
        </button>
      ) : (
        <div className="w-full py-3 bg-slate-50 text-slate-400 text-[10px] font-black rounded-xl text-center uppercase tracking-widest border border-slate-100">
          Module Locked (Under Dev)
        </div>
      )}
    </div>
  );
}
