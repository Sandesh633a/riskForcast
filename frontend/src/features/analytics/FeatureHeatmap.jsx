import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export default function FeatureHeatmap({ explain, activeDomain }) {
    const option = useMemo(() => {
        if (!explain || explain.length === 0) return {};

        const zones = explain.map(e => e.zone_id?.replace(/_/g, ' ') ?? '');
        const contribs = explain.map(e => e.feature_contributions || e.risk_feature_contributions || {});
        const features = [...new Set(contribs.flatMap(c => Object.keys(c)))];

        const data = [];
        contribs.forEach((c, zi) => {
            features.forEach((f, fi) => {
                data.push([fi, zi, +(c[f] ?? 0).toFixed(3)]);
            });
        });

        const maxAbs = Math.max(...data.map(d => Math.abs(d[2])), 0.01);

        return {
            backgroundColor: 'transparent',
            tooltip: {
                position: 'top',
                backgroundColor: 'rgba(18,24,33,0.95)',
                borderColor: 'rgba(201,209,217,0.15)',
                textStyle: { color: '#C9D1D9', fontFamily: 'Inter', fontSize: 11 },
                formatter: (p) => `${features[p.value[0]]}<br/>${zones[p.value[1]]}: <b>${p.value[2]}</b>`,
            },
            grid: { top: 10, left: 120, right: 30, bottom: 60 },
            xAxis: {
                type: 'category',
                data: features.map(f => f.replace(/_lag\d+/g, '').replace(/_/g, ' ')),
                axisLabel: { color: '#6B7B8D', fontSize: 9, rotate: 45 },
                axisLine: { lineStyle: { color: 'rgba(201,209,217,0.1)' } },
            },
            yAxis: {
                type: 'category',
                data: zones,
                axisLabel: { color: '#6B7B8D', fontSize: 10 },
                axisLine: { show: false },
            },
            visualMap: {
                min: -maxAbs,
                max: maxAbs,
                show: false,
                inRange: {
                    color: ['#00C896', '#121821', '#FF3B3B'],
                },
            },
            series: [{
                type: 'heatmap',
                data,
                emphasis: {
                    itemStyle: { borderColor: '#C9D1D9', borderWidth: 1 },
                },
                itemStyle: { borderRadius: 3 },
            }],
        };
    }, [explain, activeDomain]);

    if (!explain || explain.length === 0) {
        return <div className="skeleton-chart" style={{ height: 260 }} />;
    }

    return (
        <ReactECharts
            option={option}
            style={{ height: 300 }}
            notMerge={true}
        />
    );
}
