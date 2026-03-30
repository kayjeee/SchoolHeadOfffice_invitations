import React from 'react';
import DashboardLayoutWrapper from '@/components/teacher/DashboardLayoutWrapper';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    schoolSlug: string;
    teacherSlug: string;
  }>;
}

export default async function DashboardLayout({ children, params }: LayoutProps) {
  const { schoolSlug, teacherSlug } = await params;

  return (
    <DashboardLayoutWrapper
      schoolSlug={schoolSlug}
      teacherSlug={teacherSlug}
    >
      {children}
    </DashboardLayoutWrapper>
  );
}
