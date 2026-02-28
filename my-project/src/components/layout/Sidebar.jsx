import { NavLink, useLocation } from 'react-router-dom';
import {
    LuLayoutDashboard, LuMap, LuLayers, LuTriangleAlert, LuTestTube,
    LuTrophy, LuBrainCircuit, LuRss, LuServerCog, LuChevronLeft,
    LuChevronRight, LuSend, LuZap, LuLandmark
} from 'react-icons/lu';

const NAV_ITEMS = [
    { path: '/overview', label: 'Overview', icon: LuLayoutDashboard, color: '#34d399' },
    { path: '/map', label: 'Risk Atlas', icon: LuMap, color: '#60a5fa' },
    { path: '/zones', label: 'Zone Hub', icon: LuLayers, color: '#a78bfa' },
    { path: '/alerts', label: 'Alerts', icon: LuTriangleAlert, color: '#f87171' },
    { path: '/simulation', label: 'Simulation Lab', icon: LuTestTube, color: '#fbbf24' },
    { path: '/leaderboard', label: 'Leaderboard', icon: LuTrophy, color: '#fb923c' },
    { path: '/model-lab', label: 'Model Lab', icon: LuBrainCircuit, color: '#a78bfa' },
    { path: '/insights', label: 'Insight Stream', icon: LuRss, color: '#2dd4bf' },
    { path: '/predict', label: 'Manual Predict', icon: LuSend, color: '#60a5fa' },
    { path: '/auto-simulate', label: 'Auto Simulation', icon: LuZap, color: '#fbbf24' },
    { path: '/system', label: 'System', icon: LuServerCog, color: '#8a8f9d' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
    const location = useLocation();

    return (
        <aside className={`flex flex-col h-screen bg-[#0a0c10]/95 backdrop-blur-xl border-r border-white/[0.04] transition-all duration-300 ease-in-out relative z-20 ${isCollapsed ? 'w-20' : 'w-64'}`}>

            {/* ── Platform Logo ── */}
            <div className="h-16 flex items-center px-4 border-b border-white/[0.04] shrink-0">
                <div className="flex items-center gap-3 w-full overflow-hidden">
                    <div className="w-9 h-9 rounded-xl shrink-0 bg-gradient-to-br from-[#34d399] to-[#059669] flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col whitespace-nowrap">
                            <span className="text-[14px] font-bold tracking-wide text-white leading-tight">URI Platform</span>
                            <span className="text-[10px] text-[#34d399] uppercase tracking-[0.15em] font-semibold">Urban Risk Intel</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Collapse Toggle ── */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 bg-[#111318] border border-white/[0.1] rounded-full p-1 text-[#8a8f9d] hover:text-white hover:bg-[#1a1d24] hover:border-white/[0.2] transition-all z-30 shadow-lg"
            >
                {isCollapsed ? <LuChevronRight size={14} /> : <LuChevronLeft size={14} />}
            </button>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <NavLink key={item.path} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-white/[0.06] text-white border border-white/[0.08]'
                                    : 'text-[#6a7080] hover:bg-white/[0.03] hover:text-[#c0c4cf] border border-transparent'}`}
                            title={isCollapsed ? item.label : undefined}>

                            {/* Active glow bar */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                                    style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}60` }} />
                            )}

                            <Icon size={20}
                                className="shrink-0 transition-colors duration-200"
                                style={{ color: isActive ? item.color : undefined }} />

                            {!isCollapsed && (
                                <span className="text-[13px] font-medium whitespace-nowrap truncate">
                                    {item.label}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* ── Footer ── */}
            <div className="p-4 border-t border-white/[0.04] shrink-0">
                {!isCollapsed ? (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                        <div className="text-[11px] text-[#6a7080] font-mono">
                            v2.0.4 <span className="text-[#34d399] font-semibold">• Live</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                    </div>
                )}
            </div>
        </aside>
    );
}
