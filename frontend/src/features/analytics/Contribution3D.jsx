import React from 'react';
import ShapLab from './ShapLab';
import FeatureHeatmap from './FeatureHeatmap';

export default function AnalyticsLab({
    activeDomain,
    selectedZone,
    airExplain,
    waterExplain,
    urbanExplain,
    loading,
}) {
    const explain = activeDomain === 'air' ? airExplain
        : activeDomain === 'water' ? waterExplain
            : urbanExplain;

    return (
        <section
            id="analytics"
            className="section-zone section-zone--content"
            style={{
                background: `
          radial-gradient(ellipse 50% 40% at 30% 60%, rgba(0,200,150,0.03), transparent),
          var(--base)
        `,
            }}
        >
            <div className="section-inner">
                <div className="section-label">
                    <div className="section-label-tag">🧪 Analytics Lab</div>
                    <div className="section-label-title">AI Explainability & Feature Engineering</div>
                    <div className="section-label-desc">
                        SHAP-based feature contributions · Understand what drives risk predictions
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <ShapLab
                        activeDomain={activeDomain}
                        selectedZone={selectedZone}
                        airExplain={airExplain}
                        waterExplain={waterExplain}
                        urbanExplain={urbanExplain}
                        loading={loading}
                    />
                    <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--text-muted)',
                            marginBottom: 16,
                        }}>
                            Feature Heatmap — All Zones
                        </div>
                        <FeatureHeatmap explain={explain} activeDomain={activeDomain} />
                    </div>
                </div>
            </div>
        </section>
    );
}
