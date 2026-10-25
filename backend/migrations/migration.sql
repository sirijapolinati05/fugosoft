-- ==============================================================================
-- FugoSoft HRMS - PostgreSQL Database Migration Script
-- Compatible with: pgAdmin 4 / psql / PostgreSQL 12+
-- Description: Creates the 'employees' table with all required columns, constraints,
--              and indexes for the FugoSoft Employee Management System.
-- ==============================================================================

-- 1. Create the employees table if it does not already exist
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,

    -- Basic Details
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    date_of_birth VARCHAR(50),
    gender VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,

    -- Job Details
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Full Time',
    joining_date VARCHAR(50) NOT NULL,
    reporting_manager VARCHAR(100),
    work_location VARCHAR(100) NOT NULL DEFAULT 'Bangalore',

    -- Salary & Statutory Details
    monthly_salary VARCHAR(50),
    pay_frequency VARCHAR(50) DEFAULT 'Monthly',
    pf_eligibility VARCHAR(10) DEFAULT 'Yes',
    uan_number VARCHAR(50),
    esi_eligibility VARCHAR(10) DEFAULT 'Yes',
    esi_number VARCHAR(50),
    basic_salary VARCHAR(50),
    hra VARCHAR(50),
    special_allowance VARCHAR(50),
    other_allowances VARCHAR(50),

    -- Bank Details
    account_holder_name VARCHAR(150),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(50),
    bank_name VARCHAR(100),
    branch_name VARCHAR(100),

    -- Documents & Attachments
    aadhaar_file VARCHAR(255),
    pan_file VARCHAR(255),
    experience_file VARCHAR(255),
    education_file VARCHAR(255),

    -- Status & Audit Timestamps
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS ix_employees_id ON employees(id);
CREATE INDEX IF NOT EXISTS ix_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS ix_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS ix_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS ix_employees_status ON employees(status);

-- 3. In case the table already existed previously with fewer columns,
--    the following idempotent statements ensure missing columns are safely added:
ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Full Time';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS reporting_manager VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_location VARCHAR(100) DEFAULT 'Bangalore';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS monthly_salary VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pay_frequency VARCHAR(50) DEFAULT 'Monthly';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pf_eligibility VARCHAR(10) DEFAULT 'Yes';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS uan_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS esi_eligibility VARCHAR(10) DEFAULT 'Yes';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS esi_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS basic_salary VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hra VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS special_allowance VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS other_allowances VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(150);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS aadhaar_file VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pan_file VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS experience_file VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS education_file VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Active';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
