import csv 
from app.database import SessionLocal
from app.models import Reservation

def export_reservations_csv(path="reservations.csv"):
    db = SessionLocal()
    reservations = db.query(Reservation).all()
    
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "ID", "Имя", "Гостей", "Телефон",
            "Дата", "Время", "Пришёл", "Чек"
        ])
        
        for r in reservations:
            writer.writerow([
                r.id, r.name, r.guests, r.phone,
                r.date, r.time, r.appeared, r.check
            ])
            
    db.close()
    return path