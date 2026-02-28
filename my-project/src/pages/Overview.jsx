import { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import CountUp from 'react-countup';
import { LuActivity, LuTriangleAlert, LuMapPin, LuServerCog, LuInfo, LuShieldCheck, LuArrowUpRight, LuArrowDownRight, LuBrainCircuit, LuTarget } from 'react-icons/lu';
import { fetchOverview, fetchSystemMetrics, fetchHeatmap } from '../services/api';

const VIVID_COLORS = { safe: '#34d399', moderate: '#fbbf24', danger: '#f87171', blue: '#60a5fa', purple: '#a78bfa' };

function Tooltip({ text }) {
  return (
    <span className="relative group cursor-help ml-1 inline-flex">
      <LuInfo size={13} className="text-[#4a4f5c] group-hover:text-[#8a8f9d] transition-colors" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#111318] border border-white/[0.08] rounded-xl text-[11px] text-[#8a8f9d] leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">
        {text}
      </span>
    </span>
  );
}

function KPICard({ title, value, icon: Icon, subtitle, alert, tooltip, color }) {
  const accentColor = color || (alert ? VIVID_COLORS.danger : VIVID_COLORS.blue);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] p-5 flex flex-col gap-3 hover:border-white/[0.12] transition-all duration-500">
      {/* Glow on hover */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ backgroundColor: accentColor + '15' }}></div>
      <div className="relative flex items-center justify-between">
        <span className="text-[#8a8f9d] text-[11px] font-bold uppercase tracking-wider flex items-center">
          {title}
          {tooltip && <Tooltip text={tooltip} />}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentColor + '10' }}>
          <Icon size={16} style={{ color: accentColor }} />
        </div>
      </div>
      <div className="relative text-3xl font-black text-white">{value}</div>
      {subtitle && <div className="relative text-[12px] text-[#6a7080] font-medium">{subtitle}</div>}
    </div>
  );
}

function HealthGauge({ score }) {
  const color = score < 40 ? VIVID_COLORS.safe : score < 65 ? VIVID_COLORS.moderate : VIVID_COLORS.danger;
  const label = score < 40 ? 'Healthy' : score < 65 ? 'Moderate' : 'At Risk';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width="150" height="150" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 8px ${color}60)` }} />
        <text x="60" y="54" textAnchor="middle" fill="white" fontSize="30" fontWeight="900">{Math.round(score)}</text>
        <text x="60" y="74" textAnchor="middle" fill={color} fontSize="11" fontWeight="600">{label}</text>
      </svg>
      <span className="text-[12px] text-[#6a7080] flex items-center gap-1 font-semibold">
        City Health Score
        <Tooltip text="Average predicted risk across all zones. Lower = safer. Below 40 = Healthy." />
      </span>
    </div>
  );
}

function ConfidenceGauge({ pct }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  const color = VIVID_COLORS.blue;
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width="150" height="150" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 8px ${color}60)` }} />
        <text x="60" y="54" textAnchor="middle" fill="white" fontSize="28" fontWeight="900">{pct}%</text>
        <text x="60" y="74" textAnchor="middle" fill={color} fontSize="11" fontWeight="600">Reliable</text>
      </svg>
      <span className="text-[12px] text-[#6a7080] flex items-center gap-1 font-semibold">
        AI Confidence
        <Tooltip text="Model prediction accuracy. Above 90% = highly reliable." />
      </span>
    </div>
  );
}

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOverview(), fetchSystemMetrics(), fetchHeatmap()])
      .then(([ov, met, hm]) => {
        const zoneMap = {};
        hm.forEach(z => { if (!zoneMap[z.zone_id] || z.risk_score > zoneMap[z.zone_id].risk_score) zoneMap[z.zone_id] = z; });
        setOverview(ov); setMetrics(met); setZones(Object.values(zoneMap));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-[#6a7080]">
        <div className="w-5 h-5 border-2 border-[#34d399] border-t-transparent rounded-full animate-spin"></div>
        Loading intelligence data…
      </div>
    </div>
  );
  if (!overview) return <div className="flex items-center justify-center h-64 text-[#f87171] font-semibold">Failed to load data</div>;

  const totalZones = zones.length;
  const high = zones.filter(z => z.risk_score > 75).length;
  const moderate = zones.filter(z => z.risk_score >= 40 && z.risk_score <= 75).length;
  const normal = zones.filter(z => z.risk_score < 40).length;
  const anomalyCount = overview.anomaly_zones || 0;
  const riskDist = [
    { name: 'Normal', value: normal || totalZones, fill: VIVID_COLORS.safe },
    { name: 'Moderate', value: moderate, fill: VIVID_COLORS.moderate },
    { name: 'High', value: high, fill: VIVID_COLORS.danger },
  ].filter(d => d.value > 0);

  const barData = zones.map(z => ({ zone: z.zone_id, risk: z.risk_score })).sort((a, b) => {
    return parseInt(a.zone.replace('Zone_', '')) - parseInt(b.zone.replace('Zone_', ''));
  });

  const barColor = (risk) => risk > 75 ? VIVID_COLORS.danger : risk > 40 ? VIVID_COLORS.moderate : VIVID_COLORS.safe;

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* ── Hero Banner ── */}
      <div className="relative rounded-2xl overflow-hidden h-44 border border-white/[0.06] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#34d399]/10 via-[#60a5fa]/5 to-[#a78bfa]/10" style={{ backgroundSize: '300% 100%', animation: 'gradientMove 10s ease-in-out infinite' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090c] via-transparent to-[#08090c]/80"></div>
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="relative z-10 px-8">
          <h2 className="text-3xl font-black text-white tracking-tight">Executive Control Room</h2>
          <p className="text-[14px] text-[#8a8f9d] mt-1 font-medium">Real-time city intelligence from <span className="text-[#34d399] font-bold">{totalZones}</span> monitored zones</p>
        </div>

        {/* Right side badges */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#34d399]/[0.08] border border-[#34d399]/20 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
            <span className="text-[11px] font-bold text-[#34d399] tracking-wider uppercase">Live</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#60a5fa]/[0.06] border border-[#60a5fa]/15 rounded-xl">
            <LuBrainCircuit size={12} className="text-[#60a5fa]" />
            <span className="text-[11px] font-bold text-[#60a5fa] tracking-wider uppercase">AI Active</span>
          </div>
        </div>
      </div>

      {/* ── Gauges + KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="rounded-2xl p-6 flex items-center justify-center border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(circle at 50% 50%, ${VIVID_COLORS.safe}06, transparent 70%)` }}></div>
          <HealthGauge score={overview.average_risk} />
        </div>
        <div className="rounded-2xl p-6 flex items-center justify-center border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(circle at 50% 50%, ${VIVID_COLORS.blue}06, transparent 70%)` }}></div>
          <ConfidenceGauge pct={metrics?.model_confidence || 97} />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <KPICard title="Total Zones" value={<CountUp end={totalZones} duration={1.5} />} icon={LuTarget} subtitle="Active monitoring" color={VIVID_COLORS.safe} tooltip="Geographic areas the AI is tracking." />
          <KPICard title="High Risk" value={<CountUp end={high} duration={1.5} />} icon={LuTriangleAlert} alert={high > 0} subtitle="Zones above 75" color={VIVID_COLORS.danger} tooltip="Zones with risk score > 75 needing attention." />
          <KPICard title="Anomalies" value={<CountUp end={anomalyCount} duration={1.5} />} icon={LuActivity} alert={anomalyCount > 0} subtitle="Prediction errors > 10" color={VIVID_COLORS.moderate} tooltip="Zones where prediction was far off reality." />
          <KPICard title="Forecast" value={overview.forecast_range} icon={LuServerCog} subtitle={`Mode: ${metrics?.mode || 'N/A'}`} color={VIVID_COLORS.purple} tooltip="AI prediction time window." />
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Pie */}
        <div className="rounded-2xl p-6 min-h-[320px] border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <h3 className="relative text-[14px] font-bold text-white tracking-wide mb-1 flex items-center gap-1">
            Risk Distribution
            <Tooltip text="Zones by risk category: Normal (safe), Moderate (watch), High (danger)." />
          </h3>
          <p className="relative text-[12px] text-[#6a7080] mb-4 font-medium">Breakdown of {totalZones} zones by risk level</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: '#111318', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f0f1f4', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="relative flex justify-center gap-6 mt-2">
            {riskDist.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-[#8a8f9d] font-medium">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.fill, boxShadow: `0 0 6px ${d.fill}40` }}></span>
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Zone Bar Chart */}
        <div className="rounded-2xl p-6 min-h-[320px] border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <h3 className="relative text-[14px] font-bold text-white tracking-wide mb-1 flex items-center gap-1">
            Zone Risk Comparison
            <Tooltip text="Each zone's predicted risk score. Taller bars = higher risk." />
          </h3>
          <p className="relative text-[12px] text-[#6a7080] mb-4 font-medium">D+1 predicted risk score per zone</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="zone" stroke="#4a4f5c" fontSize={10} tickLine={false} axisLine={false} fontWeight={600} />
              <YAxis stroke="#4a4f5c" fontSize={10} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#111318', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f0f1f4', fontSize: '12px' }} />
              <Bar dataKey="risk" name="Risk Score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={barColor(entry.risk)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Live Status Bar ── */}
      <div className="rounded-2xl p-4 flex items-center gap-5 overflow-x-auto border border-white/[0.06] bg-gradient-to-r from-[#111318] to-[#0d0f13]">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#34d399]/[0.1]">
            <LuShieldCheck size={14} className="text-[#34d399]" />
          </div>
          <span className="text-[12px] text-[#34d399] font-bold">System Active</span>
        </div>
        <div className="w-px h-5 bg-white/[0.06] shrink-0"></div>
        <span className="text-[12px] text-[#6a7080] shrink-0">Confidence: <strong className="text-[#60a5fa]">{metrics?.model_confidence}%</strong></span>
        <div className="w-px h-5 bg-white/[0.06] shrink-0"></div>
        <span className="text-[12px] text-[#6a7080] shrink-0">Avg Risk: <strong className="text-[#fbbf24]">{overview.average_risk}</strong></span>
        <div className="w-px h-5 bg-white/[0.06] shrink-0"></div>
        <span className="text-[12px] text-[#6a7080] shrink-0">Forecast: <strong className="text-[#a78bfa]">{overview.forecast_range}</strong></span>
        <div className="w-px h-5 bg-white/[0.06] shrink-0"></div>
        <span className="text-[12px] text-[#6a7080] shrink-0">Model: <strong className="text-white">{metrics?.mode || 'N/A'}</strong></span>
      </div>
    </div>
  );
}