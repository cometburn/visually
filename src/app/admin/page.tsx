'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BodyMap } from '@/components/BodyMap';
import { AdminLogin } from '@/components/AdminLogin';
import { getAllAssessments, deleteAssessmentRecord } from '@/lib/db';
import { getAdminSession, logoutAdmin, AdminUser } from '@/lib/auth';
import { PainAssessment } from '@/types/database';
import { getPainColor } from '@/lib/bodyParts';
import {
  ShieldCheck,
  Search,
  Users,
  Flame,
  Activity,
  X,
  Trash2,
  Eye,
  Database,
  RefreshCw,
  FileText,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const [assessments, setAssessments] = useState<PainAssessment[]>([]);
  const [dbSource, setDbSource] = useState<'supabase' | 'local'>('local');
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [minPainScore, setMinPainScore] = useState<number>(1);

  // Inspection Drawer Modal
  const [selectedAssessment, setSelectedAssessment] = useState<PainAssessment | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const session = getAdminSession();
    setCurrentUser(session);
    setAuthChecked(true);
    if (session) {
      fetchRecords();
    }
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const result = await getAllAssessments();
      setAssessments(result.data);
      setDbSource(result.source);
    } catch (err) {
      console.error('Error fetching admin records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    setSelectedAssessment(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete assessment record for ${name}?`)) {
      await deleteAssessmentRecord(id);
      if (selectedAssessment?.id === id) {
        setSelectedAssessment(null);
      }
      fetchRecords();
    }
  };

  // Filter logic
  const filteredAssessments = assessments.filter((item) => {
    const patientName = item.patient?.name || 'Anonymous';
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = selectedGender === 'All' || item.patient?.gender === selectedGender;

    const maxScoreInItem = item.entries && item.entries.length > 0
      ? Math.max(...item.entries.map((e) => e.pain_level))
      : 0;
    const matchesScore = maxScoreInItem >= minPainScore;

    return matchesSearch && matchesGender && matchesScore;
  });

  // Calculate Overview Stats
  const totalPatients = assessments.length;
  const highPainCount = assessments.filter((a) => {
    const maxPain = a.entries && a.entries.length > 0 ? Math.max(...a.entries.map((e) => e.pain_level)) : 0;
    return maxPain >= 7;
  }).length;

  let totalEntriesCount = 0;
  let totalPainSum = 0;
  const bodyPartFrequency = new Map<string, number>();

  assessments.forEach((a) => {
    if (a.entries) {
      a.entries.forEach((e) => {
        totalEntriesCount++;
        totalPainSum += e.pain_level;
        bodyPartFrequency.set(
          e.body_part_name,
          (bodyPartFrequency.get(e.body_part_name) || 0) + 1
        );
      });
    }
  });

  const avgPainRating = totalEntriesCount > 0 ? (totalPainSum / totalEntriesCount).toFixed(1) : '0.0';

  let mostFrequentPart = 'N/A';
  let maxFreq = 0;
  bodyPartFrequency.forEach((count, name) => {
    if (count > maxFreq) {
      maxFreq = count;
      mostFrequentPart = name;
    }
  });

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // RENDER LOGIN IF NOT AUTHENTICATED
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <AdminLogin
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              fetchRecords();
            }}
          />
        </main>
      </div>
    );
  }

  // RENDER ADMIN DASHBOARD
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authenticated Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Patient Body Pain Registry
            </h1>
            <p className="text-sm text-slate-400">
              Inspect submitted patient body pain ratings, location heatmaps, and medical history logs.
            </p>
          </div>

          {/* User Info & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300 font-medium">{currentUser.email}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>DB: {dbSource.toUpperCase()}</span>
            </div>

            <button
              type="button"
              onClick={fetchRecords}
              className="p-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Patient Records</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white font-mono">{totalPatients}</div>
            <p className="text-[11px] text-slate-400">Registered pain assessments</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>High Pain Alerts (7-10)</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-bold text-rose-400 font-mono">{highPainCount}</div>
            <p className="text-[11px] text-slate-400">Cases requiring urgent review</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Avg Recorded Severity</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">{avgPainRating} / 10</div>
            <p className="text-[11px] text-slate-400">Across {totalEntriesCount} pain points</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Most Common Pain Area</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-300 truncate">{mostFrequentPart}</div>
            <p className="text-[11px] text-slate-400">Reported {maxFreq} time(s)</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Gender Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Gender:</span>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>

            {/* Min Pain Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Min Pain Score:</span>
              <select
                value={minPainScore}
                onChange={(e) => setMinPainScore(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value={1}>Any (1+)</option>
                <option value={4}>Moderate (4+)</option>
                <option value={7}>Severe (7+)</option>
                <option value={9}>Critical (9+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Demographics</th>
                  <th className="px-6 py-4">Pain Severity</th>
                  <th className="px-6 py-4">Pain Locations</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Loading assessment registry...
                    </td>
                  </tr>
                ) : filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No matching patient pain records found.
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((item) => {
                    const maxScore = item.entries && item.entries.length > 0
                      ? Math.max(...item.entries.map((e) => e.pain_level))
                      : 0;
                    const colorMeta = getPainColor(maxScore);
                    const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedAssessment(item)}
                      >
                        <td className="px-6 py-4 font-bold text-white">
                          {item.patient?.name || 'Anonymous Patient'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-200">{item.patient?.age} yrs</span>
                          <span className="text-slate-500 mx-1.5">•</span>
                          <span className="text-slate-400">{item.patient?.gender}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`}>
                            <span>Score: {maxScore}/10</span>
                            <span className="text-[10px]">({colorMeta.label})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {item.entries && item.entries.length > 0 ? (
                              item.entries.map((e) => (
                                <span
                                  key={e.id || e.body_part_id}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60"
                                >
                                  {e.body_part_name} ({e.pain_level}/10)
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic">None logged</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedAssessment(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                              title="Inspect Assessment"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.patient?.name || 'Patient')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Patient Assessment Detail Modal / Drawer */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel border border-slate-700/60 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">
                    {selectedAssessment.patient?.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                    {selectedAssessment.patient?.age} yrs • {selectedAssessment.patient?.gender}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Assessment ID: {selectedAssessment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Patient Notes */}
            {selectedAssessment.patient?.notes && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-slate-200">Patient Chief Complaint / General Notes:</span>
                <p className="italic text-slate-400">{selectedAssessment.patient.notes}</p>
              </div>
            )}

            {/* Split View: Visual Body Map + Detail Entries Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Visual Body Map highlighting patient's reported pain */}
              <div className="lg:col-span-5 flex flex-col items-center glass-panel p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Patient Pain Map Snapshot</h4>
                <BodyMap
                  entries={selectedAssessment.entries || []}
                  onSelectZone={() => {}}
                  readOnly
                />
              </div>

              {/* Table Breakdown of Pain Points */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Reported Body Pain Locations ({selectedAssessment.entries?.length || 0})
                </h4>

                <div className="space-y-2">
                  {selectedAssessment.entries && selectedAssessment.entries.length > 0 ? (
                    selectedAssessment.entries.map((entry) => {
                      const color = getPainColor(entry.pain_level);
                      return (
                        <div
                          key={entry.id || entry.body_part_id}
                          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-white">{entry.body_part_name}</h5>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color.bg} ${color.text} ${color.border}`}>
                              Level {entry.pain_level}/10
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div>
                              Duration: <span className="text-slate-200 font-medium">{entry.duration}</span>
                            </div>
                            <div>
                              Symptom: <span className="text-cyan-300 font-medium">{entry.symptom_type || 'Aching'}</span>
                            </div>
                          </div>

                          {entry.notes && (
                            <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs italic">
                      No specific pain locations recorded.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
