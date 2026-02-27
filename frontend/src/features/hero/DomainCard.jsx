import React, { useMemo, useState, useRef, useCallback } from 'react';
import { riskColor, riskLevel } from '../../lib/utils/metrics';

/* ── SVG Icons for domain cards ── */
const DomainIcons = {
    air: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
    ),
    water: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
    ),
    urban: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="7" height="16" rx="1" /><rect x="9" y="2" width="7" height="20" rx="1" />
            <rect x="17" y="9" width="6" height="13" rx="1" /><line x1="4" y1="10" x2="5" y2="10" />
            <line x1="4" y1="14" x2="5" y2="14" /><line x1="12" y1="6" x2="13" y2="6" />
            <line x1="12" y1="10" x2="13" y2="10" /><line x1="12" y1="14" x2="13" y2="14" />
            <line x1="20" y1="13" x2="21" y2="13" /><line x1="20" y1="17" x2="21" y2="17" />
        </svg>
    ),
};

const DOMAIN_CONFIG = {
    air: {
        title: 'Air Quality Index',
        label: 'AQI',
        color: '#00A87A',
        colorDim: 'rgba(0,168,122,0.08)',
        colorBorder: 'rgba(0,168,122,0.18)',
        gradient: 'linear-gradient(135deg, rgba(0,168,122,0.05) 0%, rgba(255,255,255,0.9) 100%)',
        desc: 'PM2.5, PM10, NO2, SO2, O3 composite prediction',
        riskKey: 'air_risk',
    },
    water: {
        title: 'Water Quality Index',
        label: 'WQI',
        color: '#008B8B',
        colorDim: 'rgba(0,139,139,0.08)',
        colorBorder: 'rgba(0,139,139,0.18)',
        gradient: 'linear-gradient(135deg, rgba(0,139,139,0.05) 0%, rgba(255,255,255,0.9) 100%)',
        desc: 'pH, TDS, Turbidity, Dissolved Oxygen analysis',
        riskKey: 'water_risk',
    },
    urban: {
        title: 'Urban Stress Index',
        label: 'USI',
        color: '#2B6CB0',
        colorDim: 'rgba(43,108,176,0.08)',
        colorBorder: 'rgba(43,108,176,0.18)',
        gradient: 'linear-gradient(135deg, rgba(43,108,176,0.05) 0%, rgba(255,255,255,0.9) 100%)',
        desc: 'Traffic density, Noise pollution, Infrastructure load',
        riskKey: 'urban_risk',
    },
};

export default function DomainCard({ domain, predictions, residuals, selectedZone }) {
    const cfg = DOMAIN_CONFIG[domain];
    const [tooltip, setTooltip] = useState(null);
    const svgRef = useRef(null);

    const zoneD1 = useMemo(() =>
        predictions.find(p => p.zone_id === selectedZone && p.horizon_days === 1),
        [predictions, selectedZone]
    );
    const zoneD3 = useMemo(() =>
        predictions.find(p => p.zone_id === selectedZone && p.horizon_days === 3),
        [predictions, selectedZone]
    );
    const zoneD7 = useMemo(() =>
        predictions.find(p => p.zone_id === selectedZone && p.horizon_days === 7),
        [predictions, selectedZone]
    );

    const riskVal = zoneD1?.[cfg.riskKey] ?? 0;
    const d3Risk = zoneD3?.[cfg.riskKey] ?? 0;
    const d7Risk = zoneD7?.[cfg.riskKey] ?? 0;
    const delta = d7Risk - riskVal;
    const anomalyCount = residuals?.filter(r => r.anomaly_flag === 1).length ?? 0;
    const totalZones = residuals?.length ?? 0;

    // Sparkline
    const sparkVals = [riskVal, d3Risk, d7Risk];
    const sparkLabels = ['D+1', 'D+3', 'D+7'];
    const sparkMax = Math.max(...sparkVals, 1);
    const sparkMin = Math.min(...sparkVals, 0);
    const sparkRange = sparkMax - sparkMin || 1;

    const sparkPoints = sparkVals.map((v, i) => ({
        x: 15 + i * 85,
        y: 34 - ((v - sparkMin) / sparkRange) * 28,
        val: v,
        label: sparkLabels[i],
    }));

    const handleSparkHover = useCallback((e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const relX = ((e.clientX - rect.left) / rect.width) * 200;
        let nearest = sparkPoints[0];
        let minDist = Infinity;
        sparkPoints.forEach(p => {
            const dist = Math.abs(p.x - relX);
            if (dist < minDist) { minDist = dist; nearest = p; }
        });
        if (minDist < 40) {
            setTooltip({ ...nearest, clientX: e.clientX - rect.left, clientY: e.clientY - rect.top });
        } else {
            setTooltip(null);
        }
    }, [sparkPoints]);

    return (
        <div style={{
            flex: 1,
            minWidth: 300,
            background: cfg.gradient,
            border: `1.5px solid ${cfg.colorBorder}`,
            borderRadius: 18,
            padding: '28px 24px 24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = cfg.color;
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${cfg.colorDim}`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = cfg.colorBorder;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            }}
        >
            {/* Decorative corner SVG */}
            <svg style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 90, opacity: 0.06 }} viewBox="0 0 90 90">
                <path d="M 90 0 L 90 90 L 0 90" fill="none" stroke={cfg.color} strokeWidth="1" />
                <circle cx="90" cy="0" r="45" fill="none" stroke={cfg.color} strokeWidth="0.5" strokeDasharray="4 4" />
            </svg>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: cfg.colorDim,
                    border: `1.5px solid ${cfg.colorBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.color,
                }}>
                    {DomainIcons[domain]}
                </div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {cfg.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.02em', marginTop: 2 }}>
                        {cfg.desc}
                    </div>
                </div>
            </div>

            {/* Primary Risk Score */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 18 }}>
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 48,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                }}>
                    {riskVal.toFixed(1)}
                </div>
                <div style={{ paddingBottom: 6 }}>
                    <div style={{
                        fontSize: 13, fontWeight: 700, color: riskColor(riskVal),
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                        {riskLevel(riskVal)}
                    </div>
                    <div style={{
                        fontSize: 12,
                        color: delta > 0 ? 'var(--crimson)' : delta < 0 ? '#00A87A' : 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: 2,
                    }}>
                        {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {delta > 0 ? '+' : ''}{delta.toFixed(1)} 7d
                    </div>
                </div>
            </div>

            {/* Risk progress bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    height: 6, borderRadius: 3,
                    background: 'rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${Math.min(riskVal, 100)}%`,
                        background: `linear-gradient(90deg, ${cfg.color}, ${riskColor(riskVal)})`,
                        boxShadow: `0 0 10px ${cfg.colorDim}`,
                        transition: 'width 0.8s ease',
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
                    <span>0</span><span>RISK SCALE</span><span>100</span>
                </div>
            </div>

            {/* Interactive Horizon Sparkline */}
            <div style={{ marginBottom: 18, position: 'relative' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
                    Horizon Trend
                </div>
                <svg
                    ref={svgRef}
                    width="100%" height="56" viewBox="0 0 200 56" preserveAspectRatio="none"
                    onMouseMove={handleSparkHover}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: 'crosshair' }}
                >
                    <defs>
                        <linearGradient id={`spark-${domain}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={cfg.color} stopOpacity="0.18" />
                            <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
                        </linearGradient>
                        <filter id={`glow-${domain}`}>
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* Grid lines */}
                    {[12, 22, 32, 42].map(y => (
                        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
                    ))}

                    {/* Area fill */}
                    <path
                        d={`M ${sparkPoints[0].x} ${sparkPoints[0].y} L ${sparkPoints[1].x} ${sparkPoints[1].y} L ${sparkPoints[2].x} ${sparkPoints[2].y} L ${sparkPoints[2].x} 52 L ${sparkPoints[0].x} 52 Z`}
                        fill={`url(#spark-${domain})`}
                    >
                        <animate attributeName="opacity" from="0" to="1" dur="1s" fill="freeze" />
                    </path>

                    {/* Line with glow */}
                    <polyline
                        points={sparkPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none" stroke={cfg.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        filter={`url(#glow-${domain})`}
                    />

                    {/* Dots */}
                    {sparkPoints.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r="6" fill={cfg.color} opacity="0.12" />
                            <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={cfg.color} strokeWidth="2" />
                        </g>
                    ))}

                    {/* Axis labels */}
                    {sparkPoints.map((p, i) => (
                        <text key={i} x={p.x} y={54} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="Inter" fontWeight="500">{p.label}</text>
                    ))}
                </svg>

                {/* Tooltip */}
                {tooltip && (
                    <div style={{
                        position: 'absolute',
                        left: tooltip.clientX - 30,
                        top: -8,
                        background: 'white',
                        border: `1.5px solid ${cfg.colorBorder}`,
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 13,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: cfg.color,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                    }}>
                        {tooltip.label}: {tooltip.val.toFixed(1)}
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                <div style={statBoxStyle}>
                    <div style={statLabelStyle}>Zones</div>
                    <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700, color: cfg.color }}>{totalZones}</div>
                </div>
                <div style={statBoxStyle}>
                    <div style={statLabelStyle}>Anomalies</div>
                    <div style={{
                        fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        color: anomalyCount > 0 ? 'var(--crimson)' : '#00A87A',
                    }}>
                        {anomalyCount > 0 ? (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> {anomalyCount}</>
                        ) : (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> 0</>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizon forecast pills */}
            <div style={{ display: 'flex', gap: 8 }}>
                {[
                    { label: 'D+1', val: riskVal },
                    { label: 'D+3', val: d3Risk },
                    { label: 'D+7', val: d7Risk },
                ].map(h => (
                    <div key={h.label} style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '10px 6px',
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: 10,
                        border: '1px solid rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s ease',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h.label}</div>
                        <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                            {h.val.toFixed(1)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const statBoxStyle = {
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.05)',
    textAlign: 'center',
};

const statLabelStyle = {
    fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4,
};
