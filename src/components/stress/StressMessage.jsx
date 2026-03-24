import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = {
    high: [
        { emoji: '🧘', text: "Take a slow, deep breath. Inhale for 4 counts, hold for 4, exhale for 4." },
        { emoji: '💧', text: "Step away from the screen for a moment. Drink some water — you've got this." },
        { emoji: '🤝', text: "It's okay to ask for help. Reach out to someone you trust right now." },
        { emoji: '🌬️', text: "Your body is in fight mode. Try rolling your shoulders back and relaxing your jaw." },
        { emoji: '⏸️', text: "Pause whatever you're doing. Even 60 seconds of stillness can help reset your mind." },
    ],
    medium: [
        { emoji: '☕', text: "You're doing okay — consider a short break to stretch or make a warm drink." },
        { emoji: '🎵', text: "Some calm music might help lower that stress. Take it one step at a time." },
        { emoji: '🌿', text: "Try stepping outside for a few minutes. Fresh air does wonders for a busy mind." },
        { emoji: '📝', text: "Write down what's on your mind. Getting it out of your head often eases the pressure." },
        { emoji: '😊', text: "You're managing well. A short walk or a few stretches could help you recharge." },
    ],
    low: [
        { emoji: '🌟', text: "You're in a great headspace! Keep riding this wave of calm." },
        { emoji: '✨', text: "Stress is low — you're doing an amazing job taking care of yourself." },
        { emoji: '🌈', text: "Your mind is at ease. This is a perfect time to focus on what matters most." },
        { emoji: '💚', text: "Feeling balanced and calm. Take a moment to appreciate how well you're doing." },
        { emoji: '🕊️', text: "All is well. Enjoy this peaceful moment — you've earned it." },
    ],
};

const LEVEL_STYLES = {
    high: {
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.25)',
        text: '#f87171',
        label: 'Wellness Tip',
    },
    medium: {
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.25)',
        text: '#fbbf24',
        label: 'Helpful Reminder',
    },
    low: {
        bg: 'rgba(20, 184, 166, 0.08)',
        border: 'rgba(20, 184, 166, 0.25)',
        text: '#2dd4bf',
        label: 'Feeling Good',
    },
};

export default function StressMessage({ level = 'low', isMonitoring = false }) {
    const [msgIndex, setMsgIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    // Pick a random message once per level change
    useEffect(() => {
        const msgs = MESSAGES[level] || MESSAGES.low;
        setMsgIndex(Math.floor(Math.random() * msgs.length));
        setVisible(isMonitoring);
    }, [level, isMonitoring]);

    // Rotate message every 20 seconds while monitoring
    useEffect(() => {
        if (!isMonitoring) return;
        const interval = setInterval(() => {
            const msgs = MESSAGES[level] || MESSAGES.low;
            setMsgIndex(i => (i + 1) % msgs.length);
        }, 20000);
        return () => clearInterval(interval);
    }, [level, isMonitoring]);

    const msgs = MESSAGES[level] || MESSAGES.low;
    const msg = msgs[msgIndex];
    const style = LEVEL_STYLES[level] || LEVEL_STYLES.low;

    return (
        <AnimatePresence mode="wait">
            {visible && (
                <motion.div
                    key={`${level}-${msgIndex}`}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        borderRadius: '1rem',
                        padding: '14px 18px',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                    }}
                >
                    {/* Emoji bubble */}
                    <span
                        style={{
                            fontSize: '1.5rem',
                            lineHeight: 1,
                            flexShrink: 0,
                            marginTop: '2px',
                        }}
                    >
                        {msg.emoji}
                    </span>

                    <div style={{ flex: 1 }}>
                        <p
                            style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: style.text,
                                marginBottom: '4px',
                                opacity: 0.8,
                            }}
                        >
                            {style.label}
                        </p>
                        <p
                            style={{
                                fontSize: '0.82rem',
                                color: 'rgba(255,255,255,0.82)',
                                lineHeight: 1.55,
                                margin: 0,
                            }}
                        >
                            {msg.text}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
