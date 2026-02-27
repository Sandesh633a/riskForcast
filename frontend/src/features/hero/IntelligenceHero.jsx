import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ParticleField from './ParticleField';
import HeroBackground from './HeroBackground';
import RiskRadial3D from './RiskRadial3D';
import DomainCard from './DomainCard';
import { riskColor, riskLevel, avgRisk, countAnomalies, computeConfidenceScore } from '../../lib/utils/metrics';

/* ── SVG Icons ── */
const SvgPin = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const SvgTarget = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
const SvgAlert = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const SvgCheck = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const SvgBrain = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.5.6 2.8 1.5 3.8L4 14l2 1.5L4 18l2 2h4v-4.5" />
        <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 1.5-.6 2.8-1.5 3.8L20 14l-2 1.5L20 18l-2 2h-4v-4.5" />
    </svg>
);
const SvgBarChart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);
const SvgCalendar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const SvgCpu = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    </svg>
);
const SvgZap = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const SvgTrend = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const SvgLayers = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
);

/* ══════════════════════════════════════════
   BOLD DECORATIVE BACKGROUND PATTERNS
   — Much more visible, dominant, and stylized
   ══════════════════════════════════════════ */

/* Hexagonal grid — bigger hexagons, more opacity */
const DecoHexGrid = () => {
    const hexagons = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 10; col++) {
            const cx = 35 + col * 70 + (row % 2 ? 35 : 0);
            const cy = 35 + row * 60;
            const r = 30;
            const pts = Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 3) * i - Math.PI / 6;
                return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
            }).join(' ');
            hexagons.push(
                <polygon key={`${row}-${col}`} points={pts} fill="none"
                    stroke={row % 3 === 0 ? '#0094CC' : row % 3 === 1 ? '#00A87A' : '#2B6CB0'}
                    strokeWidth="0.8"
                    opacity={0.15 + (row + col) * 0.005}
                />
            );
        }
    }
    return (
        <svg style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            opacity: 0.12, pointerEvents: 'none', zIndex: 0,
        }} viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice">
            {hexagons}
        </svg>
    );
};

/* Circuit board pattern — bold lines with nodes and pulses */
const DecoCircuitBoard = () => (
    <svg style={{
        position: 'absolute', top: 0, right: 0, width: '55%', height: '100%',
        opacity: 0.08, pointerEvents: 'none', zIndex: 0,
    }} viewBox="0 0 500 600" preserveAspectRatio="none">
        {/* Vertical data lines */}
        {[80, 180, 280, 380, 450].map((x, i) => (
            <g key={`v${i}`}>
                <line x1={x} y1="0" x2={x} y2="600" stroke="#0094CC" strokeWidth="1.2" strokeDasharray="12 6" />
                {/* Nodes along lines */}
                {[100, 250, 400, 520].map((y, j) => (
                    <g key={j}>
                        <circle cx={x} cy={y} r="5" fill="none" stroke="#0094CC" strokeWidth="1" />
                        <circle cx={x} cy={y} r="2" fill="#0094CC" opacity="0.4" />
                    </g>
                ))}
            </g>
        ))}
        {/* Horizontal cross-links */}
        {[120, 270, 380, 500].map((y, i) => (
            <line key={`h${i}`} x1="60" y1={y} x2="470" y2={y}
                stroke="#00A87A" strokeWidth="0.8" strokeDasharray="8 8" />
        ))}
        {/* Diagonal accent lines */}
        <line x1="80" y1="100" x2="280" y2="250" stroke="#2B6CB0" strokeWidth="0.7" opacity="0.5" />
        <line x1="280" y1="250" x2="380" y2="400" stroke="#0094CC" strokeWidth="0.7" opacity="0.5" />
        <line x1="180" y1="400" x2="450" y2="520" stroke="#00A87A" strokeWidth="0.7" opacity="0.5" />
    </svg>
);

/* Floating geometric shapes — topographic contour inspired */
const DecoTopoLines = () => (
    <svg style={{
        position: 'absolute', bottom: 0, left: 0, width: '50%', height: '60%',
        opacity: 0.06, pointerEvents: 'none', zIndex: 0,
    }} viewBox="0 0 400 300">
        {/* Concentric rounded rectangles */}
        {[0, 1, 2, 3, 4].map(i => (
            <rect key={i}
                x={40 + i * 25} y={30 + i * 20}
                width={320 - i * 50} height={240 - i * 40}
                rx={20 + i * 6} fill="none"
                stroke={i % 2 === 0 ? '#0094CC' : '#00A87A'}
                strokeWidth="1" strokeDasharray={i % 2 === 0 ? '6 4' : '10 5'}
            />
        ))}
        {/* Data flow arrows */}
        <path d="M 60 150 Q 120 80 200 150 Q 280 220 340 150" fill="none" stroke="#2B6CB0" strokeWidth="1.2" strokeDasharray="8 4" />
    </svg>
);

/* Large gradient orbs — soft, dominant ambient lighting */
const DecoGradientOrbs = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Top right cyan orb */}
        <div style={{
            position: 'absolute', top: '-8%', right: '-5%', width: '45%', height: '50%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,148,204,0.08) 0%, transparent 70%)',
        }} />
        {/* Center left green orb */}
        <div style={{
            position: 'absolute', top: '30%', left: '-10%', width: '40%', height: '45%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,168,122,0.06) 0%, transparent 70%)',
        }} />
        {/* Bottom right blue orb */}
        <div style={{
            position: 'absolute', bottom: '-10%', right: '10%', width: '35%', height: '40%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(43,108,176,0.06) 0%, transparent 70%)',
        }} />
        {/* Subtle horizontal scan line effect */}
        <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,148,204,0.01) 3px, rgba(0,148,204,0.01) 4px)',
        }} />
    </div>
);

export default function IntelligenceHero({
    predictions,
    airResidual,
    waterResidual,
    urbanResidual,
    selectedZone,
    zones,
    loading,
}) {
    const zoneD1 = useMemo(() =>
        predictions.find(p => p.zone_id === selectedZone && p.horizon_days === 1),
        [predictions, selectedZone]
    );

    const avg = useMemo(() => avgRisk(predictions), [predictions]);
    const totalAnomalies = useMemo(() =>
        countAnomalies(airResidual) + countAnomalies(waterResidual) + countAnomalies(urbanResidual),
        [airResidual, waterResidual, urbanResidual]
    );
    const confidence = useMemo(() => {
        const all = [...(airResidual || []), ...(waterResidual || []), ...(urbanResidual || [])];
        return computeConfidenceScore(all);
    }, [airResidual, waterResidual, urbanResidual]);

    return (
        <section
            id="hero"
            className="section-zone"
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                padding: '100px 48px 48px',
                background: '#F5F7FA',
                overflow: 'hidden',
            }}
        >
            {/* ── BOLD BACKGROUND PATTERNS ── */}
            <DecoGradientOrbs />
            <DecoHexGrid />
            <DecoCircuitBoard />
            <DecoTopoLines />
            <ParticleField />
            <HeroBackground />

            {/* ── MAIN CONTENT ── */}
            <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* ── Row 1: Title + Central Risk Gauge + Quick Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 48, alignItems: 'center', marginBottom: 52 }}>

                    {/* Left: Title & Description */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{
                            fontSize: 13, color: '#0094CC', textTransform: 'uppercase',
                            letterSpacing: '0.16em', fontWeight: 700, marginBottom: 14,
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <SvgCpu /> AI-Powered Prediction Engine
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            lineHeight: 1.08,
                            color: 'var(--text-primary)',
                            marginBottom: 18,
                        }}>
                            Urban Risk{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #00A87A, #0094CC)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontStyle: 'italic',
                            }}>
                                Intelligence
                            </span>
                        </h1>
                        <p style={{
                            fontSize: 16,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            maxWidth: 480,
                        }}>
                            Multi-domain environmental risk forecasting across{' '}
                            <strong style={{ color: 'var(--text-primary)' }}>{zones.length} Delhi NCR zones</strong>.
                            Leveraging <strong>XGBoost Regressor</strong> with SHAP explainability
                            for D+1, D+3, and D+7 horizon predictions.
                        </p>

                        {/* Quick info tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
                            {[
                                { label: 'XGBoost Regressor', Icon: SvgCpu },
                                { label: 'SHAP Analysis', Icon: SvgLayers },
                                { label: 'Real-time', Icon: SvgZap },
                                { label: 'Multi-Horizon', Icon: SvgTrend },
                            ].map(t => (
                                <div key={t.label} style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    padding: '7px 16px',
                                    background: 'rgba(0,148,204,0.06)',
                                    border: '1px solid rgba(0,148,204,0.15)',
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    transition: 'all 0.25s ease',
                                    cursor: 'default',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(0,148,204,0.12)';
                                        e.currentTarget.style.borderColor = 'rgba(0,148,204,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(0,148,204,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(0,148,204,0.15)';
                                    }}
                                >
                                    <t.Icon /> {t.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Center: 3D Risk Gauge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        style={{ padding: '16px 0' }}
                    >
                        {loading ? (
                            <div className="skeleton" style={{ width: 340, height: 340, borderRadius: '50%' }} />
                        ) : (
                            <RiskRadial3D
                                air={zoneD1?.air_risk ?? 0}
                                water={zoneD1?.water_risk ?? 0}
                                urban={zoneD1?.urban_risk ?? 0}
                                finalRisk={zoneD1?.final_risk_prediction ?? 0}
                            />
                        )}
                    </motion.div>

                    {/* Right: Quick Stats Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                        <div style={{
                            fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase',
                            letterSpacing: '0.12em', fontWeight: 800, marginBottom: 6,
                        }}>
                            System Metrics
                        </div>

                        {[
                            { label: 'Active Zones', value: zones.length, Icon: SvgPin, color: '#0094CC' },
                            { label: 'Composite Risk', value: avg.toFixed(1), Icon: SvgTarget, color: riskColor(avg) },
                            { label: 'Active Anomalies', value: totalAnomalies, Icon: totalAnomalies > 0 ? SvgAlert : SvgCheck, color: totalAnomalies > 0 ? 'var(--crimson)' : '#00A87A' },
                            { label: 'Model Confidence', value: `${confidence.toFixed(0)}%`, Icon: SvgBrain, color: confidence > 70 ? '#0094CC' : 'var(--risk-mid)' },
                            { label: 'Risk Status', value: riskLevel(avg), Icon: SvgBarChart, color: riskColor(avg) },
                            { label: 'Forecast Range', value: 'D+1 → D+7', Icon: SvgCalendar, color: 'var(--text-secondary)' },
                        ].map(s => (
                            <div key={s.label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 18px',
                                background: 'rgba(255,255,255,0.75)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                borderRadius: 12,
                                backdropFilter: 'blur(12px)',
                                transition: 'all 0.25s ease',
                                cursor: 'default',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateX(6px)';
                                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.75)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: s.color }}>
                                    <s.Icon />
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</span>
                                </div>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: s.color,
                                }}>
                                    {s.value}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── Row 2: Domain Cards (Air · Water · Urban) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
                    }}>
                        <div style={{
                            width: 4, height: 24, borderRadius: 2,
                            background: 'linear-gradient(180deg, #00A87A, #0094CC)',
                        }} />
                        <span style={{
                            fontSize: 15, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--text-secondary)',
                        }}>
                            Domain Intelligence Overview — {selectedZone?.replace(/_/g, ' ') || 'All Zones'}
                        </span>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: 24,
                    }}>
                        <DomainCard domain="air" predictions={predictions} residuals={airResidual} selectedZone={selectedZone} />
                        <DomainCard domain="water" predictions={predictions} residuals={waterResidual} selectedZone={selectedZone} />
                        <DomainCard domain="urban" predictions={predictions} residuals={urbanResidual} selectedZone={selectedZone} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
