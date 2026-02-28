import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { LuInfo, LuSend, LuRotateCcw, LuWind, LuDroplets, LuBuilding2, LuTrendingUp, LuTrendingDown } from 'react-icons/lu';
import { postPredict } from '../services/api';

function Tooltip({ text }) {
    return (
        <span className="relative group cursor-help ml-1 inline-flex">
            <LuInfo size={13} className="text-[#5e6470] group-hover:text-[#a0a5b0] transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-[#1a1c23] border border-[#3a3f4a] rounded-lg text-[11px] text-[#a0a5b0] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">{text}</span>
        </span>
    );
}

function getRiskColor(score) {
    if (score > 75) return '#803030';
    if (score > 50) return '#8c7322';
    return '#2e6041';
}

function getSeverityLabel(score) {
    if (score > 85) return 'Critical';
    if (score > 75) return 'High';
    if (score > 55) return 'Moderate';
    if (score > 35) return 'Low';
    return 'Safe';
}

const CAT_COLORS = { air: '#5b8fb9', water: '#3b9b8f', urban: '#b07d4f' };
const CAT_ICONS = { air: LuWind, water: LuDroplets, urban: LuBuilding2 };
const CAT_LABELS = { air: 'Air Quality', water: 'Water Risk', urban: 'Urban Risk' };
const PIE_WEIGHTS = { air: 0.4, water: 0.3, urban: 0.3 };

const FIELDS = [
    { key: 'pm25', label: 'PM2.5', default: 150, tip: 'Fine dust particles in air (µg/m³). Above 60 is unhealthy.' },
    { key: 'pm10', label: 'PM10', default: 250, tip: 'Coarse dust particles (µg/m³). Common near construction sites.' },
    { key: 'no2', label: 'NO₂', default: 45, tip: 'Nitrogen dioxide from vehicles/industry. Above 40 is concerning.' },
    { key: 'humidity', label: 'Humidity', default: 60, tip: 'Air moisture percentage. High humidity traps pollutants.' },
    { key: 'wind_speed', label: 'Wind Speed', default: 5, tip: 'Wind in m/s. Higher wind disperses pollution faster.' },
    { key: 'rainfall_last_3_days', label: 'Rainfall (3d)', default: 5, tip: 'Rain in mm over last 3 days. Affects flooding risk.' },
    { key: 'water_quality_index', label: 'Water Quality', default: 70, tip: 'Overall water safety (0-100). Higher = cleaner.' },
    { key: 'reservoir_level', label: 'Reservoir Level', default: 80, tip: 'How full water reservoirs are (%). Low = water stress.' },
    { key: 'drainage_quality_index', label: 'Drainage Quality', default: 65, tip: 'How well the area handles water drainage (0-100).' },
    { key: 'violations_last_7_days', label: 'Violations (7d)', default: 12, tip: 'Environmental violations reported in the past week.' },
    { key: 'avg_violation_severity', label: 'Avg Severity', default: 3, tip: 'Average severity of violations (1-5 scale).' },
    { key: 'repeat_offender_rate', label: 'Repeat Offenders', default: 0.3, tip: 'Fraction of violators who are repeat offenders (0-1).' },
    { key: 'population_density', label: 'Population Density', default: 12000, tip: 'People per sq km. Higher = more vulnerable to risk.' },
    { key: 'industrial_density', label: 'Industrial Density', default: 40, tip: 'Percentage of area used for industrial purposes.' },
    { key: 'green_cover_percentage', label: 'Green Cover', default: 25, tip: 'Percentage covered by vegetation. More = safer.' },
    { key: 'social_vulnerability_index', label: 'Social Vulnerability', default: 0.5, tip: 'Vulnerability of residents (0-1). Higher = more at risk.' },
    { key: 'risk_score', label: 'Current Risk Score', default: 60, tip: 'The current known risk score for this zone.' },
];

export default function ManualPredict() {
    const initDay = () => Object.fromEntries(FIELDS.map(f => [f.key, f.default]));
    const [zoneId, setZoneId] = useState('Zone_1');
    const [days, setDays] = useState([initDay(), initDay(), initDay()]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateDay = (di, key, val) => {
        setDays(prev => prev.map((d, i) => i === di ? { ...d, [key]: parseFloat(val) || 0 } : d));
    };

    const handlePredict = async () => {
        setLoading(true); setError(null);
        try {
            const res = await postPredict({ zone_id: zoneId, history: days });
            setResult(res);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    // Generate insight text for a prediction
    const getInsight = (r) => {
        const air = r.predicted_air || 0;
        const water = r.predicted_water || 0;
        const urban = r.predicted_urban || 0;
        const cats = [{ name: 'Air', val: air }, { name: 'Water', val: water }, { name: 'Urban', val: urban }];
        const dominant = cats.sort((a, b) => b.val - a.val)[0];
        const lowest = cats[cats.length - 1];

        if (dominant.val > 80) return `${dominant.name} risk is critically high at ${dominant.val.toFixed(1)} — immediate intervention needed. ${lowest.name} is the lowest concern at ${lowest.val.toFixed(1)}.`;
        if (dominant.val > 60) return `${dominant.name} is the primary risk driver at ${dominant.val.toFixed(1)}. Consider targeted mitigation for this category.`;
        return `All risk categories are manageable. ${dominant.name} leads at ${dominant.val.toFixed(1)} but within safe thresholds.`;
    };

    return (
        <div className="flex flex-col gap-6 pb-6 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-semibold text-[#e2e4e9] flex items-center gap-2">
                    Manual AI Prediction
                    <Tooltip text="Input 3 days of environmental data and the AI predicts Air, Water, Urban, and Final risk for D+1, D+3, and D+7." />
                </h2>
                <p className="text-sm text-[#9095a0]">Provide 3-day history to get detailed AI forecast with category breakdown</p>
            </div>

            <div className="panel-bg panel-border rounded-xl p-5">
                <label className="text-xs text-[#5e6470] uppercase tracking-wider font-bold">Zone ID</label>
                <input value={zoneId} onChange={e => setZoneId(e.target.value)}
                    className="mt-1 w-full max-w-xs bg-[#1a1c23] border border-[#1e2128] rounded-lg px-3 py-2 text-sm text-[#e2e4e9] outline-none focus:border-[#3a3f4a]" />
            </div>

            {/* 3-Day Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {days.map((day, di) => (
                    <div key={di} className="panel-bg panel-border rounded-xl p-4">
                        <h3 className="text-sm font-bold text-[#a0a5b0] mb-3">Day {di + 1} {di === 2 ? '(Most Recent)' : ''}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {FIELDS.map(f => (
                                <div key={f.key}>
                                    <label className="text-[10px] text-[#5e6470] flex items-center gap-0.5">{f.label}</label>
                                    <input type="number" value={day[f.key]} onChange={e => updateDay(di, f.key, e.target.value)}
                                        className="w-full bg-[#1a1c23] border border-[#1e2128] rounded px-2 py-1 text-xs text-[#e2e4e9] outline-none focus:border-[#3a3f4a] font-mono" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button onClick={handlePredict} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#3b5060] hover:bg-[#3b5060]/80 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
                    <LuSend size={16} /> {loading ? 'Predicting…' : 'Run AI Prediction'}
                </button>
                <button onClick={() => { setDays([initDay(), initDay(), initDay()]); setResult(null); }}
                    className="px-5 py-3 rounded-xl border border-[#3a3f4a] text-[#a0a5b0] hover:bg-[#1e2128] transition-colors">
                    <LuRotateCcw size={16} />
                </button>
            </div>

            {error && <div className="panel-bg border border-[#803030]/30 rounded-xl p-4 text-sm text-[#803030]">{error}</div>}

            {/* ── RESULTS ── */}
            {result && (
                <div className="flex flex-col gap-4">
                    {/* Horizon Cards with Sub-risk Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {result.map((r, i) => {
                            const air = r.predicted_air || 0;
                            const water = r.predicted_water || 0;
                            const urban = r.predicted_urban || 0;

                            // Composition donut data
                            const pieData = [
                                { name: 'Air (40%)', value: parseFloat((PIE_WEIGHTS.air * air).toFixed(2)), color: CAT_COLORS.air },
                                { name: 'Water (30%)', value: parseFloat((PIE_WEIGHTS.water * water).toFixed(2)), color: CAT_COLORS.water },
                                { name: 'Urban (30%)', value: parseFloat((PIE_WEIGHTS.urban * urban).toFixed(2)), color: CAT_COLORS.urban },
                            ];

                            return (
                                <div key={i} className="panel-bg panel-border rounded-xl p-5">
                                    {/* Header */}
                                    <div className="text-center mb-4">
                                        <div className="text-xs text-[#5e6470] uppercase font-bold tracking-wider mb-1">D+{r.horizon_days}</div>
                                        <div className="text-3xl font-bold font-mono" style={{ color: getRiskColor(r.predicted_final) }}>{r.predicted_final.toFixed(2)}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: getRiskColor(r.predicted_final) }}>{getSeverityLabel(r.predicted_final)}</div>
                                    </div>

                                    {/* Sub-risk Breakdown */}
                                    <div className="space-y-2.5 mb-4">
                                        {[
                                            { key: 'air', val: air, label: 'Air Quality' },
                                            { key: 'water', val: water, label: 'Water Risk' },
                                            { key: 'urban', val: urban, label: 'Urban Risk' },
                                        ].map(cat => {
                                            const Icon = CAT_ICONS[cat.key];
                                            return (
                                                <div key={cat.key}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold" style={{ color: CAT_COLORS[cat.key] }}>
                                                            <Icon size={11} /> {cat.label}
                                                        </span>
                                                        <span className="text-xs font-mono font-bold" style={{ color: CAT_COLORS[cat.key] }}>{cat.val.toFixed(1)}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-[#1e2128] rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(cat.val, 100)}%`, backgroundColor: CAT_COLORS[cat.key], opacity: 0.75 }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Composition Donut */}
                                    <div className="flex items-center justify-center mb-3">
                                        <ResponsiveContainer width={100} height={100}>
                                            <PieChart>
                                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={3} strokeWidth={0}>
                                                    {pieData.map((entry, idx) => (
                                                        <Cell key={idx} fill={entry.color} opacity={0.8} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#1a1c23', borderColor: '#3a3f4a', borderRadius: '8px', color: '#e2e4e9', fontSize: '11px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-3 mb-3">
                                        {pieData.map(p => (
                                            <span key={p.name} className="flex items-center gap-1 text-[9px]" style={{ color: p.color }}>
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color, opacity: 0.8 }}></span>
                                                {p.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actual & Error */}
                                    <div className="text-xs text-[#5e6470] text-center border-t border-[#1e2128] pt-3">
                                        Actual: <strong className="text-[#e2e4e9]">{r.actual_final.toFixed(2)}</strong> · Error: <strong className="text-[#8c7322]">{r.error.toFixed(2)}</strong>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Risk Driver Insight ── */}
                    {result.length > 0 && (
                        <div className="panel-bg panel-border rounded-xl p-4">
                            <h4 className="text-xs font-bold text-[#a0a5b0] uppercase tracking-wider mb-3 flex items-center gap-1">
                                <LuTrendingUp size={12} /> AI Risk Insight
                            </h4>
                            <div className="space-y-2">
                                {result.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-[#1a1c23] border border-[#1e2128] rounded-lg p-3">
                                        <span className="text-xs font-bold text-[#5e6470] mt-0.5 shrink-0 w-8">D+{r.horizon_days}</span>
                                        <p className="text-xs text-[#9095a0] leading-relaxed">{getInsight(r)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Horizon Comparison Bar Chart ── */}
                    {result.length > 1 && (
                        <div className="panel-bg panel-border rounded-xl p-5">
                            <h4 className="text-sm font-medium text-[#e2e4e9] mb-1 flex items-center gap-1">
                                Category Risk Across Horizons
                                <Tooltip text="Compare how Air, Water, and Urban risk scores change across D+1, D+3, and D+7 prediction horizons." />
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={result.map(r => ({
                                    horizon: `D+${r.horizon_days}`,
                                    Air: parseFloat((r.predicted_air || 0).toFixed(1)),
                                    Water: parseFloat((r.predicted_water || 0).toFixed(1)),
                                    Urban: parseFloat((r.predicted_urban || 0).toFixed(1)),
                                }))} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" vertical={false} />
                                    <XAxis dataKey="horizon" stroke="#5e6470" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#5e6470" fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1a1c23', borderColor: '#3a3f4a', borderRadius: '8px', color: '#e2e4e9', fontSize: '12px' }} />
                                    <Bar dataKey="Air" fill={CAT_COLORS.air} radius={[3, 3, 0, 0]} opacity={0.8} />
                                    <Bar dataKey="Water" fill={CAT_COLORS.water} radius={[3, 3, 0, 0]} opacity={0.8} />
                                    <Bar dataKey="Urban" fill={CAT_COLORS.urban} radius={[3, 3, 0, 0]} opacity={0.8} />
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
                    )}
                </div>
            )}
        </div>
    );
}
