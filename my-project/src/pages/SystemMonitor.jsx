import { useState, useEffect } from 'react';
import { LuServer, LuCpu, LuActivity, LuDatabase, LuInfo, LuShieldCheck } from 'react-icons/lu';
import { fetchHealth, fetchSystemMetrics } from '../services/api';

function Tooltip({ text }) {
    return (
        <span className="relative group cursor-help ml-1 inline-flex">
            <LuInfo size={13} className="text-[#5e6470] group-hover:text-[#a0a5b0] transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-[#1a1c23] border border-[#3a3f4a] rounded-lg text-[11px] text-[#a0a5b0] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">{text}</span>
        </span>
    );
}

export default function SystemMonitor() {
    const [health, setHealth] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [healthError, setHealthError] = useState(false);

    useEffect(() => {
        Promise.all([
            fetchHealth().catch(() => { setHealthError(true); return null; }),
            fetchSystemMetrics().catch(() => null)
        ]).then(([h, m]) => { setHealth(h); setMetrics(m); })
            .finally(() => setLoading(false));
    }, []);

    const isOnline = health?.status === 'running';

    if (loading) return <div className="flex items-center justify-center h-64 text-[#5e6470]">Loading system status…</div>;

    return (
        <div className="flex flex-col gap-6 pb-6 max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-semibold text-[#e2e4e9] flex items-center gap-2">
                    System Operations
                    <Tooltip text="Shows the health of the backend server, AI model confidence, and operational mode. Green dot = server is responding." />
                </h2>
                <p className="text-sm text-[#9095a0]">Enterprise-grade infrastructure monitoring</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col gap-4">
                    <span className="text-xs uppercase tracking-widest text-[#7a828e] font-semibold flex items-center">
                        <LuActivity size={14} className="mr-1.5" /> API Health
                        <Tooltip text="Whether the backend server is up and responding to requests. Green = online." />
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                            {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2e6041] opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-[#4caf50]' : 'bg-[#803030]'}`}></span>
                        </div>
                        <span className="text-xl font-bold text-[#e2e4e9]">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>

                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col gap-4">
                    <span className="text-xs uppercase tracking-widest text-[#7a828e] font-semibold flex items-center">
                        <LuCpu size={14} className="mr-1.5" /> Model Confidence
                        <Tooltip text="How confident the AI is in its predictions. Based on historical accuracy. Above 90% is production-grade." />
                    </span>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold font-mono text-[#e2e4e9]">{metrics?.model_confidence || '—'}</span>
                        <span className="text-sm text-[#7a828e] mb-1">%</span>
                    </div>
                </div>

                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col gap-4">
                    <span className="text-xs uppercase tracking-widest text-[#7a828e] font-semibold flex items-center">
                        <LuDatabase size={14} className="mr-1.5" /> Active Zones
                        <Tooltip text="Number of geographic zones the system is actively monitoring and generating predictions for." />
                    </span>
                    <span className="text-3xl font-bold font-mono text-[#e2e4e9]">{metrics?.active_zones || '—'}</span>
                </div>

                <div className="panel-bg panel-border rounded-xl p-6 flex flex-col gap-4">
                    <span className="text-xs uppercase tracking-widest text-[#7a828e] font-semibold flex items-center">
                        <LuServer size={14} className="mr-1.5" /> Mode
                        <Tooltip text="Operating mode of the system. 'demo_simulation' means it's running with simulated data for demonstration." />
                    </span>
                    <span className="text-lg font-bold text-[#a0a5b0]">{metrics?.mode || '—'}</span>
                </div>
            </div>

            <div className="panel-bg panel-border rounded-xl p-6">
                <h3 className="text-sm font-medium text-[#e2e4e9] mb-4 flex items-center gap-1">
                    System Configuration
                    <Tooltip text="Key operational parameters of the deployed AI system." />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1a1c23] border border-[#1e2128] rounded-lg p-4 flex justify-between">
                        <span className="text-sm text-[#9095a0]">Forecast Range</span>
                        <span className="text-sm font-bold text-[#e2e4e9]">{metrics?.forecast_range || '—'}</span>
                    </div>
                    <div className="bg-[#1a1c23] border border-[#1e2128] rounded-lg p-4 flex justify-between">
                        <span className="text-sm text-[#9095a0]">Backend URL</span>
                        <span className="text-sm font-mono text-[#3b5060]">riskforcast.onrender.com</span>
                    </div>
                    <div className="bg-[#1a1c23] border border-[#1e2128] rounded-lg p-4 flex justify-between">
                        <span className="text-sm text-[#9095a0]">Health Status</span>
                        <span className={`text-sm font-bold ${isOnline ? 'text-[#2e6041]' : 'text-[#803030]'}`}>{health?.status || 'unknown'}</span>
                    </div>
                    <div className="bg-[#1a1c23] border border-[#1e2128] rounded-lg p-4 flex justify-between">
                        <span className="text-sm text-[#9095a0]">Risk Components</span>
                        <span className="text-sm text-[#e2e4e9]">Air (40%) + Water (30%) + Urban (30%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
