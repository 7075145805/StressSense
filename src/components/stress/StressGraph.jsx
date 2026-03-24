import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const levelColors = { low: '#14b8a6', medium: '#f59e0b', high: '#ef4444' };
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-xs text-slate-400">{d.time}</p>
            <p className="text-sm font-semibold" style={{ color: levelColors[d.level] || '#fff' }}>
                Score: {d.score}
            </p>
            <p className="text-xs capitalize" style={{ color: levelColors[d.level] }}>
                {d.level} stress
            </p>
        </div>
    );
};

export default function StressGraph({ history = [] }) {
    const chartData = history.slice(-30).map((item) => ({
        time: format(new Date(item.timestamp || item.created_date), 'HH:mm:ss'),
        score: item.stress_score,
        level: item.stress_level
    }));

    if (chartData.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                Start monitoring to see stress data
            </div>
        );
    }

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        fill="url(#stressGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#14b8a6', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}