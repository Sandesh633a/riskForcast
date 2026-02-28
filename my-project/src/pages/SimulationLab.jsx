import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { LuInfo, LuPlay, LuRotateCcw, LuWind, LuDroplets, LuBuilding2, LuArrowDown, LuArrowUp } from 'react-icons/lu';
import { postSimulate } from '../services/api';

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

const DEFAULTS = {
    green_cover_percentage: 25, violations_last_7_days: 12, drainage_quality_index: 65,
    industrial_density: 40, pm25: 150, pm10: 250, no2: 45, humidity: 60,
    wind_speed: 5, rainfall_last_3_days: 5, water_quality_index: 70,
    reservoir_level: 80, avg_violation_severity: 3, repeat_offender_rate: 0.3,
    population_density: 12000, social_vulnerability_index: 0.5, risk_score: 60,
};

const SLIDERS = [
    { key: 'green_cover_percentage', label: 'Green Cover', min: 5, max: 80, unit: '%', tooltip: 'Percentage covered by vegetation. More green = cleaner air and lower flood risk.' },
    { key: 'violations_last_7_days', label: 'Violations (7d)', min: 0, max: 30, unit: '', tooltip: 'Weekly environmental violations. Fewer = better compliance.' },
    { key: 'drainage_quality_index', label: 'Drainage Quality', min: 20, max: 100, unit: '/100', tooltip: 'Water flow handling. Higher = better drainage, lower flood risk.' },
    { key: 'industrial_density', label: 'Industrial Density', min: 5, max: 80, unit: '%', tooltip: 'Factory concentration. Higher = more pollution.' },
    { key: 'pm25', label: 'PM2.5 (Air)', min: 30, max: 300, unit: 'µg/m³', tooltip: 'Fine particulate matter. Above 60 is unhealthy.' },
    { key: 'water_quality_index', label: 'Water Quality', min: 20, max: 100, unit: '/100', tooltip: 'Overall water safety. Higher = cleaner water.' },
];

const CAT_COLORS = { air: '#5b8fb9', water: '#3b9b8f', urban: '#b07d4f' };
const CAT_ICONS = { air: LuWind, water: LuDroplets, urban: LuBuilding2 };
const CAT_LABELS = { air: 'Air Quality', water: 'Water Risk', urban: 'Urban Risk' };

export default function SimulationLab() {
    const [params, setParams] = useState({ ...DEFAULTS });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRun = async () => {
        setLoading(true); setError(null);
        try {
            const payload = { zone_id: 'Zone_1', history: [{ ...params }, { ...params }, { ...params }] };
            const res = await postSimulate(payload);
            setResult(res[0] || res);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const handleReset = () => { setParams({ ...DEFAULTS }); setResult(null); setError(null); };

    const improvement = result ? ((result.original_risk - result.simulated_risk) / result.original_risk * 100) : 0;

    // Category comparison bar chart data
    const comparisonData = result ? [
        { category: 'Air', Original: parseFloat((result.air_risk || 0).toFixed(1)), Simulated: parseFloat((result.simulated_air || 0).toFixed(1)) },
        { category: 'Water', Original: parseFloat((result.water_risk || 0).toFixed(1)), Simulated: parseFloat((result.simulated_water || 0).toFixed(1)) },
        { category: 'Urban', Original: parseFloat((result.urban_risk || 0).toFixed(1)), Simulated: parseFloat((result.simulated_urban || 0).toFixed(1)) },
    ] : [];

    // Find which category had the biggest impact
    const getMaxImpactInsight = () => {
        if (!result) return '';
        const impacts = [
            { name: 'Air', impact: (result.air_risk || 0) - (result.simulated_air || 0) },
            { name: 'Water', impact: (result.water_risk || 0) - (result.simulated_water || 0) },
            { name: 'Urban', impact: (result.urban_risk || 0) - (result.simulated_urban || 0) },
        ].sort((a, b) => b.impact - a.impact);
        const best = impacts[0];
        return `Your parameter changes reduced ${best.name} risk by ${best.impact.toFixed(1)} points (${((best.impact / (result[best.name.toLowerCase() + '_risk'] || 1)) * 100).toFixed(1)}%) — the largest improvement among all categories.`;
    };

    return (
        <div className="flex flex-col gap-6 pb-6">
            <div>
                <h2 className="text-2xl font-semibold text-[#e2e4e9] tracking-tight flex items-center gap-2">
                    Simulation Lab
                    <Tooltip text="Test what-if scenarios. Adjust parameters, run the AI model, and see how Air, Water, Urban, and Final risk change. Helps city planners test policy impact." />
                </h2>
                <p className="text-sm text-[#9095a0]">Policy testing & scenario modeling — see Air · Water · Urban impact breakdown</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left — Controls */}
                <div className="flex flex-col gap-4">
                    <div className="panel-bg panel-border rounded-xl p-6 flex flex-col gap-5">
                        <h3 className="text-sm font-medium text-[#a0a5b0] uppercase tracking-wider">Adjust Policy Parameters</h3>
                        {SLIDERS.map(s => (
                            <div key={s.key}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-[#e2e4e9] flex items-center gap-1">
                                        {s.label} <Tooltip text={s.tooltip} />
                                    </label>
                                    <span className="text-sm font-mono font-bold text-[#a0a5b0]">{params[s.key]}{s.unit}</span>
                                </div>
                                <input type="range" min={s.min} max={s.max} value={params[s.key]}
                                    onChange={e => setParams(p => ({ ...p, [s.key]: parseFloat(e.target.value) }))}
                                    className="w-full h-1.5 bg-[#1e2128] rounded-full appearance-none cursor-pointer accent-[#3b5060]"
                                    style={{ accentColor: '#3b5060' }} />
                                <div className="flex justify-between text-[10px] text-[#5e6470] mt-0.5">
                                    <span>{s.min}</span><span>{s.max}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleRun} disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#2e6041] hover:bg-[#2e6041]/80 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
                            <LuPlay size={16} /> {loading ? 'Running Simulation…' : 'Run Simulation'}
                        </button>
                        <button onClick={handleReset}
                            className="flex items-center justify-center gap-2 bg-[#1e2128] hover:bg-[#3a3f4a] text-[#a0a5b0] px-5 py-3 rounded-xl border border-[#3a3f4a] transition-colors">
                            <LuRotateCcw size={16} /> Reset
                        </button>
                    </div>
                </div>

                {/* Right — Results */}
                <div className="flex flex-col gap-4">
                    {error && <div className="panel-bg border border-[#803030]/30 rounded-xl p-4 text-sm text-[#803030]">{error}</div>}

                    {!result ? (
                        <div className="panel-bg panel-border rounded-xl p-12 flex flex-col items-center justify-center gap-3 flex-1">
                            <div className="text-4xl">🧪</div>
                            <p className="text-[#e2e4e9] font-medium">Adjust & Simulate</p>
                            <p className="text-xs text-[#5e6470] text-center max-w-xs">Modify parameters on the left and click "Run Simulation" to see category-level risk impact.</p>
                        </div>
                    ) : (
                        <>
                            {/* Original vs Simulated Final */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="panel-bg border border-[#803030]/20 rounded-xl p-5 text-center">
                                    <div className="text-[10px] uppercase tracking-widest text-[#5e6470] font-bold mb-2 flex items-center justify-center gap-1">
                                        Original Risk <Tooltip text="Baseline risk without policy changes." />
                                    </div>
                                    <div className="text-3xl font-bold font-mono text-[#803030]">{result.original_risk.toFixed(1)}</div>
                                </div>
                                <div className="panel-bg border border-[#2e6041]/20 rounded-xl p-5 text-center">
                                    <div className="text-[10px] uppercase tracking-widest text-[#5e6470] font-bold mb-2 flex items-center justify-center gap-1">
                                        Simulated Risk <Tooltip text="Predicted risk after your parameter changes." />
                                    </div>
                                    <div className="text-3xl font-bold font-mono text-[#2e6041]">{result.simulated_risk.toFixed(1)}</div>
                                </div>
                            </div>

                            {/* ── Category Breakdown Cards ── */}
                            <div className="grid grid-cols-3 gap-3">
                                {['air', 'water', 'urban'].map(cat => {
                                    const original = result[`${cat}_risk`] || 0;
                                    const simulated = result[`simulated_${cat}`] || 0;
                                    const delta = original - simulated;
                                    const deltaPct = original > 0 ? (delta / original * 100) : 0;
                                    const Icon = CAT_ICONS[cat];
                                    return (
                                        <div key={cat} className="panel-bg panel-border rounded-xl p-4" style={{ borderColor: `${CAT_COLORS[cat]}20` }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CAT_COLORS[cat]}15`, border: `1px solid ${CAT_COLORS[cat]}30` }}>
                                                    <Icon size={14} style={{ color: CAT_COLORS[cat] }} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: CAT_COLORS[cat] }}>{CAT_LABELS[cat]}</span>
                                            </div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[9px] text-[#5e6470] uppercase">Original</span>
                                                <span className="text-sm font-mono font-bold text-[#e2e4e9]">{original.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] text-[#5e6470] uppercase">Simulated</span>
                                                <span className="text-sm font-mono font-bold" style={{ color: CAT_COLORS[cat] }}>{simulated.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 pt-2 border-t border-[#1e2128]">
                                                {delta > 0 ? <LuArrowDown size={12} className="text-[#2e6041]" /> : <LuArrowUp size={12} className="text-[#803030]" />}
                                                <span className={`text-xs font-bold ${delta > 0 ? 'text-[#2e6041]' : 'text-[#803030]'}`}>
                                                    {Math.abs(delta).toFixed(1)} pts ({Math.abs(deltaPct).toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Comparison Bar Chart ── */}
                            <div className="panel-bg panel-border rounded-xl p-5">
                                <h4 className="text-sm font-medium text-[#e2e4e9] mb-1 flex items-center gap-1">
                                    Original vs Simulated — by Category
                                    <Tooltip text="Side-by-side comparison of original (red) and simulated (green) risk for each category." />
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={comparisonData} margin={{ top: 10, right: 5, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" vertical={false} />
                                        <XAxis dataKey="category" stroke="#5e6470" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#5e6470" fontSize={10} tickLine={false} axisLine={false} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1a1c23', borderColor: '#3a3f4a', borderRadius: '8px', color: '#e2e4e9', fontSize: '12px' }} />
                                        <Bar dataKey="Original" fill="#803030" radius={[3, 3, 0, 0]} opacity={0.7} />
                                        <Bar dataKey="Simulated" fill="#2e6041" radius={[3, 3, 0, 0]} opacity={0.7} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-5 mt-2">
                                    <span className="flex items-center gap-1.5 text-xs text-[#9095a0]"><span className="w-2.5 h-2.5 rounded-sm bg-[#803030] opacity-70"></span> Original</span>
                                    <span className="flex items-center gap-1.5 text-xs text-[#9095a0]"><span className="w-2.5 h-2.5 rounded-sm bg-[#2e6041] opacity-70"></span> Simulated</span>
                                </div>
                            </div>

                            {/* ── Impact Assessment ── */}
                            <div className="panel-bg panel-border rounded-xl p-5 text-center">
                                <div className="text-[10px] uppercase tracking-widest text-[#5e6470] font-bold mb-2 flex items-center justify-center gap-1">
                                    Impact Assessment <Tooltip text="Overall risk reduction percentage from your simulation." />
                                </div>
                                <div className={`text-4xl font-bold font-mono ${improvement > 0 ? 'text-[#2e6041]' : improvement < 0 ? 'text-[#803030]' : 'text-[#7a828e]'}`}>
                                    {improvement > 0 ? '↓' : improvement < 0 ? '↑' : '→'} {Math.abs(improvement).toFixed(1)}%
                                </div>
                                <p className="text-sm text-[#9095a0] mt-2 mb-3">
                                    Risk reduced by <strong className="text-[#e2e4e9]">{result.impact.toFixed(2)}</strong> points
                                </p>
                                {/* Policy Insight */}
                                <div className="bg-[#1a1c23] border border-[#1e2128] rounded-lg p-3 text-left">
                                    <div className="text-[10px] text-[#5e6470] uppercase tracking-wider font-bold mb-1">💡 Policy Insight</div>
                                    <p className="text-xs text-[#9095a0] leading-relaxed">{getMaxImpactInsight()}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
