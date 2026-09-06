'use client';

import React, { use, useEffect, useState, useMemo } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import { useSchoolContext } from '@/components/context/SchoolContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  BookOpen,
  UserPlus,
  Download,
  ShieldCheck,
  Star,
  Send,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Phone,
  HelpCircle,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  MoreVertical,
  Eye,
  RefreshCw,
  Package,
  CheckSquare,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useUser } from '@auth0/nextjs-auth0/client';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PageHeader, StatsCard } from '@/components/admin/common/DashboardUI';
import { TeacherProfileDrawer } from '@/components/admin/teachers/TeacherProfileDrawer';
import { SchoolAPI, Teacher, Grade, Subject } from '@/lib/api/school-api';
import { apiClient } from '@/lib/api/api-client';
import { z } from 'zod';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TeachersCRMPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, isLoading: isSchoolLoading } = useSchool(schoolSlug);
  const { currentSchool } = useSchoolContext();
  const { user } = useUser();
  const router = useRouter();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'directory' | 'invitations' | 'supplies'>('directory');

  // Directory State
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Aux Data
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Invitations CRM State
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isInvitationsLoading, setIsInvitationsLoading] = useState(false);
  const [invitationSearchQuery, setInvitationSearchQuery] = useState('');
  const [invitationFilterStatus, setInvitationFilterStatus] = useState<string>('all');
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  // Supply Requisitions State
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [isSupplyLoading, setIsSupplyLoading] = useState(false);
  const [supplySearchQuery, setSupplySearchQuery] = useState('');
  const [supplyFilterStatus, setSupplyFilterStatus] = useState<string>('all');

  // Invite Wizard Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<'single' | 'bulk'>('single');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Single Invite Form State
  const [singleInvite, setSingleInvite] = useState({
    name: '',
    phone: '',
    email: '',
    teacher_type: 'staff' as 'staff' | 'community',
    assigned_grade_ids: [] as string[],
    subject_ids: [] as string[],
    channel: 'WhatsApp' as 'WhatsApp' | 'SMS' | 'Email'
  });

  // Bulk Invite Form State (text paste / entries)
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [bulkTeacherType, setBulkTeacherType] = useState<'staff' | 'community'>('staff');
  const [bulkAssignedGradeIds, setBulkAssignedGradeIds] = useState<string[]>([]);
  const [bulkSubjectIds, setBulkSubjectIds] = useState<string[]>([]);
  const [bulkChannel, setBulkChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');

  useEffect(() => {
    if (schoolId) {
      loadTeachers();
      fetchAuxData();
      fetchInvitations();
      fetchSupplyRequests();
    }
  }, [schoolId]);

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await SchoolAPI.getTeachers(schoolId!);
      setTeachers(data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [gradesData, subjectsData] = await Promise.all([
        SchoolAPI.getGrades(schoolId!),
        SchoolAPI.getSubjects(schoolId!)
      ]);
      setGrades(gradesData || []);
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Failed to load grades/subjects:', error);
    }
  };

  const fetchInvitations = async () => {
    if (!schoolId) return;
    setIsInvitationsLoading(true);
    setInvitationsError(null);
    try {
      const invitesData = await SchoolAPI.getTeacherInvitations(schoolId!);
      setInvitations(invitesData || []);
    } catch (error) {
      console.error('Failed to fetch teacher invitations:', error);
      setInvitationsError("Couldn't load teacher invitations — try refreshing");
    } finally {
      setIsInvitationsLoading(false);
    }
  };

  const fetchSupplyRequests = async () => {
    if (!schoolId) return;
    setIsSupplyLoading(true);
    try {
      const requests = await SchoolAPI.getSupplyRequests(schoolId!);
      setSupplyRequests(requests || []);
    } catch (error) {
      console.error('Failed to fetch supply requests:', error);
    } finally {
      setIsSupplyLoading(false);
    }
  };

  // Supply Actions: Approve, Reject, Fulfill
  const handleApproveSupply = async (id: string) => {
    toast.loading('Approving supply request...', { id: `supply-${id}` });
    try {
      await SchoolAPI.approveSupplyRequest(id);
      toast.success('Supply request approved!', { id: `supply-${id}` });
      fetchSupplyRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request', { id: `supply-${id}` });
    }
  };

  const handleRejectSupply = async (id: string) => {
    const adminNote = prompt('Optional rejection note for teacher:') || '';
    toast.loading('Rejecting supply request...', { id: `supply-${id}` });
    try {
      await SchoolAPI.rejectSupplyRequest(id, adminNote);
      toast.success('Supply request rejected.', { id: `supply-${id}` });
      fetchSupplyRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request', { id: `supply-${id}` });
    }
  };

  const handleFulfillSupply = async (id: string) => {
    toast.loading('Fulfilling supply request...', { id: `supply-${id}` });
    try {
      await SchoolAPI.fulfillSupplyRequest(id);
      toast.success('Supply request marked as fulfilled!', { id: `supply-${id}` });
      fetchSupplyRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to fulfill request', { id: `supply-${id}` });
    }
  };

  // Resend / Cancel / Accept Action Handlers
  const handleResendInvitation = async (token: string) => {
    toast.loading('Resending teacher invitation...', { id: `resend-${token}` });
    try {
      await SchoolAPI.resendLearnerInvitation(token);
      toast.success('Teacher invitation resent successfully!', { id: `resend-${token}` });
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to resend invitation.', { id: `resend-${token}` });
    }
  };

  const handleCancelInvitation = async (token: string) => {
    toast.loading('Cancelling teacher invitation...', { id: `cancel-${token}` });
    try {
      await SchoolAPI.cancelLearnerInvitation(token);
      toast.success('Teacher invitation cancelled.', { id: `cancel-${token}` });
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to cancel invitation.', { id: `cancel-${token}` });
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    toast.loading('Accepting teacher invitation...', { id: `accept-${token}` });
    try {
      await SchoolAPI.acceptLearnerInvitation(token);
      toast.success('Teacher invitation accepted and linked!', { id: `accept-${token}` });
      fetchInvitations();
      loadTeachers(); // Refresh directory state to reflect updated teacher records
    } catch (error: any) {
      console.error('Accept teacher invitation error:', error);
      const errorMsg = error.details?.message || error.details?.error || error.message || 'Failed to accept invitation.';
      toast.error(errorMsg, { id: `accept-${token}` });
    }
  };

  // Phone normalization utility (082... -> 2782...)
  const normalizePhoneNumber = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
      return '27' + digits.slice(1);
    }
    if (digits.length >= 10 && digits.length <= 15) {
      return digits;
    }
    return phone.trim();
  };

  // Handlers for Single Invite Dispatch
  const handleSendSingleInvite = async () => {
    if (!singleInvite.name.trim()) {
      toast.error('Please enter the teacher name.');
      return;
    }
    if (singleInvite.channel === 'Email' && !singleInvite.email.trim()) {
      toast.error('Please enter the teacher email address.');
      return;
    }
    if (singleInvite.channel !== 'Email' && !singleInvite.phone.trim()) {
      toast.error('Please enter the teacher phone number.');
      return;
    }

    const resolvedSchoolId = schoolId || currentSchool?.id || currentSchool?._id || '';
    const normalizedPhone = normalizePhoneNumber(singleInvite.phone);

    const payload = {
      phone_number: normalizedPhone,
      email: singleInvite.email,
      school_id: resolvedSchoolId,
      role: 'teacher',
      invited_via: singleInvite.channel.toLowerCase(),
      teacher_name: singleInvite.name,
      parent_name: singleInvite.name, // standard fallback
      teacher_type: singleInvite.teacher_type,
      assigned_grade_ids: singleInvite.assigned_grade_ids,
      subject_ids: singleInvite.subject_ids,
      sender: user?.email || 'admin@schoolheadoffice.co.za',
      sender_id: user?.sub || 'system'
    };

    setIsProcessing('sending-invite');
    const toastId = toast.loading('Creating teacher invitation...');

    try {
      const response: any = await apiClient.post('/api/v1/invitations', payload, z.any());
      const invToken = response.invitation?.token || response.token || response.id || '';
      const schoolName = currentSchool?.schoolName || 'School';
      const magicLink = `?token=${invToken}&school=${encodeURIComponent(schoolName.trim())}`;

      if (singleInvite.channel === 'WhatsApp' && normalizedPhone) {
        toast.loading('Dispatching WhatsApp message...', { id: toastId });
        try {
          await apiClient.post('/api/whatsapp-business/send-bulk', {
            personalizedMessages: [
              {
                to: normalizedPhone,
                parentName: singleInvite.name.trim(),
                magicLink: magicLink,
                message: `Hello ${singleInvite.name.trim()}, you are invited to join the Faculty Portal for ${schoolName}. Click here: ${magicLink}`
              }
            ],
            schoolName
          }, z.any());
        } catch (wsErr: any) {
          console.warn('WhatsApp business dispatch warning:', wsErr);
        }
      }

      toast.success('Teacher invitation dispatched successfully!', { id: toastId });
      setIsInviteModalOpen(false);

      // Reset Single Invite state
      setSingleInvite({
        name: '',
        phone: '',
        email: '',
        teacher_type: 'staff',
        assigned_grade_ids: [],
        subject_ids: [],
        channel: 'WhatsApp'
      });

      fetchInvitations();
    } catch (err: any) {
      toast.error(`Dispatch failed: ${err.message}`, { id: toastId });
    } finally {
      setIsProcessing(null);
    }
  };

  // Handlers for Bulk Paste Invite Dispatch
  const handleSendBulkInvites = async () => {
    if (!bulkPasteText.trim()) {
      toast.error('Please paste or type at least one teacher contact (Name, Phone/Email).');
      return;
    }

    // Parse lines: "Name, Phone" or "Name, Email" or separate lines
    const lines = bulkPasteText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedEntries = lines.map(line => {
      const parts = line.split(/[,;\t]+/).map(p => p.trim());
      const name = parts[0] || 'Faculty Member';
      const contact = parts[1] || '';
      const isEmail = contact.includes('@');
      return {
        name,
        phone_number: isEmail ? '' : normalizePhoneNumber(contact),
        email: isEmail ? contact : '',
        teacher_type: bulkTeacherType,
        assigned_grade_ids: bulkAssignedGradeIds,
        subject_ids: bulkSubjectIds
      };
    }).filter(e => e.phone_number || e.email || e.name);

    if (parsedEntries.length === 0) {
      toast.error('No valid teacher entries parsed.');
      return;
    }

    const resolvedSchoolId = schoolId || currentSchool?.id || currentSchool?._id || '';

    const payload = {
      invitations: parsedEntries.map(e => ({
        phone_number: e.phone_number,
        email: e.email,
        teacher_name: e.name,
        parent_name: e.name,
        teacher_type: e.teacher_type,
        assigned_grade_ids: e.assigned_grade_ids,
        subject_ids: e.subject_ids
      })),
      school_id: resolvedSchoolId,
      role: 'teacher',
      sender_id: user?.sub || 'system',
      sender: user?.email || 'admin@schoolheadoffice.co.za',
      invited_via: bulkChannel.toLowerCase()
    };

    setIsProcessing('sending-invite');
    const toastId = toast.loading(`Creating ${parsedEntries.length} teacher invitations...`);

    let bulkResponse: any;
    try {
      bulkResponse = await apiClient.post('/api/v1/invitations/bulk_create', payload, z.any());
    } catch (err: any) {
      toast.error(`Invitation creation failed: ${err.message}`, { id: toastId });
      setIsProcessing(null);
      return;
    }

    const createdInvites: any[] =
      bulkResponse?.invitations ||
      bulkResponse?.teacher_invitations ||
      bulkResponse?.data?.invitations ||
      (Array.isArray(bulkResponse) ? bulkResponse : []);

    const createdCount = createdInvites.length;

    if (createdCount === 0) {
      toast.error('Failed to create teacher invitations.', { id: toastId });
      setIsProcessing(null);
      return;
    }

    // Pipeline: Send WhatsApp messages for entries with valid phone numbers
    const schoolName = currentSchool?.schoolName || 'School';
    const personalizedMessages = createdInvites.map((inv: any) => {
      const phone = inv.phone_number || inv.phone || inv.recipient_phone_number || '';
      const token = inv.token || inv.id || '';
      const teacherName = inv.teacher_name || inv.parent_name || 'Teacher';
      const magicLink = `?token=${token}&school=${encodeURIComponent(schoolName.trim())}`;

      return {
        to: phone,
        parentName: teacherName,
        magicLink: magicLink,
        message: `Hello ${teacherName}, you are invited to join the Faculty Portal for ${schoolName}. Click here: ${magicLink}`
      };
    }).filter(msg => !!msg.to);

    if (personalizedMessages.length > 0 && bulkChannel === 'WhatsApp') {
      toast.loading(`Sending ${personalizedMessages.length} WhatsApp messages...`, { id: toastId });
      try {
        await apiClient.post('/api/whatsapp-business/send-bulk', {
          personalizedMessages,
          schoolName
        }, z.any());
      } catch (wsErr) {
        console.error('WhatsApp send-bulk error:', wsErr);
      }
    }

    toast.success(`Created ${createdCount} teacher invitation(s) successfully!`, { id: toastId });
    setIsInviteModalOpen(false);
    setBulkPasteText('');
    fetchInvitations();
    setIsProcessing(null);
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <PageHeader
        title="Teacher Management"
        description="Manage your faculty, academic workloads, invitations, and supply requisitions."
        actions={
          <>
            <button
              onClick={async () => {
                if (!schoolId) return;
                toast.loading('Opening All Teachers conversation thread...', { id: 'msg-teachers' });
                try {
                  const existing = await MessagingAPI.getConversations({
                    scope_id: 'all_teachers',
                    school_id: schoolId
                  });

                  let conv = existing.find(c => c.scope_type === 'teachers');

                  if (!conv) {
                    conv = await MessagingAPI.createConversation(
                      [],
                      schoolId,
                      user?.sub || 'admin-123',
                      {
                        scope_type: 'teachers',
                        scope_id: 'all_teachers',
                        title: 'All Faculty & Staff Teachers'
                      }
                    );
                  }

                  toast.success('Redirecting to Communications...', { id: 'msg-teachers' });
                  router.push(`/admin/${schoolSlug}/communications?conversationId=${conv.id}`);
                } catch (err: any) {
                  toast.error(err.message || 'Failed to open conversation', { id: 'msg-teachers' });
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Message All Teachers
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" />
              Export Staff List
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-sm font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20 uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              Invite Teachers
            </button>
          </>
        }
      />

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 pb-px">
        <div className="flex gap-8">
          {[
            { id: 'directory', label: 'Faculty Directory', icon: Users },
            { id: 'invitations', label: 'Teacher Invitations CRM', icon: ClipboardList },
            { id: 'supplies', label: 'Supply Requisitions', icon: Package }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 pb-4 text-sm font-bold transition-all relative",
                activeTab === tab.id ? "text-school-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabTeacher"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-school-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'directory' ? (
            <div className="space-y-8">
              {/* Faculty Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard label="Total Faculty" value={teachers.length.toString()} change="+2" icon={Users} />
                <StatsCard label="Classes Assigned" value="428" change="+12" icon={BookOpen} />
                <StatsCard label="Avg Performance" value="94.2%" icon={Star} />
                <StatsCard label="On Leave" value="6" icon={ShieldCheck} />
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, department, or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse h-[320px]">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
                      <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-slate-50 rounded w-1/2 mb-6" />
                      <div className="space-y-2 pt-4 border-t border-slate-50">
                        <div className="h-2 bg-slate-50 rounded" />
                        <div className="h-2 bg-slate-50 rounded" />
                      </div>
                    </div>
                  ))
                ) : filteredTeachers.map((teacher, i) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-school-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg">
                        {teacher.avatar || teacher.name.charAt(0)}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                        teacher.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {teacher.status}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 mb-1 truncate">{teacher.name}</h5>
                    <p className="text-xs font-black text-school-primary uppercase tracking-wider mb-2">
                      {teacher.role}
                    </p>

                    {/* Show Assigned Grades */}
                    {teacher.grades && teacher.grades.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {teacher.grades.map((g, gi) => (
                          <span key={gi} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 pt-4 border-t border-slate-50">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Department</span>
                        <span className="text-slate-900 font-bold">{teacher.department || 'General'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Students</span>
                        <span className="text-slate-900 font-bold">{teacher.student_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Avg Result</span>
                        <span className="text-emerald-600 font-black">{teacher.performance || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setIsDrawerOpen(true);
                        }}
                        className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-600 rounded-xl transition-all uppercase tracking-widest border border-slate-100"
                      >
                        View Profile
                      </button>
                      <button className="p-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition-all border border-slate-100">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Empty/Add Slot */}
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-school-primary hover:border-school-primary/50 hover:bg-school-primary/5 transition-all group"
                >
                   <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 group-hover:border-school-primary/50 flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest">Invite Faculty Member</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'invitations' ? (
            <div className="space-y-6">

              {invitationsError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{invitationsError}</span>
                  <button onClick={() => fetchInvitations()} className="ml-auto underline hover:text-rose-900">Retry</button>
                </div>
              )}

              {/* Quick Help Banner */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-emerald-100/50">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight">Faculty & Community Teacher Invitations</h4>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xl">
                      Invite staff or community teachers with pre-assigned grades and academic subjects. Dispatches dynamic WhatsApp links directly to faculty members.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-md shadow-school-primary/10 uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  Invite Teachers
                </button>
              </div>

              {/* Stats / KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Invitations Sent', value: invitations.length, sub: 'Teacher role', icon: Users, color: 'bg-indigo-50 text-blue-600' },
                  { label: 'Pending Response', value: invitations.filter(inv => inv.status === 'pending').length, sub: 'Awaiting onboarding', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
                  { label: 'Accepted & Joined', value: invitations.filter(inv => inv.status === 'accepted').length, sub: 'Active faculty', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Conversion Rate', value: `${invitations.length > 0 ? Math.round((invitations.filter(inv => inv.status === 'accepted').length / invitations.length) * 100) : 0}%`, sub: 'Success rate', icon: TrendingUp, color: 'bg-pink-50 text-pink-600' },
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
                    placeholder="Search by teacher name, contact, or status..."
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
                    onClick={() => fetchInvitations()}
                    className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all"
                    title="Refresh List"
                  >
                    <RefreshCw className={cn("w-4 h-4", isInvitationsLoading && "animate-spin")} />
                  </button>
                </div>
              </div>

              {/* Teacher Invitations Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Grades</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjects</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {invitations
                        .filter(inv => {
                          const query = invitationSearchQuery.toLowerCase();
                          const tName = inv.teacher_name || inv.resolved_learner_names || inv.parent_name || 'Unknown Teacher';
                          const contact = inv.phone_number || inv.parent_phone || inv.email || inv.parent_email || '';
                          const matchesSearch = tName.toLowerCase().includes(query) || contact.toLowerCase().includes(query);
                          const matchesStatus = invitationFilterStatus === 'all' || inv.status === invitationFilterStatus;
                          return matchesSearch && matchesStatus;
                        })
                        .map((inv) => {
                          const teacherName = inv.teacher_name || (Array.isArray(inv.resolved_learner_names) ? inv.resolved_learner_names.join(', ') : inv.resolved_learner_names) || inv.parent_name || 'Teacher';
                          const contactInfo = inv.phone_number || inv.parent_phone || inv.email || inv.parent_email || '---';
                          const teacherType = inv.teacher_type || 'staff';
                          const gradeNames = inv.resolved_assigned_grade_names || inv.assigned_grade_names || (inv.grade_name ? [inv.grade_name] : []);
                          const subjectNames = inv.resolved_subject_names || inv.subject_names || [];

                          return (
                            <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                    {teacherName[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{teacherName}</p>
                                    <p className="text-[10px] text-slate-400">
                                      Invited: {new Date(inv.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                                {contactInfo}
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border",
                                  teacherType === 'community'
                                    ? "bg-purple-50 text-purple-700 border-purple-100"
                                    : "bg-blue-50 text-blue-700 border-blue-100"
                                )}>
                                  {teacherType}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-[160px]">
                                  {gradeNames.length > 0 ? gradeNames.map((gn: string, gni: number) => (
                                    <span key={gni} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                                      {gn}
                                    </span>
                                  )) : <span className="text-xs text-slate-400">---</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-[160px]">
                                  {subjectNames.length > 0 ? subjectNames.map((sn: string, sni: number) => (
                                    <span key={sni} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                                      {sn}
                                    </span>
                                  )) : <span className="text-xs text-slate-400">---</span>}
                                </div>
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
                            No teacher invitations sent yet. Click "Invite Teachers" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Supply Requisitions Tab */
            <div className="space-y-6">
              {/* Quick Summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Requisitions', value: supplyRequests.length, sub: 'Paper & materials', icon: Package, color: 'bg-indigo-50 text-blue-600' },
                  { label: 'Pending Triage', value: supplyRequests.filter(r => r.status === 'pending').length, sub: 'Needs review', icon: Clock, color: 'bg-amber-50 text-amber-600' },
                  { label: 'Approved', value: supplyRequests.filter(r => r.status === 'approved').length, sub: 'Ready for fulfillment', icon: CheckSquare, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Fulfilled', value: supplyRequests.filter(r => r.status === 'fulfilled').length, sub: 'Completed', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-xl", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">{isSupplyLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-200" /> : stat.value}</h4>
                    <p className="text-sm font-bold text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search requisitions by teacher name or item type..."
                    value={supplySearchQuery}
                    onChange={(e) => setSupplySearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900"
                  />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <select
                    value={supplyFilterStatus}
                    onChange={(e) => setSupplyFilterStatus(e.target.value)}
                    className="flex-1 md:flex-initial px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900 min-w-[160px]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => fetchSupplyRequests()}
                    className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all"
                    title="Refresh List"
                  >
                    <RefreshCw className={cn("w-4 h-4", isSupplyLoading && "animate-spin")} />
                  </button>
                </div>
              </div>

              {/* Requisitions Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Member</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item & Quantity</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Notes</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {supplyRequests
                        .filter(req => {
                          const query = supplySearchQuery.toLowerCase();
                          const teacherName = req.teacher_name || teachers.find(t => t.id === req.teacher_id)?.name || 'Teacher';
                          const itemType = req.item_type || 'paper';
                          const matchesSearch = teacherName.toLowerCase().includes(query) || itemType.toLowerCase().includes(query) || (req.reason || '').toLowerCase().includes(query);
                          const matchesStatus = supplyFilterStatus === 'all' || req.status === supplyFilterStatus;
                          return matchesSearch && matchesStatus;
                        })
                        .map((req) => {
                          const teacherName = req.teacher_name || teachers.find(t => t.id === req.teacher_id)?.name || 'Faculty Member';

                          return (
                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                                {teacherName}
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900 text-sm">
                                  {req.quantity} {req.unit || 'pages'}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase">
                                  {req.item_type || 'paper'}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                                {req.reason || '---'}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {new Date(req.created_at || Date.now()).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                  req.status === 'fulfilled'
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : req.status === 'approved'
                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                    : req.status === 'rejected'
                                    ? "bg-rose-50 text-rose-700 border-rose-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                )}>
                                  {req.status || 'pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {req.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveSupply(req.id)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-wider"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleRejectSupply(req.id)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[10px] font-bold rounded-xl transition-all"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {req.status === 'approved' && (
                                    <button
                                      onClick={() => handleFulfillSupply(req.id)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-wider"
                                    >
                                      Mark Fulfilled
                                    </button>
                                  )}
                                  {req.status === 'fulfilled' && (
                                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                    </span>
                                  )}
                                  {req.status === 'rejected' && (
                                    <span className="text-xs text-rose-500 italic">Rejected</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {supplyRequests.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                            No supply requisitions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <TeacherProfileDrawer
        teacher={selectedTeacher}
        schoolId={schoolId || undefined}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDataChange={() => fetchSupplyRequests()}
      />

      {/* Invite Teacher Modal */}
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
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Faculty & Teacher Invitations</h3>
                    <p className="text-xs font-medium text-slate-500">Invite individual teachers or paste a list to dispatch WhatsApp invites.</p>
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
                  { id: 'single', label: 'Single Teacher Invite' },
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
                      {/* Teacher Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                          Teacher Name <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={singleInvite.name}
                          onChange={(e) => setSingleInvite(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                          placeholder="e.g. Dr. Sarah Jenkins"
                        />
                      </div>

                      {/* Teacher Type Toggle (Staff / Community) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                          Teacher Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'staff', label: 'Staff Teacher' },
                            { id: 'community', label: 'Community Teacher' }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSingleInvite(prev => ({ ...prev, teacher_type: t.id as any }))}
                              className={cn(
                                "py-2.5 px-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                singleInvite.teacher_type === t.id
                                  ? "border-school-primary bg-school-primary/5 text-school-primary"
                                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Assigned Grades Multi-Select */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                          Assigned Grades
                        </label>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-32 overflow-y-auto space-y-1.5">
                          {grades.map(g => {
                            const isSelected = singleInvite.assigned_grade_ids.includes(g.id);
                            return (
                              <label key={g.id} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSingleInvite(prev => ({
                                      ...prev,
                                      assigned_grade_ids: isSelected
                                        ? prev.assigned_grade_ids.filter(id => id !== g.id)
                                        : [...prev.assigned_grade_ids, g.id]
                                    }));
                                  }}
                                  className="rounded border-slate-300 text-school-primary focus:ring-school-primary h-4 w-4"
                                />
                                {g.name}
                              </label>
                            );
                          })}
                          {grades.length === 0 && <span className="text-xs text-slate-400">No grades loaded</span>}
                        </div>
                      </div>

                      {/* Subjects Multi-Select */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                          Assigned Subjects
                        </label>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-32 overflow-y-auto space-y-1.5">
                          {subjects.map(s => {
                            const isSelected = singleInvite.subject_ids.includes(s.id);
                            return (
                              <label key={s.id} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-slate-900">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSingleInvite(prev => ({
                                      ...prev,
                                      subject_ids: isSelected
                                        ? prev.subject_ids.filter(id => id !== s.id)
                                        : [...prev.subject_ids, s.id]
                                    }));
                                  }}
                                  className="rounded border-slate-300 text-school-primary focus:ring-school-primary h-4 w-4"
                                />
                                {s.name} {s.code ? `(${s.code})` : ''}
                              </label>
                            );
                          })}
                          {subjects.length === 0 && <span className="text-xs text-slate-400">No subjects loaded</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Contact Channel Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
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
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Teacher Email Address <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={singleInvite.email}
                            onChange={(e) => setSingleInvite(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                            placeholder="e.g. teacher@school.edu"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Mobile / WhatsApp Number <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={singleInvite.phone}
                            onChange={(e) => setSingleInvite(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                            placeholder="e.g. 0821234567 or +27..."
                          />
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                            Accepts local formats (e.g. 082...) and international prefixes.
                          </p>
                        </div>
                      )}

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Message Preview</span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          <span>Meta Template <b>"parent_invite"</b> (Faculty Mode): <i>"Hello {singleInvite.name || 'Teacher'}, you are invited to join the Faculty Portal for {currentSchool?.schoolName || 'School'}. Click here to complete setup..."</i></span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                        Bulk Teacher Entries (One per line: "Name, Phone/Email")
                      </label>
                      <textarea
                        rows={6}
                        value={bulkPasteText}
                        onChange={(e) => setBulkPasteText(e.target.value)}
                        placeholder="e.g.&#10;Dr. Sarah Jenkins, 0821234567&#10;Mr. Mark Davis, 0739876543&#10;Prof. Alan Poe, alan@school.edu"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bulk Teacher Type */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                          Default Teacher Type
                        </label>
                        <select
                          value={bulkTeacherType}
                          onChange={(e) => setBulkTeacherType(e.target.value as any)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none text-slate-900"
                        >
                          <option value="staff">Staff Teacher</option>
                          <option value="community">Community Teacher</option>
                        </select>
                      </div>

                      {/* Bulk Grades Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                          Assign Grades to All
                        </label>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-24 overflow-y-auto space-y-1">
                          {grades.map(g => (
                            <label key={g.id} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bulkAssignedGradeIds.includes(g.id)}
                                onChange={() => {
                                  setBulkAssignedGradeIds(prev =>
                                    prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
                                  );
                                }}
                                className="rounded border-slate-300 text-school-primary focus:ring-school-primary h-3.5 w-3.5"
                              />
                              {g.name}
                            </label>
                          ))}
                        </div>
                      </div>
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
                    disabled={isProcessing === 'sending-invite' || !singleInvite.name.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 disabled:opacity-50 transition-all shadow-md shadow-school-primary/10 uppercase tracking-widest"
                  >
                    {isProcessing === 'sending-invite' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Teacher Invitation
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendBulkInvites}
                    disabled={isProcessing === 'sending-invite' || !bulkPasteText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 disabled:opacity-50 transition-all shadow-md shadow-school-primary/10 uppercase tracking-widest"
                  >
                    {isProcessing === 'sending-invite' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Bulk Invitations
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
