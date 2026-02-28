import { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { LuOctagonAlert, LuShieldAlert, LuCircleCheck, LuArrowRight, LuActivity, LuInfo, LuRefreshCw, LuWind, LuDroplets, LuBuilding2 } from 'react-icons/lu';
import { fetchAlerts, fetchInsightFeed } from '../services/api';

function Tooltip({ text }) {
    return (
        <span className="relative group cursor-help ml-1 inline-flex">
            <LuInfo size={13} className="text-[#5e6470] group-hover:text-[#a0a5b0] transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-[#1a1c23] border border-[#3a3f4a] rounded-lg text-[11px] text-[#a0a5b0] leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                {text}
            </span>
        </span>
    );
}

const CAT_COLORS = { Air: '#5b8fb9', Water: '#3b9b8f', Urban: '#b07d4f' };
const CAT_ICONS = { Air: LuWind, Water: LuDroplets, Urban: LuBuilding2 };
const CAT_EMOJIS = { Air: '🌫️', Water: '💧', Urban: '🏙️' };

function getRiskColor(score) {
    if (score > 75) return '#803030';
    if (score > 50) return '#8c7322';
    return '#2e6041';
}

function getActionFromDominant(dominant, score) {
    const actions = {
        Air: score > 80 ? 'Deploy air filtration units. Issue health advisory.' : 'Monitor PM2.5/PM10 levels. Restrict industrial emissions.',
        Water: score > 80 ? 'Test water supply immediately. Activate backup reservoir.' : 'Inspect drainage systems. Check water quality sensors.',
        Urban: score > 80 ? 'Launch ground inspection. Halt unauthorized construction.' : 'Review compliance violations. Increase patrol frequency.',
    };
    return actions[dominant] || 'Immediate inspection required';
}

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const intervalRef = useRef(null);

    const loadData = async () => {
        try {
            const [al, ins] = await Promise.all([fetchAlerts(), fetchInsightFeed()]);
            setAlerts(al);
            setInsights(ins);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(loadData, 30000);
        }
        return () => clearInterval(intervalRef.current);
    }, [autoRefresh]);

    const critical = alerts.filter(a => a.risk_level === 'CRITICAL');
    const high = alerts.filter(a => a.risk_level === 'HIGH');

    // Compute averages for Air/Water/Urban across alerts
    const avgAir = alerts.length > 0 ? alerts.reduce((s, a) => s + (a.predicted_air || 0), 0) / alerts.length : 0;
    const avgWater = alerts.length > 0 ? alerts.reduce((s, a) => s + (a.predicted_water || 0), 0) / alerts.length : 0;
    const avgUrban = alerts.length > 0 ? alerts.reduce((s, a) => s + (a.predicted_urban || 0), 0) / alerts.length : 0;

    // Bar chart data for category distribution
    const catBarData = [
        { category: 'Air', value: parseFloat(avgAir.toFixed(1)), fill: CAT_COLORS.Air },
        { category: 'Water', value: parseFloat(avgWater.toFixed(1)), fill: CAT_COLORS.Water },
        { category: 'Urban', value: parseFloat(avgUrban.toFixed(1)), fill: CAT_COLORS.Urban },
    ];

    if (loading) return <div className="flex items-center justify-center h-64 text-[#5e6470]">Loading alerts…</div>;

    return (
        <div className="flex flex-col gap-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-[#e2e4e9] tracking-tight flex items-center gap-2">
                        Alerts Command Center
                        <Tooltip text="Shows zones where the AI detected dangerously high risk. Now includes Air, Water, and Urban breakdown per alert with dominant risk category identification." />
                    </h2>
                    <p className="text-sm text-[#9095a0]">{alerts.length} active alerts • Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</p>
                </div>
                <button onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${autoRefresh ? 'bg-[#2e6041]/10 border-[#2e6041]/20 text-[#2e6041]' : 'bg-[#1e2128] border-[#3a3f4a] text-[#5e6470]'}`}>
                    <LuRefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} style={autoRefresh ? { animationDuration: '3s' } : {}} />
                    {autoRefresh ? '30s Auto' : 'Paused'}
                </button>
            </div>

            {/* Stats Row — Alert Counts + Category Averages */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="panel-bg panel-border rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5"><LuOctagonAlert size={60} /></div>
                    <span className="text-[#a0a5b0] text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
                        Critical
                        <Tooltip text="Zones with predicted risk above 85. Require immediate action." />
                    </span>
                    <span className="text-3xl font-bold text-[#803030]">{critical.length}</span>
                </div>
                <div className="panel-bg panel-border rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5"><LuShieldAlert size={60} /></div>
                    <span className="text-[#a0a5b0] text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
                        High
                        <Tooltip text="Zones with risk 75–85 or large prediction errors." />
                    </span>
                    <span className="text-3xl font-bold text-[#8c7322]">{high.length}</span>
                </div>

                {/* Category Average Cards */}
                {[
                    { label: 'Avg Air Risk', value: avgAir, color: CAT_COLORS.Air, icon: LuWind, tip: 'Average air quality risk across all flagged zones.' },
                    { label: 'Avg Water Risk', value: avgWater, color: CAT_COLORS.Water, icon: LuDroplets, tip: 'Average water risk across all flagged zones.' },
                    { label: 'Avg Urban Risk', value: avgUrban, color: CAT_COLORS.Urban, icon: LuBuilding2, tip: 'Average urban compliance risk across all flagged zones.' },
                ].map(c => (
                    <div key={c.label} className="panel-bg panel-border rounded-xl p-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center" style={{ color: c.color }}>
                            <c.icon size={11} className="mr-1" /> {c.label}
                            <Tooltip text={c.tip} />
                        </span>
                        <span className="text-2xl font-bold font-mono" style={{ color: c.color }}>{c.value.toFixed(1)}</span>
                        <div className="w-full h-1.5 bg-[#1e2128] rounded-full overflow-hidden mt-2">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(c.value, 100)}%`, backgroundColor: c.color, opacity: 0.7 }}></div>
                        </div>
                    </div>
                ))}

                {/* Category Distribution Mini Chart */}
                <div className="panel-bg panel-border rounded-xl p-4">
                    <span className="text-[#a0a5b0] text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center">
                        Risk Profile
                        <Tooltip text="Visual comparison of average Air, Water, and Urban risk across all alerts." />
                    </span>
                    <ResponsiveContainer width="100%" height={70}>
                        <BarChart data={catBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                                {catBarData.map((entry, i) => (
                                    <Bar key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                            <XAxis dataKey="category" fontSize={9} tickLine={false} axisLine={false} stroke="#5e6470" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Insight Feed */}
            {insights.length > 0 && (
                <div className="panel-bg panel-border rounded-xl p-5">
                    <span className="text-[#a0a5b0] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center">
                        AI Insight Feed
                        <Tooltip text="Smart observations the AI generates when it detects critical patterns or anomalies." />
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {insights.map((ins, i) => (
                            <div key={i} className="text-xs text-[#9095a0] bg-[#1a1c23] border border-[#1e2128] rounded-lg px-3 py-2">
                                🔴 {ins}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alert Cards */}
            {alerts.length === 0 ? (
                <div className="panel-bg panel-border rounded-xl p-8 flex flex-col items-center justify-center gap-3">
                    <LuCircleCheck size={40} className="text-[#2e6041]" />
                    <p className="text-[#e2e4e9] font-medium">All Clear</p>
                    <p className="text-xs text-[#5e6470]">No zones currently exceed alert thresholds. The system is stable.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-[#a0a5b0] uppercase tracking-wider">Active Dispatches</h3>
                    {alerts.map((alert, i) => {
                        const DomIcon = CAT_ICONS[alert.dominant_risk] || LuActivity;
                        const domColor = CAT_COLORS[alert.dominant_risk] || '#a0a5b0';
                        return (
                            <div key={i} className={`panel-bg rounded-xl p-5 border relative overflow-hidden ${alert.risk_level === 'CRITICAL' ? 'border-[#803030]/30' : 'border-[#8c7322]/20'}`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.risk_level === 'CRITICAL' ? 'bg-[#803030]' : 'bg-[#8c7322]'}`}></div>
                                <div className="flex flex-col gap-3 pl-3">
                                    {/* Top Row — Zone, Level, Dominant Risk */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-[#e2e4e9]">{alert.zone_id}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${alert.risk_level === 'CRITICAL' ? 'bg-[#803030]/10 text-[#803030] border-[#803030]/20' : 'bg-[#8c7322]/10 text-[#8c7322] border-[#8c7322]/20'}`}>
                                                {alert.risk_level}
                                            </span>
                                            <span className="text-xs text-[#5e6470]">D+{alert.horizon_days}</span>
                                            {/* Dominant Risk Badge */}
                                            {alert.dominant_risk && (
                                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-bold" style={{ color: domColor, borderColor: `${domColor}30`, backgroundColor: `${domColor}10` }}>
                                                    <DomIcon size={10} />
                                                    {CAT_EMOJIS[alert.dominant_risk]} {alert.dominant_risk}-Driven
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xl font-bold font-mono" style={{ color: getRiskColor(alert.predicted_final) }}>
                                            {alert.predicted_final.toFixed(1)}
                                        </div>
                                    </div>

                                    {/* Sub-Risk Pills */}
                                    <div className="flex items-center gap-3">
                                        {[
                                            { key: 'Air', val: alert.predicted_air, icon: LuWind },
                                            { key: 'Water', val: alert.predicted_water, icon: LuDroplets },
                                            { key: 'Urban', val: alert.predicted_urban, icon: LuBuilding2 },
                                        ].map(cat => (
                                            <div key={cat.key} className="flex items-center gap-2 bg-[#1a1c23] border border-[#1e2128] rounded-lg px-3 py-2 flex-1">
                                                <cat.icon size={13} style={{ color: CAT_COLORS[cat.key] }} />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: CAT_COLORS[cat.key] }}>{cat.key}</span>
                                                        <span className="text-xs font-mono font-bold" style={{ color: CAT_COLORS[cat.key] }}>
                                                            {(cat.val || 0).toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1 bg-[#16181d] rounded-full overflow-hidden mt-1">
                                                        <div className="h-full rounded-full" style={{ width: `${Math.min(cat.val || 0, 100)}%`, backgroundColor: CAT_COLORS[cat.key], opacity: 0.7 }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Row */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-[#a0a5b0] bg-[#16181d] border border-[#1e2128] px-3 py-1.5 rounded-md flex-1 mr-3">
                                            {getActionFromDominant(alert.dominant_risk, alert.predicted_final)}
                                        </div>
                                        {alert.error && (
                                            <span className="text-xs text-[#5e6470] mr-3">Error: <strong className="text-[#8c7322]">{alert.error.toFixed(2)}</strong></span>
                                        )}
                                        <button className="bg-[#1e2128] hover:bg-[#3a3f4a] p-1.5 rounded-md border border-[#3a3f4a] transition-colors shrink-0">
                                            <LuArrowRight size={16} className="text-[#a0a5b0]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
