import { useState, useEffect, useRef } from 'react';
import { LuRss, LuInfo, LuRefreshCw } from 'react-icons/lu';
import { fetchInsightFeed } from '../services/api';

function Tooltip({ text }) {
    return (
        <span className="relative group cursor-help ml-1 inline-flex">
            <LuInfo size={13} className="text-[#5e6470] group-hover:text-[#a0a5b0] transition-colors" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-[#1a1c23] border border-[#3a3f4a] rounded-lg text-[11px] text-[#a0a5b0] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">{text}</span>
        </span>
    );
}

export default function InsightStream() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const intervalRef = useRef(null);

    const loadData = async () => {
        try { setInsights(await fetchInsightFeed()); } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        if (autoRefresh) intervalRef.current = setInterval(loadData, 30000);
        return () => clearInterval(intervalRef.current);
    }, [autoRefresh]);

    if (loading) return <div className="flex items-center justify-center h-64 text-[#5e6470]">Loading…</div>;

    return (
        <div className="flex flex-col gap-6 pb-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-[#e2e4e9] flex items-center gap-2">Intelligence Stream <Tooltip text="Live feed of AI-generated observations about critical risks and anomalies." /></h2>
                    <p className="text-sm text-[#9095a0]">{insights.length} insights</p>
                </div>
                <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${autoRefresh ? 'bg-[#2e6041]/10 border-[#2e6041]/20 text-[#2e6041]' : 'bg-[#1e2128] border-[#3a3f4a] text-[#5e6470]'}`}>
                    <LuRefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} style={autoRefresh ? { animationDuration: '3s' } : {}} />
                    {autoRefresh ? '30s Auto' : 'Paused'}
                </button>
            </div>

            {insights.length === 0 ? (
                <div className="panel-bg panel-border rounded-xl p-12 flex flex-col items-center gap-3">
                    <div className="text-4xl">✅</div>
                    <p className="text-[#e2e4e9] font-medium">No Active Insights</p>
                    <p className="text-xs text-[#5e6470] text-center max-w-sm">All zones are operating within normal parameters.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {insights.map((insight, i) => {
                        const isCrit = insight.toLowerCase().includes('critical');
                        const isAnom = insight.toLowerCase().includes('anomaly');
                        return (
                            <div key={i} className={`panel-bg rounded-xl p-5 border relative overflow-hidden ${isCrit ? 'border-[#803030]/30' : isAnom ? 'border-[#8c7322]/20' : 'border-[#1e2128]'}`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCrit ? 'bg-[#803030]' : isAnom ? 'bg-[#8c7322]' : 'bg-[#3b5060]'}`}></div>
                                <div className="flex items-start gap-3 pl-3">
                                    <LuRss size={16} className={`mt-0.5 shrink-0 ${isCrit ? 'text-[#803030]' : 'text-[#5e6470]'}`} />
                                    <div>
                                        <p className="text-sm text-[#e2e4e9]">{insight}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase mt-2 inline-block ${isCrit ? 'bg-[#803030]/10 text-[#803030] border-[#803030]/20' : isAnom ? 'bg-[#8c7322]/10 text-[#8c7322] border-[#8c7322]/20' : 'bg-[#3b5060]/10 text-[#3b5060] border-[#3b5060]/20'}`}>
                                            {isCrit ? 'CRITICAL' : isAnom ? 'ANOMALY' : 'INFO'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
