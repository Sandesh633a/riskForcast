import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProgressRing from './ProgressRing';
import { fetchRetrainStatus, triggerRetrain } from '../../lib/api';
import { computeConfidenceScore } from '../../lib/utils/metrics';

export default function ModelCore({ airResidual, waterResidual, urbanResidual }) {
    const [status, setStatus] = useState(null);
    const [retraining, setRetraining] = useState(false);
    const [logs, setLogs] = useState([]);

    const confidence = useMemo(() => {
        const all = [...(airResidual || []), ...(waterResidual || []), ...(urbanResidual || [])];
        return computeConfidenceScore(all);
    }, [airResidual, waterResidual, urbanResidual]);

    const airConf = useMemo(() => computeConfidenceScore(airResidual || []), [airResidual]);
    const waterConf = useMemo(() => computeConfidenceScore(waterResidual || []), [waterResidual]);
    const urbanConf = useMemo(() => computeConfidenceScore(urbanResidual || []), [urbanResidual]);

    const loadStatus = useCallback(async () => {
        try {
            const data = await fetchRetrainStatus();
            setStatus(data);
        } catch { }
    }, []);

    useEffect(() => {
        loadStatus();
        const t = setInterval(loadStatus, 30000);
        return () => clearInterval(t);
    }, [loadStatus]);

    const handleRetrain = async () => {
        setRetraining(true);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Retrain triggered...`]);
        try {
            const res = await triggerRetrain();
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${res.message || 'Retrain started'}`]);
            setTimeout(loadStatus, 3000);
        } catch (e) {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${e.message}`]);
        }
        setRetraining(false);
    };

    return (
        <section
            id="modelcore"
            className="section-zone section-zone--content"
            style={{
                background: `
          radial-gradient(ellipse 50% 40% at 70% 50%, rgba(47,128,255,0.03), transparent),
          var(--base)
        `,
            }}
        >
            <div className="section-inner">
                <div className="section-label">
                    <div className="section-label-tag">Model Core</div>
                    <div className="section-label-title">Model Intelligence & System Status</div>
                    <div className="section-label-desc">
                        Retrain controls · Confidence metrics · System diagnostics
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    {/* Left: Confidence Rings */}
                    <div className="glass-card">
                        <div style={{
                            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 24,
                        }}>
                            Model Confidence
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <ProgressRing value={confidence} label="Overall" color="var(--cyan)" />
                            <ProgressRing value={airConf} label="Air Model" color="var(--emerald)" />
                            <ProgressRing value={waterConf} label="Water Model" color="var(--teal)" />
                            <ProgressRing value={urbanConf} label="Urban Model" color="var(--electric)" />
                        </div>
                    </div>

                    {/* Right: Status + Retrain */}
                    <div className="glass-card">
                        <div style={{
                            fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 20,
                        }}>
                            System Status
                        </div>

                        {/* Status grid */}
                        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                            {[
                                { label: 'Training Status', value: status?.training_status ?? 'unknown', color: status?.training_status === 'idle' ? 'var(--emerald)' : 'var(--risk-mid)' },
                                { label: 'Last Success', value: status?.last_success ?? '—', color: 'var(--text-secondary)' },
                                { label: 'Last Run', value: status?.completed_at ?? '—', color: 'var(--text-secondary)' },
                                { label: 'Error', value: status?.error ?? 'None', color: status?.error ? 'var(--crimson)' : 'var(--emerald)' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: s.color }}>
                                        {s.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Retrain button */}
                        <button
                            className={`btn ${retraining ? '' : 'btn-primary'}`}
                            onClick={handleRetrain}
                            disabled={retraining}
                            style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}
                        >
                            {retraining ? '⏳ Retraining...' : '🔄 Trigger Retrain'}
                        </button>

                        {/* Log console */}
                        {logs.length > 0 && (
                            <div style={{
                                background: 'rgba(11,15,20,0.7)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: 12,
                                maxHeight: 120,
                                overflowY: 'auto',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 10,
                                color: 'var(--text-muted)',
                                lineHeight: 1.8,
                            }}>
                                {logs.map((l, i) => <div key={i}>{l}</div>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
