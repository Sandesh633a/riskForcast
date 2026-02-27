/**
 * Derived Metrics — computed from raw backend data
 */

// Risk std deviation across horizons for a zone
export function computeVolatilityIndex(predictions, zoneId) {
    const zoneData = predictions.filter(p => p.zone_id === zoneId);
    if (zoneData.length < 2) return 0;
    const risks = zoneData.map(p => p.final_risk_prediction);
    const mean = risks.reduce((a, b) => a + b, 0) / risks.length;
    const variance = risks.reduce((a, v) => a + (v - mean) ** 2, 0) / risks.length;
    return Math.sqrt(variance);
}

// Delta of risk between D+1 → D+3 → D+7
export function computeAccelerationRate(predictions, zoneId) {
    const zoneData = predictions.filter(p => p.zone_id === zoneId);
    const d1 = zoneData.find(p => p.horizon_days === 1);
    const d7 = zoneData.find(p => p.horizon_days === 7);
    if (!d1 || !d7) return 0;
    return d7.final_risk_prediction - d1.final_risk_prediction;
}

// Inverse of volatility (higher = more stable)
export function computeStabilityScore(predictions, zoneId) {
    const vol = computeVolatilityIndex(predictions, zoneId);
    return vol === 0 ? 100 : Math.max(0, 100 - vol * 10);
}

// Confidence from residual std (lower residual = higher confidence)
export function computeConfidenceScore(residuals) {
    if (!residuals || residuals.length === 0) return 0;
    const values = residuals.map(r => Math.abs(r.residual));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.max(0, Math.min(100, 100 - mean * 2));
}

// Sort zones by D+1 final risk, descending
export function computeZoneRanking(predictions) {
    const d1 = predictions.filter(p => p.horizon_days === 1);
    return [...d1].sort((a, b) => b.final_risk_prediction - a.final_risk_prediction);
}

// Which domain contributes most per zone
export function computeDomainDominance(predictions, zoneId) {
    const d1 = predictions.filter(p => p.zone_id === zoneId && p.horizon_days === 1)[0];
    if (!d1) return 'unknown';
    const domains = { air: d1.air_risk, water: d1.water_risk, urban: d1.urban_risk };
    return Object.entries(domains).sort((a, b) => b[1] - a[1])[0][0];
}

// Risk color based on value
export function riskColor(value) {
    if (value >= 70) return 'var(--crimson)';
    if (value >= 40) return 'var(--risk-mid)';
    return 'var(--emerald)';
}

// Risk level label
export function riskLevel(value) {
    if (value >= 70) return 'High';
    if (value >= 40) return 'Moderate';
    return 'Low';
}

// Anomaly count from residual array
export function countAnomalies(residuals) {
    if (!residuals) return 0;
    return residuals.filter(r => r.anomaly_flag === 1).length;
}

// Average risk across all zones for D+1
export function avgRisk(predictions) {
    const d1 = predictions.filter(p => p.horizon_days === 1);
    if (d1.length === 0) return 0;
    return d1.reduce((s, p) => s + p.final_risk_prediction, 0) / d1.length;
}
