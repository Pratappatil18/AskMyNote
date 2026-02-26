import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export default function EegSim({ focusLevel, setFocusLevel }: { focusLevel: number, setFocusLevel: (v: number) => void }) {
  const waves = useMemo(() => Array.from({ length: 20 }), []);

  return (
    <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/10 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-mono text-indigo-400 uppercase tracking-wider">Neural Activity</h3>
        <span className="text-2xl font-bold text-white">{focusLevel}%</span>
      </div>

      <div className="h-16 flex items-end gap-1 overflow-hidden">
        {waves.map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-indigo-500/40 rounded-t-sm"
            animate={{
              height: [
                `${Math.random() * focusLevel}%`,
                `${Math.random() * focusLevel}%`,
                `${Math.random() * focusLevel}%`
              ]
            }}
            transition={{
              duration: 0.5 + Math.random(),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
          <span>Theta (Relaxed)</span>
          <span>Gamma (Hyper-Focus)</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={focusLevel}
          onChange={(e) => setFocusLevel(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase mb-1">AI Adaptation</p>
          <p className="text-xs text-indigo-300 font-medium">
            {focusLevel < 40 ? "Simplified Mode" : focusLevel > 70 ? "Deep Analysis" : "Standard Mode"}
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase mb-1">Brain State</p>
          <p className="text-xs text-emerald-400 font-medium">
            {focusLevel < 30 ? "Drowsy" : focusLevel < 60 ? "Engaged" : "Flow State"}
          </p>
        </div>
      </div>
    </div>
  );
}
