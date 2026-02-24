from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
import os
import random

from config import MODEL_DIR
from database import engine, SessionLocal
from models_db import Base, Prediction

app = FastAPI()

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# INPUT SCHEMA
# =========================
class DayData(BaseModel):
    pm25: float
    pm10: float
    no2: float
    humidity: float
    wind_speed: float
    rainfall_last_3_days: float

    water_quality_index: float
    reservoir_level: float
    drainage_quality_index: float

    violations_last_7_days: float
    avg_violation_severity: float
    repeat_offender_rate: float
    population_density: float
    industrial_density: float
    green_cover_percentage: float
    social_vulnerability_index: float

    risk_score: float


class PredictionInput(BaseModel):
    zone_id: str
    history: List[DayData]


# =========================
# LOAD MODELS + CREATE TABLES
# =========================
models = {}

@app.on_event("startup")
def startup_event():
    for h in [1, 3, 7]:
        models[f"air_{h}"] = joblib.load(os.path.join(MODEL_DIR, f"air_risk_t{h}.pkl"))
        models[f"water_{h}"] = joblib.load(os.path.join(MODEL_DIR, f"water_risk_t{h}.pkl"))
        models[f"urban_{h}"] = joblib.load(os.path.join(MODEL_DIR, f"urban_risk_t{h}.pkl"))

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

# =========================
# FEATURE BUILDER
# =========================
def build_features(history):

    if len(history) < 3:
        raise HTTPException(status_code=400, detail="Provide 3 days history")

    today = history[-1]
    y1 = history[-2]
    y2 = history[-3]

    def lagify(field):
        return [
            getattr(y1, field),
            getattr(y2, field),
            getattr(today, field)
        ]

    air = []
    for f in ['pm25','pm10','no2','humidity','wind_speed','rainfall_last_3_days']:
        air += lagify(f)

    water = []
    for f in ['water_quality_index','reservoir_level','drainage_quality_index']:
        water += lagify(f)

    urban = []
    for f in [
        'violations_last_7_days','avg_violation_severity',
        'repeat_offender_rate','population_density',
        'industrial_density','green_cover_percentage',
        'social_vulnerability_index'
    ]:
        urban += lagify(f)

    return np.array([air]), np.array([water]), np.array([urban])


# =========================
# CORE PREDICTION LOGIC
# =========================
def run_prediction(zone_id, history):

    X_air, X_water, X_urban = build_features(history)

    db = SessionLocal()
    results = []

    try:
        for h in [1, 3, 7]:

            air = models[f"air_{h}"].predict(X_air)[0]
            water = models[f"water_{h}"].predict(X_water)[0]
            urban = models[f"urban_{h}"].predict(X_urban)[0]

            final = 0.4 * air + 0.3 * water + 0.3 * urban

            # 🔥 Simulated actual using random noise
            noise = random.uniform(-5, 5)
            actual = final + noise
            error = actual - final
            absolute_error = abs(error)

            record = Prediction(
                zone_id=zone_id,
                horizon_days=h,
                predicted_air=float(air),
                predicted_water=float(water),
                predicted_urban=float(urban),
                predicted_final=float(final),
                actual_final=float(actual),
                error=float(error),
                absolute_error=float(absolute_error)
            )

            db.add(record)

            results.append({
                "zone_id": zone_id,
                "horizon_days": h,
                "predicted_final": float(final),
                "actual_final": float(actual),
                "error": float(error)
            })

        db.commit()

    finally:
        db.close()

    return results


# =========================
# MANUAL MODE
# =========================
@app.post("/predict")
def predict(data: PredictionInput):
    return run_prediction(data.zone_id, data.history)


# =========================
# AUTO MODE (DEMO SIMULATION)
# Generates dummy 3-day history for 10 zones
# =========================
@app.post("/predict-all-auto")
def predict_all_auto():

    zones = [f"Zone_{i}" for i in range(1, 11)]
    all_results = []

    for zone in zones:

        history = []
        for _ in range(3):
            history.append(
                DayData(
                    pm25=random.uniform(100, 200),
                    pm10=random.uniform(200, 300),
                    no2=random.uniform(30, 60),
                    humidity=random.uniform(40, 80),
                    wind_speed=random.uniform(2, 10),
                    rainfall_last_3_days=random.uniform(0, 20),
                    water_quality_index=random.uniform(50, 90),
                    reservoir_level=random.uniform(60, 100),
                    drainage_quality_index=random.uniform(50, 80),
                    violations_last_7_days=random.uniform(5, 20),
                    avg_violation_severity=random.uniform(1, 5),
                    repeat_offender_rate=random.uniform(0.1, 0.5),
                    population_density=random.uniform(10000, 15000),
                    industrial_density=random.uniform(20, 60),
                    green_cover_percentage=random.uniform(10, 40),
                    social_vulnerability_index=random.uniform(0.2, 0.8),
                    risk_score=random.uniform(50, 90)
                )
            )

        result = run_prediction(zone, history)
        all_results.extend(result)

    return all_results


# =========================
# HISTORY FOR GRAPHS
# =========================
@app.get("/history/{zone_id}")
def get_history(zone_id: str):

    db = SessionLocal()

    try:
        records = db.query(Prediction)\
                    .filter(Prediction.zone_id == zone_id)\
                    .order_by(Prediction.created_at.desc())\
                    .limit(30)\
                    .all()

        return [
            {
                "horizon_days": r.horizon_days,
                "predicted_final": r.predicted_final,
                "actual_final": r.actual_final,
                "error": r.error,
                "absolute_error": r.absolute_error,
                "created_at": r.created_at
            }
            for r in records
        ]

    finally:
        db.close()


# =========================
# SYSTEM METRICS
# =========================
@app.get("/system-metrics")
def system_metrics():
    return {
        "active_zones": 10,
        "model_confidence": 97,
        "forecast_range": "D+1 to D+7",
        "mode": "demo_simulation"
    }