import React, { useMemo, useCallback } from 'react';
import { riskColor } from '../../lib/utils/metrics';

// Simplified Delhi district positions (relative x,y in 0-1 space)
const DISTRICTS = [
    { id: 'Central_Delhi', label: 'Central', x: 0.48, y: 0.48 },
    { id: 'East_Delhi', label: 'East', x: 0.68, y: 0.45 },
    { id: 'New_Delhi', label: 'New Delhi', x: 0.45, y: 0.55 },
    { id: 'North_Delhi', label: 'North', x: 0.45, y: 0.28 },
    { id: 'North_East_Delhi', label: 'North East', x: 0.65, y: 0.25 },
    { id: 'North_West_Delhi', label: 'North West', x: 0.28, y: 0.22 },
    { id: 'Shahdara', label: 'Shahdara', x: 0.72, y: 0.35 },
    { id: 'South_Delhi', label: 'South', x: 0.42, y: 0.72 },
    { id: 'South_East_Delhi', label: 'South East', x: 0.62, y: 0.65 },
    { id: 'South_West_Delhi', label: 'South West', x: 0.25, y: 0.65 },
    { id: 'West_Delhi', label: 'West', x: 0.22, y: 0.45 },
];

export default function RiskAtlas3D({
    predictions,
    activeDomain,
    selectedZone,
    onZoneClick,
    loading,
}) {
    const WIDTH = 500;
    const HEIGHT = 500;

    const zoneRisks = useMemo(() => {
        const d1 = predictions.filter(p => p.horizon_days === 1);
        const map = {};
        d1.forEach(p => {
            const riskVal = activeDomain === 'air' ? p.air_risk
                : activeDomain === 'water' ? p.water_risk
                    : p.urban_risk;
            map[p.zone_id] = { risk: riskVal, final: p.final_risk_prediction };
        });
        return map;
    }, [predictions, activeDomain]);

    const handleClick = useCallback((id) => {
        onZoneClick(id);
    }, [onZoneClick]);

    if (loading) {
        return <div className="skeleton-chart" style={{ width: WIDTH, height: HEIGHT }} />;
    }

    return (
        <div style={{ position: 'relative', width: WIDTH, height: HEIGHT }}>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT}>
                {/* Background grid */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(107,123,141,0.06)" strokeWidth="0.5" />
                    </pattern>
                    <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(0,209,255,0.06)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
                <rect width={WIDTH} height={HEIGHT} fill="url(#mapGlow)" rx="16" />
                <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" rx="16" />

                {/* Boundary polygon */}
                <polygon
                    points="130,60 250,35 370,55 410,130 420,260 390,380 320,430 200,440 100,400 70,300 65,180"
                    fill="rgba(18,24,33,0.5)"
                    stroke="rgba(201,209,217,0.1)"
                    strokeWidth="1.5"
                />

                {/* District nodes */}
                {DISTRICTS.map(d => {
                    const cx = d.x * WIDTH;
                    const cy = d.y * HEIGHT;
                    const data = zoneRisks[d.id];
                    const risk = data?.risk ?? 0;
                    const color = riskColor(risk);
                    const isSelected = selectedZone === d.id;
                    const size = 18 + (risk / 100) * 20;

                    return (
                        <g
                            key={d.id}
                            onClick={() => handleClick(d.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Glow ring for selected */}
                            {isSelected && (
                                <circle
                                    cx={cx} cy={cy} r={size + 8}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="2"
                                    opacity="0.4"
                                    className="animate-breathe"
                                />
                            )}
                            {/* Outer glow */}
                            <circle
                                cx={cx} cy={cy} r={size + 3}
                                fill={color}
                                opacity="0.1"
                            />
                            {/* Main circle */}
                            <circle
                                cx={cx} cy={cy} r={size}
                                fill={color}
                                opacity={isSelected ? 0.9 : 0.6}
                                stroke={isSelected ? '#E8ECF1' : 'transparent'}
                                strokeWidth={isSelected ? 2 : 0}
                            />
                            {/* Risk value */}
                            <text
                                x={cx} y={cy + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#E8ECF1"
                                fontSize="11"
                                fontFamily="JetBrains Mono, monospace"
                                fontWeight="700"
                            >
                                {risk.toFixed(0)}
                            </text>
                            {/* Label */}
                            <text
                                x={cx} y={cy + size + 14}
                                textAnchor="middle"
                                fill="var(--text-muted)"
                                fontSize="9"
                                fontFamily="Inter, sans-serif"
                                fontWeight="600"
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
