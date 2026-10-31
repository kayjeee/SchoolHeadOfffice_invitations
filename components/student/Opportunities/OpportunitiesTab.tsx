// components/student/Opportunities/OpportunitiesTab.tsx
import React, { useState } from 'react';

interface Opportunity {
  id: string;
  title: string;
  type: 'peer_tutoring' | 'homework_support' | 'content_assistant' | 'assessment_marking' | 'moderation';
  subject: string;
  gradeTarget: string;
  description: string;
  requirements: string[];
  expectedHoursPerWeek: number;
  stipendAmount: number;
  status: 'open' | 'applied' | 'assigned' | 'closed';
  schoolVerified: boolean;
}

const OPPORTUNITY_LIST: Opportunity[] = [
  {
    id: 'opp-101',
    title: 'Grade 8 & 9 Peer Mathematics Tutor',
    type: 'peer_tutoring',
    subject: 'Mathematics',
    gradeTarget: 'Grade 8-9',
    description: 'Provide after-school peer tutoring in algebra, geometry, and equations for junior grade learners.',
    requirements: ['Grade 10 or 11 enrollment', '80%+ average in Mathematics', 'Educator recommendation'],
    expectedHoursPerWeek: 4,
    stipendAmount: 120.00,
    status: 'open',
    schoolVerified: true
  },
  {
    id: 'opp-102',
    title: 'Physical Sciences Homework & Lab Assistant',
    type: 'homework_support',
    subject: 'Physical Sciences',
    gradeTarget: 'Grade 10',
    description: 'Assist physical science educators in preparing experiment kits and providing study support.',
    requirements: ['Active Grade 11/12 student', '75%+ average in Physical Sciences'],
    expectedHoursPerWeek: 3,
    stipendAmount: 95.00,
    status: 'open',
    schoolVerified: true
  },
  {
    id: 'opp-103',
    title: 'Digital Study Guide Content Assistant',
    type: 'content_assistant',
    subject: 'English Home Language',
    gradeTarget: 'Grade 10-12',
    description: 'Digitize poetry summary sheets, proofread study materials, and format digital flashcards.',
    requirements: ['Strong writing skills', 'Basic computer literacy'],
    expectedHoursPerWeek: 5,
    stipendAmount: 150.00,
    status: 'open',
    schoolVerified: true
  },
  {
    id: 'opp-104',
    title: 'Grade 8 Assessment Marking Assistant (Staff Supervised)',
    type: 'assessment_marking',
    subject: 'Natural Sciences',
    gradeTarget: 'Grade 8',
    description: 'Under direct educator supervision, assist in marking multiple-choice and short-answer class quizzes.',
    requirements: ['Senior student (Grade 11/12)', 'Formal educator approval', 'Signed confidentiality agreement'],
    expectedHoursPerWeek: 2,
    stipendAmount: 80.00,
    status: 'open',
    schoolVerified: true
  }
];

export default function OpportunitiesTab() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(OPPORTUNITY_LIST);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'my_applications' | 'earnings'>('available');

  const filteredOpportunities = opportunities.filter(opp => {
    if (filterType === 'all') return true;
    return opp.type === filterType;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;

    setAppliedIds([...appliedIds, selectedOpportunity.id]);
    setOpportunities(prev =>
      prev.map(o => (o.id === selectedOpportunity.id ? { ...o, status: 'applied' } : o))
    );
    setSelectedOpportunity(null);
    setApplicationNotes('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-semibold rounded-full mb-2">
            Approved Educational Opportunities
          </span>
          <h2 className="text-xl font-bold">Peer Tutoring & Academic Opportunities</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Earn stipends and build leadership skills by assisting junior learners, creating study content, and supporting educators.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'available' ? 'bg-white text-emerald-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Available Work
          </button>
          <button
            onClick={() => setActiveTab('my_applications')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'my_applications' ? 'bg-white text-emerald-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            My Applications ({appliedIds.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === 'earnings' ? 'bg-white text-emerald-900 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Earnings Record
          </button>
        </div>
      </div>

      {/* SECTION 1: OPPORTUNITIES LIST */}
      {activeTab === 'available' && !selectedOpportunity && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs font-semibold text-gray-700">Filter Work Type:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {['all', 'peer_tutoring', 'homework_support', 'content_assistant', 'assessment_marking'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg border text-xs capitalize ${
                    filterType === type
                      ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opp) => {
              const hasApplied = appliedIds.includes(opp.id);
              return (
                <div
                  key={opp.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {opp.type.replace(/_/g, ' ')}
                      </span>
                      {opp.schoolVerified && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✓ School Approved
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{opp.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{opp.description}</p>

                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] font-semibold text-gray-700 block">Requirements:</span>
                      <ul className="list-disc list-inside text-[11px] text-gray-500 space-y-0.5">
                        {opp.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Weekly Stipend</span>
                      <span className="text-base font-extrabold text-emerald-900">R{opp.stipendAmount.toFixed(2)} / wk</span>
                    </div>

                    {hasApplied ? (
                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedOpportunity(opp)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: APPLICATION FORM */}
      {selectedOpportunity && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Application: {selectedOpportunity.title}</h3>
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="text-xs text-emerald-600 font-medium hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl mb-4 text-xs space-y-1">
            <p className="font-bold text-emerald-900">Subject: {selectedOpportunity.subject}</p>
            <p className="text-emerald-800">Target Learners: {selectedOpportunity.gradeTarget}</p>
            <p className="text-emerald-800">Estimated Workload: {selectedOpportunity.expectedHoursPerWeek} hrs / week</p>
          </div>

          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Motivational Note / Why are you qualified?
              </label>
              <textarea
                rows={4}
                required
                value={applicationNotes}
                onChange={(e) => setApplicationNotes(e.target.value)}
                placeholder="Explain your academic performance in this subject and any previous peer tutoring experience..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-800 space-y-1">
              <span className="font-bold block">🛡️ Academic Integrity & Safeguarding Rule</span>
              <p>
                All student applications are reviewed by school educators. Paid assessment marking assistant roles are strictly supervised by educators and subject to signed confidentiality agreements.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-sm"
            >
              Submit Application
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: MY APPLICATIONS */}
      {activeTab === 'my_applications' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-4">Submitted Work Applications</h3>

          {appliedIds.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">You have not applied for any opportunities yet.</p>
          ) : (
            <div className="space-y-3">
              {opportunities
                .filter(o => appliedIds.includes(o.id))
                .map(opp => (
                  <div key={opp.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs">{opp.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{opp.subject} • R{opp.stipendAmount.toFixed(2)} / week</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                      Under Review
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: EARNINGS RECORD */}
      {activeTab === 'earnings' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-base mb-2">Transparent Earnings Ledger</h3>
          <p className="text-xs text-gray-500 mb-4">Official record of approved peer tutoring and educational stipends.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase block">Approved Earnings</span>
              <span className="text-lg font-extrabold text-emerald-900">R0.00</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-semibold text-amber-800 uppercase block">Pending Payment</span>
              <span className="text-lg font-extrabold text-amber-900">R0.00</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-semibold text-blue-800 uppercase block">Completed Payments</span>
              <span className="text-lg font-extrabold text-blue-900">R0.00</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center py-4 border-t border-gray-100">
            No completed earnings records found for current term.
          </p>
        </div>
      )}
    </div>
  );
}
