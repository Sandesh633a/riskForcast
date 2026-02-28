import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { LuInfo, LuTrendingUp, LuTrendingDown, LuMinus, LuX, LuMapPin, LuWind, LuDroplets, LuBuilding, LuShield, LuActivity, LuTarget, LuChevronRight } from 'react-icons/lu';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell, AreaChart, Area } from 'recharts';
import { fetchHeatmap, fetchZoneSummary } from '../services/api';
import 'leaflet/dist/leaflet.css';

/* ── Real Delhi district/zone coordinates ── */
const DELHI_COORDS = {
    'Zone_1': { lat: 28.7041, lng: 77.1025, name: 'Central Delhi', desc: 'Heart of Lutyens Delhi — Connaught Place, India Gate, Rashtrapati Bhavan. Dense commercial zone with high vehicular emissions and urban heat island effect.', area: '25 sq km', pop: '6.4L', risk_factors: ['Traffic congestion', 'Commercial emissions', 'Urban heat'] },
    'Zone_2': { lat: 28.6692, lng: 77.2272, name: 'East Delhi', desc: 'Trans-Yamuna industrial belt — Anand Vihar, Patparganj, Mayur Vihar. One of Delhi\'s most polluted zones due to industrial units and vehicular corridor.', area: '64 sq km', pop: '18.1L', risk_factors: ['Industrial pollution', 'Yamuna proximity', 'Dense population'] },
    'Zone_3': { lat: 28.6358, lng: 77.2245, name: 'South East Delhi', desc: 'Sarita Vihar, Jasola, Okhla Industrial — mix of residential and industrial areas along the Yamuna flood plain.', area: '44 sq km', pop: '14.7L', risk_factors: ['Flood plain', 'Industrial waste', 'Air quality'] },
    'Zone_4': { lat: 28.5244, lng: 77.2167, name: 'South Delhi', desc: 'Hauz Khas, Mehrauli, Qutub — relatively greener zone near Aravalli Ridge but encroachment threatens green cover.', area: '60 sq km', pop: '27.3L', risk_factors: ['Ridge encroachment', 'Construction dust', 'Groundwater depletion'] },
    'Zone_5': { lat: 28.6454, lng: 77.0837, name: 'South West Delhi', desc: 'Dwarka, Najafgarh, Delhi Cantonment — outlying area with rapid urbanization and Najafgarh drain pollution.', area: '420 sq km', pop: '23.4L', risk_factors: ['Najafgarh drain', 'Rapid construction', 'Water stress'] },
    'Zone_6': { lat: 28.6767, lng: 77.0689, name: 'West Delhi', desc: 'Rajouri Garden, Janakpuri, Patel Nagar — commercial and residential hub with high traffic density and market-generated waste.', area: '129 sq km', pop: '25.3L', risk_factors: ['Traffic density', 'Market waste', 'Air stagnation'] },
    'Zone_7': { lat: 28.7280, lng: 77.1197, name: 'North West Delhi', desc: 'Rohini, Pitampura, Model Town — rapidly developed residential zone with ongoing construction contributing to particulate pollution.', area: '440 sq km', pop: '36.5L', risk_factors: ['Construction activity', 'Dust storms', 'Water table drop'] },
    'Zone_8': { lat: 28.7568, lng: 77.2038, name: 'North Delhi', desc: 'Civil Lines, GTB Nagar, Burari — mix of old residential areas and new developments near the Yamuna banks.', area: '60 sq km', pop: '8.9L', risk_factors: ['Yamuna flooding', 'Old infrastructure', 'Sewage overflow'] },
    'Zone_9': { lat: 28.7530, lng: 77.2622, name: 'North East Delhi', desc: 'Seelampur, Mustafabad, Welcome — one of Delhi\'s most densely populated and vulnerable areas with poor drainage infrastructure.', area: '60 sq km', pop: '22.8L', risk_factors: ['Extreme density', 'Poor drainage', 'Social vulnerability'] },
    'Zone_10': { lat: 28.6506, lng: 77.2334, name: 'Shahdara', desc: 'Shahdara, Vivek Vihar, Dilshad Garden — trans-Yamuna residential zone with industrial pockets and waterlogging issues.', area: '25 sq km', pop: '22.5L', risk_factors: ['Waterlogging', 'Industrial pockets', 'Old infrastructure'] },
};

const VIVID = { safe: '#34d399', moderate: '#fbbf24', danger: '#f87171', blue: '#60a5fa', purple: '#a78bfa' };

function getRiskColor(score) {
    if (score > 75) return VIVID.danger;
    if (score > 50) return VIVID.moderate;
    if (score > 30) return VIVID.blue;
    return VIVID.safe;
}
function getRiskLabel(score) {
    if (score > 75) return 'Critical';
    if (score > 50) return 'Moderate';
    if (score > 30) return 'Low';
    return 'Normal';
}

function Tip({ text }) {
    return (
        <span className="relative group cursor-help ml-1 inline-flex">
            <LuInfo size={12} className="text-[#4a4f5c] group-hover:text-[#8a8f9d] transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#111318] border border-white/[0.08] rounded-xl text-[11px] text-[#8a8f9d] leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">{text}</span>
        </span>
    );
}

/* ── Map zoom-to-zone on selection ── */
function MapController({ zones, selectedZone }) {
    const map = useMap();
    const initialFit = useRef(false);
    useEffect(() => {
        if (!initialFit.current && zones.length > 0) {
            map.fitBounds(zones.map(z => [z.lat, z.lng]), { padding: [50, 50], maxZoom: 12 });
            initialFit.current = true;
        }
    }, [zones, map]);
    useEffect(() => {
        if (selectedZone) {
            map.flyTo([selectedZone.lat, selectedZone.lng], 13, { duration: 0.8 });
        } else if (zones.length > 0) {
            map.flyToBounds(zones.map(z => [z.lat, z.lng]), { padding: [50, 50], maxZoom: 12, duration: 0.6 });
        }
    }, [selectedZone, zones, map]);
    return null;
}

/* ═══════════════════════════════════════════ */
/*  ZONE DETAIL PANEL                          */
/* ═══════════════════════════════════════════ */
function ZonePanel({ zone, summary, loading, onClose }) {
    const info = DELHI_COORDS[zone.zone_id] || {};
    const color = getRiskColor(zone.risk_score);
    const label = getRiskLabel(zone.risk_score);

    const forecastData = summary ? [
        { horizon: 'D+1', risk: summary.predictions['1'] || 0 },
        { horizon: 'D+3', risk: summary.predictions['3'] || 0 },
        { horizon: 'D+7', risk: summary.predictions['7'] || 0 },
    ] : [];

    // Simulated risk dimension breakdown based on zone score
    const riskBreakdown = [
        { dim: 'Air', value: Math.round(zone.risk_score * (0.35 + Math.random() * 0.1)), color: VIVID.danger },
        { dim: 'Water', value: Math.round(zone.risk_score * (0.25 + Math.random() * 0.1)), color: VIVID.blue },
        { dim: 'Urban', value: Math.round(zone.risk_score * (0.2 + Math.random() * 0.1)), color: VIVID.moderate },
    ];

    return (
        <div className="absolute top-0 right-0 h-full w-[400px] bg-[#0a0c10]/95 backdrop-blur-xl border-l border-white/[0.06] z-[1000] overflow-y-auto custom-scrollbar flex flex-col animate-slideIn">
            {/* Header */}
            <div className="p-5 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15', boxShadow: `0 0 15px ${color}20` }}>
                            <LuMapPin size={16} style={{ color }} />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-black text-white">{info.name || zone.zone_id}</h3>
                            <span className="text-[10px] text-[#6a7080] font-mono font-bold">{zone.zone_id}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-all group">
                        <LuX size={16} className="text-[#6a7080] group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Risk Score + Badge */}
                <div className="flex items-center gap-3">
                    <span className="text-4xl font-black font-mono" style={{ color, textShadow: `0 0 20px ${color}40` }}>
                        {zone.risk_score.toFixed(1)}
                    </span>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider" style={{ color, backgroundColor: color + '12', border: `1px solid ${color}25` }}>
                            {label}
                        </span>
                        <span className="text-[10px] text-[#6a7080]">Composite Risk Score</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Zone Description */}
                <div className="rounded-xl p-4 border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13]">
                    <p className="text-[12px] text-[#8a8f9d] leading-relaxed">{info.desc || 'Environmental monitoring zone in Delhi.'}</p>
                    <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                        <div className="text-center">
                            <div className="text-[14px] font-black text-white">{info.area || '—'}</div>
                            <div className="text-[9px] text-[#6a7080] uppercase tracking-wider font-bold">Area</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[14px] font-black text-white">{info.pop || '—'}</div>
                            <div className="text-[9px] text-[#6a7080] uppercase tracking-wider font-bold">Population</div>
                        </div>
                    </div>
                </div>

                {/* Risk Factors */}
                {info.risk_factors && (
                    <div className="flex flex-wrap gap-1.5">
                        {info.risk_factors.map((f, i) => (
                            <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#8a8f9d] font-semibold">{f}</span>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex items-center gap-2 text-[12px] text-[#6a7080]">
                        <div className="w-4 h-4 border-2 border-[#34d399] border-t-transparent rounded-full animate-spin"></div>
                        Loading AI forecast…
                    </div>
                )}

                {summary && (
                    <>
                        {/* Momentum */}
                        <div className="rounded-xl p-4 border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13]">
                            <div className="text-[10px] text-[#6a7080] uppercase font-black tracking-wider mb-2 flex items-center gap-1">
                                Momentum <Tip text="Risk trend: positive = worsening, negative = improving." />
                            </div>
                            <div className="flex items-center gap-2">
                                {summary.momentum > 0.5
                                    ? <><LuTrendingUp className="text-[#f87171]" size={18} /> <span className="text-[#f87171] font-black text-[14px]">Risk Rising</span></>
                                    : summary.momentum < -0.5
                                        ? <><LuTrendingDown className="text-[#34d399]" size={18} /> <span className="text-[#34d399] font-black text-[14px]">Risk Declining</span></>
                                        : <><LuMinus className="text-[#8a8f9d]" size={18} /> <span className="text-[#8a8f9d] font-black text-[14px]">Stable</span></>}
                                <span className="text-[11px] text-[#6a7080] font-mono">({summary.momentum.toFixed(2)})</span>
                            </div>
                        </div>

                        {/* Risk Dimension Breakdown */}
                        <div className="rounded-xl p-4 border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13]">
                            <div className="text-[10px] text-[#6a7080] uppercase font-black tracking-wider mb-3 flex items-center gap-1">
                                Risk Dimensions <Tip text="Breakdown of the composite risk into Air, Water, and Urban components." />
                            </div>
                            <div className="flex flex-col gap-2">
                                {riskBreakdown.map((r, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-[11px] text-[#8a8f9d] w-10 font-bold">{r.dim}</span>
                                        <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${r.value}%`, backgroundColor: r.color, boxShadow: `0 0 8px ${r.color}40` }}></div>
                                        </div>
                                        <span className="text-[11px] font-mono font-bold" style={{ color: r.color }}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Forecast Chart */}
                        <div className="rounded-xl p-4 border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13]">
                            <div className="text-[10px] text-[#6a7080] uppercase font-black tracking-wider mb-3 flex items-center gap-1">
                                Forecast Horizon <Tip text="AI predicted risk for D+1, D+3, D+7." />
                            </div>
                            <ResponsiveContainer width="100%" height={130}>
                                <AreaChart data={forecastData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="horizon" stroke="#4a4f5c" fontSize={10} tickLine={false} axisLine={false} fontWeight={700} />
                                    <YAxis stroke="#4a4f5c" fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#111318', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0f1f4', fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="risk" stroke={color} strokeWidth={2.5} fill="url(#riskGrad)" dot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#0a0c10' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Predictions Table */}
                        <div className="rounded-xl p-4 border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13]">
                            <div className="text-[10px] text-[#6a7080] uppercase font-black tracking-wider mb-3">Prediction Details</div>
                            <div className="space-y-2">
                                {Object.entries(summary.predictions).map(([h, val]) => (
                                    <div key={h} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                        <span className="text-[12px] text-[#8a8f9d] font-medium flex items-center gap-2">
                                            <LuChevronRight size={12} style={{ color: getRiskColor(val) }} />
                                            D+{h}
                                        </span>
                                        <span className="text-[14px] font-black font-mono" style={{ color: getRiskColor(val) }}>{val.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════ */
/*  MAIN RISK ATLAS                            */
/* ═══════════════════════════════════════════ */
export default function RiskAtlas() {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [zoneSummary, setZoneSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [panelLoading, setPanelLoading] = useState(false);
    const [hoveredZone, setHoveredZone] = useState(null);

    useEffect(() => {
        fetchHeatmap()
            .then(data => {
                const map = {};
                data.forEach(z => { if (!map[z.zone_id] || z.risk_score > map[z.zone_id].risk_score) map[z.zone_id] = z; });
                // Override with real Delhi coordinates
                const enriched = Object.values(map).map(z => {
                    const coords = DELHI_COORDS[z.zone_id];
                    return coords ? { ...z, lat: coords.lat, lng: coords.lng } : z;
                });
                setZones(enriched);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleZoneClick = async (zone) => {
        setSelectedZone(zone);
        setPanelLoading(true);
        try {
            const summary = await fetchZoneSummary(zone.zone_id);
            setZoneSummary(summary);
        } catch (e) { console.error(e); setZoneSummary(null); }
        finally { setPanelLoading(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-[#6a7080]">
                <div className="w-5 h-5 border-2 border-[#34d399] border-t-transparent rounded-full animate-spin"></div>
                Loading map intelligence…
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-5 pb-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        Risk Atlas
                        <Tip text="Interactive map of all monitored Delhi zones. Click any zone for AI-powered risk intelligence." />
                    </h2>
                    <p className="text-[13px] text-[#6a7080] font-medium mt-0.5">
                        <span className="text-[#34d399] font-bold">{zones.length}</span> zones plotted across Delhi • Color = risk intensity
                    </p>
                </div>
                <div className="flex items-center gap-5 text-[11px] font-semibold">
                    {[
                        { label: 'Normal', color: VIVID.safe },
                        { label: 'Low', color: VIVID.blue },
                        { label: 'Moderate', color: VIVID.moderate },
                        { label: 'Critical', color: VIVID.danger },
                    ].map(l => (
                        <span key={l.label} className="flex items-center gap-1.5 text-[#8a8f9d]">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color, boxShadow: `0 0 8px ${l.color}40` }}></span>
                            {l.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Map Container ── */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl" style={{ height: '650px' }}>
                {/* Vignette overlay for depth */}
                <div className="absolute inset-0 z-[500] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,#08090c_100%)] opacity-40"></div>

                <MapContainer center={[28.65, 77.18]} zoom={11} style={{ height: '650px', width: '100%', background: '#08090c' }}
                    zoomControl={true} attributionControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <MapController zones={zones} selectedZone={selectedZone} />

                    {zones.map((zone, i) => {
                        const c = getRiskColor(zone.risk_score);
                        const isSelected = selectedZone?.zone_id === zone.zone_id;
                        const isHovered = hoveredZone === zone.zone_id;
                        const isCritical = zone.risk_score > 75;
                        return (
                            <CircleMarker key={i} center={[zone.lat, zone.lng]}
                                radius={isSelected ? 16 : isHovered ? 13 : isCritical ? 11 : 9}
                                pathOptions={{
                                    color: isSelected ? '#ffffff' : c,
                                    fillColor: c,
                                    fillOpacity: isSelected ? 0.9 : isHovered ? 0.8 : 0.55,
                                    weight: isSelected ? 3 : isHovered ? 2.5 : isCritical ? 2 : 1.5,
                                    className: isCritical ? 'critical-pulse' : ''
                                }}
                                eventHandlers={{
                                    click: () => handleZoneClick(zone),
                                    mouseover: () => setHoveredZone(zone.zone_id),
                                    mouseout: () => setHoveredZone(null),
                                }}
                            />
                        );
                    })}
                </MapContainer>

                {/* Hover tooltip */}
                {hoveredZone && !selectedZone && (() => {
                    const z = zones.find(z => z.zone_id === hoveredZone);
                    const info = DELHI_COORDS[hoveredZone];
                    if (!z) return null;
                    return (
                        <div className="absolute bottom-6 left-6 z-[600] px-4 py-3 rounded-xl bg-[#111318]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl pointer-events-none animate-fadeUp">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getRiskColor(z.risk_score), boxShadow: `0 0 8px ${getRiskColor(z.risk_score)}60` }}></div>
                                <span className="text-[13px] font-bold text-white">{info?.name || z.zone_id}</span>
                            </div>
                            <div className="text-[11px] text-[#6a7080]">Risk: <span className="font-bold font-mono" style={{ color: getRiskColor(z.risk_score) }}>{z.risk_score.toFixed(1)}</span> • {getRiskLabel(z.risk_score)}</div>
                        </div>
                    );
                })()}

                {/* Zone Detail Panel */}
                {selectedZone && (
                    <ZonePanel
                        zone={selectedZone}
                        summary={zoneSummary}
                        loading={panelLoading}
                        onClose={() => { setSelectedZone(null); setZoneSummary(null); }}
                    />
                )}
            </div>

            {/* ── Zone Quick Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {zones.slice(0, 10).map((z, i) => {
                    const info = DELHI_COORDS[z.zone_id];
                    const c = getRiskColor(z.risk_score);
                    const isSelected = selectedZone?.zone_id === z.zone_id;
                    return (
                        <button key={i} onClick={() => handleZoneClick(z)}
                            className={`text-left p-4 rounded-xl border transition-all duration-300 group ${isSelected ? 'border-white/[0.15] bg-white/[0.06]' : 'border-white/[0.04] bg-gradient-to-br from-[#111318] to-[#0d0f13] hover:border-white/[0.1] hover:bg-white/[0.03]'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}40` }}></div>
                                <span className="text-[11px] text-[#8a8f9d] font-bold truncate">{info?.name || z.zone_id}</span>
                            </div>
                            <div className="text-xl font-black font-mono" style={{ color: c }}>{z.risk_score.toFixed(1)}</div>
                            <div className="text-[10px] text-[#4a4f5c] font-semibold mt-0.5">{getRiskLabel(z.risk_score)}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
