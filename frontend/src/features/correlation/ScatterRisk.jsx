import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export default function ScatterRisk({ predictions, activeDomain }) {
    const option = useMemo(() => {
        const d1 = predictions.filter(p => p.horizon_days === 1);
        if (d1.length === 0) return {};

        const domainKey = activeDomain === 'air' ? 'air_risk'
            : activeDomain === 'water' ? 'water_risk'
                : 'urban_risk';

        const domainLabel = activeDomain.charAt(0).toUpperCase() + activeDomain.slice(1);
        const domainColor = activeDomain === 'air' ? '#00C896'
            : activeDomain === 'water' ? '#00A3A3' : '#2F80FF';

        const data = d1.map(p => [
            p[domainKey],
            p.final_risk_prediction,
            p.zone_id?.replace(/_/g, ' '),
        ]);

        return {
            backgroundColor: 'transparent',
            tooltip: {
                backgroundColor: 'rgba(18,24,33,0.95)',
                borderColor: 'rgba(201,209,217,0.15)',
                textStyle: { color: '#C9D1D9', fontFamily: 'Inter', fontSize: 12 },
                formatter: (p) => `${p.value[2]}<br/>${domainLabel}: ${p.value[0]?.toFixed(1)}<br/>Final: ${p.value[1]?.toFixed(1)}`,
            },
            grid: { top: 20, left: 55, right: 20, bottom: 45 },
            xAxis: {
                type: 'value',
                name: `${domainLabel} Risk`,
                nameTextStyle: { color: '#6B7B8D', fontSize: 10 },
                axisLine: { lineStyle: { color: 'rgba(201,209,217,0.1)' } },
                splitLine: { lineStyle: { color: 'rgba(201,209,217,0.06)' } },
                axisLabel: { color: '#6B7B8D' },
            },
            yAxis: {
                type: 'value',
                name: 'Final Risk',
                nameTextStyle: { color: '#6B7B8D', fontSize: 10 },
                axisLine: { show: false },
                splitLine: { lineStyle: { color: 'rgba(201,209,217,0.06)' } },
                axisLabel: { color: '#6B7B8D' },
            },
            series: [{
                type: 'scatter',
                data,
                symbolSize: 14,
                itemStyle: {
                    color: domainColor,
                    borderColor: 'rgba(232,236,241,0.3)',
                    borderWidth: 1,
                },
                emphasis: {
                    scale: 1.5,
                    itemStyle: { borderColor: '#E8ECF1', borderWidth: 2 },
                },
                animationDuration: 600,
            }],
        };
    }, [predictions, activeDomain]);

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
                {activeDomain.charAt(0).toUpperCase() + activeDomain.slice(1)} Risk vs Final Risk
            </div>
            <ReactECharts
                option={option}
                style={{ height: 340 }}
                notMerge={true}
            />
        </div>
    );
}
