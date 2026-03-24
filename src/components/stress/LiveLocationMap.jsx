import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation2 } from 'lucide-react';

export default function LiveLocationMap({ lat, lng }) {
    if (!lat || !lng) {
        return (
            <motion.div
                className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50 flex flex-col items-center justify-center py-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <MapPin className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">Waiting for GPS signal...</p>
            </motion.div>
        );
    }

    // OpenStreetMap simple iframe embed with a bounding box around the coordinates
    const bboxStr = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxStr}&layer=mapnik&marker=${lat},${lng}`;

    return (
        <motion.div
            className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Navigation2 className="w-4 h-4 text-teal-400" />
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Live Tracking</p>
                </div>
                <div className="flex items-center gap-2 opacity-80 text-teal-400 bg-teal-400/10 px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono tracking-widest">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                </div>
            </div>

            <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-700/50 relative">
                {/* CSS filter to Dark-mode the map slightly to fit the app vibe! */}
                <iframe
                    title="Live Location"
                    className="absolute inset-0 w-full h-full grayscale-[40%] contrast-125 hover:grayscale-0 transition-all duration-500"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={mapUrl}
                ></iframe>
            </div>
        </motion.div>
    );
}
