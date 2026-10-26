// components/student/Projects/ProjectHubTab.tsx
import React, { useState } from 'react';

interface SchoolProject {
  id: string;
  title: string;
  problemStatement: string;
  scope: string;
  requiredSkills: string[];
  techStack: string[];
  educatorMentor: string;
  schoolName: string;
  status: 'proposal' | 'active_development' | 'in_review' | 'integrated';
  contributorsCount: number;
}

const PROJECT_LIST: SchoolProject[] = [
  {
    id: 'proj-201',
    title: 'Automated Library Book Check-In & RFID Scanner',
    problemStatement: 'School library experiencing long queue times and lost textbook inventories during end-of-term returns.',
    scope: 'Develop a Web-based barcode/RFID scanner interface using Next.js to streamline book returns and update library database.',
    requiredSkills: ['JavaScript / TypeScript', 'React / Next.js', 'Basic Database Design'],
    techStack: ['Next.js', 'Tailwind CSS', 'MongoDB'],
    educatorMentor: 'Mr M. Sithole (Computer Applications Technology Educator)',
    schoolName: 'Kagiso High School',
    status: 'active_development',
    contributorsCount: 4
  },
  {
    id: 'proj-202',
    title: 'Solar Power & Load Shedding School Monitoring Dashboard',
    problemStatement: 'School IT equipment suffers unexpected shutdowns during municipal load shedding schedules.',
    scope: 'Build an IoT dashboard displaying solar battery charge levels and automated SMS alerts for computer lab equipment.',
    requiredSkills: ['Python', 'IoT Basics', 'REST API Integration'],
    techStack: ['Python', 'Flask', 'Chart.js'],
    educatorMentor: 'Mrs S. Patel (Physical Sciences Lead)',
    schoolName: 'Kagiso High School',
    status: 'proposal',
    contributorsCount: 2
  },
  {
    id: 'proj-203',
    title: 'Open-Source Offline Worksheet Generator',
    problemStatement: 'Rural township schools lack reliable high-speed internet to download online learning materials.',
    scope: 'Create a lightweight offline progressive web app (PWA) allowing educators to bundle offline PDF worksheets.',
    requiredSkills: ['PWA', 'JavaScript', 'HTML5 / CSS3'],
    techStack: ['Service Workers', 'IndexedDB', 'PDFKit'],
    educatorMentor: 'Dr K. Naidoo (District IT Specialist)',
    schoolName: 'Kagiso High School',
    status: 'in_review',
    contributorsCount: 6
  }
];

export default function ProjectHubTab() {
  const [projects, setProjects] = useState<SchoolProject[]>(PROJECT_LIST);
  const [selectedProject, setSelectedProject] = useState<SchoolProject | null>(null);
  const [joinedProjectIds, setJoinedProjectIds] = useState<string[]>([]);
  const [interestStatement, setInterestStatement] = useState('');
  const [activeTab, setActiveTab] = useState<'hub' | 'my_projects' | 'lifecycle'>('hub');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setJoinedProjectIds([...joinedProjectIds, selectedProject.id]);
    setProjects(prev =>
      prev.map(p => (p.id === selectedProject.id ? { ...p, contributorsCount: p.contributorsCount + 1 } : p))
    );
    setSelectedProject(null);
    setInterestStatement('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-semibold rounded-full mb-2">
            Student IT & Software Development
          </span>
          <h2 className="text-xl font-bold">Open-Source School Project Hub</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Collaborate on real-world school IT problems under educator mentorship. Build practical software skills for your portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'hub' ? 'bg-white text-blue-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Project Directory
          </button>
          <button
            onClick={() => setActiveTab('my_projects')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'my_projects' ? 'bg-white text-blue-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            My Contributions ({joinedProjectIds.length})
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'lifecycle' ? 'bg-white text-blue-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Contribution Lifecycle
          </button>
        </div>
      </div>

      {/* SECTION 1: PROJECT DIRECTORY */}
      {activeTab === 'hub' && !selectedProject && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const hasJoined = joinedProjectIds.includes(proj.id);
            return (
              <div
                key={proj.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {proj.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400">👥 {proj.contributorsCount} Student Contributors</span>
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm">{proj.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Problem: {proj.problemStatement}</p>
                  <p className="text-xs text-gray-500 mt-1">Scope: {proj.scope}</p>

                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.techStack.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700">Educator Mentor:</span> {proj.educatorMentor}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-indigo-900">{proj.schoolName}</span>
                  {hasJoined ? (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
                      ✓ Contributor
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Join Project
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 2: JOIN PROJECT FORM */}
      {selectedProject && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Join Project: {selectedProject.title}</h3>
            <button
              onClick={() => setSelectedProject(null)}
              className="text-xs text-indigo-600 font-medium hover:underline"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Your Technical Background & Motivation
              </label>
              <textarea
                rows={4}
                required
                value={interestStatement}
                onChange={(e) => setInterestStatement(e.target.value)}
                placeholder="Mention programming languages you know, GitHub profile link if any, or why you want to work on this school project..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-[11px] text-blue-900 space-y-1">
              <span className="font-bold block">⚙️ Open-Source Contribution Policy</span>
              <p>
                Student contributions are reviewed by educator mentors before merge. Software modules must pass quality tests and obtain maintainer approval prior to ecosystem integration.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm"
            >
              Submit Contribution Request
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: MY CONTRIBUTIONS */}
      {activeTab === 'my_projects' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-4">My Active Project Contributions</h3>

          {joinedProjectIds.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">You have not joined any open-source school projects yet.</p>
          ) : (
            <div className="space-y-3">
              {projects
                .filter(p => joinedProjectIds.includes(p.id))
                .map(proj => (
                  <div key={proj.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs">{proj.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Mentor: {proj.educatorMentor}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      Active Contributor
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: CONTRIBUTION LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Open-Source Contribution Lifecycle</h3>
          <p className="text-gray-600">
            How student software projects move from initial problem identification to school ecosystem integration:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong className="text-gray-900">Problem Identification:</strong> Educator or student identifies a practical school operational issue.</li>
            <li><strong className="text-gray-900">Project Proposal:</strong> Problem scope, required skills, and tech stack are defined.</li>
            <li><strong className="text-gray-900">Mentor Assignment:</strong> A qualified computer science educator or district IT specialist is assigned.</li>
            <li><strong className="text-gray-900">Development & Task Allocation:</strong> Student contributors break work into manageable feature modules.</li>
            <li><strong className="text-gray-900">Code Review & Approval:</strong> Code submissions are reviewed for quality, security, and documentation.</li>
            <li><strong className="text-gray-900">Maintainer Integration:</strong> Approved modules are integrated into school tools under open-source licenses.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
