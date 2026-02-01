from sqlalchemy import Column, Integer, String, Date, Time, DateTime
from datetime import datetime
from app.database import Base

class Reservation(Base):
    __tablename__ = "reservation"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    guests = Column(String)
    phone = Column(String)
    email = Column(String, nullable=True)
    date = Column(Date)
    time = Column(Time)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)