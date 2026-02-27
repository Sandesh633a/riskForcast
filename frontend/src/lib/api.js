import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 15000,
});

// ── Predictions (multi-horizon, multi-domain) ──
export const fetchPredictions = async () => {
    const { data } = await API.get('/predict');
    return data;
};

// ── Residual / Anomaly Detection ──
export const fetchAirResidual = async () => {
    const { data } = await API.get('/air-residual');
    return data;
};

export const fetchWaterResidual = async () => {
    const { data } = await API.get('/water-residual');
    return data;
};

export const fetchUrbanResidual = async () => {
    const { data } = await API.get('/urban-residual');
    return data;
};

// ── SHAP Explainability ──
export const fetchAirExplain = async () => {
    const { data } = await API.get('/air-explain');
    return data;
};

export const fetchWaterExplain = async () => {
    const { data } = await API.get('/water-explain');
    return data;
};

export const fetchUrbanExplain = async () => {
    const { data } = await API.get('/urban-explain');
    return data;
};

// ── Retrain ──
export const fetchRetrainStatus = async () => {
    const { data } = await API.get('/retrain-status');
    return data;
};

export const triggerRetrain = async () => {
    const { data } = await API.post('/retrain', {}, {
        headers: { 'x-api-key': 'SUPER_SECRET_KEY' },
    });
    return data;
};

// ── Data Insert ──
export const addData = async (payload) => {
    const { data } = await API.post('/add-data', payload);
    return data;
};

// ── Health ──
export const healthCheck = async () => {
    const { data } = await API.get('/health');
    return data;
};
