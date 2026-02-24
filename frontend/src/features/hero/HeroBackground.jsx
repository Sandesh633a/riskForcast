import React from 'react';

/* ── Stylized hero background with dominant geometric patterns ── */
export default function HeroBackground() {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
        }}>
            <style>{`
                @keyframes bgSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes bgFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                @keyframes bgPulse { 0%, 100% { opacity: 0.06; } 50% { opacity: 0.12; } }
            `}</style>

            {/* Large bold grid */}
            <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}
                viewBox="0 0 1000 800" preserveAspectRatio="none"
            >
                {Array.from({ length: 25 }, (_, i) => (
                    <line key={`v${i}`}
                        x1={i * 40} y1="0" x2={i * 40} y2="800"
                        stroke="#2B6CB0" strokeWidth="0.8"
                    />
                ))}
                {Array.from({ length: 20 }, (_, i) => (
                    <line key={`h${i}`}
                        x1="0" y1={i * 40} x2="1000" y2={i * 40}
                        stroke="#2B6CB0" strokeWidth="0.8"
                    />
                ))}
                {/* Intersections dots */}
                {Array.from({ length: 6 }, (_, row) =>
                    Array.from({ length: 8 }, (_, col) => (
                        <circle key={`d${row}-${col}`}
                            cx={80 + col * 120} cy={80 + row * 120} r="2"
                            fill="#0094CC" opacity="0.3"
                        />
                    ))
                )}
            </svg>

            {/* Rotating concentric circles — top right */}
            <svg
                style={{
                    position: 'absolute', top: '5%', right: '5%', width: '22%', height: '22%',
                    animation: 'bgSpin 80s linear infinite',
                    opacity: 0.1,
                }}
                viewBox="0 0 200 200"
            >
                <circle cx="100" cy="100" r="95" fill="none" stroke="#0094CC" strokeWidth="0.6" strokeDasharray="8 4" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#00A87A" strokeWidth="0.5" strokeDasharray="5 7" />
                <circle cx="100" cy="100" r="65" fill="none" stroke="#2B6CB0" strokeWidth="0.5" strokeDasharray="10 4" />
                <circle cx="100" cy="100" r="50" fill="none" stroke="#0094CC" strokeWidth="0.4" strokeDasharray="3 6" />
                <circle cx="100" cy="100" r="35" fill="none" stroke="#00A87A" strokeWidth="0.3" />
                {/* Cross hairs */}
                <line x1="100" y1="5" x2="100" y2="195" stroke="#718096" strokeWidth="0.3" />
                <line x1="5" y1="100" x2="195" y2="100" stroke="#718096" strokeWidth="0.3" />
            </svg>

            {/* Rotating concentric circles — bottom left */}
            <svg
                style={{
                    position: 'absolute', bottom: '8%', left: '3%', width: '18%', height: '18%',
                    animation: 'bgSpin 60s linear infinite reverse',
                    opacity: 0.08,
                }}
                viewBox="0 0 200 200"
            >
                <circle cx="100" cy="100" r="90" fill="none" stroke="#00A87A" strokeWidth="0.6" strokeDasharray="6 5" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#0094CC" strokeWidth="0.5" strokeDasharray="4 8" />
                <circle cx="100" cy="100" r="50" fill="none" stroke="#2B6CB0" strokeWidth="0.4" strokeDasharray="8 4" />
            </svg>

            {/* DNA helix pattern — center to right */}
            <svg
                style={{
                    position: 'absolute', top: '15%', right: '0%', width: '20%', height: '70%',
                    opacity: 0.06, animation: 'bgFloat 6s ease-in-out infinite',
                }}
                viewBox="0 0 100 400"
            >
                {Array.from({ length: 20 }, (_, i) => {
                    const y = i * 20;
                    const x1 = 50 + Math.sin(i * 0.6) * 30;
                    const x2 = 50 - Math.sin(i * 0.6) * 30;
                    return (
                        <g key={i}>
                            <circle cx={x1} cy={y} r="3" fill="#0094CC" opacity="0.5" />
                            <circle cx={x2} cy={y} r="3" fill="#00A87A" opacity="0.5" />
                            <line x1={x1} y1={y} x2={x2} y2={y} stroke="#718096" strokeWidth="0.5" opacity="0.4" />
                        </g>
                    );
                })}
            </svg>

            {/* Pulsing diamond shapes */}
            <svg
                style={{
                    position: 'absolute', top: '45%', left: '8%', width: '12%', height: '12%',
                    animation: 'bgPulse 4s ease-in-out infinite',
                }}
                viewBox="0 0 100 100"
            >
                <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#0094CC" strokeWidth="1" />
                <polygon points="50,20 80,50 50,80 20,50" fill="none" stroke="#00A87A" strokeWidth="0.8" />
                <polygon points="50,35 65,50 50,65 35,50" fill="none" stroke="#2B6CB0" strokeWidth="0.6" />
            </svg>
        </div>
    );
}
