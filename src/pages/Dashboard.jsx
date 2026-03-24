import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Brain, Activity, Heart, TrendingUp, TrendingDown,
    Clock, ArrowLeft, BarChart3, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import StressMeter from '../components/stress/StressMeter';
import { getStressColor } from '../components/stress/StressClassifier';

const PIE_COLORS = { low: '#14b8a6', medium: '#f59e0b', high: '#ef4444' };

function StatCard({ icon: Icon, label, value, sub, color = 'text-teal-400' }) {
    return (
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

export default function Dashboard() {
    const { data: results = [], isLoading } = useQuery({
        queryKey: ['stress-results'],
        queryFn: () => base44.entities.StressResult.list('-created_date', 100),
    });

    const latest = results[0];
    const avgScore = results.length > 0
        ? Math.round(results.reduce((s, r) => s + (r.stress_score || 0), 0) / results.length)
        : 0;

    const avgHR = results.length > 0
        ? Math.round(results.reduce((s, r) => s + (r.heart_rate || 0), 0) / results.length)
        : 0;

    const levelCounts = { low: 0, medium: 0, high: 0 };
    results.forEach(r => { if (r.stress_level) levelCounts[r.stress_level]++; });

    const pieData = Object.entries(levelCounts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));

    // Last 20 readings for bar chart
    const barData = [...results].reverse().slice(-20).map((r, i) => ({
        idx: i + 1,
        score: r.stress_score || 0,
        level: r.stress_level
    }));

    const trend = results.length >= 2
        ? results[0].stress_score - results[Math.min(4, results.length - 1)].stress_score
        : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/Monitor" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-teal-400" />
                            <span className="font-semibold text-sm">Dashboard</span>
                        </div>
                    </div>
                    <Link to="/History" className="text-slate-400 hover:text-white text-xs uppercase tracking-wider">
                        History
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {results.length === 0 ? (
                    <div className="text-center py-20">
                        <Brain className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 mb-2">No stress data yet</p>
                        <Link to="/Monitor" className="text-teal-400 text-sm hover:underline">
                            Start monitoring →
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Current stress */}
                        <motion.div
                            className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-4 text-center">Latest Stress Level</p>
                            <StressMeter
                                score={latest?.stress_score || 0}
                                level={latest?.stress_level || 'low'}
                            />
                        </motion.div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <StatCard icon={Activity} label="Avg Score" value={avgScore} sub={`of ${results.length} readings`} />
                            <StatCard icon={Heart} label="Avg Heart Rate" value={`${avgHR}`} sub="bpm" color="text-red-400" />
                            <StatCard
                                icon={trend >= 0 ? TrendingUp : TrendingDown}
                                label="Trend"
                                value={`${trend >= 0 ? '+' : ''}${trend}`}
                                sub="vs recent"
                                color={trend >= 0 ? 'text-red-400' : 'text-teal-400'}
                            />
                            <StatCard icon={Zap} label="Readings" value={results.length} sub="total collected" color="text-amber-400" />
                        </div>

                        {/* Distribution */}
                        <motion.div
                            className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        >
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-4">Stress Distribution</p>
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%" cy="50%"
                                                innerRadius={30} outerRadius={50}
                                                dataKey="value"
                                                strokeWidth={0}
                                            >
                                                {pieData.map((entry, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[entry.name]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 flex-1">
                                    {['low', 'medium', 'high'].map(level => (
                                        <div key={level} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[level] }} />
                                                <span className="text-xs text-slate-300 capitalize">{level}</span>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">{levelCounts[level]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Bar Chart */}
                        <motion.div
                            className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        >
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">Recent Readings</p>
                            <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="idx" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                                            labelStyle={{ color: '#94a3b8' }}
                                        />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                            {barData.map((entry, i) => (
                                                <Cell key={i} fill={getStressColor(entry.level)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    );
}