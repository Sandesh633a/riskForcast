import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroControlRoom from './components/HeroControlRoom';
import DelhiMap from './components/DelhiMap';
import HorizonTimeline from './components/HorizonTimeline';
import ExplainLab from './components/ExplainLab';
import AnomalyRadar from './components/AnomalyRadar';
import ModelCore from './components/ModelCore';
import AddDataModal from './components/AddDataModal';

import {
    getPredictions, getAnomalies, getRiskExplain, healthCheck,
    getWaterResidual, getWaterExplain,
    getUrbanResidual, getUrbanExplain,
} from './services/api';

// ─── Toast system ─────────────────────────────────────────────
let toastTimer = null;
function useToast() {
    const [toast, setToast] = useState(null);
    const show = useCallback((type, message) => {
        setToast({ type, message });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => setToast(null), 4500);
    }, []);
    return { toast, show };
}

// ─── Loading state helper ──────────────────────────────────────
const INITIAL_LOADING = { predictions: true, anomalies: true, explain: true, water: true, urban: true };
const NO_LOADING = { predictions: false, anomalies: false, explain: false, water: false, urban: false };

// ─── Framer variants ────────────────────────────────────────────
const fadeSlide = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

export default function App() {
    // ── State ──
    const [predictions, setPredictions] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [explain, setExplain] = useState([]);

    const [waterAnomalies, setWaterAnomalies] = useState([]);
    const [waterExplain, setWaterExplain] = useState([]);
    const [urbanAnomalies, setUrbanAnomalies] = useState([]);
    const [urbanExplain, setUrbanExplain] = useState([]);

    const [selectedZone, setSelectedZone] = useState('');
    const [activeDomain, setActiveDomain] = useState('air');
    const [loading, setLoading] = useState(INITIAL_LOADING);
    const [errors, setErrors] = useState({});
    const [apiStatus, setApiStatus] = useState('checking');
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [showAddData, setShowAddData] = useState(false);
    const [navSolid, setNavSolid] = useState(false);
    const { toast, show: showToast } = useToast();

    // Auto-select first zone whenever predictions load
    const zones = [...new Set((predictions).map(p => p.zone_id))].sort();
    const prevZonesLen = useRef(0);
    useEffect(() => {
        if (zones.length > 0 && zones.length !== prevZonesLen.current) {
            setSelectedZone(z => z || zones[0]);
        }
        prevZonesLen.current = zones.length;
    }, [zones]);

    // ── Navbar scroll behavior ────────────────────────────────
    useEffect(() => {
        const handleScroll = () => {
            setNavSolid(window.scrollY > 80);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ── Scroll-reveal with IntersectionObserver ──────────────
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        );

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [loading, activeDomain]);

    // ── Fetch all data ────────────────────────────────────────
    const fetchAll = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        setLoading(INITIAL_LOADING);

        const newErrors = {};
        try {
            await healthCheck();
            setApiStatus('online');
        } catch {
            setApiStatus('offline');
            setLoading(NO_LOADING);
            if (!silent) setRefreshing(false);
            return;
        }

        const safe = async (fn, setter, key) => {
            try { const d = await fn(); setter(d); }
            catch (e) { newErrors[key] = e.message; }
        };

        await Promise.all([
            safe(getPredictions, setPredictions, 'predictions'),
            safe(getAnomalies, setAnomalies, 'anomalies'),
            safe(getRiskExplain, setExplain, 'explain'),
            safe(getWaterResidual, setWaterAnomalies, 'water'),
            safe(getWaterExplain, setWaterExplain, 'waterExplain'),
            safe(getUrbanResidual, setUrbanAnomalies, 'urban'),
            safe(getUrbanExplain, setUrbanExplain, 'urbanExplain'),
        ]);

        setErrors(newErrors);
        setLoading(NO_LOADING);
        setLastUpdated(new Date());
        if (!silent) {
            setRefreshing(false);
            if (Object.keys(newErrors).length > 0) {
                showToast('error', `${Object.keys(newErrors).length} endpoint(s) returned errors`);
            } else {
                showToast('success', 'Intelligence updated with live data');
            }
        }
    }, [showToast]);

    // Initial load + 60s auto-refresh
    useEffect(() => {
        fetchAll(true);
        const t = setInterval(() => fetchAll(true), 60_000);
        return () => clearInterval(t);
    }, [fetchAll]);

    const isOffline = apiStatus === 'offline';

    return (
        <div className="page-wrap">

            {/* Navbar — floating over hero, solid on scroll */}
            <Navbar
                apiStatus={apiStatus}
                onRefresh={() => fetchAll(false)}
                refreshing={refreshing}
                solid={navSolid}
                onAddData={() => setShowAddData(true)}
                lastUpdated={lastUpdated}
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`toast toast-${toast.type}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                    >
                        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'} {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Data Modal */}
            {showAddData && (
                <AddDataModal
                    onClose={() => setShowAddData(false)}
                    onSuccess={(msg) => {
                        showToast('success', msg);
                        setTimeout(() => fetchAll(false), 3000);
                    }}
                />
            )}

            {/* ═══════════════════════════════════════════════════
                LAYER 1 — HERO CONTROL ROOM
            ═══════════════════════════════════════════════════ */}
            <HeroControlRoom
                activeDomain={activeDomain}
                onDomainChange={setActiveDomain}
                predictions={predictions}
                anomalies={anomalies}
                waterAnomalies={waterAnomalies}
                urbanAnomalies={urbanAnomalies}
                zones={zones}
                selectedZone={selectedZone}
                apiStatus={apiStatus}
                loading={loading.predictions}
            />

            {/* ── Offline Banner ── */}
            {isOffline && (
                <motion.div className="offline-banner" {...fadeSlide}
                    style={{ maxWidth: 1100, margin: '0 auto 0', position: 'relative', zIndex: 10 }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <div>
                        <strong>FastAPI server is unreachable</strong>
                        <span style={{ color: 'var(--ember-300)', marginLeft: 8 }}>(http://127.0.0.1:8000)</span>
                        <div className="text-xs" style={{ color: 'var(--ember-300)', marginTop: 2, fontWeight: 400 }}>
                            Start the backend: <code style={{ background: 'rgba(192,57,43,0.12)', padding: '1px 6px', borderRadius: 4 }}>uvicorn app:app --reload</code>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════
                LAYER 2 — DELHI MAP ZONE
            ═══════════════════════════════════════════════════ */}
            {!isOffline && (
                <section className="map-layer layer-section reveal">
                    <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
                        <div className="section-label mb-6">
                            <div className="section-label-title">🗺️ Delhi Risk Map</div>
                            <div className="section-label-desc">
                                Click any district to select · Showing D+1 forecast
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 28, alignItems: 'center' }}>
                            <DelhiMap
                                predictions={predictions}
                                selectedZone={selectedZone}
                                onZoneClick={(zoneId) => setSelectedZone(zoneId)}
                                loading={loading.predictions}
                            />

                            {/* Zone selector + quick stats */}
                            <div>
                                <div className="card mb-4">
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                                        Active Zone
                                    </div>
                                    <select
                                        className="select mb-4"
                                        value={selectedZone}
                                        onChange={e => setSelectedZone(e.target.value)}
                                        disabled={zones.length === 0}
                                    >
                                        {zones.length === 0
                                            ? <option>Loading zones…</option>
                                            : zones.map(z => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)
                                        }
                                    </select>

                                    {/* Quick risk breakdown */}
                                    {(() => {
                                        const zd = predictions.filter(p => p.zone_id === selectedZone && p.horizon_days === 1)[0];
                                        if (!zd) return null;
                                        return (
                                            <div>
                                                {[
                                                    { label: '🌫️ Air Risk', val: zd.air_risk, color: 'var(--forest-400)' },
                                                    { label: '💧 Water Risk', val: zd.water_risk, color: 'var(--teal-400)' },
                                                    { label: '🏙️ Urban Risk', val: zd.urban_risk, color: 'var(--amber-400)' },
                                                    { label: '📊 Final Risk', val: zd.final_risk_prediction, color: 'var(--ember-400)' },
                                                ].map(d => (
                                                    <div key={d.label} style={{ marginBottom: 10 }}>
                                                        <div className="flex justify-between" style={{ marginBottom: 3 }}>
                                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.label}</span>
                                                            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: d.color }}>
                                                                {d.val?.toFixed(1) ?? '—'}
                                                            </span>
                                                        </div>
                                                        <div className="progress-track">
                                                            <div className="progress-fill" style={{
                                                                width: `${Math.min(d.val ?? 0, 100)}%`,
                                                                background: d.color,
                                                            }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {lastUpdated && (
                                    <div style={{ fontSize: 11, color: 'var(--earth-500)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                                        Last sync: {lastUpdated.toLocaleTimeString('en-IN')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════════════
                LAYER 3 — RISK HORIZON TIMELINE
            ═══════════════════════════════════════════════════ */}
            {!isOffline && (
                <div className="reveal">
                    <HorizonTimeline
                        predictions={predictions}
                        selectedZone={selectedZone}
                        activeDomain={activeDomain}
                        explain={explain}
                        waterExplain={waterExplain}
                        urbanExplain={urbanExplain}
                        loading={loading.predictions}
                    />
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                LAYER 4 — AI EXPLAINABILITY LAB
            ═══════════════════════════════════════════════════ */}
            {!isOffline && (
                <div className="reveal">
                    <ExplainLab
                        activeDomain={activeDomain}
                        selectedZone={selectedZone}
                        explain={explain}
                        waterExplain={waterExplain}
                        urbanExplain={urbanExplain}
                        loading={loading.explain}
                    />
                </div>
            )}

            {/* ═══════════════════════════════════════════════════
                LAYER 5 — ANOMALY RADAR + MODEL CORE
            ═══════════════════════════════════════════════════ */}
            {!isOffline && (
                <section className="radar-layer layer-section reveal">
                    <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
                        <div className="section-label mb-6">
                            <div className="section-label-title">🚨 Anomaly Radar & Model Core</div>
                            <div className="section-label-desc">
                                Real-time anomaly detection · Model intelligence status
                            </div>
                        </div>

                        <div className="radar-layout">
                            <AnomalyRadar
                                activeDomain={activeDomain}
                                anomalies={anomalies}
                                waterAnomalies={waterAnomalies}
                                urbanAnomalies={urbanAnomalies}
                                selectedZone={selectedZone}
                                onZoneClick={setSelectedZone}
                                loading={loading.anomalies}
                            />

                            <ModelCore />
                        </div>
                    </div>
                </section>
            )}

            {/* ── Footer ── */}
            <div className="footer">
                <div style={{ fontSize: 11, color: 'var(--earth-500)', letterSpacing: '0.04em' }}>
                    Urban Risk Intelligence &nbsp;·&nbsp; FastAPI ML Backend &nbsp;·&nbsp; Node.js Data Layer &nbsp;·&nbsp; Auto-refreshes every 60s
                </div>
                <div style={{ fontSize: 10, color: 'var(--earth-600)', marginTop: 4 }}>
                    AI-powered Environmental Risk Prediction System
                </div>
            </div>
        </div>
    );
}
