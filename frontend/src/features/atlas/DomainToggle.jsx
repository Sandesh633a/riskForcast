import React from 'react';

export default function DomainToggle({ activeDomain, onDomainChange }) {
    const domains = [
        { key: 'air', label: 'Air', color: '#00C896' },
        { key: 'water', label: 'Water', color: '#00A3A3' },
        { key: 'urban', label: 'Urban', color: '#2F80FF' },
    ];

    return (
        <div className="domain-toggle">
            {domains.map(d => (
                <button
                    key={d.key}
                    className={`domain-btn ${activeDomain === d.key ? 'active' : ''}`}
                    onClick={() => onDomainChange(d.key)}
                >
                    {d.label}
                </button>
            ))}
        </div>
    );
}
