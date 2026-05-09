from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# Local SQLite database used by the backend during development.
DATABASE_URL = "sqlite:///./testcasegen.db"

# check_same_thread=False allows DB access from FastAPI request handling
# threads when using SQLite.
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)


# Session factory used by request-scoped dependencies in main.py.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


# Base class inherited by all SQLAlchemy ORM models.
Base = declarative_base()