import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Subject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Trash2, 
  Plus, 
  BookOpen, 
  StickyNote, 
  Calendar,
  ChevronRight,
  Search,
  Loader2
} from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface Document {
  id: number;
  filename: string;
  content: string;
}

export default function Library({ subject }: { subject: Subject }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'docs' | 'notes'>('docs');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchData();
  }, [subject]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notesRes, docsRes] = await Promise.all([
        api.getNotes(subject),
        api.getDocuments(subject)
      ]);
      setNotes(notesRes);
      setDocs(docsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.title || !newNote.content) return;
    try {
      await api.saveNote(subject, newNote.title, newNote.content);
      setNewNote({ title: '', content: '' });
      setShowNoteForm(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await api.deleteNote(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-mono">Accessing neural library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <StickyNote className="w-4 h-4" />
            Study Notes
          </button>
        </div>

        {activeTab === 'notes' && (
          <button
            onClick={() => setShowNoteForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showNoteForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl space-y-4"
          >
            <input
              type="text"
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Start typing your study notes..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 min-h-[150px]"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNoteForm(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
              >
                Save Note
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'docs' ? (
          docs.length === 0 ? (
            <div className="col-span-2 py-20 text-center space-y-4 opacity-50">
              <FileText className="w-12 h-12 mx-auto text-slate-500" />
              <p className="text-slate-400">No documents indexed for {subject}.</p>
            </div>
          ) : (
            docs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium truncate max-w-[200px]">{doc.filename}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Indexed Document</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {doc.content}
                </p>
              </motion.div>
            ))
          )
        ) : (
          notes.length === 0 ? (
            <div className="col-span-2 py-20 text-center space-y-4 opacity-50">
              <StickyNote className="w-12 h-12 mx-auto text-slate-500" />
              <p className="text-slate-400">Your {subject} notebook is empty.</p>
            </div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group relative"
              >
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-mono uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                  <h4 className="text-white font-bold text-lg">{note.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              </motion.div>
            ))
          )
        )}
      </div>
    </div>
  );
}
