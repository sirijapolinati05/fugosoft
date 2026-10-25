from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os
import shutil
import uuid
from fastapi.staticfiles import StaticFiles

from datetime import datetime, timedelta
import re

try:
    from database import engine, get_db, Base
    from models import EmployeeModel, UserModel
    from schemas import (
        EmployeeCreate, EmployeeUpdate, EmployeeResponse, PaginatedEmployeesResponse, EmployeeStatsResponse,
        UserRegister, UserLogin, UserResponse, UserRequestOTP, UserVerifyOTP, UserResetWithOTP
    )
except ImportError:
    from .database import engine, get_db, Base
    from .models import EmployeeModel, UserModel
    from .schemas import (
        EmployeeCreate, EmployeeUpdate, EmployeeResponse, PaginatedEmployeesResponse, EmployeeStatsResponse,
        UserRegister, UserLogin, UserResponse, UserRequestOTP, UserVerifyOTP, UserResetWithOTP
    )

import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def hash_password(password: str) -> str:
    # PBKDF2 HMAC SHA-256 password hashing with environment-configurable secret salt
    salt = os.getenv("SECRET_SALT", "fugosoft_salt_key_2026")
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

def validate_strong_password(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must include at least one uppercase letter (A-Z).")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must include at least one lowercase letter (a-z).")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must include at least one number (0-9).")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must include at least one special character (!@#$%^&*).")

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FugoSoft Employee Management API", version="1.0.0")

# Enable CORS for React frontend (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def root():
    return {"message": "FugoSoft Employee API is running", "database": "fugosoft"}

@app.get("/api/employees/stats", response_model=EmployeeStatsResponse)
def get_employee_stats(db: Session = Depends(get_db)):
    """
    Returns accurate aggregate employee statistics dynamically computed from PostgreSQL:
    - total_staff: Total number of active/existing employees
    - active_count: Employees with status == 'Active'
    - new_joiners: Employees created or joined in the last 30 days
    - active_percentage: Percentage of active employees
    """
    total_staff = db.query(EmployeeModel).count()
    active_count = db.query(EmployeeModel).filter(EmployeeModel.status == "Active").count()
    
    # Calculate new joiners (records created in the last 30 days, or by joining_date)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    all_employees = db.query(EmployeeModel).all()
    
    new_joiners = 0
    current_year_month = datetime.utcnow().strftime("%Y-%m")
    
    for emp in all_employees:
        is_new = False
        try:
            # Check created_at timestamp
            if emp.created_at and emp.created_at >= thirty_days_ago:
                is_new = True
            # Also check joining_date string if it contains current month or within 30 days
            elif emp.joining_date:
                clean_date = str(emp.joining_date).strip()
                if clean_date.startswith(current_year_month):
                    is_new = True
                else:
                    parsed_date = None
                    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d %b %Y", "%d %B %Y", "%Y/%m/%d"):
                        try:
                            parsed_date = datetime.strptime(clean_date, fmt)
                            break
                        except ValueError:
                            continue
                    if parsed_date and parsed_date >= (datetime.utcnow() - timedelta(days=30)):
                        is_new = True
        except Exception:
            pass
        
        if is_new:
            new_joiners += 1

    active_percentage = round((active_count / total_staff) * 100) if total_staff > 0 else 100

    return {
        "total_staff": total_staff,
        "active_count": active_count,
        "new_joiners": new_joiners,
        "active_percentage": active_percentage
    }

@app.get("/api/employees")
def get_employees(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: Optional[int] = Query(None, ge=1),
    limit: Optional[int] = Query(None, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(EmployeeModel)
    
    if search:
        search_fmt = f"%{search.lower()}%"
        query = query.filter(
            (EmployeeModel.first_name.ilike(search_fmt)) |
            (EmployeeModel.last_name.ilike(search_fmt)) |
            (EmployeeModel.employee_id.ilike(search_fmt)) |
            (EmployeeModel.department.ilike(search_fmt)) |
            (EmployeeModel.designation.ilike(search_fmt)) |
            (EmployeeModel.work_location.ilike(search_fmt)) |
            (EmployeeModel.email.ilike(search_fmt)) |
            (EmployeeModel.phone.ilike(search_fmt))
        )
        
    if department and department != "All Departments":
        query = query.filter(EmployeeModel.department == department)
        
    if status and status != "All Status":
        query = query.filter(EmployeeModel.status == status)
        
    total = query.count()
    ordered_query = query.order_by(EmployeeModel.id.desc())

    if page is not None and limit is not None:
        offset = (page - 1) * limit
        items = ordered_query.offset(offset).limit(limit).all()
        total_pages = (total + limit - 1) // limit if limit > 0 else 1
        return {
            "items": [EmployeeResponse.model_validate(item) for item in items],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": max(1, total_pages)
        }

    return [EmployeeResponse.model_validate(item) for item in ordered_query.all()]

@app.post("/api/employees", response_model=EmployeeResponse)
def create_employee(emp_data: EmployeeCreate, db: Session = Depends(get_db)):
    # Clean email and validate domain format
    clean_email = emp_data.email.strip().lower()
    email_regex = r'^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})$'
    if not re.match(email_regex, clean_email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email address. Please enter a valid email (@gmail.com or @companyname.com)."
        )

    existing_email = db.query(EmployeeModel).filter(EmployeeModel.email.ilike(clean_email)).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Employee with this email address already exists.")

    # Auto-generate employee_id if not supplied or if 'Auto-generated'
    emp_id_input = (emp_data.employee_id or "").strip()
    if not emp_id_input or emp_id_input == "Auto-generated":
        count = db.query(EmployeeModel).count() + 1
        candidate_id = f"EMP{count:03d}"
        while db.query(EmployeeModel).filter(EmployeeModel.employee_id == candidate_id).first():
            count += 1
            candidate_id = f"EMP{count:03d}"
        emp_data.employee_id = candidate_id
    else:
        existing = db.query(EmployeeModel).filter(EmployeeModel.employee_id == emp_id_input).first()
        if existing:
            count = db.query(EmployeeModel).count() + 1
            candidate_id = f"EMP{count:03d}"
            while db.query(EmployeeModel).filter(EmployeeModel.employee_id == candidate_id).first():
                count += 1
                candidate_id = f"EMP{count:03d}"
            emp_data.employee_id = candidate_id

    emp_data.email = clean_email

    try:
        new_employee = EmployeeModel(**emp_data.model_dump())
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)
        return new_employee
    except Exception as e:
        db.rollback()
        print(f"[Error creating employee]: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/employees/{emp_id}", response_model=EmployeeResponse)
def get_employee(emp_id: str, db: Session = Depends(get_db)):
    employee = db.query(EmployeeModel).filter(EmployeeModel.employee_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@app.patch("/api/employees/{emp_id}", response_model=EmployeeResponse)
@app.put("/api/employees/{emp_id}", response_model=EmployeeResponse)
def update_employee(emp_id: str, updates: EmployeeUpdate, db: Session = Depends(get_db)):
    employee = db.query(EmployeeModel).filter(EmployeeModel.employee_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = updates.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        clean_email = update_data["email"].strip().lower()
        email_regex = r'^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})$'
        if not re.match(email_regex, clean_email):
            raise HTTPException(
                status_code=400,
                detail="Invalid email address. Please enter a valid email (@gmail.com or @companyname.com)."
            )
        update_data["email"] = clean_email

    for field, val in update_data.items():
        setattr(employee, field, val)
    
    db.commit()
    db.refresh(employee)
    return employee

@app.delete("/api/employees/{emp_id}")
def delete_employee(emp_id: str, db: Session = Depends(get_db)):
    employee = db.query(EmployeeModel).filter(EmployeeModel.employee_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return {"message": f"Employee {emp_id} deleted successfully"}

class BulkDeleteRequest(BaseModel):
    employee_ids: List[str]

@app.post("/api/employees/bulk-delete")
def bulk_delete_employees(payload: BulkDeleteRequest, db: Session = Depends(get_db)):
    if not payload.employee_ids:
        return {"deleted_count": 0, "message": "No employee IDs provided"}
    
    deleted = db.query(EmployeeModel).filter(EmployeeModel.employee_id.in_(payload.employee_ids)).delete(synchronize_session=False)
    db.commit()
    return {"deleted_count": deleted, "message": f"{deleted} employee(s) deleted successfully"}

try:
    from storage import upload_file_to_storage
except ImportError:
    from .storage import upload_file_to_storage

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    unique_filename = f"{uuid.uuid4().hex[:10]}_{file.filename.replace(' ', '_')}"
    file_url = upload_file_to_storage(file.file, unique_filename, content_type=file.content_type or "application/octet-stream")
    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "url": file_url,
        "status": "uploaded"
    }

@app.post("/api/employees/{emp_id}/avatar")
async def update_employee_avatar(emp_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    employee = db.query(EmployeeModel).filter(EmployeeModel.employee_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    unique_filename = f"avatar_{emp_id}_{uuid.uuid4().hex[:6]}_{file.filename.replace(' ', '_')}"
    avatar_url = upload_file_to_storage(file.file, unique_filename, content_type=file.content_type or "image/jpeg")
    
    employee.avatar_url = avatar_url
    db.commit()
    db.refresh(employee)
    return {"message": "Avatar updated successfully", "avatar_url": avatar_url}

@app.get("/api/documents/view/{filename}")
def view_document_by_filename(filename: str):
    """
    Secure document viewer endpoint that opens files inline in browser.
    """
    clean_filename = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_DIR, clean_filename)

    if os.path.exists(file_path):
        import mimetypes
        mime_type, _ = mimetypes.guess_type(file_path)
        return FileResponse(
            file_path,
            media_type=mime_type or "application/pdf",
            headers={"Content-Disposition": f"inline; filename={clean_filename}"}
        )

    # If S3 / cloud storage is configured, redirect to cloud storage URL
    from storage import AWS_ENDPOINT_URL_S3, S3_BUCKET_NAME
    if AWS_ENDPOINT_URL_S3 and S3_BUCKET_NAME:
        endpoint = AWS_ENDPOINT_URL_S3.rstrip("/")
        cloud_url = f"{endpoint}/{S3_BUCKET_NAME}/{clean_filename}"
        return RedirectResponse(url=cloud_url)

    raise HTTPException(status_code=404, detail="Requested document not found.")

@app.get("/api/employees/{emp_id}/documents/{doc_type}")
def view_employee_document(emp_id: str, doc_type: str, db: Session = Depends(get_db)):
    """
    Directly opens the employee's document (aadhaar, pan, experience, education) in a new browser tab.
    """
    employee = db.query(EmployeeModel).filter(EmployeeModel.employee_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    doc_field_map = {
        "aadhaar": employee.aadhaar_file,
        "pan": employee.pan_file,
        "experience": employee.experience_file,
        "education": employee.education_file
    }

    doc_val = doc_field_map.get(doc_type.lower())
    if not doc_val:
        raise HTTPException(status_code=404, detail=f"No {doc_type} document uploaded for this employee.")

    # If already a full URL
    if doc_val.startswith("http://") or doc_val.startswith("https://"):
        return RedirectResponse(url=doc_val)

    # If local path or filename
    filename = os.path.basename(doc_val)
    return view_document_by_filename(filename)

# ----------------- AUTHENTICATION ENDPOINTS -----------------
@app.post("/api/auth/signup", response_model=UserResponse)
def signup(data: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user (HR / Admin) with email and password.
    """
    clean_email = data.email.strip().lower()
    
    # Check if user already exists
    existing = db.query(UserModel).filter(UserModel.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists. Please log in.")
    
    validate_strong_password(data.password)

    new_user = UserModel(
        full_name=data.full_name.strip(),
        email=clean_email,
        password_hash=hash_password(data.password),
        role=data.role or "HR Admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate a simple bearer token
    token = f"fugo_token_{new_user.id}_{secrets.token_hex(16)}"
    return UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        role=new_user.role,
        token=token
    )

@app.post("/api/auth/login", response_model=UserResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user by email and password.
    """
    clean_email = data.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email == clean_email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    hashed_input = hash_password(data.password)
    if user.password_hash != hashed_input:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = f"fugo_token_{user.id}_{secrets.token_hex(16)}"
    return UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        token=token
    )

def send_otp_email(recipient_email: str, recipient_name: str, otp_code: str) -> bool:
    """
    Sends 6-digit OTP code to user's registered email using SMTP.
    Configured via environment variables:
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_from = os.getenv("SMTP_FROM_EMAIL", smtp_user or "support@fugosoft.com")

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #0e243a; margin: 0 0 4px 0; font-size: 22px; font-weight: 800;">MANUFAC INDUSTRIES</h2>
            <p style="color: #f26522; margin: 0; font-size: 11px; font-weight: bold; letter-spacing: 2px;">PASSWORD RESET VERIFICATION</p>
          </div>
          <p style="font-size: 14px; margin-bottom: 16px;">Hello <b>{recipient_name}</b>,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            We received a request to reset your password. Use the following 6-digit verification code to complete your password reset:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #e45809; background: #fff7ed; padding: 12px 28px; border-radius: 12px; border: 2px dashed #fdba74;">
              {otp_code}
            </span>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
            This code will expire in <b>10 minutes</b>. If you did not request this password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            FugoSoft Employee & HR Management Portal &bull; Secure Automated Delivery
          </p>
        </div>
      </body>
    </html>
    """

    clean_user = smtp_user.strip()
    clean_password = smtp_password.replace(" ", "").strip()
    clean_from = smtp_from.strip()

    # If SMTP is configured with real credentials, send via SMTP
    if clean_user and clean_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Your Password Reset Code: {otp_code} - Manufac Industries"
            msg["From"] = f"Manufac Support <{clean_from}>"
            msg["To"] = recipient_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(clean_user, clean_password)
                server.sendmail(clean_from, recipient_email, msg.as_string())
            print(f"[SMTP] Reset OTP sent successfully to {recipient_email}")
            return True
        except Exception as e:
            print(f"[SMTP ERROR] Failed to send email via SMTP: {e}")
            return False
    else:
        # Fallback log when SMTP credentials are not yet set in .env
        print(f"[DEVELOPMENT MODE] SMTP credentials not set. 6-digit OTP for {recipient_email}: {otp_code}")
        return True

@app.post("/api/auth/forgot-password/request-otp")
def request_password_reset_otp(data: UserRequestOTP, db: Session = Depends(get_db)):
    """
    Step 1: User enters email. Generates 6-digit OTP, saves in DB with 10-minute expiry, and sends via SMTP.
    """
    clean_email = data.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email == clean_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address.")

    # Generate cryptographically secure 6-digit OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    user.reset_otp = otp_code
    user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    email_sent = send_otp_email(user.email, user.full_name, otp_code)
    
    # Check if SMTP is configured
    smtp_configured = bool(os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD"))

    if smtp_configured and not email_sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send verification email via SMTP server. Please verify your SMTP settings or check your spam folder."
        )

    return {
        "message": f"A 6-digit verification code has been sent to {user.email}.",
        "email": user.email,
        "smtp_configured": smtp_configured,
        "dev_code": None if smtp_configured else otp_code
    }

@app.post("/api/auth/forgot-password/verify-otp")
def verify_otp_only(data: UserVerifyOTP, db: Session = Depends(get_db)):
    """
    Step 2: Validates the 6-digit OTP entered by the user.
    """
    clean_email = data.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email == clean_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address.")

    if not user.reset_otp or not user.reset_otp_expiry:
        raise HTTPException(status_code=400, detail="No active reset code found. Please request a new code.")

    if datetime.utcnow() > user.reset_otp_expiry:
        user.reset_otp = None
        user.reset_otp_expiry = None
        db.commit()
        raise HTTPException(status_code=400, detail="The verification code has expired. Please request a new code.")

    if user.reset_otp.strip() != data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check your email and try again.")

    return {"message": "OTP verified successfully. You can now set your new password."}

@app.post("/api/auth/forgot-password/verify-and-reset")
def verify_otp_and_reset_password(data: UserResetWithOTP, db: Session = Depends(get_db)):
    """
    Step 3: Validates the 6-digit OTP, verifies strong new password, and updates password.
    """
    clean_email = data.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email == clean_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email address.")

    if not user.reset_otp or not user.reset_otp_expiry:
        raise HTTPException(status_code=400, detail="No active reset code found. Please request a new code.")

    if datetime.utcnow() > user.reset_otp_expiry:
        user.reset_otp = None
        user.reset_otp_expiry = None
        db.commit()
        raise HTTPException(status_code=400, detail="The verification code has expired. Please request a new code.")

    if user.reset_otp.strip() != data.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check your email and try again.")

    validate_strong_password(data.new_password)

    # Password verified, clear OTP and update password
    user.password_hash = hash_password(data.new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None
    db.commit()

    return {"message": "Password has been successfully updated! You can now sign in with your new password."}


@app.get("/api/auth/me")
def get_current_user_info(db: Session = Depends(get_db)):
    """
    Quick endpoint to verify auth status.
    """
    # Return count of registered users
    total_users = db.query(UserModel).count()
    return {"status": "ok", "total_users": total_users}



if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)

