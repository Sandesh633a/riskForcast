import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export default function ResidualBars({
    activeDomain,
    airResidual,
    waterResidual,
    urbanResidual,
    selectedZone,
}) {
    const residuals = activeDomain === 'air' ? airResidual
        : activeDomain === 'water' ? waterResidual
            : urbanResidual;

    const option = useMemo(() => {
        if (!residuals || residuals.length === 0) return {};

        const sorted = [...residuals].sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
        const zones = sorted.map(r => r.zone_id?.replace(/_/g, ' ') ?? '');
        const values = sorted.map(r => +r.residual.toFixed(3));
        const anomalies = sorted.map(r => r.anomaly_flag);

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(18,24,33,0.95)',
                borderColor: 'rgba(201,209,217,0.15)',
                textStyle: { color: '#C9D1D9', fontFamily: 'Inter', fontSize: 12 },
                formatter: (params) => {
                    const p = params[0];
                    const flag = anomalies[p.dataIndex] ? 'ANOMALY' : 'Normal';
                    return `${p.name}<br/>Residual: <b>${p.value}</b><br/>${flag}`;
                },
            },
            grid: { top: 10, left: 120, right: 30, bottom: 10 },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: 'rgba(201,209,217,0.1)' } },
                splitLine: { lineStyle: { color: 'rgba(201,209,217,0.06)' } },
                axisLabel: { color: '#6B7B8D', fontSize: 10 },
            },
            yAxis: {
                type: 'category',
                data: zones,
                inverse: true,
                axisLine: { show: false },
                axisLabel: {
                    color: '#C9D1D9',
                    fontSize: 10,
                    formatter: (v, i) => {
                        const z = sorted[i];
                        return z?.zone_id === selectedZone ? `► ${v}` : v;
                    },
                },
                axisTick: { show: false },
            },
            series: [{
                type: 'bar',
                data: values.map((v, i) => ({
                    value: v,
                    itemStyle: {
                        color: anomalies[i] ? '#FF3B3B' : 'rgba(0,200,150,0.6)',
                        borderRadius: v >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
                    },
                })),
                barWidth: 14,
                animationDuration: 500,
            }],
        };
    }, [residuals, selectedZone]);

    if (!residuals || residuals.length === 0) {
        return <div className="skeleton-chart" style={{ height: 260 }} />;
    }

    return (
        <div className="glass-card" style={{ padding: 20 }}>
            <div style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 12,
            }}>
                Residual Distribution
            </div>
            <ReactECharts
                option={option}
                style={{ height: Math.max(200, (residuals?.length || 0) * 26) }}
                notMerge={true}
            />
        </div>
    );
}
