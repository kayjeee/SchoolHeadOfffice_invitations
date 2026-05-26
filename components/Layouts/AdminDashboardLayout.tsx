import React from 'react';

interface SchoolTheme {
  primary_color?: string;
  secondary_color?: string;
  border_color?: string;
  border_radius?: string;
  border_weight?: string;
}

interface AdminDashboardLayoutProps {
  schoolTheme?: SchoolTheme;
  children: React.ReactNode;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ schoolTheme, children }) => {
  // Safeguard definitions if fields are empty
  const themeVars = {
    '--school-primary': schoolTheme?.primary_color || '#4f46e5',
    '--school-secondary': schoolTheme?.secondary_color || '#10b981',
    '--school-border-color': schoolTheme?.border_color || '#e5e7eb',
    '--school-radius': schoolTheme?.border_radius || '0.5rem',
    '--school-border-weight': schoolTheme?.border_weight || '1px',
  } as React.CSSProperties;

  return (
    <div
      style={themeVars}
      className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex"
    >
      {/* Sidebar / Shell Components */}
      <aside className="w-64 border-r border-school bg-white">
        <div className="p-6">
          <div className="h-8 w-8 rounded bg-school-primary mb-4"></div>
          <nav className="space-y-2">
            <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
            <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
