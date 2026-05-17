import React from 'react';
import { MOCK_DEVELOPERS, VISION_STATEMENT, SCHOOL_INFO } from '@/constants';
import { Heart, Globe, Users, Trophy, Code } from 'lucide-react';
import { motion } from 'motion/react';

const BMCHeritage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      {/* Hero */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-bmc-red rounded-full text-sm font-bold animate-bounce"
        >
          <Heart size={16} fill="currentColor" />
          Proudly Made by Students
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">
          Developed by <span className="text-bmc-red">{SCHOOL_INFO.shortName}</span><br/> Tech Explorers
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Built with passion in Bandar Mahkota Cheras, this app represents the fusion of heritage and high-tech.
        </p>
      </div>

      {/* Vision */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bmc-yellow rounded-full -mr-16 -mt-16 opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bmc-red text-white rounded-2xl">
              <Globe size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Our Vision</h3>
          </div>
          <p className="text-xl italic text-slate-600 font-medium leading-relaxed">
            "{VISION_STATEMENT}"
          </p>
        </div>
      </motion.div>

      {/* Scrolling List of Devs */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
            <Users className="text-bmc-blue" />
            The Development Team
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_DEVELOPERS.map((dev, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow group cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${idx % 2 === 0 ? 'bmc-red' : 'bmc-blue'}`}>
                {idx % 2 === 0 ? <Code size={24} /> : <Trophy size={24} />}
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-800 group-hover:text-bmc-red transition-colors">{dev.name}</h4>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{dev.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* School Badge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-slate-900 rounded-[40px] p-12 text-white text-center space-y-8"
      >
        <img 
          src={SCHOOL_INFO.logoUrl} 
          alt="Logo" 
          className="w-32 h-32 mx-auto drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)] object-contain" 
        />
        <div className="space-y-2">
          <h4 className="text-2xl font-bold">{SCHOOL_INFO.name}</h4>
          <p className="text-slate-400 font-mono text-sm uppercase tracking-tighter">School Code: {SCHOOL_INFO.code}</p>
          <p className="text-slate-500 text-sm">{SCHOOL_INFO.location}</p>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8">
           <div className="text-center">
             <p className="text-3xl font-black text-bmc-yellow">100%</p>
             <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Student Built</p>
           </div>
           <div className="text-center">
             <p className="text-3xl font-black text-bmc-yellow">AI</p>
             <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Powered</p>
           </div>
           <div className="text-center">
             <p className="text-3xl font-black text-bmc-yellow">Zero</p>
             <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Gap Goal</p>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BMCHeritage;