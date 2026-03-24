import React from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MonitorControls({ isMonitoring, onStart, onStop, sessionDuration }) {
    const formatDuration = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <motion.div
                    className={`w-2.5 h-2.5 rounded-full ${isMonitoring ? 'bg-teal-400' : 'bg-slate-600'}`}
                    animate={isMonitoring ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <div>
                    <p className="text-sm font-medium text-white">
                        {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
                    </p>
                    {isMonitoring && (
                        <p className="text-xs text-slate-400 font-mono">
                            {formatDuration(sessionDuration)}
                        </p>
                    )}
                </div>
            </div>

            {isMonitoring ? (
                <Button
                    onClick={onStop}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                    <Square className="w-3.5 h-3.5 mr-1.5" />
                    Stop
                </Button>
            ) : (
                <Button
                    onClick={onStart}
                    size="sm"
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Start Monitoring
                </Button>
            )}
        </div>
    );
}