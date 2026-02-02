from fastapi import FastAPI
from app.schemas import ReservationCreate
from app.database import SessionLocal, engine, Base
from app.models import Reservation
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, BackgroundTasks
from sqlalchemy.orm import Session
from telegram_bot import send_message, reservation_buttons
import time
from datetime import datetime

Base.metadata.create_all(bind=engine)

try:
    with engine.connect() as conn:
        print("✅ Подключение к БД успешно")
        print("✅ Таблица 'reservations' создана/существует")
except Exception as e:
    print(f"❌ Ошибка: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()

@app.post("/api/reservation")
def create_reservation(
    reservation: ReservationCreate, 
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks
    ):
    
    new_reservation = Reservation(**reservation.dict())
    
    db.add(new_reservation)
    
    db.commit()
    
    visit_datetime = datetime.combine(
        reservation.date,
        reservation.time
    )

    background_tasks.add_task(
        send_visit_notification,
        new_reservation.id,
        visit_datetime
    )
    
    db.refresh(new_reservation)
    
    send_message(
        f"""
        📌 Новая бронь
        Имя: {reservation.name}
        Гостей: {reservation.guests}
        Телефон: {reservation.phone}
        Дата: {reservation.date}
        Время: {reservation.time}
        Комментарий: {reservation.comment}
        """
    )
    
    def send_visit_notification(reservation_id: int, visit_datetime: datetime):
        delay =(visit_datetime - datetime.now).total_second()
        
        if delay > 0 :
            time.sleep(delay)
        
        send_message(
            "⏰ Гость должен придти",
            reply_markup=reservation_buttons(reservation_id))
    
    
    
    return new_reservation