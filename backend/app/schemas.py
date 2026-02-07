from pydantic import BaseModel
from datetime import date, time

class ReservationCreate(BaseModel):
    name: str
    guests: int
    phone: str
    date: date
    time: time
    comment: str | None = None