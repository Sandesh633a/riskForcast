import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { LuBrainCircuit, LuTarget, LuScale, LuInfo, LuShieldCheck, LuWind, LuDroplets, LuBuilding2 } from 'react-icons/lu';
import { fetchModelMetrics } from '../services/api';

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

const CAT_COLORS = { air: '#5b8fb9', water: '#3b9b8f', urban: '#b07d4f' };
const CAT_ICONS = { air: LuWind, water: LuDroplets, urban: LuBuilding2 };
const CAT_LABELS = { air: 'Air Model', water: 'Water Model', urban: 'Urban Model' };

export default function ModelLab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModelMetrics()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64 text-[#5e6470]">Loading model metrics…</div>;
    if (!data) return <div className="flex items-center justify-center h-64 text-[#803030]">Failed to load</div>;

    // Zone-wise MAE bar chart
    const zoneMAE = Object.entries(data.zone_wise_mae || {}).map(([zone, mae]) => ({
        zone, mae: parseFloat(mae.toFixed(3)),
    })).sort((a, b) => parseInt(a.zone.replace('Zone_', '')) - parseInt(b.zone.replace('Zone_', '')));

    // Per-zone Per-category MAE grouped bar chart
    const zoneCatMAE = Object.entries(data.zone_category_mae || {}).map(([zone, cats]) => ({
        zone: zone.replace('Zone_', 'Z'),
        Air: parseFloat((cats.air || 0).toFixed(3)),
        Water: parseFloat((cats.water || 0).toFixed(3)),
        Urban: parseFloat((cats.urban || 0).toFixed(3)),
    })).sort((a, b) => parseInt(a.zone.replace('Z', '')) - parseInt(b.zone.replace('Z', '')));

    // Accuracy gauge (inverse of MAE)
    const accuracyPct = Math.max(0, Math.min(100, 100 - (data.overall_mae * 5)));
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (accuracyPct / 100) * circumference;

    // Category MAE values
    const airMAE = data.air_mae || 0;
    const waterMAE = data.water_mae || 0;
    const urbanMAE = data.urban_mae || 0;

    // Category accuracy radar data
    const radarData = [
        { category: 'Air', accuracy: Math.max(0, 100 - airMAE * 10), fullMark: 100 },
        { category: 'Water', accuracy: Math.max(0, 100 - waterMAE * 10), fullMark: 100 },
        { category: 'Urban', accuracy: Math.max(0, 100 - urbanMAE * 10), fullMark: 100 },
    ];

    // Model health insight
    const catMAEs = [
        { name: 'Air', mae: airMAE },
        { name: 'Water', mae: waterMAE },
        { name: 'Urban', mae: urbanMAE },
    ].sort((a, b) => b.mae - a.mae);
    const worstCat = catMAEs[0];
    const bestCat = catMAEs[catMAEs.length - 1];

    const healthInsight = worstCat.mae > 3
        ? `The ${worstCat.name} model has the highest MAE at ${worstCat.mae.toFixed(3)} — consider retraining with more recent ${worstCat.name.toLowerCase()} quality data. The ${bestCat.name} model performs best with MAE ${bestCat.mae.toFixed(3)}.`
        : `All category models are performing well. ${bestCat.name} leads with MAE ${bestCat.mae.toFixed(3)}, while ${worstCat.name} has the widest margin at ${worstCat.mae.toFixed(3)} — still within acceptable range.`;

    return (
        <div className="flex flex-col gap-6 pb-6 w-full max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-semibold text-[#e2e4e9] tracking-tight flex items-center gap-2">
                    AI Model Laboratory
                    <Tooltip text="Transparency dashboard showing model performance for Air, Water, and Urban prediction models individually, plus overall composite metrics." />
                </h2>
                <p className="text-sm text-[#9095a0]">MLOps transparency — Air · Water · Urban model metrics separated</p>
            </div>

            {/* ── Top Overall Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4 border-b border-[#1e2128] pb-3">
                        <div className="w-9 h-9 rounded-full bg-[#1e2128] border border-[#3a3f4a] flex items-center justify-center text-[#a0a5b0]">
                            <LuBrainCircuit size={18} />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-[#7a828e] font-semibold flex items-center">
                            Total Predictions <Tooltip text="Total risk predictions made by all models across all zones and horizons." />
                        </div>
                    </div>
                    <div className="text-3xl font-bold font-mono text-[#a0a5b0]">{data.total_predictions.toLocaleString()}</div>
                </div>

                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4 border-b border-[#1e2128] pb-3">
                        <div className="w-9 h-9 rounded-full bg-[#1e2128] border border-[#3a3f4a] flex items-center justify-center text-[#a0a5b0]">
                            <LuTarget size={18} />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-[#7a828e] font-semibold flex items-center">
                            Overall MAE <Tooltip text="Mean Absolute Error across all predictions. Lower = better. Under 5 = very good." />
                        </div>
                    </div>
                    <div className="text-3xl font-bold font-mono text-[#e2e4e9]">{data.overall_mae} <span className="text-sm text-[#5e6470]">pts</span></div>
                </div>

                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4 border-b border-[#1e2128] pb-3">
                        <div className="w-9 h-9 rounded-full bg-[#1e2128] border border-[#3a3f4a] flex items-center justify-center text-[#a0a5b0]">
                            <LuScale size={18} />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-[#7a828e] font-semibold flex items-center">
                            Overall Bias <Tooltip text="Positive = AI over-predicts (cautious). Negative = under-predicts. Near 0 = balanced." />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold font-mono ${data.overall_bias > 0 ? 'text-[#8c7322]' : 'text-[#3b5060]'}`}>
                        {data.overall_bias > 0 ? '+' : ''}{data.overall_bias}
                    </div>
                    <div className="text-[10px] text-[#5e6470] mt-1">{data.overall_bias > 0 ? 'Over-predicting' : 'Under-predicting'} on average</div>
                </div>

                {/* Accuracy Gauge */}
                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col items-center justify-center">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#1e2128" strokeWidth="8" />
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#2e6041" strokeWidth="8"
                            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                            transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                        <text x="60" y="56" textAnchor="middle" fill="#e2e4e9" fontSize="24" fontWeight="bold">{accuracyPct.toFixed(0)}%</text>
                        <text x="60" y="72" textAnchor="middle" fill="#9095a0" fontSize="9">Accuracy</text>
                    </svg>
                    <span className="text-[10px] text-[#5e6470] mt-1 flex items-center gap-1">
                        AI Reliability <Tooltip text="Derived from MAE. Above 85% = production-grade reliability." />
                    </span>
                </div>
            </div>

            {/* ── Per-Category MAE Cards ── */}
            <div className="grid grid-cols-3 gap-4">
                {['air', 'water', 'urban'].map(cat => {
                    const mae = data[`${cat}_mae`] || 0;
                    const Icon = CAT_ICONS[cat];
                    const catAccuracy = Math.max(0, Math.min(100, 100 - mae * 10));
                    const catCirc = 2 * Math.PI * 32;
                    const catOffset = catCirc - (catAccuracy / 100) * catCirc;
                    return (
                        <div key={cat} className="panel-bg panel-border rounded-xl p-5" style={{ borderColor: `${CAT_COLORS[cat]}20` }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CAT_COLORS[cat]}15`, border: `1px solid ${CAT_COLORS[cat]}30` }}>
                                        <Icon size={16} style={{ color: CAT_COLORS[cat] }} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: CAT_COLORS[cat] }}>{CAT_LABELS[cat]}</div>
                                        <div className="text-[10px] text-[#5e6470]">Category-specific accuracy</div>
                                    </div>
                                </div>
                                {/* Mini gauge */}
                                <svg width="70" height="70" viewBox="0 0 70 70">
                                    <circle cx="35" cy="35" r="32" fill="none" stroke="#1e2128" strokeWidth="5" />
                                    <circle cx="35" cy="35" r="32" fill="none" stroke={CAT_COLORS[cat]} strokeWidth="5"
                                        strokeLinecap="round" strokeDasharray={catCirc} strokeDashoffset={catOffset}
                                        transform="rotate(-90 35 35)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} opacity={0.8} />
                                    <text x="35" y="33" textAnchor="middle" fill="#e2e4e9" fontSize="14" fontWeight="bold">{catAccuracy.toFixed(0)}%</text>
                                    <text x="35" y="45" textAnchor="middle" fill="#7a828e" fontSize="7">Accuracy</text>
                                </svg>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#1a1c23] border border-[#1e2128] rounded-lg">
                                <div>
                                    <div className="text-[10px] text-[#5e6470] uppercase tracking-wider font-bold">MAE</div>
                                    <div className="text-xl font-bold font-mono" style={{ color: CAT_COLORS[cat] }}>{mae.toFixed(3)} <span className="text-[10px] text-[#5e6470]">pts</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-[#5e6470] uppercase tracking-wider font-bold">Grade</div>
                                    <div className="text-lg font-bold" style={{ color: mae < 1 ? '#2e6041' : mae < 2 ? '#8c7322' : '#803030' }}>
                                        {mae < 1 ? 'Excellent' : mae < 2 ? 'Good' : mae < 3 ? 'Fair' : 'Needs Work'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Zone-wise MAE Bar Chart (Overall) */}
                <div className="panel-bg panel-border rounded-xl p-6 min-h-[350px]">
                    <h3 className="text-sm font-medium text-[#e2e4e9] mb-1 flex items-center gap-1">
                        Zone-wise Overall MAE
                        <Tooltip text="Prediction accuracy per zone (combined). Shorter bars = more accurate." />
                    </h3>
                    <p className="text-xs text-[#5e6470] mb-4">Lower MAE = better accuracy for that zone</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={zoneMAE} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" vertical={false} />
                            <XAxis dataKey="zone" stroke="#5e6470" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#5e6470" fontSize={10} tickLine={false} axisLine={false} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1a1c23', borderColor: '#3a3f4a', borderRadius: '8px', color: '#e2e4e9', fontSize: '12px' }} />
                            <Bar dataKey="mae" name="MAE" fill="#3b5060" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Per-Zone Category MAE Grouped Bar Chart */}
                <div className="panel-bg panel-border rounded-xl p-6 min-h-[350px]">
                    <h3 className="text-sm font-medium text-[#e2e4e9] mb-1 flex items-center gap-1">
                        Zone-wise Category MAE
                        <Tooltip text="Per-zone MAE breakdown by Air, Water, and Urban models. Shows which model performs best/worst in each zone." />
                    </h3>
                    <p className="text-xs text-[#5e6470] mb-4">Air · Water · Urban prediction error per zone</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={zoneCatMAE} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" vertical={false} />
                            <XAxis dataKey="zone" stroke="#5e6470" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#5e6470" fontSize={10} tickLine={false} axisLine={false} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1a1c23', borderColor: '#3a3f4a', borderRadius: '8px', color: '#e2e4e9', fontSize: '12px' }} />
                            <Bar dataKey="Air" fill={CAT_COLORS.air} radius={[2, 2, 0, 0]} opacity={0.8} />
                            <Bar dataKey="Water" fill={CAT_COLORS.water} radius={[2, 2, 0, 0]} opacity={0.8} />
                            <Bar dataKey="Urban" fill={CAT_COLORS.urban} radius={[2, 2, 0, 0]} opacity={0.8} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-5 mt-2">
                        {Object.entries(CAT_COLORS).map(([cat, color]) => (
                            <span key={cat} className="flex items-center gap-1.5 text-xs" style={{ color }}>
                                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color, opacity: 0.8 }}></span>
                                {CAT_LABELS[cat]}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Performance Extremes + Model Health Insight ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best / Worst Zones */}
                <div className="panel-bg panel-border rounded-xl flex flex-col">
                    <div className="p-6 border-b border-[#1e2128]">
                        <h3 className="text-sm font-medium text-[#e2e4e9] flex items-center gap-1">
                            Performance Extremes
                            <Tooltip text="Shows which zones the AI predicts most/least accurately. Worst zones may need model retraining." />
                        </h3>
                    </div>
                    <div className="flex flex-col p-6 gap-6 flex-1">
                        <div>
                            <h4 className="text-[10px] font-bold text-[#5e6470] tracking-widest uppercase mb-3 flex items-center gap-1">
                                <LuShieldCheck size={12} className="text-[#2e6041]" /> Best Performing Zone
                            </h4>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1c23] border border-[#2e6041]/20">
                                <div>
                                    <span className="text-lg font-bold text-[#e2e4e9]">{data.best_performing_zone.zone_id}</span>
                                    <p className="text-xs text-[#5e6470] mt-0.5">Most accurate predictions among all zones</p>
                                </div>
                                <span className="text-2xl font-mono font-bold text-[#2e6041]">{data.best_performing_zone.mae}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-[#5e6470] tracking-widest uppercase mb-3 flex items-center gap-1">
                                <LuTarget size={12} className="text-[#803030]" /> Worst Performing Zone
                            </h4>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-[#803030]/5 border border-[#803030]/20">
                                <div>
                                    <span className="text-lg font-bold text-[#e2e4e9]">{data.worst_performing_zone.zone_id}</span>
                                    <p className="text-xs text-[#5e6470] mt-0.5">Largest prediction errors — may need data review</p>
                                </div>
                                <span className="text-2xl font-mono font-bold text-[#803030]">{data.worst_performing_zone.mae}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Model Health Insight */}
                <div className="panel-bg panel-border rounded-xl flex flex-col">
                    <div className="p-6 border-b border-[#1e2128]">
                        <h3 className="text-sm font-medium text-[#e2e4e9] flex items-center gap-1">
                            Model Health Assessment
                            <Tooltip text="AI-generated insight comparing the performance of Air, Water, and Urban prediction models." />
                        </h3>
                    </div>
                    <div className="flex flex-col p-6 gap-4 flex-1">
                        {/* Category MAE comparison */}
                        <div className="space-y-3">
                            {catMAEs.reverse().map(c => {
                                const cat = c.name.toLowerCase();
                                const Icon = CAT_ICONS[cat];
                                return (
                                    <div key={cat} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${CAT_COLORS[cat]}15`, border: `1px solid ${CAT_COLORS[cat]}30` }}>
                                            <Icon size={14} style={{ color: CAT_COLORS[cat] }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold" style={{ color: CAT_COLORS[cat] }}>{c.name} Model</span>
                                                <span className="text-xs font-mono font-bold text-[#e2e4e9]">{c.mae.toFixed(3)}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-[#1e2128] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{
                                                    width: `${Math.min((c.mae / Math.max(...catMAEs.map(x => x.mae), 1)) * 100, 100)}%`,
                                                    backgroundColor: CAT_COLORS[cat], opacity: 0.7
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Insight Box */}
                        <div className="bg-[#1a1c23] border border-[#1e2128] rounded-lg p-4 mt-auto">
                            <div className="text-[10px] text-[#5e6470] uppercase tracking-wider font-bold mb-1">💡 Model Health Insight</div>
                            <p className="text-xs text-[#9095a0] leading-relaxed">{healthInsight}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
