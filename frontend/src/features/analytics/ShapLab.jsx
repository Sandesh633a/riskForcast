import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export default function ShapLab({
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

    const zoneData = useMemo(() => {
        if (!explain) return null;
        return explain.find(e => e.zone_id === selectedZone);
    }, [explain, selectedZone]);

    const option = useMemo(() => {
        if (!zoneData) return {};
        const contribs = zoneData.feature_contributions || zoneData.risk_feature_contributions || {};
        const entries = Object.entries(contribs)
            .map(([k, v]) => ({
                name: k.replace(/_lag\d+/g, '').replace(/_/g, ' '),
                value: +v.toFixed(4),
            }))
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

        const names = entries.map(e => e.name);
        const values = entries.map(e => e.value);

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(18,24,33,0.95)',
                borderColor: 'rgba(201,209,217,0.15)',
                textStyle: { color: '#C9D1D9', fontFamily: 'Inter', fontSize: 12 },
            },
            grid: { top: 10, left: 140, right: 40, bottom: 10 },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: 'rgba(201,209,217,0.1)' } },
                splitLine: { lineStyle: { color: 'rgba(201,209,217,0.06)' } },
                axisLabel: { color: '#6B7B8D', fontSize: 10 },
            },
            yAxis: {
                type: 'category',
                data: names,
                inverse: true,
                axisLine: { show: false },
                axisLabel: { color: '#C9D1D9', fontSize: 11, fontWeight: 500 },
                axisTick: { show: false },
            },
            series: [{
                type: 'bar',
                data: values.map(v => ({
                    value: v,
                    itemStyle: {
                        color: v >= 0 ? '#FF3B3B' : '#00C896',
                        borderRadius: v >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
                    },
                })),
                barWidth: 16,
                animationDuration: 600,
                animationEasing: 'cubicOut',
            }],
        };
    }, [zoneData]);

    if (loading || !zoneData) {
        return (
            <div className="glass-card">
                <div className="skeleton-chart" style={{ height: 280 }} />
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ padding: 20 }}>
            <div style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 16,
            }}>
                Feature Contributions — {selectedZone?.replace(/_/g, ' ')}
            </div>
            <ReactECharts
                option={option}
                style={{ height: Math.max(200, Object.keys(zoneData.feature_contributions || zoneData.risk_feature_contributions || {}).length * 28) }}
                notMerge={true}
            />
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
                <span style={{ color: '#FF3B3B' }}>■</span> Risk Increasing &nbsp;&nbsp;
                <span style={{ color: '#00C896' }}>■</span> Risk Decreasing
            </div>
        </div>
    );
}
