
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, Cake, Star, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthdayCelebrationProps {
  studentName: string;
}

const BirthdayCelebration: React.FC<BirthdayCelebrationProps> = ({ studentName }) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            className="bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-2 bmc-yellow" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 text-yellow-100 opacity-50"
            >
              <Star size={120} fill="currentColor" />
            </motion.div>

            <div className="relative z-10 space-y-6">
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-red-50 text-bmc-red rounded-3xl flex items-center justify-center shadow-xl shadow-red-100"
                >
                  <Cake size={48} />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-800">Happy Birthday!</h2>
                <p className="text-xl font-bold text-bmc-blue">{studentName}</p>
              </div>

              <p className="text-slate-500 font-medium italic">
                "Wishing you a day filled with joy, laughter, and lots of cake! Keep shining at SJKT.BMC!"
              </p>

              <div className="pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-8 py-3 bmc-red text-white rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-800 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <PartyPopper size={20} /> Let's Celebrate!
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BirthdayCelebration;
