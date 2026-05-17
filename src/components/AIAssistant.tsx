import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User as UserIcon, Lightbulb } from 'lucide-react';
import { chatWithAssistant } from '@/services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldPencil } from '@/components/HeroMascot';
import { Student } from '@/types';

import { UserRole } from '@/types';

interface AIAssistantProps {
  context: string;
  student?: Student;
  updateStudent: (student: Student) => void;
  userRole: UserRole;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ context, student, updateStudent, userRole }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hello! I'm your Homework Hero Assistant. How can I help you with school today? I can explain homework, give study tips, or answer questions about our school!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const playAlertSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check usage limit (skip for teachers)
    const isTeacher = userRole === UserRole.TEACHER;
    const usage = JSON.parse(localStorage.getItem('ai_usage') || '{"count": 0, "date": ""}');
    
    if (!isTeacher) {
      const today = new Date().toDateString();
      if (usage.date !== today) {
        usage.count = 0;
        usage.date = today;
      }
      if (usage.count >= 3) {
        setMessages(prev => [...prev, { role: 'ai', text: "You've reached your daily AI usage limit (3/3). Please try again tomorrow!" }]);
        return;
      }
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    
    if (!isTeacher) {
      usage.count++;
      localStorage.setItem('ai_usage', JSON.stringify(usage));
    }

    const response = await chatWithAssistant(userMsg, context, student);
    
    let isSmartAttempt = false;
    let aiResponse = response;
    if (response.startsWith('SMART_ATTEMPT')) {
      isSmartAttempt = true;
      aiResponse = response.replace('SMART_ATTEMPT', '').trim();
      playAlertSound();
      if (student) {
        const updatedStudent = {
          ...student,
          aiLogs: [...(student.aiLogs || []), { date: new Date().toISOString(), message: userMsg, isSmartAttempt: true }]
        };
        updateStudent(updatedStudent);
      }
    }

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  const suggestions = [
    "How do I use this app?",
    "Explain today's math task",
    "Study tips for primary students",
    "Tell me about SJK.BMC history"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm overflow-hidden max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="bmc-blue p-5 text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20 -translate-y-4 translate-x-4 pointer-events-none">
          <ShieldPencil />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2.5 bg-white/20 rounded-xl group relative">
            <Sparkles size={24} />
            <div className="absolute bottom-full mb-3 left-0 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap z-[100] animate-in fade-in duration-100">
              AI Powered by Google Gemini
              <div className="absolute top-full left-4 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-tight">Homework Hero Assistant</h3>
            <p className="text-[11px] opacity-90 uppercase tracking-widest font-black">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full relative z-10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-xs font-black uppercase tracking-tighter">Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bmc-red text-white' : 'bmc-blue text-white'
              }`}>
                {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-[16px] font-bold leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bmc-red text-white rounded-tr-none' 
                  : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bmc-blue text-white flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-4 bg-white border-t border-slate-100 space-y-4">
        {messages.length < 3 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(s);
                }}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Lightbulb size={12} className="text-bmc-yellow" />
                {s}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about school..."
            className="flex-1 px-5 py-3 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
          />
          <div className="relative group">
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-4 bmc-blue text-white rounded-2xl hover:bg-blue-800 disabled:opacity-50 shadow-lg transition-all active:scale-95 flex items-center justify-center min-w-[56px] border-2 border-transparent hover:border-white/20"
            >
              <Send size={24} />
            </button>
            <div className="absolute bottom-full mb-3 right-0 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap z-[100] animate-in fade-in zoom-in-95 duration-100">
              Send to AI
              <div className="absolute top-full right-6 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-600 font-bold">
          Homework Hero Assistant can make mistakes. Please check with teachers for important info.
        </p>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
