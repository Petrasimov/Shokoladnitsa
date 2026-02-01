from pydantic import BaseModel
from datetime import date, time

class ReservationCreate(BaseModel):
    name: str
    guests: str
    phone: str
    email: str | None = None
    date: date
    time: time
    comment: str | None = None