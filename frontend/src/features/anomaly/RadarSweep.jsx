import React, { useMemo, useCallback } from 'react';
import { riskColor } from '../../lib/utils/metrics';

export default function RadarSweep({
    activeDomain,
    airResidual,
    waterResidual,
    urbanResidual,
    selectedZone,
    onZoneClick,
    loading,
}) {
    const residuals = activeDomain === 'air' ? airResidual
        : activeDomain === 'water' ? waterResidual
            : urbanResidual;

    const SIZE = 380;
    const CENTER = SIZE / 2;
    const MAX_R = SIZE / 2 - 30;

    const zones = useMemo(() => {
        if (!residuals || residuals.length === 0) return [];
        const maxRes = Math.max(...residuals.map(r => Math.abs(r.residual)), 1);

        return residuals.map((r, i) => {
            const angle = (i / residuals.length) * Math.PI * 2 - Math.PI / 2;
            const dist = (Math.abs(r.residual) / maxRes) * MAX_R * 0.8;
            return {
                ...r,
                cx: CENTER + Math.cos(angle) * dist,
                cy: CENTER + Math.sin(angle) * dist,
                angle,
            };
        });
    }, [residuals]);

    const handleClick = useCallback((id) => {
        onZoneClick(id);
    }, [onZoneClick]);

    if (loading) {
        return <div className="skeleton" style={{ width: SIZE, height: SIZE, borderRadius: '50%', margin: '0 auto' }} />;
    }

    return (
        <div style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto' }}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
                <defs>
                    <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(0,209,255,0)" />
                        <stop offset="100%" stopColor="rgba(0,209,255,0.15)" />
                    </linearGradient>
                </defs>

                {/* Concentric rings */}
                {[0.25, 0.5, 0.75, 1].map(frac => (
                    <circle
                        key={frac}
                        cx={CENTER}
                        cy={CENTER}
                        r={MAX_R * frac}
                        fill="none"
                        stroke="rgba(201,209,217,0.06)"
                        strokeWidth="0.5"
                    />
                ))}

                {/* Cross lines */}
                {[0, 45, 90, 135].map(deg => (
                    <line
                        key={deg}
                        x1={CENTER + Math.cos(deg * Math.PI / 180) * MAX_R}
                        y1={CENTER + Math.sin(deg * Math.PI / 180) * MAX_R}
                        x2={CENTER - Math.cos(deg * Math.PI / 180) * MAX_R}
                        y2={CENTER - Math.sin(deg * Math.PI / 180) * MAX_R}
                        stroke="rgba(201,209,217,0.04)"
                        strokeWidth="0.5"
                    />
                ))}

                {/* Sweep */}
                <g className="animate-radar-sweep" style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}>
                    <path
                        d={`M ${CENTER} ${CENTER} L ${CENTER + MAX_R} ${CENTER} A ${MAX_R} ${MAX_R} 0 0 1 ${CENTER + MAX_R * Math.cos(Math.PI / 6)} ${CENTER + MAX_R * Math.sin(Math.PI / 6)} Z`}
                        fill="url(#sweepGrad)"
                    />
                </g>

                {/* Zone blips */}
                {zones.map(z => {
                    const anomalyColor = z.anomaly_flag ? 'var(--crimson)' : 'var(--emerald)';
                    const isSelected = selectedZone === z.zone_id;

                    return (
                        <g
                            key={z.zone_id}
                            onClick={() => handleClick(z.zone_id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Anomaly ripple */}
                            {z.anomaly_flag === 1 && (
                                <>
                                    <circle cx={z.cx} cy={z.cy} r="8" fill="none" stroke="var(--crimson)" strokeWidth="1" opacity="0.3">
                                        <animate attributeName="r" from="8" to="24" dur="2s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                </>
                            )}
                            {/* Selection ring */}
                            {isSelected && (
                                <circle cx={z.cx} cy={z.cy} r="14" fill="none" stroke="var(--cyan)" strokeWidth="2" opacity="0.6" />
                            )}
                            {/* Blip */}
                            <circle
                                cx={z.cx}
                                cy={z.cy}
                                r={z.anomaly_flag ? 7 : 5}
                                fill={anomalyColor}
                                opacity={isSelected ? 1 : 0.75}
                                className={z.anomaly_flag ? 'animate-anomaly' : ''}
                            />
                            {/* Label */}
                            <text
                                x={z.cx}
                                y={z.cy - 12}
                                textAnchor="middle"
                                fill="var(--text-muted)"
                                fontSize="8"
                                fontFamily="Inter, sans-serif"
                                fontWeight="600"
                            >
                                {z.zone_id?.replace(/_/g, ' ').slice(0, 12)}
                            </text>
                        </g>
                    );
                })}

                {/* Center dot */}
                <circle cx={CENTER} cy={CENTER} r="3" fill="var(--cyan)" opacity="0.8" />
            </svg>
        </div>
    );
}
