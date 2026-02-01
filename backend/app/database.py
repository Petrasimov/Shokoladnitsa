from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus

password = "nikonpye1520"
encoded_password = quote_plus(password)

DATABASE_URL = f"postgresql://postgres:{encoded_password}@localhost:5432/reservation"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()