from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
try:
    from database import Base
except ImportError:
    from .database import Base

class EmployeeModel(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    
    # Basic Details
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=False)
    
    # Job Details
    department = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=False)
    employment_type = Column(String(50), default="Full Time")
    joining_date = Column(String(50), nullable=False)
    reporting_manager = Column(String(100), nullable=True)
    work_location = Column(String(100), nullable=False, default="Bangalore")
    
    # Salary & Statutory Details
    monthly_salary = Column(String(50), nullable=True)
    pay_frequency = Column(String(50), default="Monthly")
    pf_eligibility = Column(String(10), default="Yes")
    uan_number = Column(String(50), nullable=True)
    esi_eligibility = Column(String(10), default="Yes")
    esi_number = Column(String(50), nullable=True)
    basic_salary = Column(String(50), nullable=True)
    hra = Column(String(50), nullable=True)
    special_allowance = Column(String(50), nullable=True)
    other_allowances = Column(String(50), nullable=True)
    
    # Bank Details
    account_holder_name = Column(String(150), nullable=True)
    account_number = Column(String(50), nullable=True)
    ifsc_code = Column(String(50), nullable=True)
    bank_name = Column(String(100), nullable=True)
    branch_name = Column(String(100), nullable=True)
    
    # Documents filenames
    aadhaar_file = Column(String(255), nullable=True)
    pan_file = Column(String(255), nullable=True)
    experience_file = Column(String(255), nullable=True)
    education_file = Column(String(255), nullable=True)
    
    status = Column(String(30), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="HR Admin")
    reset_otp = Column(String(10), nullable=True)
    reset_otp_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
