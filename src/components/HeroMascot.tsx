import React from 'react';
import { motion } from 'framer-motion';

export const CapedBook: React.FC<{ size?: number, className?: string }> = ({ size = 64, className = '' }) => (
  <motion.svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    whileHover={{ y: -5 }}
    animate={{ y: [0, -5, 0] }}
    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
  >
    {/* Cape */}
    <path d="M20 30 Q 10 60 25 90 Q 50 80 75 90 Q 90 60 80 30 Z" fill="#EF4444" />
    {/* Book Pages */}
    <rect x="30" y="20" width="40" height="50" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <path d="M35 30 H 65 M35 40 H 65 M35 50 H 55" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    {/* Book Cover */}
    <path d="M25 20 C 25 15 30 15 30 15 V 70 C 30 70 25 70 25 65 Z" fill="#3B82F6" />
    <path d="M70 15 C 70 15 75 15 75 20 V 65 C 75 70 70 70 70 70 Z" fill="#3B82F6" />
    {/* Eyes */}
    <circle cx="42" cy="35" r="3" fill="#1E293B" />
    <circle cx="58" cy="35" r="3" fill="#1E293B" />
    {/* Smile */}
    <path d="M45 45 Q 50 50 55 45" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Hero Emblem */}
    <circle cx="50" cy="60" r="6" fill="#FBBF24" />
    <path d="M48 60 L 50 56 L 52 60 L 48 60 Z" fill="#B45309" />
  </motion.svg>
);

export const ShieldPencil: React.FC<{ size?: number, className?: string }> = ({ size = 64, className = '' }) => (
  <motion.svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    whileHover={{ y: -5 }}
    animate={{ y: [0, -5, 0] }}
    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
  >
    {/* Shield */}
    <path d="M20 20 L 50 10 L 80 20 V 50 C 80 75 50 90 50 90 C 50 90 20 75 20 50 Z" fill="#3B82F6" opacity="0.8" />
    <path d="M25 25 L 50 17 L 75 25 V 50 C 75 70 50 82 50 82 C 50 82 25 70 25 50 Z" fill="#60A5FA" />
    {/* Pencil Body */}
    <rect x="42" y="25" width="16" height="40" fill="#FBBF24" />
    {/* Pencil Tip */}
    <path d="M42 65 L 50 80 L 58 65 Z" fill="#FDE68A" />
    <path d="M48 76 L 50 80 L 52 76 Z" fill="#1E293B" />
    {/* Pencil Eraser */}
    <rect x="42" y="15" width="16" height="10" fill="#FCA5A5" />
    <rect x="42" y="25" width="16" height="3" fill="#94A3B8" />
    {/* Eyes */}
    <circle cx="46" cy="40" r="2" fill="#1E293B" />
    <circle cx="54" cy="40" r="2" fill="#1E293B" />
    {/* Smile */}
    <path d="M48 45 Q 50 48 52 45" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </motion.svg>
);
