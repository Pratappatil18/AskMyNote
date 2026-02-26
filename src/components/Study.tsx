import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Subject, StudyData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, HelpCircle, BookOpen, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Study({ subject }: { subject: Subject }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudyData | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'mcq' | 'short'>('intro');
  const [mcqIndex, setMcqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const startStudy = async () => {
    setLoading(true);
    try {
      const res = await api.getStudyData(subject);
      setData(res);
      setCurrentStep('mcq');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMcqNext = () => {
    if (selectedOption === data?.mcqs[mcqIndex].answer) {
      setScore(s => s + 1);
    }
    
    if (mcqIndex < 4) {
      setMcqIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setCurrentStep('short');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <BrainCircuit className="w-12 h-12 text-indigo-500 animate-pulse" />
        <p className="text-slate-400 font-mono animate-pulse">Synthesizing personalized curriculum...</p>
      </div>
    );
  }

  if (currentStep === 'intro') {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex p-4 bg-indigo-500/10 rounded-full">
          <BookOpen className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Ready for your {subject} session?</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          We've analyzed your uploaded documents to create a focused study module with 5 MCQs and 3 short answers.
        </p>
        <button
          onClick={startStudy}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-all transform hover:scale-105"
        >
          Begin Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {currentStep === 'mcq' && data && (
          <motion.div
            key="mcq"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-indigo-400 uppercase">Question {mcqIndex + 1} of 5</span>
              <span className="text-xs font-mono text-slate-500">Score: {score}</span>
            </div>
            
            <h3 className="text-xl font-medium text-white leading-relaxed">
              {data.mcqs[mcqIndex].question}
            </h3>

            <div className="grid gap-3">
              {data.mcqs[mcqIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    selectedOption === idx
                      ? "bg-indigo-600/20 border-indigo-500 text-white"
                      : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  {selectedOption === idx ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  {opt}
                </button>
              ))}
            </div>

            <button
              disabled={selectedOption === null}
              onClick={handleMcqNext}
              className="w-full py-4 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors"
            >
              {mcqIndex === 4 ? "Finish Quiz" : "Next Question"}
            </button>
          </motion.div>
        )}

        {currentStep === 'short' && data && (
          <motion.div
            key="short"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">Concept Mastery</h3>
              <p className="text-slate-400">Review these core concepts from your materials.</p>
            </div>

            <div className="space-y-4">
              {data.short.map((q, i) => (
                <div key={i} className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
                    <p className="text-white font-medium">{q.question}</p>
                  </div>
                  <div className="pl-8 border-l border-white/10">
                    <p className="text-sm text-slate-400 leading-relaxed italic">
                      {q.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep('intro')}
              className="w-full py-4 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
