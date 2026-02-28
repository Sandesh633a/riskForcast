const API_BASE = 'https://riskforcast.onrender.com';

async function fetchJSON(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
}

async function postJSON(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
}

// ─── GET Endpoints ───────────────────────────────────────
export const fetchHealth = () => fetchJSON('/health');
export const fetchOverview = () => fetchJSON('/dashboard-overview');
export const fetchSystemMetrics = () => fetchJSON('/system-metrics');
export const fetchHeatmap = () => fetchJSON('/heatmap-data');
export const fetchAlerts = () => fetchJSON('/alerts');
export const fetchZoneSummary = (zoneId) => fetchJSON(`/zone-summary/${zoneId}`);
export const fetchHistory = (zoneId) => fetchJSON(`/history/${zoneId}`);
export const fetchRanking = () => fetchJSON('/zone-ranking');
export const fetchModelMetrics = () => fetchJSON('/model-metrics');
export const fetchInsightFeed = () => fetchJSON('/insight-feed');

// ─── POST Endpoints ──────────────────────────────────────
export const postSimulate = (payload) => postJSON('/simulate', payload);
export const postPredict = (payload) => postJSON('/predict', payload);
export const postPredictAllAuto = () => postJSON('/predict-all-auto', {});
