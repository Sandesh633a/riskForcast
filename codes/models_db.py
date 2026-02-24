from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String)
    horizon_days = Column(Integer)
    predicted_air = Column(Float)
    predicted_water = Column(Float)
    predicted_urban = Column(Float)
    predicted_final = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)