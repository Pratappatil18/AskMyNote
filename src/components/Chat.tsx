import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { Subject, Message } from '../types';
import { Send, Mic, MicOff, Paperclip, Loader2, User, Bot, AlertCircle, FileText } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function Chat({ subject, focusLevel, onSpeaking }: { subject: Subject, focusLevel: number, onSpeaking: (s: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() && files.length === 0) return;
    
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chat(text, subject, focusLevel);
      
      if (res.error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `⚠️ **AI Error:** ${res.error}. Please try again or check your connection.` 
        }]);
        return;
      }

      const assistantMsg: Message = { 
        role: 'assistant', 
        content: res.text || "I'm sorry, I couldn't generate a response.",
      };
      setMessages(prev => [...prev, assistantMsg]);
      
      // TTS
      if (window.speechSynthesis) {
        onSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(res.text.replace(/\[.*?\]/g, ''));
        utterance.onend = () => onSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      for (const file of uploadedFiles) {
        let content = '';
        
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `[Page ${i}]\n${pageText}\n\n`;
          }
          content = fullText;
        } else {
          content = await file.text();
        }

        if (content.trim()) {
          await api.upload(subject, file.name, content);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Successfully indexed **${file.name}** for ${subject}. You can now ask questions about it.` 
          }]);
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error processing file. Please ensure it's a valid PDF or text file.` 
      }]);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleSend(transcript);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
        setIsRecording(true);
      }
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-bottom border-white/5 bg-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono text-white/70 uppercase tracking-wider">{subject} Engine Active</span>
        </div>
        <div className="flex gap-2">
          {isUploading ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-indigo-500/10 rounded-lg">
              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
              <span className="text-[10px] font-mono text-indigo-400 uppercase">Processing...</span>
            </div>
          ) : (
            <label className="cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <input type="file" multiple accept=".pdf,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12 text-indigo-400" />
            <p className="text-sm text-slate-400 max-w-[200px]">
              Upload {subject} materials or ask a question to begin.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/10'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'
              }`}>
                <div className="markdown-body text-sm leading-relaxed">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about ${subject}...`}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-xl transition-colors ${isRecording ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
