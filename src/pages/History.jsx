import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Brain, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getStressColor, getStressLabel } from '../components/stress/StressClassifier';
import { Button } from '@/components/ui/button';
import StressGraph from '../components/stress/StressGraph';

export default function History() {
    const { data: results = [], isLoading, refetch } = useQuery({
        queryKey: ['stress-history'],
        queryFn: () => base44.entities.StressResult.list('-created_date', 200),
    });

    const clearHistory = async () => {
        if (!confirm('Clear all stress history? This cannot be undone.')) return;
        for (const r of results) {
            await base44.entities.StressResult.delete(r.id);
        }
        refetch();
    };

    // Group by session
    const sessions = {};
    results.forEach(r => {
        const sid = r.session_id || 'unknown';
        if (!sessions[sid]) sessions[sid] = [];
        sessions[sid].push(r);
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/Monitor" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-teal-400" />
                            <span className="font-semibold text-sm">History</span>
                        </div>
                    </div>
                    {results.length > 0 && (
                        <Button
                            variant="ghost" size="sm"
                            className="text-slate-500 hover:text-red-400"
                            onClick={clearHistory}
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin" />
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20">
                        <Brain className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 mb-2">No history yet</p>
                        <Link to="/Monitor" className="text-teal-400 text-sm hover:underline">
                            Start monitoring →
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Overall graph */}
                        <motion.div
                            className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">All Readings</p>
                            <StressGraph history={[...results].reverse()} />
                        </motion.div>

                        {/* Session list */}
                        {Object.entries(sessions).map(([sessionId, entries]) => {
                            const sorted = [...entries].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                            const avgScore = Math.round(sorted.reduce((s, r) => s + (r.stress_score || 0), 0) / sorted.length);
                            const dominantLevel = avgScore < 35 ? 'low' : avgScore < 65 ? 'medium' : 'high';
                            const startTime = sorted[0]?.created_date;

                            return (
                                <motion.div
                                    key={sessionId}
                                    className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-medium text-white">Session</p>
                                            <p className="text-xs text-slate-500">
                                                {startTime ? format(new Date(startTime), 'MMM d, yyyy · HH:mm') : 'Unknown time'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">{sorted.length} readings</span>
                                            <div
                                                className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                                                style={{ backgroundColor: `${getStressColor(dominantLevel)}20`, color: getStressColor(dominantLevel) }}
                                            >
                                                Avg: {avgScore}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini timeline */}
                                    <div className="flex gap-0.5">
                                        {sorted.map((r, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 h-2 rounded-full"
                                                style={{ backgroundColor: getStressColor(r.stress_level) }}
                                                title={`Score: ${r.stress_score}`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </>
                )}
            </main>
        </div>
    );
}