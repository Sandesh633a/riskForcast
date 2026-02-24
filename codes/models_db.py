from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    zone_id = Column(String, index=True)
    horizon_days = Column(Integer)

    predicted_air = Column(Float)
    predicted_water = Column(Float)
    predicted_urban = Column(Float)
    predicted_final = Column(Float)

    actual_final = Column(Float)          
    error = Column(Float)                 
    absolute_error = Column(Float)        

    created_at = Column(DateTime(timezone=True), server_default=func.now())