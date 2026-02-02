from sqlalchemy import Column, Integer, String, Date, Time, DateTime, Boolean
from datetime import datetime
from app.database import Base

class Reservation(Base):
    __tablename__ = "reservation"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    guests = Column(Integer, nullable=False)
    
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    
    comment = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    appeared = Column(Boolean, nullable=True)
    check_amout = Column(Integer, nullable=True)