import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

export default function MorphGraph({ predictions, selectedZone, activeDomain }) {
    const option = useMemo(() => {
        const zoneData = predictions
            .filter(p => p.zone_id === selectedZone)
            .sort((a, b) => a.horizon_days - b.horizon_days);

        const horizons = zoneData.map(p => `D+${p.horizon_days}`);
        const getValue = (p) => {
            if (activeDomain === 'air') return p.air_risk;
            if (activeDomain === 'water') return p.water_risk;
            return p.urban_risk;
        };

        const domainValues = zoneData.map(getValue);
        const finalValues = zoneData.map(p => p.final_risk_prediction);

        const domainLabel = activeDomain.charAt(0).toUpperCase() + activeDomain.slice(1);
        const domainColor = activeDomain === 'air' ? '#00C896' : activeDomain === 'water' ? '#00A3A3' : '#2F80FF';

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(18,24,33,0.95)',
                borderColor: 'rgba(201,209,217,0.15)',
                textStyle: { color: '#C9D1D9', fontFamily: 'Inter', fontSize: 12 },
            },
            legend: {
                data: [`${domainLabel} Risk`, 'Final Risk'],
                textStyle: { color: '#6B7B8D', fontSize: 11 },
                top: 0,
            },
            grid: {
                top: 40,
                left: 50,
                right: 30,
                bottom: 30,
            },
            xAxis: {
                type: 'category',
                data: horizons,
                axisLine: { lineStyle: { color: 'rgba(201,209,217,0.1)' } },
                axisLabel: { color: '#6B7B8D', fontWeight: 600 },
            },
            yAxis: {
                type: 'value',
                name: 'Risk Score',
                nameTextStyle: { color: '#6B7B8D', fontSize: 10 },
                axisLine: { show: false },
                splitLine: { lineStyle: { color: 'rgba(201,209,217,0.06)' } },
                axisLabel: { color: '#6B7B8D' },
            },
            series: [
                {
                    name: `${domainLabel} Risk`,
                    type: 'line',
                    data: domainValues,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { color: domainColor, width: 3 },
                    itemStyle: { color: domainColor },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: `${domainColor}30` },
                                { offset: 1, color: 'transparent' },
                            ],
                        },
                    },
                    animationDuration: 800,
                    animationEasing: 'cubicInOut',
                },
                {
                    name: 'Final Risk',
                    type: 'line',
                    data: finalValues,
                    smooth: true,
                    symbol: 'diamond',
                    symbolSize: 8,
                    lineStyle: { color: '#C9D1D9', width: 2, type: 'dashed' },
                    itemStyle: { color: '#C9D1D9' },
                    animationDuration: 800,
                    animationDelay: 200,
                },
                // Threshold marklines
                {
                    type: 'line',
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        data: [
                            { yAxis: 40, lineStyle: { color: 'rgba(240,165,0,0.3)', type: 'dashed' }, label: { show: false } },
                            { yAxis: 70, lineStyle: { color: 'rgba(255,59,59,0.3)', type: 'dashed' }, label: { show: false } },
                        ],
                    },
                },
            ],
        };
    }, [predictions, selectedZone, activeDomain]);

    return (
        <div className="glass-card" style={{ padding: 20 }}>
            <ReactECharts
                option={option}
                style={{ height: 320 }}
                notMerge={true}
                lazyUpdate={true}
            />
        </div>
    );
}
