from fastapi import FastAPI
from app.schemas import ReservationCreate
from app.database import SessionLocal, engine, Base
from app.models import Reservation
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from sqlalchemy.orm import Session

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
def create_reservation(reservation: ReservationCreate, db: Session = Depends(get_db)):
    
    new_reservation = Reservation(**reservation.dict())
    
    db.add(new_reservation)
    
    db.commit()
    
    db.refresh(new_reservation)
    
    return new_reservation