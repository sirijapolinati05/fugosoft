from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
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
    from models import EmployeeModel
    from schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse, PaginatedEmployeesResponse, EmployeeStatsResponse
except ImportError:
    from .database import engine, get_db, Base
    from .models import EmployeeModel
    from .schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse, PaginatedEmployeesResponse, EmployeeStatsResponse

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

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)

