import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Layout from './Layout';

// Feature zones
import IntelligenceHero from '../features/hero/IntelligenceHero';
import RiskAtlas3D from '../features/atlas/RiskAtlas3D';
import DomainToggle from '../features/atlas/DomainToggle';
import HorizonEngine from '../features/horizon/HorizonEngine';
import AnalyticsLab from '../features/analytics/Contribution3D';
import RadarSweep from '../features/anomaly/RadarSweep';
import ResidualBars from '../features/anomaly/ResidualBars';
import CorrelationMatrix from '../features/correlation/CorrelationMatrix';
import ScatterRisk from '../features/correlation/ScatterRisk';
import ModelCore from '../features/modelcore/ModelCore';
import DeepDivePanel from '../components/ui/DeepDivePanel';
import AddDataModal from '../components/ui/AddDataModal';

// API
import {
    fetchPredictions,
    fetchAirResidual,
    fetchWaterResidual,
    fetchUrbanResidual,
    fetchAirExplain,
    fetchWaterExplain,
    fetchUrbanExplain,
    healthCheck,
} from '../lib/api';

import { riskColor, computeZoneRanking } from '../lib/utils/metrics';

// ─── Toast system ────────────────────────────────────
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

export default function App() {
    // ── State ──
    const [predictions, setPredictions] = useState([]);
    const [airResidual, setAirResidual] = useState([]);
    const [waterResidual, setWaterResidual] = useState([]);
    const [urbanResidual, setUrbanResidual] = useState([]);
    const [airExplain, setAirExplain] = useState([]);
    const [waterExplain, setWaterExplain] = useState([]);
    const [urbanExplain, setUrbanExplain] = useState([]);

    const [selectedZone, setSelectedZone] = useState('');
    const [activeDomain, setActiveDomain] = useState('air');
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState('checking');
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [deepDiveOpen, setDeepDiveOpen] = useState(false);
    const [showAddData, setShowAddData] = useState(false);
    const { toast, show: showToast } = useToast();

    // Zones list
    const zones = useMemo(
        () => [...new Set(predictions.map(p => p.zone_id))].sort(),
        [predictions]
    );

    // Auto-select first zone
    const prevZonesRef = useRef(0);
    useEffect(() => {
        if (zones.length > 0 && zones.length !== prevZonesRef.current) {
            setSelectedZone(z => z || zones[0]);
        }
        prevZonesRef.current = zones.length;
    }, [zones]);

    // ── Fetch all data ──
    const fetchAll = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        setLoading(true);

        try {
            await healthCheck();
            setApiStatus('online');
        } catch {
            setApiStatus('offline');
            setLoading(false);
            if (!silent) setRefreshing(false);
            return;
        }

        const errors = [];
        const safe = async (fn, setter) => {
            try { const d = await fn(); setter(d); }
            catch (e) { errors.push(e.message); }
        };

        await Promise.all([
            safe(fetchPredictions, setPredictions),
            safe(fetchAirResidual, setAirResidual),
            safe(fetchWaterResidual, setWaterResidual),
            safe(fetchUrbanResidual, setUrbanResidual),
            safe(fetchAirExplain, setAirExplain),
            safe(fetchWaterExplain, setWaterExplain),
            safe(fetchUrbanExplain, setUrbanExplain),
        ]);

        setLoading(false);
        setLastUpdated(new Date());
        if (!silent) {
            setRefreshing(false);
            if (errors.length > 0) {
                showToast('error', `${errors.length} endpoint(s) failed`);
            } else {
                showToast('success', 'Intelligence updated with live data');
            }
        }
    }, [showToast]);

    // Initial + auto-refresh (every 24 hours)
    useEffect(() => {
        fetchAll(true);
        const t = setInterval(() => fetchAll(true), 86_400_000);
        return () => clearInterval(t);
    }, [fetchAll]);

    const isOffline = apiStatus === 'offline';

    // Zone ranking for atlas sidebar
    const ranking = useMemo(() => computeZoneRanking(predictions), [predictions]);

    return (
        <Layout onAddData={() => setShowAddData(true)} apiStatus={apiStatus}>
            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`toast toast-${toast.type}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                    >
                        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ ZONE 1: HERO ═══ */}
            <IntelligenceHero
                predictions={predictions}
                airResidual={airResidual}
                waterResidual={waterResidual}
                urbanResidual={urbanResidual}
                selectedZone={selectedZone}
                zones={zones}
                loading={loading}
            />

            {/* ── Offline Banner ── */}
            {isOffline && (
                <motion.div
                    className="offline-banner"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span style={{ fontSize: 18 }}>!</span>
                    <div>
                        <strong>FastAPI backend unreachable</strong>
                        <span style={{ color: 'var(--crimson)', marginLeft: 8 }}>(http://127.0.0.1:8000)</span>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            Start: <code style={{ background: 'rgba(255,59,59,0.08)', padding: '1px 6px', borderRadius: 4 }}>uvicorn app:app --reload</code>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ═══ ZONE 2: RISK ATLAS ═══ */}
            {!isOffline && (
                <section
                    id="atlas"
                    className="section-zone section-zone--content reveal"
                    style={{
                        background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,200,150,0.03), transparent), var(--base)`,
                    }}
                >
                    <div className="section-inner">
                        <div className="section-label">
                            <div className="section-label-tag">Risk Atlas</div>
                            <div className="section-label-title">Delhi District Risk Map</div>
                            <div className="section-label-desc">Click any district to explore · Showing D+1 forecast</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 32, alignItems: 'start' }}>
                            <RiskAtlas3D
                                predictions={predictions}
                                activeDomain={activeDomain}
                                selectedZone={selectedZone}
                                onZoneClick={(id) => { setSelectedZone(id); setDeepDiveOpen(true); }}
                                loading={loading}
                            />

                            <div>
                                {/* Zone selector */}
                                <div className="glass-card" style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                        Active Zone
                                    </div>
                                    <select
                                        className="select"
                                        value={selectedZone}
                                        onChange={e => setSelectedZone(e.target.value)}
                                        style={{ marginBottom: 16 }}
                                    >
                                        {zones.length === 0
                                            ? <option>Loading…</option>
                                            : zones.map(z => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)
                                        }
                                    </select>

                                    {/* Domain toggle */}
                                    <DomainToggle activeDomain={activeDomain} onDomainChange={setActiveDomain} />
                                </div>

                                {/* Zone Ranking */}
                                <div className="glass-card">
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                        Risk Leaderboard
                                    </div>
                                    {ranking.slice(0, 5).map((r, i) => (
                                        <div
                                            key={r.zone_id}
                                            onClick={() => { setSelectedZone(r.zone_id); setDeepDiveOpen(true); }}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '8px 0', borderBottom: '1px solid var(--border)',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 10, fontWeight: 700,
                                                    background: i === 0 ? 'rgba(255,59,59,0.15)' : 'rgba(107,123,141,0.1)',
                                                    color: i === 0 ? 'var(--crimson)' : 'var(--text-muted)',
                                                }}>
                                                    {i + 1}
                                                </span>
                                                <span style={{ fontSize: 12, color: r.zone_id === selectedZone ? 'var(--cyan)' : 'var(--text-secondary)' }}>
                                                    {r.zone_id?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: riskColor(r.final_risk_prediction),
                                            }}>
                                                {r.final_risk_prediction?.toFixed(1)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {lastUpdated && (
                                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: 12 }}>
                                        Last sync: {lastUpdated.toLocaleTimeString('en-IN')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ ZONE 3: HORIZON ENGINE ═══ */}
            {!isOffline && (
                <div className="reveal">
                    <HorizonEngine
                        predictions={predictions}
                        selectedZone={selectedZone}
                        activeDomain={activeDomain}
                        loading={loading}
                    />
                </div>
            )}

            {/* ═══ ZONE 4: ANALYTICS LAB ═══ */}
            {!isOffline && (
                <div className="reveal">
                    <AnalyticsLab
                        activeDomain={activeDomain}
                        selectedZone={selectedZone}
                        airExplain={airExplain}
                        waterExplain={waterExplain}
                        urbanExplain={urbanExplain}
                        loading={loading}
                    />
                </div>
            )}

            {/* ═══ ZONE 5: ANOMALY RADAR ═══ */}
            {!isOffline && (
                <section
                    id="anomaly"
                    className="section-zone section-zone--content reveal"
                    style={{
                        background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,59,59,0.02), transparent), var(--base)`,
                    }}
                >
                    <div className="section-inner">
                        <div className="section-label">
                            <div className="section-label-tag">Anomaly Radar</div>
                            <div className="section-label-title">Zone Anomaly Intelligence</div>
                            <div className="section-label-desc">Real-time residual anomaly detection across domains</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
                            <RadarSweep
                                activeDomain={activeDomain}
                                airResidual={airResidual}
                                waterResidual={waterResidual}
                                urbanResidual={urbanResidual}
                                selectedZone={selectedZone}
                                onZoneClick={setSelectedZone}
                                loading={loading}
                            />
                            <ResidualBars
                                activeDomain={activeDomain}
                                airResidual={airResidual}
                                waterResidual={waterResidual}
                                urbanResidual={urbanResidual}
                                selectedZone={selectedZone}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ ZONE 6: CORRELATION ENGINE ═══ */}
            {!isOffline && (
                <section
                    id="correlation"
                    className="section-zone section-zone--content reveal"
                    style={{
                        background: `radial-gradient(ellipse 60% 50% at 40% 50%, rgba(47,128,255,0.03), transparent), var(--base)`,
                    }}
                >
                    <div className="section-inner">
                        <div className="section-label">
                            <div className="section-label-tag">🔗 Correlation Engine</div>
                            <div className="section-label-title">Cross-Domain Analysis</div>
                            <div className="section-label-desc">Correlation matrix + domain-risk scatter analysis</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <CorrelationMatrix predictions={predictions} />
                            <ScatterRisk predictions={predictions} activeDomain={activeDomain} />
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ ZONE 7: MODEL CORE ═══ */}
            {!isOffline && (
                <div className="reveal">
                    <ModelCore
                        airResidual={airResidual}
                        waterResidual={waterResidual}
                        urbanResidual={urbanResidual}
                    />
                </div>
            )}

            {/* ── Footer ── */}
            <div className="footer">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    Urban Risk Intelligence &nbsp;·&nbsp; FastAPI ML Backend &nbsp;·&nbsp; Node.js Data Layer &nbsp;·&nbsp; Auto-refreshes every 24h
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
                    AI-powered Environmental Risk Prediction System
                </div>
            </div>

            {/* ── Add Data Modal ── */}
            {showAddData && (
                <AddDataModal
                    onClose={() => setShowAddData(false)}
                    onSuccess={(msg) => {
                        showToast('success', msg);
                        setTimeout(() => fetchAll(false), 3000);
                    }}
                />
            )}

            {/* ── Deep Dive Panel ── */}
            <DeepDivePanel
                open={deepDiveOpen}
                onClose={() => setDeepDiveOpen(false)}
                zoneId={selectedZone}
                predictions={predictions}
                airResidual={airResidual}
                waterResidual={waterResidual}
                urbanResidual={urbanResidual}
            />
        </Layout>
    );
}
