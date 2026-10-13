import os
from datetime import time
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask settings
    SECRET_KEY = os.getenv("SECRET_KEY", "college-outpass-secret-key-2026")
    
    # Database settings
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "sampost")
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "college_outpass_db")
    
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "college-jwt-outpass-key-2026")
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", 24))

    # College Working Days and Timings Configuration
    # Weekdays: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
    COLLEGE_WORKING_DAYS = [0, 1, 2, 3, 4]  # Monday to Friday
    COLLEGE_OFF_DAYS = [5, 6]  # Saturday, Sunday
    
    # Working hours: 09:00 AM to 05:00 PM (17:00)
    COLLEGE_START_TIME = time(9, 0)
    COLLEGE_END_TIME = time(17, 0)
    
    # College Holidays (format YYYY-MM-DD)
    COLLEGE_HOLIDAYS = [
        "2026-01-26",  # Republic Day
        "2026-03-25",  # Holi
        "2026-08-15",  # Independence Day
        "2026-10-02",  # Gandhi Jayanti
        "2026-10-20",  # Dussehra
        "2026-11-08",  # Diwali
        "2026-12-25",  # Christmas
    ]
