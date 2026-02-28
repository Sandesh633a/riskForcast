import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { LuZap, LuInfo, LuLoader, LuWind, LuDroplets, LuBuilding2 } from 'react-icons/lu';
import { postPredictAllAuto } from '../services/api';

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

const CAT_COLORS = { air: '#5b8fb9', water: '#3b9b8f', urban: '#b07d4f' };
const CAT_ICONS = { air: LuWind, water: LuDroplets, urban: LuBuilding2 };
const CAT_LABELS = { air: 'Air', water: 'Water', urban: 'Urban' };
const CAT_EMOJIS = { air: '🌫️', water: '💧', urban: '🏙️' };

function getDominant(air, water, urban) {
    const scores = { air, water, urban };
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export default function AutoSimulation() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRun = async () => {
        setLoading(true); setError(null); setResults([]);
        try {
            const res = await postPredictAllAuto();
            setResults(res);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    // Group results by zone
    const grouped = {};
    results.forEach(r => {
        if (!grouped[r.zone_id]) grouped[r.zone_id] = {};
        grouped[r.zone_id][r.horizon_days] = r;
    });

    // City-wide averages (from D+1 horizon)
    const d1Results = results.filter(r => r.horizon_days === 1);
    const avgAir = d1Results.length > 0 ? d1Results.reduce((s, r) => s + (r.predicted_air || 0), 0) / d1Results.length : 0;
    const avgWater = d1Results.length > 0 ? d1Results.reduce((s, r) => s + (r.predicted_water || 0), 0) / d1Results.length : 0;
    const avgUrban = d1Results.length > 0 ? d1Results.reduce((s, r) => s + (r.predicted_urban || 0), 0) / d1Results.length : 0;

    // City-wide bar chart data
    const cityBarData = d1Results.map(r => ({
        zone: r.zone_id.replace('Zone_', 'Z'),
        Air: parseFloat((r.predicted_air || 0).toFixed(1)),
        Water: parseFloat((r.predicted_water || 0).toFixed(1)),
        Urban: parseFloat((r.predicted_urban || 0).toFixed(1)),
    })).sort((a, b) => parseInt(a.zone.replace('Z', '')) - parseInt(b.zone.replace('Z', '')));

    return (
        <div className="flex flex-col gap-6 pb-6 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-semibold text-[#e2e4e9] flex items-center gap-2">
                    Citywide Auto Simulation
                    <Tooltip text="Runs the AI model across all 10 zones simultaneously. Now shows Air, Water, and Urban risk breakdown per zone with dominant risk detection." />
                </h2>
                <p className="text-sm text-[#9095a0]">One-click AI scan — Air · Water · Urban breakdown per zone</p>
            </div>

            <button onClick={handleRun} disabled={loading}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#3b5060] to-[#2e6041] hover:opacity-90 text-white py-4 rounded-xl font-bold text-lg transition-opacity disabled:opacity-50 w-full max-w-md mx-auto">
                {loading ? <><LuLoader size={20} className="animate-spin" /> Scanning City…</> : <><LuZap size={20} /> Run Citywide Simulation</>}
            </button>

            {error && <div className="panel-bg border border-[#803030]/30 rounded-xl p-4 text-sm text-[#803030] text-center">{error}</div>}

            {/* ── City-Wide Summary Stats ── */}
            {d1Results.length > 0 && (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { key: 'air', avg: avgAir, icon: LuWind, label: 'City Avg Air Risk', tip: 'Average air quality risk across all 10 zones.' },
                            { key: 'water', avg: avgWater, icon: LuDroplets, label: 'City Avg Water Risk', tip: 'Average water risk across all 10 zones.' },
                            { key: 'urban', avg: avgUrban, icon: LuBuilding2, label: 'City Avg Urban Risk', tip: 'Average urban compliance risk across all 10 zones.' },
                        ].map(c => (
                            <div key={c.key} className="panel-bg panel-border rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CAT_COLORS[c.key]}15`, border: `1px solid ${CAT_COLORS[c.key]}30` }}>
                                        <c.icon size={14} style={{ color: CAT_COLORS[c.key] }} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center" style={{ color: CAT_COLORS[c.key] }}>
                                        {c.label} <Tooltip text={c.tip} />
                                    </span>
                                </div>
                                <div className="text-2xl font-bold font-mono" style={{ color: CAT_COLORS[c.key] }}>{c.avg.toFixed(1)}</div>
                                <div className="w-full h-1.5 bg-[#1e2128] rounded-full overflow-hidden mt-2">
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(c.avg, 100)}%`, backgroundColor: CAT_COLORS[c.key], opacity: 0.7 }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── City-Wide Category Comparison Chart ── */}
                    <div className="panel-bg panel-border rounded-xl p-5">
                        <h4 className="text-sm font-medium text-[#e2e4e9] mb-1 flex items-center gap-1">
                            Zone-wise Category Risk Comparison (D+1)
                            <Tooltip text="Grouped bar chart showing Air, Water, and Urban risk side-by-side for each zone at D+1 horizon." />
                        </h4>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={cityBarData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
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
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color, opacity: 0.8 }}></span> {CAT_LABELS[cat]}
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── Zone Cards ── */}
            {Object.keys(grouped).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(grouped).sort(([a], [b]) => parseInt(a.replace('Zone_', '')) - parseInt(b.replace('Zone_', ''))).map(([zone, horizons]) => {
                        const d1 = horizons[1];
                        const air = d1?.predicted_air || 0;
                        const water = d1?.predicted_water || 0;
                        const urban = d1?.predicted_urban || 0;
                        const dominant = getDominant(air, water, urban);
                        const DomIcon = CAT_ICONS[dominant];

                        // Zone insight text
                        const maxVal = Math.max(air, water, urban);
                        const insight = maxVal > 80
                            ? `${CAT_LABELS[dominant]} critically high at ${maxVal.toFixed(1)} — needs urgent attention`
                            : maxVal > 60
                                ? `${CAT_LABELS[dominant]} elevated at ${maxVal.toFixed(1)} — monitoring advised`
                                : `All categories manageable — ${CAT_LABELS[dominant]} leads at ${maxVal.toFixed(1)}`;

                        return (
                            <div key={zone} className="panel-bg panel-border rounded-xl p-5">
                                {/* Header — Zone + Final Score + Dominant Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-[#e2e4e9]">{zone}</h3>
                                        <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md border font-bold" style={{ color: CAT_COLORS[dominant], borderColor: `${CAT_COLORS[dominant]}30`, backgroundColor: `${CAT_COLORS[dominant]}10` }}>
                                            <DomIcon size={9} /> {CAT_EMOJIS[dominant]}
                                        </span>
                                    </div>
                                    {d1 && (
                                        <span className="text-xl font-bold font-mono" style={{ color: getRiskColor(d1.predicted_final) }}>
                                            {d1.predicted_final.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                {/* Sub-risk Breakdown Bars */}
                                <div className="space-y-2 mb-3">
                                    {['air', 'water', 'urban'].map(cat => {
                                        const val = d1?.[`predicted_${cat}`] || 0;
                                        const Icon = CAT_ICONS[cat];
                                        return (
                                            <div key={cat}>
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold" style={{ color: CAT_COLORS[cat] }}>
                                                        <Icon size={10} /> {CAT_LABELS[cat]}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold" style={{ color: CAT_COLORS[cat] }}>{val.toFixed(1)}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#1e2128] rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(val, 100)}%`, backgroundColor: CAT_COLORS[cat], opacity: 0.7 }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Horizon Final Scores */}
                                <div className="space-y-1.5 mb-3">
                                    {[1, 3, 7].map(h => horizons[h] && (
                                        <div key={h} className="flex items-center justify-between bg-[#1a1c23] border border-[#1e2128] rounded-lg px-3 py-1.5">
                                            <span className="text-xs text-[#9095a0]">D+{h}</span>
                                            <span className="text-sm font-mono font-bold" style={{ color: getRiskColor(horizons[h].predicted_final) }}>
                                                {horizons[h].predicted_final.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Zone Insight */}
                                <div className="bg-[#1a1c23] border border-[#1e2128] rounded-lg p-2">
                                    <p className="text-[10px] text-[#7a828e] leading-relaxed">💡 {insight}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {results.length === 0 && !loading && (
                <div className="panel-bg panel-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
                    <div className="text-4xl">🏙️</div>
                    <p className="text-[#e2e4e9] font-medium">Ready to Scan</p>
                    <p className="text-xs text-[#5e6470] max-w-sm">Press the button above to run the AI model across all 10 city zones. Results will show Air, Water, and Urban risk breakdowns per zone.</p>
                </div>
            )}
        </div>
    );
}
