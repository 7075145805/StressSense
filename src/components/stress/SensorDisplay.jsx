import React from 'react';
import { motion } from 'framer-motion';
import { Activity, RotateCw, MapPin, Heart, Smartphone, Vibrate } from 'lucide-react';

const sensorConfig = [
    { key: 'movement_intensity', label: 'Movement', icon: Activity, unit: 'm/s²', decimals: 2 },
    { key: 'shake_frequency', label: 'Shaking', icon: Vibrate, unit: 'shakes', decimals: 0 },
    { key: 'heart_rate', label: 'Heart Rate', icon: Heart, unit: 'bpm', decimals: 0 },
    { key: 'orientation_changes', label: 'Orientation', icon: RotateCw, unit: 'changes', decimals: 0 },
    { key: 'location_delta', label: 'Location Δ', icon: MapPin, unit: 'm', decimals: 1 },
    { key: 'screen_on_duration', label: 'Screen Time', icon: Smartphone, unit: 's', decimals: 0 },
];

export default function SensorDisplay({ data = {} }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sensorConfig.map(({ key, label, icon: Icon, unit, decimals }) => {
                const value = data[key] ?? 0;
                return (
                    <motion.div
                        key={key}
                        className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-semibold text-white">
                                {typeof value === 'number' ? value.toFixed(decimals) : value}
                            </span>
                            <span className="text-[10px] text-slate-500">{unit}</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}