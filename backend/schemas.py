from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class EmployeeCreate(BaseModel):
    employee_id: Optional[str] = None
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    email: str
    phone: str
    
    department: str
    designation: str
    employment_type: Optional[str] = "Full Time"
    joining_date: str
    reporting_manager: Optional[str] = None
    work_location: str
    
    monthly_salary: Optional[str] = None
    pay_frequency: Optional[str] = "Monthly"
    pf_eligibility: Optional[str] = "Yes"
    uan_number: Optional[str] = None
    esi_eligibility: Optional[str] = "Yes"
    esi_number: Optional[str] = None
    basic_salary: Optional[str] = None
    hra: Optional[str] = None
    special_allowance: Optional[str] = None
    other_allowances: Optional[str] = None
    
    account_holder_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    
    aadhaar_file: Optional[str] = None
    pan_file: Optional[str] = None
    experience_file: Optional[str] = None
    education_file: Optional[str] = None
    status: Optional[str] = "Active"

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    employment_type: Optional[str] = None
    joining_date: Optional[str] = None
    reporting_manager: Optional[str] = None
    work_location: Optional[str] = None
    monthly_salary: Optional[str] = None
    pay_frequency: Optional[str] = None
    pf_eligibility: Optional[str] = None
    uan_number: Optional[str] = None
    esi_eligibility: Optional[str] = None
    esi_number: Optional[str] = None
    basic_salary: Optional[str] = None
    hra: Optional[str] = None
    special_allowance: Optional[str] = None
    other_allowances: Optional[str] = None
    account_holder_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    aadhaar_file: Optional[str] = None
    pan_file: Optional[str] = None
    experience_file: Optional[str] = None
    education_file: Optional[str] = None
    status: Optional[str] = None

class EmployeeResponse(EmployeeCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaginatedEmployeesResponse(BaseModel):
    items: list[EmployeeResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class EmployeeStatsResponse(BaseModel):
    total_staff: int
    active_count: int
    new_joiners: int
    active_percentage: int

class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    role: Optional[str] = "HR Admin"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    token: str

    class Config:
        from_attributes = True

class UserRequestOTP(BaseModel):
    email: str

class UserVerifyOTP(BaseModel):
    email: str
    otp: str

class UserResetWithOTP(BaseModel):
    email: str
    otp: str
    new_password: str


