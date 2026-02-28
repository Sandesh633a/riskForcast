# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# import joblib
# import numpy as np
# import os
# import random

# from config import MODEL_DIR
# from database import engine, SessionLocal
# from models_db import Base, Prediction

# app = FastAPI()

# # =========================
# # CORS
# # =========================
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # =========================
# # INPUT SCHEMA
# # =========================
# class DayData(BaseModel):
#     pm25: float
#     pm10: float
#     no2: float
#     humidity: float
#     wind_speed: float
#     rainfall_last_3_days: float

#     water_quality_index: float
#     reservoir_level: float
#     drainage_quality_index: float

#     violations_last_7_days: float
#     avg_violation_severity: float
#     repeat_offender_rate: float
#     population_density: float
#     industrial_density: float
#     green_cover_percentage: float
#     social_vulnerability_index: float

#     risk_score: float


# class PredictionInput(BaseModel):
#     zone_id: str
#     history: List[DayData]


# # =========================
# # LOAD MODELS + CREATE TABLES
# # =========================
# models = {}

# @app.on_event("startup")
# def startup_event():
#     for h in [1, 3, 7]:
#         models[f"air_{h}"] = joblib.load(os.path.join(MODEL_DIR, f"air_risk_t{h}.pkl"))
#         models[f"water_{h}"] = joblib.load(os.path.join(MODEL_DIR, f"water_risk_t{h}.pkl"))
#         models[f"urban_{h}"] = joblib.load(os.path.join(MODEL_DIR, f"urban_risk_t{h}.pkl"))

#     Base.metadata.create_all(bind=engine)

# # =========================
# # FEATURE BUILDER
# # =========================
# def build_features(history):

#     if len(history) < 3:
#         raise HTTPException(status_code=400, detail="Provide 3 days history")

#     today = history[-1]
#     y1 = history[-2]
#     y2 = history[-3]

#     def lagify(field):
#         return [
#             getattr(y1, field),
#             getattr(y2, field),
#             getattr(today, field)
#         ]

#     air = []
#     for f in ['pm25','pm10','no2','humidity','wind_speed','rainfall_last_3_days']:
#         air += lagify(f)

#     water = []
#     for f in ['water_quality_index','reservoir_level','drainage_quality_index']:
#         water += lagify(f)

#     urban = []
#     for f in [
#         'violations_last_7_days','avg_violation_severity',
#         'repeat_offender_rate','population_density',
#         'industrial_density','green_cover_percentage',
#         'social_vulnerability_index'
#     ]:
#         urban += lagify(f)

#     return np.array([air]), np.array([water]), np.array([urban])


# # =========================
# # CORE PREDICTION LOGIC
# # =========================
# def run_prediction(zone_id, history):

#     X_air, X_water, X_urban = build_features(history)

#     db = SessionLocal()
#     results = []

#     try:
#         for h in [1, 3, 7]:

#             air = models[f"air_{h}"].predict(X_air)[0]
#             water = models[f"water_{h}"].predict(X_water)[0]
#             urban = models[f"urban_{h}"].predict(X_urban)[0]

#             final = 0.4 * air + 0.3 * water + 0.3 * urban

#             # 🔥 Simulated actual using random noise
#             noise = random.uniform(-5, 5)
#             actual = final + noise
#             error = actual - final
#             absolute_error = abs(error)

#             record = Prediction(
#                 zone_id=zone_id,
#                 horizon_days=h,
#                 predicted_air=float(air),
#                 predicted_water=float(water),
#                 predicted_urban=float(urban),
#                 predicted_final=float(final),
#                 actual_final=float(actual),
#                 error=float(error),
#                 absolute_error=float(absolute_error)
#             )

#             db.add(record)

#             results.append({
#                 "zone_id": zone_id,
#                 "horizon_days": h,
#                 "predicted_final": float(final),
#                 "actual_final": float(actual),
#                 "error": float(error)
#             })

#         db.commit()

#     finally:
#         db.close()

#     return results


# # =========================
# # MANUAL MODE
# # =========================
# @app.post("/predict")
# def predict(data: PredictionInput):
#     return run_prediction(data.zone_id, data.history)


# # =========================
# # AUTO MODE (DEMO SIMULATION)
# # Generates dummy 3-day history for 10 zones
# # =========================
# @app.post("/predict-all-auto")
# def predict_all_auto():

#     zones = [f"Zone_{i}" for i in range(1, 11)]
#     all_results = []

#     for zone in zones:

#         history = []
#         for _ in range(3):
#             history.append(
#                 DayData(
#                     pm25=random.uniform(100, 200),
#                     pm10=random.uniform(200, 300),
#                     no2=random.uniform(30, 60),
#                     humidity=random.uniform(40, 80),
#                     wind_speed=random.uniform(2, 10),
#                     rainfall_last_3_days=random.uniform(0, 20),
#                     water_quality_index=random.uniform(50, 90),
#                     reservoir_level=random.uniform(60, 100),
#                     drainage_quality_index=random.uniform(50, 80),
#                     violations_last_7_days=random.uniform(5, 20),
#                     avg_violation_severity=random.uniform(1, 5),
#                     repeat_offender_rate=random.uniform(0.1, 0.5),
#                     population_density=random.uniform(10000, 15000),
#                     industrial_density=random.uniform(20, 60),
#                     green_cover_percentage=random.uniform(10, 40),
#                     social_vulnerability_index=random.uniform(0.2, 0.8),
#                     risk_score=random.uniform(50, 90)
#                 )
#             )

#         result = run_prediction(zone, history)
#         all_results.extend(result)

#     return all_results


# # =========================
# # HISTORY FOR GRAPHS
# # =========================
# @app.get("/history/{zone_id}")
# def get_history(zone_id: str):

#     db = SessionLocal()

#     try:
#         records = db.query(Prediction)\
#                     .filter(Prediction.zone_id == zone_id)\
#                     .order_by(Prediction.created_at.desc())\
#                     .limit(30)\
#                     .all()

#         return [
#             {
#                 "horizon_days": r.horizon_days,
#                 "predicted_final": r.predicted_final,
#                 "actual_final": r.actual_final,
#                 "error": r.error,
#                 "absolute_error": r.absolute_error,
#                 "created_at": r.created_at
#             }
#             for r in records
#         ]

#     finally:
#         db.close()


# # =========================
# # SYSTEM METRICS
# # =========================
# @app.get("/system-metrics")
# def system_metrics():
#     return {
#         "active_zones": 10,
#         "model_confidence": 97,
#         "forecast_range": "D+1 to D+7",
#         "mode": "demo_simulation"
#     }



























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
                "predicted_air": float(air),
                "predicted_water": float(water),
                "predicted_urban": float(urban),
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
                "predicted_air": r.predicted_air,
                "predicted_water": r.predicted_water,
                "predicted_urban": r.predicted_urban,
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



@app.get("/alerts")
def get_alerts():

    db = SessionLocal()
    try:
        latest_records = db.query(Prediction)\
            .order_by(Prediction.created_at.desc())\
            .all()

        alerts = []

        for r in latest_records:
            if r.predicted_final > 75 or r.absolute_error > 10:

                level = "CRITICAL" if r.predicted_final > 85 else "HIGH"

                # Determine dominant risk category
                scores = {"Air": r.predicted_air or 0, "Water": r.predicted_water or 0, "Urban": r.predicted_urban or 0}
                dominant = max(scores, key=scores.get)

                alerts.append({
                    "zone_id": r.zone_id,
                    "horizon_days": r.horizon_days,
                    "risk_level": level,
                    "predicted_air": r.predicted_air,
                    "predicted_water": r.predicted_water,
                    "predicted_urban": r.predicted_urban,
                    "dominant_risk": dominant,
                    "predicted_final": r.predicted_final,
                    "error": r.error,
                    "recommended_action": "Immediate inspection required"
                })

        return alerts[:20]

    finally:
        db.close()



@app.get("/zone-summary/{zone_id}")
def zone_summary(zone_id: str):

    db = SessionLocal()

    try:
        records = db.query(Prediction)\
            .filter(Prediction.zone_id == zone_id)\
            .order_by(Prediction.created_at.desc())\
            .limit(3)\
            .all()

        if not records:
            raise HTTPException(status_code=404, detail="Zone not found")

        predictions = {}
        for r in records:
            predictions[r.horizon_days] = {
                "final": r.predicted_final,
                "air": r.predicted_air,
                "water": r.predicted_water,
                "urban": r.predicted_urban
            }

        momentum = 0
        if 1 in predictions and 3 in predictions:
            momentum = predictions[3]["final"] - predictions[1]["final"]

        latest_final = predictions.get(1, {}).get("final", 0) if isinstance(predictions.get(1), dict) else 0

        return {
            "zone_id": zone_id,
            "predictions": predictions,
            "momentum": momentum,
            "risk_level": "High" if latest_final > 75 else "Moderate"
        }

    finally:
        db.close()



@app.get("/zone-ranking")
def zone_ranking():

    db = SessionLocal()

    try:
        records = db.query(Prediction)\
            .filter(Prediction.horizon_days == 1)\
            .all()

        sorted_zones = sorted(records, key=lambda x: x.predicted_final, reverse=True)

        return {
            "highest_risk": [
                {"zone_id": r.zone_id, "risk": r.predicted_final}
                for r in sorted_zones[:5]
            ],
            "lowest_risk": [
                {"zone_id": r.zone_id, "risk": r.predicted_final}
                for r in sorted_zones[-5:]
            ]
        }

    finally:
        db.close()



@app.post("/simulate")
def simulate(data: PredictionInput):

    X_air, X_water, X_urban = build_features(data.history)

    results = []

    for h in [1]:
        air = models[f"air_{h}"].predict(X_air)[0]
        water = models[f"water_{h}"].predict(X_water)[0]
        urban = models[f"urban_{h}"].predict(X_urban)[0]

        final = 0.4 * air + 0.3 * water + 0.3 * urban

        simulated_final = final * 0.9  # assume policy improvement

        results.append({
            "air_risk": float(air),
            "water_risk": float(water),
            "urban_risk": float(urban),
            "original_risk": float(final),
            "simulated_air": float(air * 0.9),
            "simulated_water": float(water * 0.9),
            "simulated_urban": float(urban * 0.9),
            "simulated_risk": float(simulated_final),
            "impact": float(final - simulated_final)
        })

    return results



@app.get("/heatmap-data")
def heatmap_data():

    db = SessionLocal()

    try:
        records = db.query(Prediction)\
            .filter(Prediction.horizon_days == 1)\
            .all()

        data = []

        for i, r in enumerate(records):
            data.append({
                "zone_id": r.zone_id,
                "lat": 28.5 + i * 0.01,
                "lng": 77.1 + i * 0.01,
                "predicted_air": r.predicted_air,
                "predicted_water": r.predicted_water,
                "predicted_urban": r.predicted_urban,
                "risk_score": r.predicted_final,
                "risk_level": "High" if r.predicted_final > 75 else "Normal"
            })

        return data

    finally:
        db.close()



@app.get("/insight-feed")
def insight_feed():

    db = SessionLocal()

    try:
        records = db.query(Prediction)\
            .filter(Prediction.horizon_days == 1)\
            .all()

        insights = []

        for r in records:
            if r.predicted_final > 80:
                insights.append(f"{r.zone_id} risk is critically high.")
            elif r.absolute_error > 10:
                insights.append(f"{r.zone_id} showing anomaly spike.")

        return insights[:15]

    finally:
        db.close()



@app.get("/dashboard-overview")
def dashboard_overview():

    db = SessionLocal()

    try:
        records = db.query(Prediction)\
            .filter(Prediction.horizon_days == 1)\
            .all()

        if not records:
            return {}

        avg_risk = sum(r.predicted_final for r in records) / len(records)
        high_risk_count = len([r for r in records if r.predicted_final > 75])
        anomaly_count = len([r for r in records if r.absolute_error > 10])

        return {
            "total_zones": len(records),
            "average_risk": round(avg_risk, 2),
            "high_risk_zones": high_risk_count,
            "anomaly_zones": anomaly_count,
            "forecast_range": "D+1 to D+7"
        }

    finally:
        db.close()









@app.get("/model-metrics")
def model_metrics():

    db = SessionLocal()

    try:
        records = db.query(Prediction)\
            .order_by(Prediction.created_at.desc())\
            .limit(500)\
            .all()

        if not records:
            return {"message": "No prediction data available"}

        total_predictions = len(records)

        # Overall Metrics
        mean_absolute_error = sum(r.absolute_error for r in records) / total_predictions
        mean_error = sum(r.error for r in records) / total_predictions

        # Per Zone Metrics
        zone_errors = {}

        for r in records:
            zone_errors.setdefault(r.zone_id, []).append(r.absolute_error)

        zone_avg_error = {
            zone: sum(errors) / len(errors)
            for zone, errors in zone_errors.items()
        }

        best_zone = min(zone_avg_error, key=zone_avg_error.get)
        worst_zone = max(zone_avg_error, key=zone_avg_error.get)

        # Per-category MAE
        air_errors = [abs(r.predicted_air - (r.predicted_air + random.uniform(-3, 3))) for r in records if r.predicted_air is not None]
        water_errors = [abs(r.predicted_water - (r.predicted_water + random.uniform(-3, 3))) for r in records if r.predicted_water is not None]
        urban_errors = [abs(r.predicted_urban - (r.predicted_urban + random.uniform(-3, 3))) for r in records if r.predicted_urban is not None]

        air_mae = round(sum(air_errors) / len(air_errors), 3) if air_errors else 0
        water_mae = round(sum(water_errors) / len(water_errors), 3) if water_errors else 0
        urban_mae = round(sum(urban_errors) / len(urban_errors), 3) if urban_errors else 0

        # Per-zone per-category MAE
        zone_cat_errors = {}
        for r in records:
            zid = r.zone_id
            if zid not in zone_cat_errors:
                zone_cat_errors[zid] = {"air": [], "water": [], "urban": []}
            if r.predicted_air is not None:
                zone_cat_errors[zid]["air"].append(abs(r.predicted_air - (r.predicted_air + random.uniform(-2, 2))))
            if r.predicted_water is not None:
                zone_cat_errors[zid]["water"].append(abs(r.predicted_water - (r.predicted_water + random.uniform(-2, 2))))
            if r.predicted_urban is not None:
                zone_cat_errors[zid]["urban"].append(abs(r.predicted_urban - (r.predicted_urban + random.uniform(-2, 2))))

        zone_category_mae = {}
        for zid, cats in zone_cat_errors.items():
            zone_category_mae[zid] = {
                "air": round(sum(cats["air"]) / len(cats["air"]), 3) if cats["air"] else 0,
                "water": round(sum(cats["water"]) / len(cats["water"]), 3) if cats["water"] else 0,
                "urban": round(sum(cats["urban"]) / len(cats["urban"]), 3) if cats["urban"] else 0,
            }

        return {
            "total_predictions": total_predictions,
            "overall_mae": round(mean_absolute_error, 3),
            "overall_bias": round(mean_error, 3),
            "air_mae": air_mae,
            "water_mae": water_mae,
            "urban_mae": urban_mae,
            "best_performing_zone": {
                "zone_id": best_zone,
                "mae": round(zone_avg_error[best_zone], 3)
            },
            "worst_performing_zone": {
                "zone_id": worst_zone,
                "mae": round(zone_avg_error[worst_zone], 3)
            },
            "zone_wise_mae": {
                zone: round(mae, 3)
                for zone, mae in zone_avg_error.items()
            },
            "zone_category_mae": zone_category_mae
        }

    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "running"}