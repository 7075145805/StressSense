import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Brain, Users } from 'lucide-react';
import { createSensorCollector } from '../components/stress/SensorCollector';
import { classifyStress } from '../components/stress/StressClassifier';
import StressMeter from '../components/stress/StressMeter';
import SensorDisplay from '../components/stress/SensorDisplay';
import StressGraph from '../components/stress/StressGraph';
import FeatureBar from '../components/stress/FeatureBar';
import MonitorControls from '../components/stress/MonitorControls';
import EmergencyAlert from '../components/stress/EmergencyAlert';
import StressMessage from '../components/stress/StressMessage';

const COLLECT_INTERVAL = 5000; // 5 seconds

export default function Monitor() {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}`);
    const [sensorData, setSensorData] = useState({});
    const [stressResult, setStressResult] = useState({ stress_score: 0, stress_level: 'low', feature_scores: {} });
    const [stressHistory, setStressHistory] = useState([]);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [highStressCount, setHighStressCount] = useState(0);

    const { data: contacts = [] } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => base44.entities.EmergencyContact.list('priority', 10),
    });

    const collectorRef = useRef(null);
    const intervalRef = useRef(null);
    const durationRef = useRef(null);
    const startTimeRef = useRef(null);

    const processData = useCallback(async () => {
        if (!collectorRef.current) return;

        const reading = collectorRef.current.collect();
        setSensorData(reading);

        // Classify stress
        const result = classifyStress({
            movement_intensity: reading.movement_intensity,
            shake_frequency: reading.shake_frequency,
            heart_rate: reading.heart_rate,
            screen_duration: reading.screen_on_duration,
            orientation_changes: reading.orientation_changes,
            location_delta: reading.location_delta
        });

        setStressResult(result);

        const stressEntry = {
            session_id: sessionId,
            timestamp: reading.timestamp,
            stress_level: result.stress_level,
            stress_score: result.stress_score,
            movement_intensity: reading.movement_intensity,
            shake_frequency: reading.shake_frequency,
            heart_rate: reading.heart_rate,
            screen_duration: reading.screen_on_duration,
            orientation_changes: reading.orientation_changes,
            location_delta: reading.location_delta
        };

        setStressHistory(prev => [...prev, stressEntry]);

        // Check for high stress alert
        if (result.stress_level === 'high') {
            setHighStressCount(prev => {
                const next = prev + 1;
                if (next >= 3) setShowAlert(true);
                return next;
            });
        } else {
            setHighStressCount(0);
        }

        // Save to database (fire and forget)
        base44.entities.SensorReading.create({ ...reading, session_id: sessionId }).catch(() => { });
        base44.entities.StressResult.create(stressEntry).catch(() => { });
    }, [sessionId]);

    const startMonitoring = useCallback(() => {
        const collector = createSensorCollector();
        collector.start();
        collectorRef.current = collector;
        startTimeRef.current = Date.now();
        setIsMonitoring(true);
        setStressHistory([]);
        setHighStressCount(0);

        intervalRef.current = setInterval(processData, COLLECT_INTERVAL);
        durationRef.current = setInterval(() => {
            setSessionDuration(Date.now() - startTimeRef.current);
        }, 1000);

        // Collect immediately
        setTimeout(processData, 500);
    }, [processData]);

    const stopMonitoring = useCallback(() => {
        if (collectorRef.current) collectorRef.current.stop();
        clearInterval(intervalRef.current);
        clearInterval(durationRef.current);
        setIsMonitoring(false);
        collectorRef.current = null;
    }, []);

    useEffect(() => {
        return () => {
            if (collectorRef.current) collectorRef.current.stop();
            clearInterval(intervalRef.current);
            clearInterval(durationRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-teal-400" />
                        <span className="font-semibold text-sm">StressSense</span>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/Contacts" className="text-slate-400 hover:text-white transition-colors p-2">
                            <Users className="w-4 h-4" />
                        </Link>
                        <Link to="/History" className="text-slate-400 hover:text-white transition-colors p-2">
                            <Clock className="w-4 h-4" />
                        </Link>
                        <Link to="/Dashboard" className="text-slate-400 hover:text-white transition-colors p-2">
                            <BarChart3 className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* Controls */}
                <motion.div
                    className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <MonitorControls
                        isMonitoring={isMonitoring}
                        onStart={startMonitoring}
                        onStop={stopMonitoring}
                        sessionDuration={sessionDuration}
                    />
                </motion.div>

                {/* Stress Meter */}
                <motion.div
                    className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <StressMeter score={stressResult.stress_score} level={stressResult.stress_level} />
                    <StressMessage level={stressResult.stress_level} isMonitoring={isMonitoring} />
                </motion.div>

                {/* Feature Contributions */}
                {Object.keys(stressResult.feature_scores).length > 0 && (
                    <motion.div
                        className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <FeatureBar featureScores={stressResult.feature_scores} />
                    </motion.div>
                )}

                {/* Stress Graph */}
                <motion.div
                    className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">Stress Over Time</p>
                    <StressGraph history={stressHistory} />
                </motion.div>

                {/* Live Sensor Values */}
                <motion.div
                    className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">Live Sensor Data</p>
                    <SensorDisplay data={sensorData} />
                </motion.div>

                {/* Info */}
                <div className="text-center pb-8">
                    <p className="text-xs text-slate-600">
                        Data is collected every 5 seconds · Sensors: Accelerometer, Gyroscope, GPS, Heart Rate (simulated)
                    </p>
                </div>
            </main>

            <EmergencyAlert show={showAlert} onDismiss={() => { setShowAlert(false); setHighStressCount(0); }} contacts={contacts} />
        </div>
    );
}