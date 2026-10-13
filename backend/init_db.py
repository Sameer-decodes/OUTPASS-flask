import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from config import Config

def init_postgres():
    print("Connecting to PostgreSQL to ensure clean database schema...")
    conn = psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        dbname="college_outpass_db"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    # Drop existing tables to ensure exact schema compliance with Section 6
    print("Recreating tables to match exact assignment specification...")
    cur.execute("DROP TABLE IF EXISTS leave_requests CASCADE;")
    cur.execute("DROP TABLE IF EXISTS users CASCADE;")

    # Create users table
    cur.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL,
            roll_number VARCHAR(50),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
    """)
    print("Created table: users")

    # Create leave_requests table
    cur.execute("""
        CREATE TABLE leave_requests (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            leave_type VARCHAR(20) NOT NULL,
            reason TEXT NOT NULL,
            from_datetime TIMESTAMP NOT NULL,
            to_datetime TIMESTAMP NOT NULL,
            destination VARCHAR(255),
            assigned_approver_role VARCHAR(20) NOT NULL,
            final_status VARCHAR(50) NOT NULL,
            rejection_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
    """)
    print("Created table: leave_requests")

    cur.close()
    conn.close()
    print("PostgreSQL database initialized successfully!")

if __name__ == "__main__":
    init_postgres()
