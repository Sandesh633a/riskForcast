import { useState, useEffect } from 'react';
import { LuTrendingUp, LuTrendingDown, LuMinus, LuTrophy, LuInfo, LuArrowUpDown } from 'react-icons/lu';
import { fetchRanking } from '../services/api';

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

export default function Leaderboard() {
    const [ranking, setRanking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortMode, setSortMode] = useState('highest');

    useEffect(() => {
        fetchRanking()
            .then(setRanking)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64 text-[#5e6470]">Loading rankings…</div>;
    if (!ranking) return <div className="flex items-center justify-center h-64 text-[#803030]">Failed to load</div>;

    const maxRisk = Math.max(...(ranking.highest_risk || []).map(z => z.risk), 100);

    return (
        <div className="flex flex-col gap-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-[#e2e4e9] tracking-tight flex items-center gap-2">
                        Zone Rankings
                        <Tooltip text="Competitive analysis of all zones. Shows the 5 highest-risk and 5 lowest-risk zones based on the AI's latest D+1 predictions." />
                    </h2>
                    <p className="text-sm text-[#9095a0]">Top & bottom zones by predicted risk score</p>
                </div>
                <button onClick={() => setSortMode(s => s === 'highest' ? 'lowest' : 'highest')}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#3a3f4a] text-[#a0a5b0] hover:bg-[#1e2128] transition-colors">
                    <LuArrowUpDown size={12} /> {sortMode === 'highest' ? 'Showing Highest First' : 'Showing Lowest First'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Highest Risk */}
                <div className={`flex flex-col gap-4 ${sortMode === 'lowest' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#803030]"></div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#a0a5b0]">
                            Highest Risk Zones
                        </h3>
                    </div>
                    {(ranking.highest_risk || []).map((zone, i) => (
                        <div key={`h-${i}`} className="panel-bg border border-[#803030]/20 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#803030]"></div>
                            <div className="flex items-center gap-4 pl-2">
                                <div className="w-8 h-8 rounded-full bg-[#1e2128] border border-[#3a3f4a] flex items-center justify-center text-[#5e6470] font-mono text-sm">
                                    #{i + 1}
                                </div>
                                <div>
                                    <div className="text-[#e2e4e9] font-medium">{zone.zone_id}</div>
                                    <div className="text-xs text-[#5e6470] mt-0.5">D+1 Prediction</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden sm:block w-32 h-1.5 bg-[#1e2128] rounded-full overflow-hidden">
                                    <div className="bg-[#803030] h-full rounded-full transition-all" style={{ width: `${(zone.risk / maxRisk) * 100}%` }}></div>
                                </div>
                                <span className="text-xl font-bold text-[#803030] w-16 text-right font-mono">{zone.risk.toFixed(1)}</span>
                            </div>
                        </div>
                    ))}
                    {(ranking.highest_risk || []).length === 0 && <p className="text-sm text-[#5e6470]">No high-risk zones.</p>}
                </div>

                {/* Lowest Risk */}
                <div className={`flex flex-col gap-4 ${sortMode === 'lowest' ? 'order-1' : 'order-2'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#2e6041]"></div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#a0a5b0]">
                            Most Stable Zones
                        </h3>
                    </div>
                    {(ranking.lowest_risk || []).map((zone, i) => (
                        <div key={`l-${i}`} className="panel-bg border border-[#2e6041]/20 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2e6041]"></div>
                            <div className="flex items-center gap-4 pl-2">
                                <div className="w-8 h-8 rounded-full bg-[#1e2128] border border-[#3a3f4a] flex items-center justify-center text-[#5e6470] font-mono text-sm">
                                    <LuTrophy size={12} className={i === 0 ? 'text-[#8c7322]' : ''} />
                                </div>
                                <div>
                                    <div className="text-[#e2e4e9] font-medium">{zone.zone_id}</div>
                                    <div className="text-xs text-[#5e6470] mt-0.5">D+1 Prediction</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden sm:block w-32 h-1.5 bg-[#1e2128] rounded-full overflow-hidden">
                                    <div className="bg-[#2e6041] h-full rounded-full transition-all" style={{ width: `${(zone.risk / maxRisk) * 100}%` }}></div>
                                </div>
                                <span className="text-xl font-bold text-[#2e6041] w-16 text-right font-mono">{zone.risk.toFixed(1)}</span>
                            </div>
                        </div>
                    ))}
                    {(ranking.lowest_risk || []).length === 0 && <p className="text-sm text-[#5e6470]">No low-risk zones.</p>}
                </div>
            </div>
        </div>
    );
}
