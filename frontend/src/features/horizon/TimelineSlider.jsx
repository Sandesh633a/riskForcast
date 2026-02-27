import React from 'react';

export default function TimelineSlider({ horizons = [1, 3, 7], selected, onChange }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            marginBottom: 48,
        }}>
            {horizons.map((h, i) => (
                <React.Fragment key={h}>
                    {i > 0 && (
                        <div style={{
                            width: 80,
                            height: 2,
                            background: selected >= h
                                ? 'linear-gradient(90deg, var(--cyan), var(--border))'
                                : 'var(--border)',
                        }} />
                    )}
                    <div
                        onClick={() => onChange(h)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '0 12px' }}
                    >
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 700,
                            fontFamily: 'var(--font-display)',
                            border: `2px solid ${selected === h ? 'var(--cyan)' : 'var(--border)'}`,
                            background: selected === h ? 'var(--elevated)' : 'var(--surface)',
                            color: selected === h ? 'var(--text-primary)' : 'var(--text-muted)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: selected === h ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: selected === h ? '0 0 20px rgba(0,209,255,0.2)' : 'none',
                        }}>
                            D+{h}
                        </div>
                        <div style={{
                            marginTop: 10,
                            fontSize: 12,
                            fontWeight: 600,
                            color: selected === h ? 'var(--text-primary)' : 'var(--text-muted)',
                            transition: 'color 0.3s',
                        }}>
                            {h === 1 ? 'Tomorrow' : h === 3 ? '3-Day' : '7-Day'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                            Forecast
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}
