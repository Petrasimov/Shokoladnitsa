from datetime import date, timedelta
from sqlalchemy import func, cast, Integer
from app.database import SessionLocal
from app.models import Reservation

def get_stats():
    db = SessionLocal()
    
    total = db.query(Reservation).count()
    came = db.query(Reservation).filter(Reservation.appeared == True).count()
    no_show = db.query(Reservation).filter(Reservation.appeared == False).count()

    guests_sum = db.query(func.sum(cast(Reservation.guests, Integer))).scalar() or 0
    avg_guests = guests_sum / total if total else 0
    
    db.close()
    
    return {
        "total": total,
        "total_guests": guests_sum,
        "came": came,
        "no_show": no_show,
        "avg_guests": round(avg_guests, 2)
    }
    

def bookings_per_day(days=30):
    db = SessionLocal()
    try:
        start_date = date.today() - timedelta(days=days)
        
        rows = (
            db.query(
                Reservation.date,
                func.count(Reservation.id)
            )
            .filter(Reservation.date >= start_date)
            .group_by(Reservation.date)
            .order_by(Reservation.date)
            .all()
        )
        
        return rows
    finally:
        db.close()
        

def guests_per_day(year: int, month: int):
    db = SessionLocal()
    
    try:
        rows = (
            db.query(
                Reservation.date,
                func.sum(cast(Reservation.guests, Integer))
            )
            .filter(
                func.extract('year', Reservation.date) == year,
                func.extract('month', Reservation.date) == month
            )
            .group_by(Reservation.date)
            .order_by(Reservation.date)
            .all()
        )
        
        return {
            "dates": [r[0].strftime("%d.%m") for r in rows],
            "guests": [r[1] for r in rows]
        }
        
    finally:
        db.close()
        

def came_vs_no_show():
    db = SessionLocal()
    
    try:
        came = db.query(Reservation).filter(Reservation.appeared == True).count()
        no_show = db.query(Reservation).filter(Reservation.appeared == False).count()
        
        return {
            "came": came,
            "no_show": no_show
        }
    finally:
        db.close()
        

def popular_times():
    db = SessionLocal()
    try:
        rows = (
            db.query(
                Reservation.time,
                func.count(Reservation.id)
            )
            .group_by(Reservation.time)
            .order_by(Reservation.time)
            .all()
        )
        
        return {
            "time": [r[0] for r in rows],
            "count": [r[1] for r in rows]
        }
        
    finally:
        db.close()