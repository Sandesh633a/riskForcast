import React, { useState, useMemo } from 'react';
import TimelineSlider from './TimelineSlider';
import MorphGraph from './MorphGraph';
import { computeAccelerationRate, riskColor } from '../../lib/utils/metrics';

export default function HorizonEngine({
    predictions,
    selectedZone,
    activeDomain,
    loading,
}) {
    const [horizon, setHorizon] = useState(1);

    const accel = useMemo(
        () => computeAccelerationRate(predictions, selectedZone),
        [predictions, selectedZone]
    );

    const zoneH = useMemo(
        () => predictions.find(p => p.zone_id === selectedZone && p.horizon_days === horizon),
        [predictions, selectedZone, horizon]
    );

    const domainRisk = zoneH
        ? activeDomain === 'air' ? zoneH.air_risk
            : activeDomain === 'water' ? zoneH.water_risk
                : zoneH.urban_risk
        : 0;

    const narrative = useMemo(() => {
        if (!zoneH) return '';
        const zone = selectedZone?.replace(/_/g, ' ') ?? '';
        const direction = accel > 2 ? 'escalating' : accel < -2 ? 'improving' : 'stable';
        return `${zone} shows ${direction} risk trajectory — D+${horizon} ${activeDomain} risk at ${domainRisk.toFixed(1)} with ${accel > 0 ? '+' : ''}${accel.toFixed(1)} 7-day delta.`;
    }, [zoneH, selectedZone, accel, horizon, activeDomain, domainRisk]);

    if (loading) {
        return (
            <section id="horizon" className="section-zone section-zone--content" style={{ background: 'var(--base)' }}>
                <div className="section-inner">
                    <div className="skeleton-title" style={{ margin: '0 auto 24px' }} />
                    <div className="skeleton-chart" />
                </div>
            </section>
        );
    }

    return (
        <section
            id="horizon"
            className="section-zone section-zone--content"
            style={{
                background: `
          radial-gradient(ellipse 60% 50% at 60% 50%, rgba(0,209,255,0.03), transparent),
          var(--base)
        `,
            }}
        >
            <div className="section-inner">
                <div className="section-label">
                    <div className="section-label-tag">Horizon Engine</div>
                    <div className="section-label-title">Multi-Horizon Risk Trajectory</div>
                    <div className="section-label-desc">
                        Track risk evolution from D+1 to D+7 with predictive trajectory analysis
                    </div>
                </div>

                <TimelineSlider selected={horizon} onChange={setHorizon} />

                {/* Narrative */}
                {narrative && (
                    <div style={{
                        textAlign: 'center',
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        maxWidth: 600,
                        margin: '0 auto 32px',
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                    }}>
                        <strong style={{ color: 'var(--text-primary)', fontStyle: 'normal' }}>
                            {selectedZone?.replace(/_/g, ' ')}
                        </strong>{' '}
                        {narrative.slice(narrative.indexOf('shows'))}
                    </div>
                )}

                {/* Acceleration indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
                    <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                            D+{horizon} {activeDomain} Risk
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 24,
                            fontWeight: 700,
                            color: riskColor(domainRisk),
                        }}>
                            {domainRisk.toFixed(1)}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                            7-Day Acceleration
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 24,
                            fontWeight: 700,
                            color: accel > 0 ? 'var(--crimson)' : 'var(--emerald)',
                        }}>
                            {accel > 0 ? '+' : ''}{accel.toFixed(1)}
                        </div>
                    </div>
                </div>

                <MorphGraph predictions={predictions} selectedZone={selectedZone} activeDomain={activeDomain} />
            </div>
        </section>
    );
}
