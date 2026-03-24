import React from 'react';
import { motion } from 'framer-motion';
import { getStressColor, getStressLabel } from './StressClassifier';

export default function StressMeter({ score = 0, level = 'low' }) {
    const color = getStressColor(level);
    const label = getStressLabel(level);
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                        cx="100" cy="100" r="80"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="12"
                    />
                    {/* Progress arc */}
                    <motion.circle
                        cx="100" cy="100" r="80"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                    {/* Glow effect */}
                    <motion.circle
                        cx="100" cy="100" r="80"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        opacity="0.3"
                        filter="url(#glow)"
                    />
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-4xl font-bold text-white"
                        key={score}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {score}
                    </motion.span>
                    <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Score</span>
                </div>
            </div>
            <motion.div
                className="px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${color}20`, color }}
                key={level}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                {label}
            </motion.div>
        </div>
    );
}