import React from 'react';

export default function ProgressRing({ value = 0, label, color = 'var(--emerald)', size = 120 }) {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const fraction = Math.min(Math.max(value, 0), 100) / 100;
    const dashArray = `${circumference * fraction} ${circumference}`;

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(107,123,141,0.1)"
                        strokeWidth="6"
                    />
                    {/* Fill */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={dashArray}
                        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                    {/* Glow */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={dashArray}
                        filter="blur(6px)"
                        opacity="0.3"
                    />
                </svg>

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 24,
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                    }}>
                        {value.toFixed(0)}%
                    </div>
                </div>
            </div>
            {label && (
                <div style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginTop: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                }}>
                    {label}
                </div>
            )}
        </div>
    );
}
