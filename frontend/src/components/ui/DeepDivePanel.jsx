import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { riskColor, riskLevel, computeVolatilityIndex, computeAccelerationRate, computeStabilityScore, computeDomainDominance } from '../../lib/utils/metrics';

export default function DeepDivePanel({ open, onClose, zoneId, predictions, airResidual, waterResidual, urbanResidual }) {
    if (!zoneId) return null;

    const d1 = predictions?.find(p => p.zone_id === zoneId && p.horizon_days === 1);
    const d3 = predictions?.find(p => p.zone_id === zoneId && p.horizon_days === 3);
    const d7 = predictions?.find(p => p.zone_id === zoneId && p.horizon_days === 7);

    const vol = computeVolatilityIndex(predictions || [], zoneId);
    const accel = computeAccelerationRate(predictions || [], zoneId);
    const stability = computeStabilityScore(predictions || [], zoneId);
    const dominance = computeDomainDominance(predictions || [], zoneId);

    const airAnomaly = airResidual?.find(r => r.zone_id === zoneId);
    const waterAnomaly = waterResidual?.find(r => r.zone_id === zoneId);
    const urbanAnomaly = urbanResidual?.find(r => r.zone_id === zoneId);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="deep-dive-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="deep-dive-panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 10, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>
                                    Deep Dive — Zone Intelligence
                                </div>
                                <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                                    {zoneId?.replace(/_/g, ' ')}
                                </div>
                            </div>
                            <button className="btn" onClick={onClose} style={{ padding: '6px 12px' }}>✕</button>
                        </div>

                        {/* Final risk */}
                        {d1 && (
                            <div className="glass-card" style={{ marginBottom: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: riskColor(d1.final_risk_prediction) }}>
                                    {d1.final_risk_prediction.toFixed(1)}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {riskLevel(d1.final_risk_prediction)} Risk — D+1 Forecast
                                </div>
                            </div>
                        )}

                        {/* Domain breakdown */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                Domain Breakdown
                            </div>
                            {d1 && [
                                { label: 'Air', val: d1.air_risk, color: '#00C896' },
                                { label: 'Water', val: d1.water_risk, color: '#00A3A3' },
                                { label: 'Urban', val: d1.urban_risk, color: '#2F80FF' },
                            ].map(d => (
                                <div key={d.label} style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.label}</span>
                                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: d.color }}>
                                            {d.val?.toFixed(1) ?? '—'}
                                        </span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${Math.min(d.val ?? 0, 100)}%`, background: d.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Derived Metrics */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                Derived Intelligence
                            </div>
                            {[
                                { label: 'Volatility Index', value: vol.toFixed(2), color: vol > 5 ? 'var(--crimson)' : 'var(--emerald)' },
                                { label: '7-Day Acceleration', value: `${accel > 0 ? '+' : ''}${accel.toFixed(2)}`, color: accel > 0 ? 'var(--crimson)' : 'var(--emerald)' },
                                { label: 'Stability Score', value: `${stability.toFixed(0)}%`, color: stability > 70 ? 'var(--emerald)' : 'var(--risk-mid)' },
                                { label: 'Domain Dominance', value: dominance, color: 'var(--cyan)' },
                            ].map(m => (
                                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</span>
                                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: m.color }}>{m.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Multi-horizon */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                Horizon Forecast
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                {[d1, d3, d7].map((d, i) => d && (
                                    <div key={i} className="glass-card" style={{ padding: 10, textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>D+{d.horizon_days}</div>
                                        <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, color: riskColor(d.final_risk_prediction) }}>
                                            {d.final_risk_prediction.toFixed(1)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Anomaly status */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                Anomaly Status
                            </div>
                            {[
                                { label: 'Air', data: airAnomaly },
                                { label: 'Water', data: waterAnomaly },
                                { label: 'Urban', data: urbanAnomaly },
                            ].map(a => (
                                <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.label}</span>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: a.data?.anomaly_flag ? 'var(--crimson)' : 'var(--emerald)',
                                    }}>
                                        {a.data?.anomaly_flag ? 'Anomaly' : 'Normal'}
                                        {a.data && ` (res: ${a.data.residual?.toFixed(2)})`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
