'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Trash2, Users } from 'lucide-react';
import { SchoolAPI, Class } from '@/lib/api/school-api';
import { toast } from 'react-hot-toast';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  classItem?: {
    id: string;
    name: string;
    capacity: number;
    class_teacher_id?: string;
  } | null;
  gradeId: string;
  schoolId: string;
  onSuccess: (updatedClass: Class) => void;
}

export function ClassModal({ isOpen, onClose, mode, classItem, gradeId, schoolId, onSuccess }: ClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    capacity: 40,
    class_teacher_id: '',
    grade_id: gradeId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && classItem) {
      setFormData({
        name: classItem.name || '',
        capacity: classItem.capacity || 40,
        class_teacher_id: classItem.class_teacher_id || '',
        grade_id: gradeId
      });
    } else {
      setFormData({
        name: '',
        capacity: 40,
        class_teacher_id: '',
        grade_id: gradeId
      });
    }
  }, [mode, classItem, isOpen, gradeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (mode === 'create') {
        result = await SchoolAPI.createClass(schoolId, gradeId, formData);
        toast.success('Class created successfully');
      } else if (mode === 'edit' && classItem) {
        result = await SchoolAPI.updateClass(schoolId, gradeId, classItem.id, formData);
        toast.success('Class updated successfully');
      }

      if (result) {
        onSuccess(result);
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} class`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!classItem || mode !== 'edit') return;

    if (confirm(`Are you sure you want to delete Class ${classItem.name}?`)) {
      setIsSubmitting(true);
      try {
        await SchoolAPI.deleteClass(schoolId, gradeId, classItem.id);
        toast.success('Class deleted successfully');
        onSuccess();
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete class');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                  {mode === 'create' ? 'Create Class' : 'Edit Class'}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-medium">
                  {mode === 'create' ? 'Add a new class to the grade' : 'Modify class details and capacity'}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Class Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 9A"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Class Teacher ID (Optional)
              </label>
              <input
                type="text"
                value={formData.class_teacher_id}
                onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
                placeholder="auth0|..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
              />
              <p className="text-xs text-slate-400 mt-1">Enter the Auth0 ID of the teacher</p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-school-primary text-white font-bold rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
