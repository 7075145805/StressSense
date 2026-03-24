import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X, Users, PhoneCall, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function EmergencyAlert({ show, onDismiss, contacts = [] }) {
    const [calledIdx, setCalledIdx] = useState(null);
    const [autoCallCountdown, setAutoCallCountdown] = useState(10);
    const [autoCalled, setAutoCalled] = useState(null);

    // Auto-call first contact after countdown
    useEffect(() => {
        if (!show || contacts.length === 0) return;
        setCalledIdx(null);
        setAutoCalled(null);
        setAutoCallCountdown(10);

        const countdown = setInterval(() => {
            setAutoCallCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const autoCallTimer = setTimeout(() => {
            window.location.href = 'tel:988'; // Number for Stress Control Room
            setAutoCalled('control_room');
        }, 10000);

        return () => {
            clearInterval(countdown);
            clearTimeout(autoCallTimer);
        };
    }, [show, contacts]);

    const handleCall = (contact, idx) => {
        setCalledIdx(idx);
        window.location.href = `tel:${contact.phone}`;
    };

    const contactColors = ['bg-teal-500', 'bg-purple-500', 'bg-blue-500', 'bg-rose-500', 'bg-amber-500'];

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.2 }}
                                >
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </motion.div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">High Stress Alert</h3>
                                    <p className="text-xs text-red-400">Elevated stress detected</p>
                                </div>
                            </div>
                            <button onClick={onDismiss} className="text-slate-600 hover:text-white transition-colors mt-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                            Your stress levels have been critically high. Automatically generating a call to the <strong className="text-white">Stress Control Room</strong>.
                        </p>

                        {/* Emergency contacts */}
                        {contacts.length > 0 ? (
                            <div className="space-y-2 mb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Auto-Calling Control Room in...</p>
                                    {!autoCalled && (
                                        <span className="text-xs text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded-full">
                                            {autoCallCountdown}s
                                        </span>
                                    )}
                                </div>
                                {contacts.map((contact, idx) => {
                                    const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                    const color = contactColors[idx % contactColors.length];
                                    const isCalled = calledIdx === idx;
                                    const isFirst = idx === 0;

                                    return (
                                        <motion.div
                                            key={contact.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isFirst && !autoCalled
                                                    ? 'border-red-500/30 bg-red-500/5'
                                                    : 'border-slate-800/50 bg-slate-800/30'
                                                }`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
                                                <span className="text-white text-xs font-bold">{initials}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
                                                <p className="text-xs text-slate-400">{contact.phone}</p>
                                                {contact.relationship && (
                                                    <p className="text-[10px] text-slate-500">{contact.relationship}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleCall(contact, idx)}
                                                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCalled
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-teal-500 text-white hover:bg-teal-400 active:scale-95'
                                                    }`}
                                            >
                                                {isCalled
                                                    ? <CheckCircle className="w-4 h-4" />
                                                    : <PhoneCall className="w-4 h-4" />
                                                }
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mb-5 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-400">No emergency contacts added</p>
                                    <Link to="/Contacts" className="text-xs text-teal-400 hover:underline" onClick={onDismiss}>
                                        Add contacts →
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Crisis line / Control Room */}
                        <Button
                            className={`w-full text-white mb-2 ${autoCalled === 'control_room' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                            onClick={() => { window.location.href = 'tel:988'; setAutoCalled('control_room'); }}
                        >
                            {autoCalled === 'control_room' ? <CheckCircle className="w-4 h-4 mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
                            {autoCalled === 'control_room' ? 'Call Generated' : 'Stress Control Room — Call 988'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={onDismiss}
                        >
                            I'm okay — Dismiss
                        </Button>

                        {/* Breathing tip */}
                        <div className="mt-4 p-3 bg-slate-800/40 rounded-xl">
                            <p className="text-xs text-slate-500 leading-relaxed text-center">
                                💡 <strong className="text-slate-400">4-7-8 Breathing:</strong> Inhale 4s · Hold 7s · Exhale 8s
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}