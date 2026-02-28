import { useLocation, Link } from 'react-router-dom';
import { LuBell, LuUser, LuLandmark, LuRadar } from 'react-icons/lu';

const ROUTE_TITLES = {
    '/overview': 'Executive Overview',
    '/map': 'Risk Atlas',
    '/zones': 'Zone Intelligence Hub',
    '/alerts': 'Alerts Command Center',
    '/simulation': 'Simulation Lab',
    '/leaderboard': 'Leaderboard & Ranking',
    '/model-lab': 'AI Model Laboratory',
    '/insights': 'Insight Stream',
    '/predict': 'Manual AI Prediction',
    '/auto-simulate': 'Citywide Auto Simulation',
    '/system': 'System Monitor',
};

export default function TopNavbar() {
    const location = useLocation();
    const currentTitle = ROUTE_TITLES[Object.keys(ROUTE_TITLES).find(path => location.pathname.startsWith(path))] || 'Command Center';

    return (
        <header className="h-14 flex items-center justify-between px-6 bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/[0.04] sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <h1 className="text-[15px] font-bold text-white tracking-tight">{currentTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Back to Landing */}
                <Link to="/delhi"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#6a7080] hover:text-white hover:bg-white/[0.04] transition-all text-xs font-semibold group">
                    <LuLandmark size={14} className="group-hover:text-[#34d399] transition-colors" />
                    <span className="hidden sm:inline">Landing Page</span>
                </Link>

                <div className="h-5 w-px bg-white/[0.06]"></div>

                {/* System Status — vivid */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#34d399]/[0.06] border border-[#34d399]/15">
                    <LuRadar size={14} className="text-[#34d399]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                    <span className="text-[11px] font-bold text-[#34d399] tracking-wide uppercase">Online</span>
                </div>

                <div className="h-5 w-px bg-white/[0.06]"></div>

                {/* Notifications */}
                <button className="relative p-2 text-[#6a7080] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all">
                    <LuBell size={17} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f87171] border border-[#08090c] rounded-full animate-pulse"></span>
                </button>

                {/* Avatar */}
                <button className="flex items-center gap-2 p-0.5 rounded-full hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.08]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#6366f1] flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(167,139,250,0.2)]">
                        S
                    </div>
                </button>
            </div>
        </header>
    );
}
