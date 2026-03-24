import React from 'react';
import { motion } from 'framer-motion';

const featureLabels = {
    movement_intensity: 'Movement',
    shake_frequency: 'Shaking',
    heart_rate: 'Heart Rate',
    screen_duration: 'Screen Time',
    orientation_changes: 'Orientation',
    location_delta: 'Location'
};

export default function FeatureBar({ featureScores = {} }) {
    const entries = Object.entries(featureScores);
    if (entries.length === 0) return null;

    return (
        <div className="space-y-2.5">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Feature Contributions</p>
            {entries.map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 w-20 shrink-0 text-right">
                        {featureLabels[key] || key}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: value < 0.35
                                    ? '#14b8a6'
                                    : value < 0.65
                                        ? '#f59e0b'
                                        : '#ef4444'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, value * 100)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                    <span className="text-[10px] text-slate-500 w-8 font-mono">
                        {(value * 100).toFixed(0)}%
                    </span>
                </div>
            ))}
        </div>
    );
}