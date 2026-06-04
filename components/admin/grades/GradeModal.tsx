'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Trash2 } from 'lucide-react';
import { SchoolAPI, Grade } from '@/lib/api/school-api';
import { toast } from 'react-hot-toast';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  grade?: Grade | null;
  schoolId: string;
  onSuccess: () => void;
}

export function GradeModal({ isOpen, onClose, mode, grade, schoolId, onSuccess }: GradeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    level: 0,
    description: '',
    order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && grade) {
      setFormData({
        name: grade.name || '',
        level: grade.level || 0,
        description: grade.description || '',
        order: grade.order || 0
      });
    } else {
      setFormData({
        name: '',
        level: 0,
        description: '',
        order: 0
      });
    }
  }, [mode, grade, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await SchoolAPI.createGrade(schoolId, formData);
        toast.success('Grade created successfully');
      } else if (mode === 'edit' && grade) {
        await SchoolAPI.updateGrade(grade.id, formData);
        toast.success('Grade updated successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} grade`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!grade || mode !== 'edit') return;

    if (confirm(`Are you sure you want to delete ${grade.name}? This will also delete all associated classes.`)) {
      setIsSubmitting(true);
      try {
        await SchoolAPI.deleteGrade(grade.id);
        toast.success('Grade deleted successfully');
        onSuccess();
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete grade');
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
            <div>
              <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                {mode === 'create' ? 'Create Grade' : 'Edit Grade'}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-slate-500 font-medium">
                {mode === 'create' ? 'Add a new grade level to the school' : 'Modify grade level details'}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Grade Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grade 9"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Level *
              </label>
              <input
                type="number"
                required
                min="0"
                max="12"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                placeholder="e.g., 9"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Optional description of the grade level"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                placeholder="0 (lowest first)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium"
              />
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
