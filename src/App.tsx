import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  BookOpen, 
  FlaskConical, 
  Calculator, 
  MessageSquare, 
  GraduationCap, 
  Activity,
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  ChevronRight,
  User
} from 'lucide-react';
import Chat from './components/Chat';
import Study from './components/Study';
import EegSim from './components/EegSim';
import HoloTeacher from './components/HoloTeacher';
import KnowledgeGraph from './components/KnowledgeGraph';
import Library from './components/Library';
import { Subject } from './types';
import { api } from './api';

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics');
  const [activeTab, setActiveTab] = useState<'chat' | 'study'>('chat');
  const [view, setView] = useState<'dashboard' | 'library'>('dashboard');
  const [focusLevel, setFocusLevel] = useState(65);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await api.search(q, selectedSubject);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const subjects: { id: Subject; icon: any; color: string; bg: string }[] = [
    { id: 'Math', icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'Physics', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'Chemistry', icon: FlaskConical, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-slate-900/50 border-r border-white/5 flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <button 
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView('library')}
            className={`p-3 rounded-xl transition-all ${view === 'library' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            <BookOpen className="w-6 h-6" />
          </button>
          <button className="p-3 text-slate-500 hover:text-white transition-colors cursor-not-allowed opacity-50"><GraduationCap className="w-6 h-6" /></button>
          <button className="p-3 text-slate-500 hover:text-white transition-colors cursor-not-allowed opacity-50"><Settings className="w-6 h-6" /></button>
        </div>
        <button className="p-3 text-slate-500 hover:text-white transition-colors"><Bell className="w-6 h-6" /></button>
      </nav>

      {/* Main Content */}
      <main className="pl-20 min-h-screen">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white tracking-tight">Askmy<span className="text-indigo-500">Note</span></h1>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedSubject === s.id 
                      ? `${s.bg} ${s.color} ring-1 ring-inset ring-white/10` 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.id}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-indigo-400 animate-pulse' : 'text-slate-500 group-focus-within:text-indigo-400'}`} />
              <input 
                type="text" 
                placeholder="Search concepts..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
              />
              
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 max-h-[400px] overflow-y-auto"
                  >
                    {searchResults.map((res) => (
                      <button
                        key={res.id}
                        className="w-full p-3 hover:bg-white/5 rounded-xl text-left transition-colors group"
                      >
                        <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{res.filename}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{res.content}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-white">Hackathon Legend</p>
                <p className="text-[10px] text-slate-500">Focus Streak: 12 days</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white/10" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
          {/* Left Column: AI Interface */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {view === 'dashboard' ? (
              <>
                {/* Mode Switcher */}
                <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 w-fit">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Adaptive Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('study')}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'study' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Study Mode
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 'chat' ? (
                      <Chat subject={selectedSubject} focusLevel={focusLevel} onSpeaking={setIsSpeaking} />
                    ) : (
                      <Study subject={selectedSubject} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Knowledge Graph Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-400" />
                      Concept Knowledge Graph
                    </h2>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Expand Map <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <KnowledgeGraph subject={selectedSubject} />
                </div>
              </>
            ) : (
              <Library subject={selectedSubject} />
            )}
          </div>

          {/* Right Column: Biofeedback & HoloTeacher */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Bio-Adaptive Feedback
              </h2>
              <EegSim focusLevel={focusLevel} setFocusLevel={setFocusLevel} />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Holo-Teacher Avatar
              </h2>
              <HoloTeacher speaking={isSpeaking} />
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Holo-Teacher uses real-time <span className="text-indigo-400">lip-sync</span> and <span className="text-indigo-400">neural adaptation</span> to match your current cognitive state.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Session Time</p>
                <p className="text-xl font-bold text-white">42:15</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Mastery Score</p>
                <p className="text-xl font-bold text-emerald-400">88%</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
