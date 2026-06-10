'use client';

import React, { use } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import {
  Building2,
  Mail,
  MapPin,
  Shield,
  Key,
  UserCheck,
  Globe,
  Fingerprint,
  Save,
  RefreshCw,
  ExternalLink,
  School
} from 'lucide-react';

export default function AdminSettingsPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolData, isLoading } = useSchool(schoolSlug);

  const displayName = (schoolData?.schoolName || schoolSlug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Administrative Settings</h2>
        <p className="text-slate-500 mt-1">Configure your school's identity and security parameters.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Meta Cards */}
        <div className="xl:col-span-2 space-y-8">

          {/* School Meta Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-school-primary/10 rounded-lg text-school-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">School Meta Information</h3>
                  <p className="text-xs text-slate-500">Public profile and contact details</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-school-primary text-white text-sm font-bold rounded-lg hover:bg-school-primary/90 transition-all shadow-md shadow-school-primary/20">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    defaultValue={displayName}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    defaultValue="info@farnorthsecondary.edu.za"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={3}
                    defaultValue="2188, 27 Ukraine Ave, Cosmo City, Johannesburg, 2188"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    defaultValue="www.farnorthsecondary.co.za"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School EMIS Number</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    defaultValue={schoolData?.emisNumber || "700400585"}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Profile/Security Details Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Security & Authentication</h3>
                <p className="text-xs text-slate-500">Identity hooks and access control</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 tracking-tight">Internal School ID</p>
                    <p className="text-xs font-mono text-slate-500 select-all">{schoolData?.id || schoolData?._id || "..."}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-200">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rotate Key
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500 rounded-full text-white mt-0.5">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Identity Verified</p>
                    <p className="text-xs text-emerald-700/80 leading-relaxed">
                      Your administrative credentials have been verified by the District Head Office.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex items-start gap-3">
                  <div className="p-1.5 bg-amber-500 rounded-full text-white mt-0.5">
                    <Shield className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">2FA Active</p>
                    <p className="text-xs text-amber-700/80 leading-relaxed">
                      Multi-factor authentication is required for all administrative access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Status & Flags */}
        <div className="space-y-6">
          <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <School className="w-24 h-24" />
            </div>

            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">System Status</h4>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Deployment Mode</span>
                <span className="px-2 py-0.5 rounded bg-school-primary text-[10px] font-bold">PRODUCTION</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Branding Engine</span>
                <span className="text-school-primary text-sm font-bold">Dynamic (v2.4)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Last Sync</span>
                <span className="text-white text-sm font-medium italic">2 mins ago</span>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">All Systems Operational</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'View School Website', icon: ExternalLink },
                { label: 'District Admin Panel', icon: ExternalLink },
                { label: 'Audit Log API', icon: Key },
                { label: 'Documentation', icon: Globe },
              ].map((link, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 text-slate-400 group-hover:text-school-primary transition-colors" />
                    <span className="text-sm font-medium text-slate-700">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
