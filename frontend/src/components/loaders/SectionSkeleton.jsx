import React from 'react';

export default function SectionSkeleton({ height = 400 }) {
    return (
        <div style={{
            padding: '80px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
        }}>
            <div className="skeleton skeleton-title" style={{ width: 200 }} />
            <div className="skeleton skeleton-text" style={{ width: 300 }} />
            <div className="skeleton skeleton-chart" style={{ width: '100%', maxWidth: 900, height }} />
        </div>
    );
}
