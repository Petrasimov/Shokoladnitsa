from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import time
import asyncio

from app.schemas import ReservationCreate
from app.database import SessionLocal, engine, Base
from app.models import Reservation
from app.telegram_bot import send_message, reservation_buttons

# ===============================
# Инициализация БД
# ===============================
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# Dependency БД
# ===============================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===============================
# ФОНОВАЯ ЗАДАЧА
# ===============================
async def send_visit_notification(reservation_id: int, visit_datetime: datetime):
    delay = (visit_datetime - datetime.now()).total_seconds()

    if delay <= 0:
        return

    await asyncio.sleep(delay)

    db = SessionLocal()
    try:
        reservation = db.get(Reservation, reservation_id)
        if not reservation:
            return

        await send_message(
            text = (
                f"⏰ *Гость по записи*\n\n"
                f"👤 Имя: {reservation.name}\n"
                f"👥 Гостей: {reservation.guests}\n"
                f"📞 Телефон: {reservation.phone}\n"
                f"🕒 Время: {reservation.time}\n"
            ),
            reply_markup=reservation_buttons(reservation.id)
        )
    finally:
        db.close()

# ===============================
# ЭНДПОИНТ СОЗДАНИЯ БРОНИ
# ===============================
@app.post("/api/reservation")
async def create_reservation(
    reservation: ReservationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    new_reservation = Reservation(**reservation.dict())

    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    # 1️⃣ Сразу отправляем сообщение
    await send_message(
        (
            f"📌 *Новая бронь*\n\n"
            f"👤 Имя: {reservation.name}\n"
            f"👥 Гостей: {reservation.guests}\n"
            f"📞 Телефон: {reservation.phone}\n"
            f"📅 Дата: {reservation.date}\n"
            f"🕒 Время: {reservation.time}\n"
            f"💬 Комментарий: {reservation.comment or '—'}"
        )
    )


    # 2️⃣ Планируем отложенное сообщение
    visit_datetime = datetime.combine(
        new_reservation.date,
        new_reservation.time
    )

    background_tasks.add_task(
        send_visit_notification,
        new_reservation.id,
        visit_datetime
    )

    return new_reservation
