"""
Database Migration & Schema Sync Script for FugoSoft
Reads DATABASE_URL from .env file and safely creates/migrates all tables and columns.
Run:
    python migrate.py
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("[ERROR] DATABASE_URL not found in .env file!")
    print("Please configure DATABASE_URL in backend/.env before running migrations.")
    sys.exit(1)

print(f"[*] Initializing database connection from .env configuration...")

try:
    from database import Base, engine
    from models import EmployeeModel
except ImportError:
    try:
        from .database import Base, engine
        from .models import EmployeeModel
    except Exception as e:
        print(f"[ERROR] Failed importing models or database setup: {e}")
        sys.exit(1)

def run_migrations():
    print("[*] Verifying database connectivity...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[+] Successfully connected to the PostgreSQL database.")
    except Exception as e:
        print(f"[!] Database connection failed: {e}")
        print("Please verify that PostgreSQL is running and credentials in .env are correct.")
        sys.exit(1)

    print("[*] Checking and creating missing tables...")
    Base.metadata.create_all(bind=engine)
    print("[+] All tables created or verified via SQLAlchemy metadata.")

    # Inspect table to add any missing columns automatically if table already existed previously
    inspector = inspect(engine)
    if "employees" in inspector.get_table_names():
        existing_cols = {col["name"] for col in inspector.get_columns("employees")}
        print(f"[*] Found {len(existing_cols)} existing columns in 'employees' table.")

        # Define expected columns and their SQL DDL types for schema sync
        schema_definitions = {
            "avatar_url": "VARCHAR(255)",
            "date_of_birth": "VARCHAR(50)",
            "gender": "VARCHAR(20)",
            "employment_type": "VARCHAR(50) DEFAULT 'Full Time'",
            "reporting_manager": "VARCHAR(100)",
            "work_location": "VARCHAR(100) DEFAULT 'Bangalore'",
            "monthly_salary": "VARCHAR(50)",
            "pay_frequency": "VARCHAR(50) DEFAULT 'Monthly'",
            "pf_eligibility": "VARCHAR(10) DEFAULT 'Yes'",
            "uan_number": "VARCHAR(50)",
            "esi_eligibility": "VARCHAR(10) DEFAULT 'Yes'",
            "esi_number": "VARCHAR(50)",
            "basic_salary": "VARCHAR(50)",
            "hra": "VARCHAR(50)",
            "special_allowance": "VARCHAR(50)",
            "other_allowances": "VARCHAR(50)",
            "account_holder_name": "VARCHAR(150)",
            "account_number": "VARCHAR(50)",
            "ifsc_code": "VARCHAR(50)",
            "bank_name": "VARCHAR(100)",
            "branch_name": "VARCHAR(100)",
            "aadhaar_file": "VARCHAR(255)",
            "pan_file": "VARCHAR(255)",
            "experience_file": "VARCHAR(255)",
            "education_file": "VARCHAR(255)",
            "status": "VARCHAR(30) DEFAULT 'Active'",
            "created_at": "TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP"
        }

        with engine.connect() as conn:
            for col_name, ddl in schema_definitions.items():
                if col_name not in existing_cols:
                    print(f"[*] Migrating: Adding missing column '{col_name}' to 'employees' table...")
                    try:
                        conn.execute(text(f"ALTER TABLE employees ADD COLUMN IF NOT EXISTS {col_name} {ddl}"))
                        conn.commit()
                        print(f"[+] Added column '{col_name}' successfully.")
                    except Exception as err:
                        print(f"[-] Warning: Could not add column '{col_name}': {err}")

    print("\n[SUCCESS] Database migration completed successfully!")

if __name__ == "__main__":
    run_migrations()
