import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export default function CorrelationMatrix({ predictions }) {
    const option = useMemo(() => {
        const d1 = predictions.filter(p => p.horizon_days === 1);
        if (d1.length < 2) return {};

        const domains = ['air_risk', 'water_risk', 'urban_risk', 'final_risk_prediction'];
        const labels = ['Air Risk', 'Water Risk', 'Urban Risk', 'Final Risk'];

        // Compute correlation matrix
        const values = domains.map(d => d1.map(p => p[d] ?? 0));
        const corr = [];

        for (let i = 0; i < domains.length; i++) {
            for (let j = 0; j < domains.length; j++) {
                const xi = values[i], xj = values[j];
                const n = xi.length;
                const mx = xi.reduce((a, b) => a + b, 0) / n;
                const my = xj.reduce((a, b) => a + b, 0) / n;
                const sxy = xi.reduce((s, v, k) => s + (v - mx) * (xj[k] - my), 0);
                const sx = Math.sqrt(xi.reduce((s, v) => s + (v - mx) ** 2, 0));
                const sy = Math.sqrt(xj.reduce((s, v) => s + (v - my) ** 2, 0));
                const r = sx && sy ? sxy / (sx * sy) : 0;
                corr.push([j, i, +r.toFixed(3)]);
            }
        }

        return {
            backgroundColor: 'transparent',
            tooltip: {
                backgroundColor: 'rgba(18,24,33,0.95)',
                borderColor: 'rgba(201,209,217,0.15)',
                textStyle: { color: '#C9D1D9', fontFamily: 'Inter', fontSize: 12 },
                formatter: (p) => `${labels[p.value[0]]} × ${labels[p.value[1]]}<br/>r = <b>${p.value[2]}</b>`,
            },
            grid: { top: 10, left: 80, right: 40, bottom: 60 },
            xAxis: {
                type: 'category',
                data: labels,
                axisLabel: { color: '#6B7B8D', fontSize: 10, rotate: 30 },
                axisLine: { lineStyle: { color: 'rgba(201,209,217,0.1)' } },
            },
            yAxis: {
                type: 'category',
                data: labels,
                axisLabel: { color: '#6B7B8D', fontSize: 10 },
                axisLine: { show: false },
            },
            visualMap: {
                min: -1,
                max: 1,
                show: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 0,
                textStyle: { color: '#6B7B8D', fontSize: 10 },
                inRange: {
                    color: ['#2F80FF', '#121821', '#FF3B3B'],
                },
            },
            series: [{
                type: 'heatmap',
                data: corr,
                label: {
                    show: true,
                    color: '#C9D1D9',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                },
                emphasis: {
                    itemStyle: { borderColor: '#C9D1D9', borderWidth: 1 },
                },
            }],
        };
    }, [predictions]);

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
                Cross-Domain Correlation Matrix
            </div>
            <ReactECharts
                option={option}
                style={{ height: 340 }}
                notMerge={true}
            />
        </div>
    );
}
