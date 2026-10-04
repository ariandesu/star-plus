'use client';

import React, { useState } from 'react';
import { FileText, Plus, X, Check } from 'lucide-react';

export interface NoteItem {
  id: string;
  text: string;
  meta: string;
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: '1',
    text: 'Crew status stable. Monitoring sleep and HRV closely.\nPrepare countermeasure plan if trend continues.',
    meta: 'Sep 26, 2026 · 14:30 UTC · Marcus Vance',
  },
];

export default function MissionControlNotesCard() {
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('Marcus Vance');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
      now.getUTCMinutes()
    ).padStart(2, '0')} UTC`;
    const metaStr = `${dateStr} · ${timeStr} · ${authorName.trim() || 'Mission Control'}`;

    const newNote: NoteItem = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
      meta: metaStr,
    };

    setNotes([newNote, ...notes]);
    setNewNoteText('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <h2 className="text-base font-black text-slate-900">
            Mission Control Notes
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Interactive Add Note Form */}
      {isAdding && (
        <form
          onSubmit={handleAddNote}
          className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              New Note Entry
            </label>
            <textarea
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Type mission control updates or notes..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author name"
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 w-36 font-medium"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteText('');
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Save Note
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Note Body List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-2"
          >
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
              {note.text}
            </p>
            <div className="text-xs text-slate-400 font-semibold">
              {note.meta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
