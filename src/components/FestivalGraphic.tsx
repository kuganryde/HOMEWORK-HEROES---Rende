
import React from 'react';
import { motion } from 'motion/react';
import { getCurrentFestival } from '@/services/FestivalService';

const FestivalGraphic: React.FC = () => {
  const festival = getCurrentFestival();

  if (!festival) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-4 right-4 z-[150] pointer-events-none hidden md:block"
    >
      <div className="relative group pointer-events-auto">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`p-3 ${festival.themeColor} rounded-2xl shadow-xl flex items-center gap-3 border-2 border-white/20 backdrop-blur-sm`}
        >
          <span className="text-3xl">{festival.icon}</span>
          <div className="pr-2">
            <p className={`text-[10px] font-black uppercase tracking-widest ${festival.accentColor} leading-none mb-1`}>
              Current Festival
            </p>
            <p className="text-white font-black text-sm whitespace-nowrap">
              {festival.name}
            </p>
          </div>
        </motion.div>
        
        {/* Tooltip on hover */}
        <div className="absolute top-full mt-2 right-0 hidden md:group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          {festival.message}
          <div className="absolute bottom-full right-6 -mb-1 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      </div>
    </motion.div>
  );
};

export default FestivalGraphic;
