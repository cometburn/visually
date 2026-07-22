'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  Video,
  FileText,
} from 'lucide-react';
import { AssessmentQuestion } from '@/types/database';
import { getAssessmentQuestions, updateAssessmentQuestions, toggleQuestionActive, deleteCustomQuestion } from '@/lib/db';
import { getEmbedVideoUrl } from '@/lib/video';

export function AdminQuestions() {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [dbSource, setDbSource] = useState<'supabase' | 'local'>('local');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editOptions, setEditOptions] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [newText, setNewText] = useState('');
  const [newOptions, setNewOptions] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    try {
      const result = await getAssessmentQuestions();
      setQuestions(result.data);
      setDbSource(result.source);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(q: AssessmentQuestion) {
    setEditingId(q.id);
    setEditText(q.text);
    setEditOptions(q.options.join(', '));
    setEditVideoUrl(q.video_url || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
    setEditOptions('');
    setEditVideoUrl('');
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const updated = [...questions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((q, i) => (q.sort_order = i + 1));
    setQuestions(updated);
  }

  function moveDown(index: number) {
    if (index === questions.length - 1) return;
    const updated = [...questions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((q, i) => (q.sort_order = i + 1));
    setQuestions(updated);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = questions.map((q, i) => ({ ...q, sort_order: i + 1 }));
      const res = await updateAssessmentQuestions(updated);
      if (res.success) {
        await loadQuestions();
      } else {
        alert('Failed to save: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    if (!newText.trim()) return;
    const options = newOptions
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const q: AssessmentQuestion = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      question_type: 'multiple_choice',
      options,
      video_url: newVideoUrl.trim(),
      sort_order: questions.length + 1,
      is_active: true,
      is_fixed: false,
      created_at: new Date().toISOString(),
    };

    const updated = [...questions, q];
    setQuestions(updated);
    setNewText('');
    setNewOptions('');
    setNewVideoUrl('');

    const res = await updateAssessmentQuestions(updated);
    if (res.success) {
      await loadQuestions();
    } else {
      alert('Failed to add: ' + res.error);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const res = await toggleQuestionActive(id, !isActive);
    if (res.success) {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, is_active: !isActive } : q)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return;
    const res = await deleteCustomQuestion(id);
    if (res.success) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } else {
      alert('Failed to delete: ' + res.error);
    }
  }

  async function handleEditSave(id: string) {
    const options = editOptions
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const updated = questions.map((item) =>
      item.id === id ? { ...item, text: editText.trim(), options, video_url: editVideoUrl.trim() } : item
    );
    setQuestions(updated);
    cancelEdit();

    const res = await updateAssessmentQuestions(updated);
    if (!res.success) {
      alert('Failed to save edit: ' + res.error);
    }
  }

  function renderVideoPreview(url: string) {
    if (!url) return null;
    const embed = getEmbedVideoUrl(url);
    if (!embed) return <span className="text-[11px] text-slate-500">Unsupported URL</span>;
    return (
      <iframe
        src={embed}
        className="w-32 h-20 rounded-lg border border-slate-700"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video preview"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Assessment Questions</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure the questions shown after selecting a body part. Fixed questions (pain tolerance + duration) cannot be deleted, but can be edited.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500">DB: {dbSource.toUpperCase()}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {/* Add New Question */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Plus className="w-4 h-4 text-indigo-400" />
          Add Custom Question
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Question Text</label>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Does this pain radiate to other areas?"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Video URL (YouTube/Vimeo)</label>
            <input
              type="text"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Options (comma separated)</label>
          <input
            type="text"
            value={newOptions}
            onChange={(e) => setNewOptions(e.target.value)}
            placeholder="Yes, No, Sometimes"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newText.trim()}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 disabled:opacity-50"
        >
          Add Question
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className={`glass-panel p-4 rounded-2xl border transition-colors ${
              q.is_active ? 'border-slate-800' : 'border-slate-700 opacity-70'
            }`}
          >
            {editingId === q.id ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-4 h-4 text-slate-500 mt-2 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Question text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <textarea
                      value={editOptions}
                      onChange={(e) => setEditOptions(e.target.value)}
                      placeholder="Options (comma separated)"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      placeholder="Video URL"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditSave(q.id)}
                    disabled={!editText.trim()}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <GripVertical className="w-4 h-4 text-slate-600" />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveDown(idx)} disabled={idx === questions.length - 1} className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{q.text}</span>
                    {q.is_fixed && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                        FIXED
                      </span>
                    )}
                    {!q.is_active && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] font-semibold">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-slate-500">Options: {q.options.join(', ')}</span>
                    {q.video_url && <Video className="w-3 h-3 text-slate-500" />}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {renderVideoPreview(q.video_url || '')}
                  <button onClick={() => startEdit(q)} className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800" title="Edit">
                    <FileText className="w-4 h-4" />
                  </button>
                  {!q.is_fixed && (
                    <button onClick={() => handleDelete(q.id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleActive(q.id, q.is_active)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors ${
                      q.is_active
                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {q.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
