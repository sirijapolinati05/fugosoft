import { CustomSelect } from './components/CustomSelect';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  IndianRupee,
  FileText,
  ShieldCheck,
  BarChart2,
  Settings,
  Search,
  Bell,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Upload,
  Pencil,
  Clock,
  UserCheck,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit3,
  X,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  MapPin,
  CreditCard,
  Sparkles,
  Plus,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Zap,
  Activity,
  Menu
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  initialsBg: string;
  jobTitle: string;
  department: string;
  date: string;
  location: string;
  status: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  employmentType?: string;
  reportingManager?: string;
  monthlySalary?: string;
  bankName?: string;
  accountNumber?: string;
  aadhaarFile?: string;
  panFile?: string;
  experienceFile?: string;
  educationFile?: string;
  rawData?: any;
}

export default function App() {
  const [activeNav, setActiveNav] = useState('Employees');
  // viewMode: 'leave-management' or 'add-employee'
  const [viewMode, setViewMode] = useState<'leave-management' | 'add-employee'>('leave-management');
  
  // Registration Flow Step: 0 = "Let's get started", 1 = "Basic Details", ..., 6 = "Review"
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [sideCardTab, setSideCardTab] = useState<'basic' | 'job' | 'salary' | 'bank' | 'documents'>('basic');
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [viewDocUrls, setViewDocUrls] = useState<{
    aadhaar?: string | null;
    pan?: string | null;
    experience?: string | null;
    education?: string | null;
  }>({});
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void> | void;
    isDeleting?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 4000);
  };

  // Form State for Step 1: Basic Details
  const [basicDetails, setBasicDetails] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    emailAddress: '',
    phoneNumber: ''
  });

  // Form State for Step 2: Job Details
  const [jobDetails, setJobDetails] = useState({
    employeeId: '',
    department: '',
    designation: '',
    employmentType: 'Full Time',
    joiningDate: '',
    reportingManager: '',
    workLocation: 'Bangalore'
  });

  // Form State for Step 3: Salary Details
  const [salaryDetails, setSalaryDetails] = useState({
    monthlySalary: '',
    payFrequency: 'Monthly',
    pfEligibility: 'Yes',
    uanNumber: '',
    esiEligibility: 'Yes',
    esiNumber: '',
    basicSalary: '',
    hra: '',
    specialAllowance: '',
    otherAllowances: ''
  });

  // Form State for Step 4: Bank Details
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: ''
  });

  // Form State for Step 5: Documents
  const [documents, setDocuments] = useState({
    aadhaar: null as File | null,
    pan: null as File | null,
    experience: null as File | null,
    education: null as File | null
  });

  // Helper to open employee in Review Step (step 6)
  const openReviewForEmployee = (emp: Employee, viewOnly: boolean) => {
    setSelectedEmployee(null);
    setActiveActionId(null);
    const raw = emp.rawData || {};
    const parts = (raw.first_name || emp.name).trim().split(' ');
    const fName = raw.first_name || parts[0] || '';
    const lName = raw.last_name || parts.slice(1).join(' ') || '';

    setBasicDetails({
      firstName: fName,
      lastName: lName,
      dateOfBirth: raw.date_of_birth || emp.dateOfBirth || '',
      gender: raw.gender || emp.gender || 'Female',
      emailAddress: raw.email || emp.email || '',
      phoneNumber: raw.phone || emp.phone || ''
    });

    setJobDetails({
      employeeId: raw.employee_id || emp.id,
      department: raw.department || emp.department,
      designation: raw.designation || emp.jobTitle,
      employmentType: raw.employment_type || emp.employmentType || 'Full Time',
      joiningDate: raw.joining_date || emp.date,
      reportingManager: raw.reporting_manager || emp.reportingManager || 'Amit Verma',
      workLocation: raw.work_location || emp.location
    });

    setSalaryDetails({
      monthlySalary: raw.monthly_salary || emp.monthlySalary || '75,000',
      payFrequency: raw.pay_frequency || 'Monthly',
      pfEligibility: raw.pf_eligibility || 'Yes',
      uanNumber: raw.uan_number || '100904839201',
      esiEligibility: raw.esi_eligibility || 'Yes',
      esiNumber: raw.esi_number || '31002948201',
      basicSalary: raw.basic_salary || '40,000',
      hra: raw.hra || '20,000',
      specialAllowance: raw.special_allowance || '10,000',
      otherAllowances: raw.other_allowances || '5,000'
    });

    setBankDetails({
      accountHolderName: raw.account_holder_name || `${fName} ${lName}`,
      bankAccountNumber: raw.account_number || emp.accountNumber || '987654321098',
      confirmAccountNumber: raw.account_number || emp.accountNumber || '987654321098',
      ifscCode: raw.ifsc_code || 'HDFC0001234',
      bankName: raw.bank_name || emp.bankName || 'HDFC Bank',
      branchName: raw.branch_name || 'Indiranagar'
    });

    setViewDocUrls({
      aadhaar: raw.aadhaar_file || emp.aadhaarFile || null,
      pan: raw.pan_file || emp.panFile || null,
      experience: raw.experience_file || emp.experienceFile || null,
      education: raw.education_file || emp.educationFile || null
    });
    setDocuments({ aadhaar: null, pan: null, experience: null, education: null });

    if (viewOnly) {
      setEditingEmployee(null);
      setIsViewMode(true);
    } else {
      setEditingEmployee(emp);
      setIsViewMode(false);
    }

    setViewMode('add-employee');
    setCurrentStep(6);
  };

  // Employee Directory State (Connected to PostgreSQL via FastAPI)
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [roleFilter, setRoleFilter] = useState('All Designations');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [bankFilter, setBankFilter] = useState('All Banks');
  const [joiningYearFilter, setJoiningYearFilter] = useState('All Joining Dates');
  const [salaryRangeFilter, setSalaryRangeFilter] = useState('All Salaries');

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeFilterAccordion, setActiveFilterAccordion] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasActiveAdvancedFilters =
    locationFilter !== 'All Locations' ||
    roleFilter !== 'All Designations' ||
    genderFilter !== 'All Genders' ||
    bankFilter !== 'All Banks' ||
    joiningYearFilter !== 'All Joining Dates' ||
    salaryRangeFilter !== 'All Salaries';

  const resetAllFilters = () => {
    setLocationFilter('All Locations');
    setRoleFilter('All Designations');
    setGenderFilter('All Genders');
    setBankFilter('All Banks');
    setJoiningYearFilter('All Joining Dates');
    setSalaryRangeFilter('All Salaries');
    setDepartmentFilter('All Departments');
    setStatusFilter('All Status');
  };

  // Export filtered employees to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all employees matching current filter without pagination
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (departmentFilter !== 'All Departments') params.append('department', departmentFilter);
      if (statusFilter !== 'All Status') params.append('status', statusFilter);
      
      const res = await fetch(`/api/employees?${params.toString()}`);
      if (!res.ok) {
        showToast('Failed to fetch employee records for export', 'error');
        return;
      }
      const data = await res.json();
      const records: any[] = Array.isArray(data) ? data : (data.items || []);

      if (records.length === 0) {
        showToast('No employee records found to export.', 'info');
        return;
      }

      // Filter by location and role if set
      const toExport = records.filter((emp: any) => {
        const matchesLoc = locationFilter === 'All Locations' || (emp.work_location || 'Bangalore') === locationFilter;
        const matchesRole = roleFilter === 'All Designations' || emp.designation === roleFilter;
        return matchesLoc && matchesRole;
      });

      if (toExport.length === 0) {
        showToast('No records match the active location / role filters.', 'info');
        return;
      }

      // Generate CSV
      const headers = [
        'Employee ID',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Date of Birth',
        'Gender',
        'Department',
        'Designation',
        'Employment Type',
        'Joining Date',
        'Work Location',
        'Status',
        'Monthly Salary',
        'Pay Frequency',
        'PF Eligibility',
        'UAN Number',
        'ESI Eligibility',
        'ESI Number',
        'Bank Name',
        'Account Number',
        'IFSC Code',
        'Branch'
      ];

      const csvRows = [
        headers.join(','),
        ...toExport.map((emp) => [
          `"${emp.employee_id || ''}"`,
          `"${(emp.first_name || '').replace(/"/g, '""')}"`,
          `"${(emp.last_name || '').replace(/"/g, '""')}"`,
          `"${(emp.email || '').replace(/"/g, '""')}"`,
          `"${(emp.phone || '').replace(/"/g, '""')}"`,
          `"${emp.date_of_birth || ''}"`,
          `"${emp.gender || ''}"`,
          `"${(emp.department || '').replace(/"/g, '""')}"`,
          `"${(emp.designation || '').replace(/"/g, '""')}"`,
          `"${emp.employment_type || ''}"`,
          `"${emp.joining_date || ''}"`,
          `"${(emp.work_location || '').replace(/"/g, '""')}"`,
          `"${emp.status || 'Active'}"`,
          `"${emp.monthly_salary || ''}"`,
          `"${emp.pay_frequency || ''}"`,
          `"${emp.pf_eligibility || ''}"`,
          `"${emp.uan_number || ''}"`,
          `"${emp.esi_eligibility || ''}"`,
          `"${emp.esi_number || ''}"`,
          `"${(emp.bank_name || '').replace(/"/g, '""')}"`,
          `"${(emp.account_number || '').replace(/"/g, '""')}"`,
          `"${(emp.ifsc_code || '').replace(/"/g, '""')}"`,
          `"${(emp.branch_name || '').replace(/"/g, '""')}"`
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_export_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export employee records');
    } finally {
      setIsExporting(false);
    }
  };
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({ total_staff: 0, active_count: 0, new_joiners: 0, active_percentage: 100 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 15;

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/employees/stats');
      if (res.ok) {
        const statsData = await res.json();
        setStats(statsData);
      }
    } catch (e) {
      console.error('Failed to fetch employee stats:', e);
    }
  };

  const handleBulkDelete = () => {
    if (selectedLeaves.length === 0) return;
    const isSingle = selectedLeaves.length === 1;
    const desc = isSingle
      ? `Are you sure you want to delete employee ${selectedLeaves[0]}? This action cannot be undone.`
      : `Are you sure you want to delete ${selectedLeaves.length} selected employees? This action cannot be undone.`;

    setDeleteModal({
      isOpen: true,
      title: isSingle ? 'Delete Employee' : `Delete ${selectedLeaves.length} Employees`,
      description: desc,
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));
        try {
          const res = await fetch('/api/employees/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_ids: selectedLeaves })
          });

          if (res.ok) {
            const data = await res.json();
            showToast(data.message || `${selectedLeaves.length} employee(s) deleted successfully!`, 'success');
            if (selectedEmployee && selectedLeaves.includes(selectedEmployee.id)) {
              setSelectedEmployee(null);
            }
            setSelectedLeaves([]);
            await fetchEmployees();
            await fetchStats();
          } else {
            showToast('Failed to delete selected employees', 'error');
          }
        } catch (err) {
          console.error('Bulk delete error:', err);
          showToast('Failed to connect to backend for bulk deletion', 'error');
        } finally {
          setDeleteModal(prev => ({ ...prev, isOpen: false, isDeleting: false }));
        }
      }
    });
  };

  // Fetch employees from FastAPI backend
  const fetchEmployees = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (departmentFilter !== 'All Departments') params.append('department', departmentFilter);
      if (statusFilter !== 'All Status') params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', String(pageSize));

      const res = await fetch(`/api/employees?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const colors = [
          'bg-blue-100 text-blue-600',
          'bg-indigo-100 text-indigo-600',
          'bg-rose-100 text-rose-600',
          'bg-emerald-100 text-emerald-600',
          'bg-amber-100 text-amber-600',
          'bg-sky-100 text-sky-600',
          'bg-purple-100 text-purple-600',
          'bg-pink-100 text-pink-600',
          'bg-teal-100 text-teal-600'
        ];

        const rawList = Array.isArray(data) ? data : (data.items || []);
        const total = Array.isArray(data) ? data.length : (data.total || 0);
        const tPages = Array.isArray(data) ? Math.ceil(data.length / pageSize) || 1 : (data.total_pages || 1);

        setTotalCount(total);
        setTotalPages(tPages);
        setCurrentPage(page);

        // Format backend rows into Employee interface
        const formatted: Employee[] = rawList.map((item: any, idx: number) => {
          const initials = `${(item.first_name || '').charAt(0)}${(item.last_name || '').charAt(0)}`.toUpperCase() || 'EM';
          return {
            id: item.employee_id,
            name: `${item.first_name} ${item.last_name}`,
            avatarUrl: item.avatar_url || undefined,
            initials: initials,
            initialsBg: colors[idx % colors.length],
            jobTitle: item.designation,
            department: item.department,
            date: item.joining_date,
            location: item.work_location || 'Bangalore',
            status: item.status || 'Active',
            email: item.email,
            phone: item.phone,
            dateOfBirth: item.date_of_birth || '',
            gender: item.gender || '',
            employmentType: item.employment_type || 'Full Time',
            reportingManager: item.reporting_manager || 'Amit Verma',
            monthlySalary: item.monthly_salary || '75,000',
            bankName: item.bank_name || 'HDFC Bank',
            accountNumber: item.account_number || '987654321098',
            aadhaarFile: item.aadhaar_file || undefined,
            panFile: item.pan_file || undefined,
            experienceFile: item.experience_file || undefined,
            educationFile: item.education_file || undefined,
            rawData: item
          };
        });
        setEmployees(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch employees from backend:', err);
    } finally {
      setIsLoading(false);
    }
    fetchStats();
  };

  useEffect(() => {
    fetchEmployees(1);
    fetchStats();
  }, [searchQuery, departmentFilter, statusFilter]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Employees', icon: Users },
    { name: 'Attendance', icon: CalendarDays },
    { name: 'Payroll', icon: IndianRupee },
    { name: 'Invoices', icon: FileText },
    { name: 'Compliance', icon: ShieldCheck },
    { name: 'Reports', icon: BarChart2 },
    { name: 'Settings', icon: Settings },
  ];

  const steps = [
    { number: 1, label: 'Basic Details' },
    { number: 2, label: 'Job Details' },
    { number: 3, label: 'Salary Details' },
    { number: 4, label: 'Bank Details' },
    { number: 5, label: 'Documents' },
    { number: 6, label: 'Review' },
  ];

  const guideItems = [
    { number: 1, text: 'Enter basic personal details' },
    { number: 2, text: 'Add job and employment details' },
    { number: 3, text: 'Add salary and statutory information (PF, ESI, UAN)' },
    { number: 4, text: 'Add bank account details' },
    { number: 5, text: 'Upload required documents' },
    { number: 6, text: 'Review and submit' },
  ];

  const handleToggleRow = (id: string) => {
    setSelectedLeaves((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBasicChange = (field: string, value: string) => {
    setBasicDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobChange = (field: string, value: string) => {
    setJobDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalaryChange = (field: string, value: string) => {
    setSalaryDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: string, value: string) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (docType: 'aadhaar' | 'pan' | 'experience' | 'education', file: File | null) => {
    setDocuments((prev) => ({ ...prev, [docType]: file }));
  };

  const computedTotalCtc = () => {
    const b = parseFloat(salaryDetails.basicSalary) || 0;
    const h = parseFloat(salaryDetails.hra) || 0;
    const s = parseFloat(salaryDetails.specialAllowance) || 0;
    const o = parseFloat(salaryDetails.otherAllowances) || 0;
    const sum = b + h + s + o;
    if (sum > 0) return sum.toLocaleString('en-IN');
    if (salaryDetails.monthlySalary) {
      return salaryDetails.monthlySalary;
    }
    return '0';
  };

  const stepLabels: Record<number, string> = {
    1: 'Basic Details',
    2: 'Job Details',
    3: 'Salary Details',
    4: 'Bank Details',
    5: 'Documents',
    6: 'Review & Submit'
  };

  const [stepError, setStepError] = useState<string | null>(null);

  const validateStep = (stepNumber: number): boolean => {
    setStepError(null);
    if (stepNumber === 1) {
      if (!basicDetails.firstName.trim()) {
        setStepError('Please enter First Name.');
        return false;
      }
      if (!basicDetails.lastName.trim()) {
        setStepError('Please enter Last Name.');
        return false;
      }
      if (!basicDetails.dateOfBirth.trim()) {
        setStepError('Please select Date of Birth.');
        return false;
      }
      if (!basicDetails.gender.trim()) {
        setStepError('Please select Gender.');
        return false;
      }
      if (!basicDetails.emailAddress.trim()) {
        setStepError('Please enter Email Address.');
        return false;
      }
      const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/i;
      if (!emailPattern.test(basicDetails.emailAddress.trim())) {
        setStepError('Invalid email address. Please enter a valid email (e.g. user@gmail.com or user@companyname.com).');
        return false;
      }
      if (!basicDetails.phoneNumber.trim()) {
        setStepError('Please enter Phone Number.');
        return false;
      }
    } else if (stepNumber === 2) {
      if (!jobDetails.employeeId.trim()) {
        setStepError('Please enter Employee ID.');
        return false;
      }
      if (!jobDetails.department.trim()) {
        setStepError('Please select Department.');
        return false;
      }
      if (!jobDetails.designation.trim()) {
        setStepError('Please select Designation.');
        return false;
      }
      if (!jobDetails.employmentType.trim()) {
        setStepError('Please select Employment Type.');
        return false;
      }
      if (!jobDetails.joiningDate.trim()) {
        setStepError('Please select Joining Date.');
        return false;
      }
      if (!jobDetails.reportingManager.trim()) {
        setStepError('Please select Reporting Manager.');
        return false;
      }
      if (!jobDetails.workLocation.trim()) {
        setStepError('Please select Work Location.');
        return false;
      }
    } else if (stepNumber === 3) {
      if (!salaryDetails.monthlySalary.trim()) {
        setStepError('Please enter Monthly Salary (CTC).');
        return false;
      }
      if (!salaryDetails.payFrequency.trim()) {
        setStepError('Please select Pay Frequency.');
        return false;
      }
      if (!salaryDetails.pfEligibility.trim()) {
        setStepError('Please select PF Eligibility.');
        return false;
      }
      if (!salaryDetails.esiEligibility.trim()) {
        setStepError('Please select ESI Eligibility.');
        return false;
      }
    } else if (stepNumber === 4) {
      if (!bankDetails.accountHolderName.trim()) {
        setStepError('Please enter Account Holder Name.');
        return false;
      }
      if (!bankDetails.bankAccountNumber.trim()) {
        setStepError('Please enter Bank Account Number.');
        return false;
      }
      if (!bankDetails.confirmAccountNumber.trim()) {
        setStepError('Please enter Confirm Account Number.');
        return false;
      }
      if (bankDetails.bankAccountNumber.trim() !== bankDetails.confirmAccountNumber.trim()) {
        setStepError('Bank Account Number and Confirm Account Number do not match.');
        return false;
      }
      if (!bankDetails.ifscCode.trim()) {
        setStepError('Please enter IFSC Code.');
        return false;
      }
    } else if (stepNumber === 5) {
      const hasAadhaar = Boolean(documents.aadhaar || viewDocUrls.aadhaar);
      const hasPan = Boolean(documents.pan || viewDocUrls.pan);
      if (!hasAadhaar) {
        setStepError('Please upload mandatory document: Aadhaar Card.');
        return false;
      }
      if (!hasPan) {
        setStepError('Please upload mandatory document: PAN Card.');
        return false;
      }
    }
    return true;
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* LEFT SIDEBAR (Responsive drawer on mobile, fixed width on lg+) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[240px] lg:w-[208px] h-screen bg-[#1a334e] flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Top Logo Container matching topbar height */}
          <div className="h-14 flex items-center justify-between px-4 bg-white border-b border-r border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-[#1a334e]" viewBox="0 0 36 36" fill="currentColor">
                  <path d="M4 27V15l6 3v-6l6 3.5V8l8 5v14H4z" fill="#1a334e" />
                  <rect x="18" y="4" width="2.5" height="3" rx="0.5" fill="#f26522" />
                  <rect x="11" y="9" width="2.5" height="3" rx="0.5" fill="#f26522" />
                  <circle cx="10" cy="24" r="5" fill="#f26522" />
                  <circle cx="10" cy="24" r="2.2" fill="#1a334e" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[15px] tracking-tight leading-none text-[#1a334e] font-sans">
                  MANUFAC
                </span>
                <span className="text-[8.5px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-0.5">
                  INDUSTRIES
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1.5 mt-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === activeNav;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveNav(item.name);
                    if (item.name === 'Employees') {
                      setViewMode('leave-management');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#d97017] text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="text-[13px]">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Silhouette & Decorative Gear */}
        <div className="pointer-events-none w-full relative h-32 lg:h-40 overflow-hidden opacity-30 flex items-end">
          <svg className="w-full h-full text-slate-900" viewBox="0 0 200 160" fill="currentColor" preserveAspectRatio="none">
            <rect x="10" y="55" width="16" height="105" />
            <rect x="34" y="30" width="18" height="130" />
            <rect x="70" y="80" width="45" height="80" />
            <polygon points="115,70 170,105 170,160 115,160" />
            <circle cx="45" cy="130" r="32" stroke="currentColor" strokeWidth="8" fill="none" />
            <circle cx="45" cy="130" r="12" fill="currentColor" />
          </svg>
        </div>
      </aside>

      {/* RIGHT MAIN VIEW */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#fbfcfd] overflow-hidden">
        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-slate-200 px-3.5 sm:px-6 flex items-center justify-between shrink-0 z-10">
          {/* Header Title displaying active page name + Mobile Hamburger button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Open menu"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-[#0e243a] tracking-tight truncate">
              {activeNav}
            </h1>
          </div>

          {/* Right Profile & Alert */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative text-slate-600 hover:text-slate-900 transition-colors cursor-pointer p-1" title="Notifications">
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.8]" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d95d10] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                U
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">User Name</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* UNDER DEVELOPMENT VIEW FOR OTHER SIDEBAR TABS */}
        {activeNav !== 'Employees' ? (
          <main className="flex-1 px-8 py-12 flex flex-col items-center justify-center overflow-y-auto">
            <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#e45809] mb-4 shadow-2xs">
                <Clock className="w-8 h-8 animate-pulse stroke-[2]" />
              </div>
              <span className="inline-block px-3 py-1 text-[11px] font-bold text-orange-700 bg-orange-100 rounded-full mb-3 tracking-wide uppercase">
                Under Development
              </span>
              <h2 className="text-xl font-bold text-[#0e243a] tracking-tight">
                {activeNav} Module
              </h2>
              <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                The <span className="font-semibold text-slate-700">{activeNav}</span> section is currently under development. Please visit the Employees section to manage employee records and registrations.
              </p>
              <button
                onClick={() => {
                  setActiveNav('Employees');
                  setViewMode('leave-management');
                }}
                className="inline-flex items-center gap-2 bg-[#1a334e] hover:bg-[#0f2238] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Users className="w-4 h-4" />
                <span>Go to Employees</span>
              </button>
            </div>
          </main>
        ) : viewMode === 'leave-management' ? (() => {
          const query = searchQuery.trim().toLowerCase();
          const filteredEmployees = employees.filter((row) => {
            const matchesSearch =
              !query ||
              row.name.toLowerCase().includes(query) ||
              row.id.toLowerCase().includes(query) ||
              row.department.toLowerCase().includes(query) ||
              row.jobTitle.toLowerCase().includes(query) ||
              row.location.toLowerCase().includes(query) ||
              (row.email && row.email.toLowerCase().includes(query)) ||
              (row.phone && row.phone.toLowerCase().includes(query));
            const matchesDept =
              departmentFilter === 'All Departments' || row.department === departmentFilter;
            const matchesStatus =
              statusFilter === 'All Status' || row.status === statusFilter;
            const matchesLoc =
              locationFilter === 'All Locations' || row.location === locationFilter;
            const matchesRole =
              roleFilter === 'All Designations' || row.jobTitle === roleFilter;
            const matchesGender =
              genderFilter === 'All Genders' || (row.gender && row.gender === genderFilter);
            const matchesBank =
              bankFilter === 'All Banks' || (row.bankName && row.bankName === bankFilter);
            const matchesJoinDate =
              joiningYearFilter === 'All Joining Dates' || (row.date && row.date.includes(joiningYearFilter));
            const matchesSalary = (() => {
              if (salaryRangeFilter === 'All Salaries') return true;
              const numericSalary = parseInt(String(row.monthlySalary || '0').replace(/[^0-9]/g, ''), 10);
              if (salaryRangeFilter === '< 40,000') return numericSalary < 40000;
              if (salaryRangeFilter === '40,000 - 75,000') return numericSalary >= 40000 && numericSalary <= 75000;
              if (salaryRangeFilter === '> 75,000') return numericSalary > 75000;
              return true;
            })();

            return (
              matchesSearch &&
              matchesDept &&
              matchesStatus &&
              matchesLoc &&
              matchesRole &&
              matchesGender &&
              matchesBank &&
              matchesJoinDate &&
              matchesSalary
            );
          });

          return (
          <main className="flex-1 px-3.5 sm:px-6 lg:px-8 py-4 sm:py-5 overflow-y-auto">
            {/* Top Action Header with Add Employee */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0e243a] tracking-tight">
                  Employees
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
                  Manage employee directory, profiles, and organization details.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsViewMode(false);
                  setViewDocUrls({});
                  setDocuments({ aadhaar: null, pan: null, experience: null, education: null });
                  setViewMode('add-employee');
                  setCurrentStep(0);
                }}
                className="flex items-center justify-center gap-2 bg-[#e45809] hover:bg-[#cf4d05] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-98 w-full sm:w-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

            {/* Employee Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {/* Total Employees */}
              <div className="group relative bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200/80 hover:border-blue-400 rounded-2xl p-4.5 shadow-sm hover:shadow-lg hover:shadow-blue-500/15 transition-all duration-300 overflow-hidden flex items-center justify-between">
                {/* Ambient glow in corner */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {/* Glowing 3D-effect icon badge container */}
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 ring-4 ring-blue-100 group-hover:ring-blue-200 group-hover:scale-105 transition-all duration-300">
                      <Users className="w-6 h-6 stroke-[2.2] drop-shadow-sm group-hover:rotate-3 transition-transform" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shadow-xs">
                      <Activity className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-blue-700/80 uppercase tracking-wider">Total Staff</span>
                    </div>
                    <div className="text-2xl font-black text-blue-950 tracking-tight mt-0.5">
                      {stats.total_staff}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                      Across all branches
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end shrink-0 relative z-10">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-white/90 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-2xs group-hover:bg-blue-100/90 transition-colors">
                    <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Active Force</span>
                  </span>
                  <span className="text-[10px] text-blue-600/70 font-semibold mt-1">100% On-roll</span>
                </div>
              </div>

              {/* Active Employees */}
              <div className="group relative bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/80 hover:border-emerald-400 rounded-2xl p-4.5 shadow-sm hover:shadow-lg hover:shadow-emerald-500/15 transition-all duration-300 overflow-hidden flex items-center justify-between">
                {/* Ambient glow in corner */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {/* Glowing 3D-effect icon badge container */}
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-100 group-hover:ring-emerald-200 group-hover:scale-105 transition-all duration-300">
                      <UserCheck className="w-6 h-6 stroke-[2.2] drop-shadow-sm group-hover:rotate-3 transition-transform" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-emerald-700/80 uppercase tracking-wider">Active Status</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-950 tracking-tight mt-0.5">
                      {stats.active_count}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Verified Active</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end shrink-0 relative z-10">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white/90 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-2xs group-hover:bg-emerald-100/90 transition-colors whitespace-nowrap">
                    <Award className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{stats.active_percentage}%</span>
                  </span>
                  <span className="text-[10px] text-emerald-600/70 font-semibold mt-1 whitespace-nowrap">Operational</span>
                </div>
              </div>

              {/* New Joiners */}
              <div className="group relative bg-gradient-to-br from-orange-50/90 via-amber-50/40 to-white border border-orange-200/80 hover:border-orange-400 rounded-2xl p-4.5 shadow-sm hover:shadow-lg hover:shadow-orange-500/15 transition-all duration-300 overflow-hidden flex items-center justify-between">
                {/* Ambient glow in corner */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {/* Glowing 3D-effect icon badge container */}
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#e45809] to-amber-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30 ring-4 ring-orange-100 group-hover:ring-orange-200 group-hover:scale-105 transition-all duration-300">
                      <Clock className="w-6 h-6 stroke-[2.2] drop-shadow-sm group-hover:rotate-3 transition-transform" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center shadow-xs">
                      <Zap className="w-2.5 h-2.5 text-[#e45809]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-orange-700/80 uppercase tracking-wider">New Joiners</span>
                    </div>
                    <div className="text-2xl font-black text-orange-950 tracking-tight mt-0.5">
                      {stats.new_joiners}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                      Joined this month
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end shrink-0 relative z-10">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-white/90 border border-orange-200/80 px-2.5 py-1 rounded-full shadow-2xs group-hover:bg-orange-100/90 transition-colors">
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Recent</span>
                  </span>
                  <span className="text-[10px] text-orange-600/70 font-semibold mt-1">Onboarding</span>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              {/* 3D Inset Sunken Search Bar */}
              <div className="w-full sm:w-80 md:w-84 relative rounded-lg bg-[#ebf0f5] p-[1.5px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.13),inset_0_1px_2px_rgba(0,0,0,0.10),0_1px_0_rgba(255,255,255,0.85)] border border-slate-300/80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Search name, ID, dept, role, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-transparent text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Delete Button when 1 or more boxes are ticked */}
                {selectedLeaves.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm shadow-rose-600/25 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-right-2 duration-200"
                    title={`Delete ${selectedLeaves.length} selected employee(s)`}
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Delete ({selectedLeaves.length})</span>
                  </button>
                )}

                <CustomSelect
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  variant="filter"
                  className="min-w-[145px]"
                  options={[
                    { value: 'All Departments', label: 'All Departments' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Human Resource', label: 'Human Resource' },
                    { value: 'Marketing', label: 'Marketing' },
                    { value: 'Operations', label: 'Operations' },
                    { value: 'Business', label: 'Business' },
                    { value: 'Product', label: 'Product' }
                  ]}
                />

                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  variant="filter"
                  className="min-w-[115px]"
                  options={[
                    { value: 'All Status', label: 'All Status' },
                    { value: 'Active', label: 'Active' },
                    { value: 'On Notice', label: 'On Notice' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                />

                {/* Filter Popover Trigger Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      showFilterDrawer || hasActiveAdvancedFilters
                        ? 'bg-orange-50 text-[#e45809] border-[#e45809] shadow-xs'
                        : 'bg-white border-slate-300 hover:border-orange-400 text-slate-700 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5 text-[#e45809]" />
                    <span>Filter</span>
                    {hasActiveAdvancedFilters && (
                      <span className="w-2 h-2 rounded-full bg-[#e45809]"></span>
                    )}
                  </button>

                  {/* Filter Popover Dropdown Panel (Exactly matching reference UI structure) */}
                  {showFilterDrawer && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowFilterDrawer(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header with Title and Reset */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/70 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0c233c]">
                            <Filter className="w-3.5 h-3.5 text-[#e45809]" />
                            <span>Filter by Field</span>
                          </div>
                          {hasActiveAdvancedFilters && (
                            <button
                              onClick={resetAllFilters}
                              className="text-[11px] font-bold text-slate-400 hover:text-[#e45809] cursor-pointer"
                            >
                              Reset all
                            </button>
                          )}
                        </div>

                        {/* Accordion List - strictly only fields and data from our website */}
                        <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 py-1">
                          {[
                            {
                              id: 'location',
                              label: 'Work Location',
                              current: locationFilter,
                              options: [
                                'All Locations',
                                'Bangalore',
                                'Hyderabad',
                                'Chennai',
                                'Mumbai',
                                'Pune',
                                'Delhi NCR',
                                'Kolkata',
                                'Ahmedabad',
                                'Visakhapatnam',
                                'Vijayawada',
                                'Plant 1 - Unit A',
                                'Plant 1 - Unit B',
                                'Warehouse East',
                                'Central Facility'
                              ],
                              setter: setLocationFilter
                            },
                            {
                              id: 'role',
                              label: 'Designation',
                              current: roleFilter,
                              options: [
                                'All Designations',
                                'Design Engineer',
                                'Production Specialist',
                                'Shift Supervisor',
                                'Plant Operator',
                                'Quality Inspector',
                                'Mechanical Technician',
                                'HR Manager',
                                'Software Engineer'
                              ],
                              setter: setRoleFilter
                            },
                            {
                              id: 'gender',
                              label: 'Gender',
                              current: genderFilter,
                              options: ['All Genders', 'Male', 'Female', 'Other'],
                              setter: setGenderFilter
                            },
                            {
                              id: 'bankName',
                              label: 'Bank Name',
                              current: bankFilter,
                              options: ['All Banks', 'HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Canara Bank'],
                              setter: setBankFilter
                            },
                            {
                              id: 'joiningDate',
                              label: 'Joining Date',
                              current: joiningYearFilter,
                              options: ['All Joining Dates', '2026', '2025', '2024'],
                              setter: setJoiningYearFilter
                            },
                            {
                              id: 'salary',
                              label: 'Salary Range',
                              current: salaryRangeFilter,
                              options: ['All Salaries', '< 40,000', '40,000 - 75,000', '> 75,000'],
                              setter: setSalaryRangeFilter
                            }
                          ].map((item) => {
                            const isExpanded = activeFilterAccordion === item.id;
                            const isFiltered = item.current && !item.current.startsWith('All');

                            return (
                              <div key={item.id} className="transition-colors">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveFilterAccordion(isExpanded ? null : item.id)
                                  }
                                  className={`w-full px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                    isExpanded
                                      ? 'bg-slate-50 font-bold text-[#e45809]'
                                      : 'hover:bg-slate-50/80 font-medium text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="truncate">{item.label}</span>
                                    {isFiltered && (
                                      <span className="inline-block px-1.5 py-0.2 text-[10px] rounded-full bg-orange-100 text-[#e45809] font-bold">
                                        {item.current}
                                      </span>
                                    )}
                                  </div>
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                                      isExpanded ? 'rotate-180 text-[#e45809]' : ''
                                    }`}
                                  />
                                </button>

                                {/* Expanded Options List */}
                                {isExpanded && (
                                  <div className="bg-orange-50/30 px-3 py-2 space-y-1 border-t border-slate-100/80 animate-in fade-in duration-100">
                                    {item.options.map((opt) => {
                                      const isSelected = item.current === opt;
                                      return (
                                        <button
                                          key={opt}
                                          type="button"
                                          onClick={() => {
                                            item.setter(opt);
                                          }}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                            isSelected
                                              ? 'bg-[#e45809] text-white font-bold shadow-2xs'
                                              : 'text-slate-700 hover:bg-orange-100/60 font-medium'
                                          }`}
                                        >
                                          <span className="truncate">{opt}</span>
                                          {isSelected && (
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer Action */}
                        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {hasActiveAdvancedFilters ? 'Filters active' : 'No filters applied'}
                          </span>
                          <button
                            onClick={() => setShowFilterDrawer(false)}
                            className="px-4 py-1.5 bg-[#e45809] hover:bg-[#cf4d05] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Export CSV Button */}
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  title="Export filtered employee directory to CSV"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-orange-400 hover:bg-slate-50 text-slate-700 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className={`w-3.5 h-3.5 text-[#e45809] ${isExporting ? 'animate-bounce' : ''}`} />
                  <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>
              </div>
            </div>

            {/* Table & Inline Side Card Layout */}
            <div className="flex flex-col lg:flex-row items-start gap-4 mb-4">
              {/* Table Container */}
              <div className="flex-1 w-full min-w-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#fafbfd] border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-3 px-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={filteredEmployees.length > 0 && selectedLeaves.length === filteredEmployees.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeaves(filteredEmployees.map((r) => r.id));
                            } else {
                              setSelectedLeaves([]);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-[#e45809] cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3 whitespace-nowrap">Employee ID</th>
                      <th className="py-3 px-3 whitespace-nowrap">Employee Name</th>
                      <th className="py-3 px-3 whitespace-nowrap">Email Address</th>
                      <th className="py-3 px-3 whitespace-nowrap">Phone Number</th>
                      <th className="py-3 px-3 whitespace-nowrap">Date of Birth</th>
                      <th className="py-3 px-3 whitespace-nowrap">Gender</th>
                      <th className="py-3 px-3 whitespace-nowrap">Job Title</th>
                      <th className="py-3 px-3 whitespace-nowrap">Department</th>
                      <th className="py-3 px-3 whitespace-nowrap">Joining Date</th>
                      <th className="py-3 px-3 whitespace-nowrap">Work Location</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">Status</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap sticky right-0 bg-[#fafbfd] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-12 text-center text-slate-500">
                          {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading employees from PostgreSQL...</span>
                            </div>
                          ) : employees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Users className="w-8 h-8 text-slate-300" />
                              <span className="font-semibold text-slate-700">No employees found</span>
                              <span className="text-xs text-slate-400">Click "+ Add Employee" to create your first employee record.</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Search className="w-8 h-8 text-slate-300" />
                              <span className="font-semibold text-slate-700">No matching employees found</span>
                              <span className="text-xs text-slate-400">
                                No records match "{searchQuery}"{departmentFilter !== 'All Departments' ? ` in ${departmentFilter}` : ''}.
                              </span>
                              <button
                                onClick={() => {
                                  setSearchQuery('');
                                  setDepartmentFilter('All Departments');
                                  setStatusFilter('All Status');
                                }}
                                className="mt-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                              >
                                Clear filters
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((row) => {
                          const isRowSelected = selectedLeaves.includes(row.id);
                          return (
                            <tr
                              key={row.id}
                              onClick={() => setSelectedEmployee(row)}
                              className={`transition-colors cursor-pointer ${
                                selectedEmployee?.id === row.id
                                  ? 'bg-orange-50/80 hover:bg-orange-50'
                                  : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isRowSelected}
                                  onChange={() => handleToggleRow(row.id)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 accent-[#e45809] cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {row.avatarUrl ? (
                                    <img
                                      src={row.avatarUrl}
                                      alt={row.name}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        if (target.nextElementSibling) {
                                          (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-7 h-7 rounded-full items-center justify-center text-[10.5px] font-bold ${row.initialsBg} ${row.avatarUrl ? 'hidden' : 'flex'}`}
                                  >
                                    {row.initials}
                                  </div>
                                  <span className="font-semibold text-[#0e243a]">{row.id}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                {row.name}
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">{row.email || '—'}</td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">{row.phone || '—'}</td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">{row.dateOfBirth || '—'}</td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
                                  {row.gender || '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">{row.jobTitle}</td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">{row.department}</td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">{row.date}</td>
                              <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">{row.location}</td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                                  {row.status}
                                </span>
                              </td>
                              <td
                                className="py-3 px-3 text-center relative whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-center">
                                  {/* 3 Dots Button */}
                                  <button
                                    onClick={() => setActiveActionId(activeActionId === row.id ? null : row.id)}
                                    title="Actions"
                                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Floating Popover / Dropdown: Single Row with Symbols only */}
                                {activeActionId === row.id && (
                                  <>
                                    {/* Backdrop to close when clicking outside */}
                                    <div
                                      className="fixed inset-0 z-20 cursor-default"
                                      onClick={() => setActiveActionId(null)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100">
                                      {/* View Symbol -> Navigates to Review Page in View mode */}
                                      <button
                                        onClick={() => {
                                          openReviewForEmployee(row, true);
                                        }}
                                        title="View Review Page"
                                        className="p-1.5 rounded-md text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition-colors cursor-pointer"
                                      >
                                        <Eye className="w-4 h-4 stroke-[2.2] text-blue-600" />
                                      </button>

                                      {/* Edit Symbol -> Navigates to Review Page with edit options in every box */}
                                      <button
                                        onClick={() => {
                                          openReviewForEmployee(row, false);
                                        }}
                                        title="Edit Employee"
                                        className="p-1.5 rounded-md text-emerald-600 hover:text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="w-4 h-4 stroke-[2.2] text-emerald-600" />
                                      </button>

                                      {/* Delete Symbol */}
                                      <button
                                        onClick={() => {
                                          setActiveActionId(null);
                                          setDeleteModal({
                                            isOpen: true,
                                            title: 'Delete Employee',
                                            description: `Are you sure you want to delete employee ${row.name} (${row.id})? This action cannot be undone.`,
                                            onConfirm: async () => {
                                              setDeleteModal(prev => ({ ...prev, isDeleting: true }));
                                              try {
                                                const res = await fetch(`/api/employees/${row.id}`, { method: 'DELETE' });
                                                if (res.ok) {
                                                  showToast(`Employee ${row.name} deleted successfully!`, 'success');
                                                  if (selectedEmployee && selectedEmployee.id === row.id) {
                                                    setSelectedEmployee(null);
                                                  }
                                                  fetchEmployees();
                                                  fetchStats();
                                                } else {
                                                  showToast('Failed to delete employee', 'error');
                                                }
                                              } catch (err) {
                                                console.error('Delete error:', err);
                                                showToast('Could not connect to backend to delete employee', 'error');
                                              } finally {
                                                setDeleteModal(prev => ({ ...prev, isOpen: false, isDeleting: false }));
                                              }
                                            }
                                          });
                                        }}
                                        title="Delete Employee"
                                        className="p-1.5 rounded-md text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4 stroke-[2.2] text-rose-600" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER - 15 ROWS PER PAGE */}
              <div className="px-4 py-3 bg-[#fafbfd] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="font-medium">
                  Showing <span className="font-semibold text-slate-800">{totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * pageSize, totalCount)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-800">{totalCount}</span> entries
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        fetchEmployees(currentPage - 1);
                      }
                    }}
                    disabled={currentPage <= 1 || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                      let p = idx + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        p = Math.min(currentPage - 2 + idx, totalPages);
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => fetchEmployees(p)}
                          className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors ${
                            currentPage === p
                              ? 'bg-[#e45809] text-white shadow-xs'
                              : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        fetchEmployees(currentPage + 1);
                      }
                    }}
                    disabled={currentPage >= totalPages || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors shadow-2xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* INLINE / MOBILE MODAL EMPLOYEE DETAILS CARD */}
            {selectedEmployee && (
              <>
                {/* Mobile Backdrop for Side Card */}
                <div
                  onClick={() => setSelectedEmployee(null)}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
                />
                <div className="fixed inset-x-3 bottom-3 top-16 sm:inset-auto sm:right-4 sm:top-18 sm:bottom-4 sm:w-[380px] lg:static lg:inset-auto lg:w-[380px] z-50 lg:z-auto shrink-0 bg-white border border-slate-200/90 rounded-2xl shadow-2xl lg:shadow-md flex flex-col overflow-hidden animate-in fade-in duration-150 lg:sticky lg:top-4 max-h-[calc(100vh-80px)] lg:max-h-[calc(100vh-100px)]">
                  {/* Compact Card Header */}
                  <div className="bg-[#1a334e] text-white px-4 py-3 relative shrink-0">
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        openReviewForEmployee(selectedEmployee, false);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-slate-800 hover:bg-slate-100 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3 h-3 text-slate-700" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setDeleteModal({
                          isOpen: true,
                          title: 'Delete Employee',
                          description: `Are you sure you want to delete employee ${selectedEmployee.name} (${selectedEmployee.id})? This action cannot be undone.`,
                          onConfirm: async () => {
                            setDeleteModal(prev => ({ ...prev, isDeleting: true }));
                            try {
                              const res = await fetch(`/api/employees/${selectedEmployee.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                showToast(`Employee ${selectedEmployee.name} deleted successfully!`, 'success');
                                setSelectedEmployee(null);
                                fetchEmployees();
                                fetchStats();
                              } else {
                                showToast('Failed to delete employee', 'error');
                              }
                            } catch (err) {
                              console.error('Delete error:', err);
                              showToast('Could not connect to backend to delete employee', 'error');
                            } finally {
                              setDeleteModal(prev => ({ ...prev, isOpen: false, isDeleting: false }));
                            }
                          }
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Delete</span>
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedEmployee(null)}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Centered Avatar overlapping top banner */}
                  <div className="flex flex-col items-center text-center -mb-7">
                    {selectedEmployee.avatarUrl ? (
                      <img
                        src={selectedEmployee.avatarUrl}
                        alt={selectedEmployee.name}
                        className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-sm bg-white"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black border-3 border-white shadow-sm bg-white text-[#1a334e]`}
                      >
                        {selectedEmployee.initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Card Body (Compact spacing) */}
                <div className="pt-8 px-4 pb-3 flex flex-col space-y-2.5 overflow-y-auto">
                  {/* Name and Designation */}
                  <div className="text-center">
                    <h3 className="text-base font-extrabold text-[#0e243a] tracking-tight">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedEmployee.jobTitle} • {selectedEmployee.department}
                    </p>
                    <p className="text-[10px] font-bold text-slate-700 tracking-wider bg-slate-100 inline-block px-2 py-0.5 rounded mt-0.5">
                      {selectedEmployee.id}
                    </p>
                  </div>

                  {/* Status & Joined Date (As before) */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedEmployee.status}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Joined {selectedEmployee.date}
                    </span>
                  </div>

                  {/* All 5 Badges in a Single Row (Micro-size) */}
                  <div>
                    <div className="flex items-center gap-1 w-full">
                      {[
                        { key: 'basic', label: 'Basic' },
                        { key: 'job', label: 'Job' },
                        { key: 'salary', label: 'Salary' },
                        { key: 'bank', label: 'Bank' },
                        { key: 'documents', label: 'Docs' }
                      ].map((tab) => {
                        const isActive = sideCardTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setSideCardTab(tab.key as any)}
                            className={`flex-1 py-1 px-0 rounded-md text-[10.5px] font-bold transition-all text-center cursor-pointer border whitespace-nowrap ${
                              isActive
                                ? 'bg-[#e45809] text-white border-[#e45809] shadow-xs'
                                : 'bg-slate-50 hover:bg-white text-slate-600 border-slate-200/90 hover:border-slate-300'
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TAB 1: BASIC DETAILS */}
                  {sideCardTab === 'basic' && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Personal Information</span>
                        <span className="text-[10px] text-slate-400 font-normal">Step 1</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Full Name</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.name}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Email</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 truncate max-w-[190px]">
                          <span className="truncate">{selectedEmployee.email || '—'}</span>
                          {selectedEmployee.email && (
                            <button
                              onClick={() => navigator.clipboard.writeText(selectedEmployee.email || '')}
                              title="Copy email"
                              className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Phone / Contact</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.phone || '—'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Date of Birth</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.dateOfBirth || selectedEmployee.rawData?.date_of_birth || '—'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Gender</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.gender || selectedEmployee.rawData?.gender || '—'}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: JOB DETAILS */}
                  {sideCardTab === 'job' && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Job & Employment</span>
                        <span className="text-[10px] text-slate-400 font-normal">Step 2</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Employee ID</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.id}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Department</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.department}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Designation</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.jobTitle}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Employment Type</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.employmentType || selectedEmployee.rawData?.employment_type || 'Full Time'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Joining Date</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.date}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Work Location</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.location}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Reporting Head</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.reportingManager || selectedEmployee.rawData?.reporting_manager || 'Amit Verma'}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SALARY DETAILS */}
                  {sideCardTab === 'salary' && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Salary & Statutory</span>
                        <span className="text-[10px] text-slate-400 font-normal">Step 3</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Monthly CTC</span>
                        <span className="font-bold text-emerald-700">₹{selectedEmployee.monthlySalary || selectedEmployee.rawData?.monthly_salary || '75,000'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Pay Frequency</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.rawData?.pay_frequency || 'Monthly'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Basic Salary</span>
                        <span className="font-semibold text-slate-800">₹{selectedEmployee.rawData?.basic_salary || '40,000'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">HRA</span>
                        <span className="font-semibold text-slate-800">₹{selectedEmployee.rawData?.hra || '20,000'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Special Allowance</span>
                        <span className="font-semibold text-slate-800">₹{selectedEmployee.rawData?.special_allowance || '10,000'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Other Allowances</span>
                        <span className="font-semibold text-slate-800">₹{selectedEmployee.rawData?.other_allowances || '5,000'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">PF Eligibility / UAN</span>
                        <span className="font-semibold text-slate-800">
                          {selectedEmployee.rawData?.pf_eligibility || 'Yes'} {selectedEmployee.rawData?.uan_number ? `(${selectedEmployee.rawData.uan_number})` : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">ESI Eligibility / No</span>
                        <span className="font-semibold text-slate-800">
                          {selectedEmployee.rawData?.esi_eligibility || 'Yes'} {selectedEmployee.rawData?.esi_number ? `(${selectedEmployee.rawData.esi_number})` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: BANK DETAILS */}
                  {sideCardTab === 'bank' && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Bank Information</span>
                        <span className="text-[10px] text-slate-400 font-normal">Step 4</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Account Holder</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.rawData?.account_holder_name || selectedEmployee.name}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Bank Name</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.bankName || selectedEmployee.rawData?.bank_name || 'HDFC Bank'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Account Number</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.accountNumber || selectedEmployee.rawData?.account_number || '987654321098'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">IFSC Code</span>
                        <span className="font-semibold text-slate-800 uppercase">{selectedEmployee.rawData?.ifsc_code || 'HDFC0001234'}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Branch</span>
                        <span className="font-semibold text-slate-800">{selectedEmployee.rawData?.branch_name || 'Indiranagar'}</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: DOCUMENTS */}
                  {sideCardTab === 'documents' && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Uploaded Documents</span>
                        <span className="text-[10px] text-slate-400 font-normal">Step 5</span>
                      </div>

                      {[
                        { label: 'Aadhaar Card', file: selectedEmployee.aadhaarFile || selectedEmployee.rawData?.aadhaar_file },
                        { label: 'PAN Card', file: selectedEmployee.panFile || selectedEmployee.rawData?.pan_file },
                        { label: 'Experience Letter', file: selectedEmployee.experienceFile || selectedEmployee.rawData?.experience_file },
                        { label: 'Education Certificate', file: selectedEmployee.educationFile || selectedEmployee.rawData?.education_file }
                      ].map((doc, idx) => {
                        const fileRaw = doc.file;
                        const docUrl = fileRaw
                          ? (fileRaw.startsWith('http') || fileRaw.startsWith('/') ? fileRaw : `/uploads/${fileRaw}`)
                          : null;
                        const fileName = fileRaw ? fileRaw.split('/').pop() : 'Uploaded (Verified)';

                        return (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-[#e45809] shrink-0" />
                              <div className="truncate">
                                <div className="font-semibold text-slate-800 truncate text-[11px]">{doc.label}</div>
                                <div className="text-[10px] text-slate-400 truncate">{fileName}</div>
                              </div>
                            </div>
                            {docUrl ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(docUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className="px-2.5 py-1 rounded bg-orange-50 hover:bg-orange-100 text-[#e45809] font-semibold text-[11px] transition-colors shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                              >
                                <span>View</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded">
                                Verified
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Open Complete Review Page CTA */}
                  <button
                    onClick={() => {
                      if (selectedEmployee) {
                        openReviewForEmployee(selectedEmployee, true);
                      }
                    }}
                    className="w-full mt-1.5 py-1.5 px-3 bg-[#e45809] hover:bg-[#cf4d05] text-white font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 text-[11px] cursor-pointer transition-all active:scale-98"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Complete Profile</span>
                  </button>
                </div>
              </div>
            </>
          )}
          </div>
          </main>
          );
        })() : (
          /* VIEW 2: NEW EMPLOYEE REGISTRATION FORM FLOW */
          <main className="flex-1 px-3 sm:px-6 lg:px-10 py-4 sm:py-5 pb-16 flex flex-col justify-between max-w-5xl w-full overflow-y-auto">
            <div>
              {/* Back to Leave Management / Employees Link */}
              <div
                onClick={() => {
                  setViewMode('leave-management');
                  setCurrentStep(0);
                  setIsViewMode(false);
                }}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer mb-2.5 transition-colors w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Employees</span>
              </div>

              {/* Header with Title and Step Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0e243a] tracking-tight">
                    New Employee Registration
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Add basic details, job information, salary, bank details and documents to create a new employee record.
                  </p>
                </div>

                {currentStep > 0 && (
                  <div className="flex items-center gap-2 border border-orange-200 bg-orange-50/80 px-3 py-1.5 rounded-lg shrink-0 w-fit">
                    <span className="text-xs text-orange-800 font-semibold">
                      Step {currentStep} of 6:
                    </span>
                    <span className="text-xs font-bold text-[#0e243a]">
                      {stepLabels[currentStep]}
                    </span>
                  </div>
                )}
              </div>

              {/* Horizontal Stepper (Scrollable on small mobile screens) */}
              <div className="mb-6 sm:mb-8 px-2 sm:px-8 overflow-x-auto pb-2 [scrollbar-width:none]">
                <div className="flex items-start min-w-[500px] sm:min-w-0">
                  {steps.map((step, idx) => {
                    const stepNum = step.number;
                    const effectiveStep = currentStep === 0 ? 1 : currentStep;
                    const isCompleted = effectiveStep > stepNum;
                    const isCurrent = effectiveStep === stepNum;
                    const isNextCompleted = effectiveStep > stepNum;
                    const isLast = idx === steps.length - 1;

                    return (
                      <div
                        key={step.number}
                        className={`flex items-start ${isLast ? 'shrink-0' : 'flex-1'}`}
                      >
                        {/* Step Circle & Label */}
                        <div
                          className="flex flex-col items-center cursor-pointer shrink-0 group"
                          onClick={() => {
                            if (step.number < currentStep) {
                              setStepError(null);
                              setCurrentStep(step.number);
                            } else if (step.number === currentStep) {
                              // already on this step
                            } else {
                              // Forward navigation: must validate current step first
                              if (validateStep(currentStep)) {
                                setCurrentStep(step.number);
                              }
                            }
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 transform shadow-xs ${
                              isCompleted
                                ? 'bg-[#1a334e] text-white scale-100'
                                : isCurrent
                                ? 'bg-[#e45809] text-white scale-110 shadow-md ring-4 ring-orange-100/80 animate-pulse'
                                : 'bg-[#e5e9f0] text-slate-600 group-hover:bg-slate-200 group-hover:scale-105'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 stroke-[3] animate-in zoom-in-75 duration-200" />
                            ) : (
                              <span className="transition-transform duration-200">{step.number}</span>
                            )}
                          </div>
                          <span
                            className={`mt-2 text-xs text-center whitespace-nowrap transition-colors duration-200 ${
                              isCurrent
                                ? 'text-[#e45809] font-bold'
                                : isCompleted
                                ? 'text-slate-700 font-semibold'
                                : 'text-slate-500 font-medium'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>

                        {/* Animated Connector Line between circles */}
                        {!isLast && (
                          <div className="flex-1 self-start pt-4 relative overflow-hidden">
                            {/* Base Gray Track */}
                            <div className="h-[2.5px] w-full bg-slate-200 rounded-full" />
                            {/* Animated Glowing Fill Track */}
                            <div
                              className={`absolute top-4 left-0 h-[2.5px] rounded-full transition-all duration-700 ease-in-out ${
                                isNextCompleted ? 'animate-progress-glow shadow-[0_0_8px_rgba(228,88,9,0.5)]' : 'bg-[#e45809]'
                              }`}
                              style={{
                                width: isNextCompleted ? '100%' : '0%'
                              }}
                            />
                            {/* Subtle Pulse Particle at leading edge */}
                            {isNextCompleted && (
                              <div
                                className="absolute top-[14px] w-1.5 h-1.5 rounded-full bg-white shadow-xs pointer-events-none animate-ping"
                                style={{
                                  left: 'calc(100% - 4px)'
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Validation Error Alert */}
              {stepError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                    <span>{stepError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStepError(null)}
                    className="text-red-400 hover:text-red-700 font-bold ml-3 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* CONDITIONAL CARDS (STEP 0 - 6) */}
              {currentStep === 0 && (
                /* Let's get started Card */
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden transition-all duration-300">
                  {/* Subtle top decorative accent gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e45809] via-amber-500 to-[#1a334e]" />

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 flex justify-center items-center relative">
                      <div className="relative w-64 h-60 flex items-center justify-center">
                        {/* Ambient glow circle behind avatar */}
                        <div className="absolute w-48 h-48 rounded-full bg-orange-200/40 blur-2xl pointer-events-none" />

                        <div className="w-48 h-48 rounded-full bg-gradient-to-b from-orange-50 to-amber-100/70 border-4 border-white shadow-xl flex items-center justify-center relative group">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar Preview"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-orange-400 group-hover:scale-105 transition-transform duration-200">
                              <svg className="w-24 h-24 text-orange-400/80" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="7" r="4.2" />
                                <path d="M4 20.5a8 8 0 0 1 16 0H4z" />
                              </svg>
                            </div>
                          )}

                          {/* File manager trigger input */}
                          <input
                            type="file"
                            id="avatar-file-input"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAvatarFile(file);
                                const url = URL.createObjectURL(file);
                                setAvatarPreview(url);
                              }
                            }}
                          />

                          <label
                            htmlFor="avatar-file-input"
                            title="Click to upload profile photo"
                            className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-gradient-to-br from-[#e45809] to-[#c24102] hover:from-[#cf4d05] hover:to-[#a93801] active:scale-95 border-3 border-white text-white flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 z-10 group-hover:shadow-orange-500/30"
                          >
                            {avatarUploading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Plus className="w-5 h-5 stroke-[3] text-white" />
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-[#e45809] text-[11px] font-bold uppercase tracking-wider mb-3 w-fit">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Quick Onboarding</span>
                      </div>
                      <h2 className="text-2xl font-black text-[#0b2138] tracking-tight">
                        Let’s get started
                      </h2>
                      <p className="text-slate-500 text-xs mt-1.5 mb-6 leading-relaxed">
                        Complete the quick guided steps below to set up a new employee with verified profile data, statutory payroll compliance, and documents.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {guideItems.map((item) => (
                          <div
                            key={item.number}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 hover:bg-orange-50/50 border border-slate-100 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-[#e45809] text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                              {item.number}
                            </div>
                            <span className="text-xs text-slate-700 font-semibold truncate">
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                /* Step 1: Basic Details */
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-sm relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e45809] to-amber-500" />
                  
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#e45809] text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
                        <Users className="w-3 h-3" />
                        <span>Step 1 of 5</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b2138] tracking-tight">
                        Basic Details
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Enter the employee's personal and contact credentials.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        First Name <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Rahul"
                          value={basicDetails.firstName}
                          onChange={(e) => handleBasicChange('firstName', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Last Name <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Sharma"
                          value={basicDetails.lastName}
                          onChange={(e) => handleBasicChange('lastName', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Date of Birth <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          id="dob-input"
                          max={new Date().toISOString().split('T')[0]}
                          value={basicDetails.dateOfBirth}
                          onChange={(e) => handleBasicChange('dateOfBirth', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Gender <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomSelect
                        value={basicDetails.gender}
                        onChange={(val) => handleBasicChange('gender', val)}
                        placeholder="Select gender"
                        icon={Users}
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                          { value: 'Other', label: 'Other' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          placeholder="e.g. rahul.sharma@fugosoft.com"
                          value={basicDetails.emailAddress}
                          onChange={(e) => handleBasicChange('emailAddress', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={basicDetails.phoneNumber}
                          onChange={(e) => handleBasicChange('phoneNumber', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                /* Step 2: Job Details */
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-sm relative overflow-visible transition-all duration-300 pb-44 mb-6">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e45809] to-amber-500 rounded-t-2xl" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#e45809] text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
                        <Briefcase className="w-3 h-3" />
                        <span>Step 2 of 5</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b2138] tracking-tight">
                        Job Details
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Define the employee's role, hierarchy, branch location, and employment terms.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Employee ID <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. EMP002"
                          value={jobDetails.employeeId}
                          onChange={(e) => handleJobChange('employeeId', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Department <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomSelect
                        value={jobDetails.department}
                        onChange={(val) => handleJobChange('department', val)}
                        placeholder="Select department"
                        icon={Building2}
                        options={[
                          { value: 'Product', label: 'Product' },
                          { value: 'Production', label: 'Production' },
                          { value: 'Quality Assurance', label: 'Quality Assurance' },
                          { value: 'Engineering & Maintenance', label: 'Engineering & Maintenance' },
                          { value: 'Supply Chain', label: 'Supply Chain' },
                          { value: 'Operations', label: 'Operations' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Designation <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomSelect
                        value={jobDetails.designation}
                        onChange={(val) => handleJobChange('designation', val)}
                        placeholder="Select designation"
                        icon={Briefcase}
                        options={[
                          { value: 'UI/UX Designer', label: 'UI/UX Designer' },
                          { value: 'Plant Operator', label: 'Plant Operator' },
                          { value: 'Shift Supervisor', label: 'Shift Supervisor' },
                          { value: 'Quality Inspector', label: 'Quality Inspector' },
                          { value: 'Mechanical Technician', label: 'Mechanical Technician' },
                          { value: 'Production Manager', label: 'Production Manager' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Employment Type <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomSelect
                        value={jobDetails.employmentType}
                        onChange={(val) => handleJobChange('employmentType', val)}
                        placeholder="Select employment type"
                        icon={Briefcase}
                        options={[
                          { value: 'Full Time', label: 'Full Time' },
                          { value: 'Part Time', label: 'Part Time' },
                          { value: 'Contract', label: 'Contract' },
                          { value: 'Internship', label: 'Internship' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Joining Date <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          id="joining-date-input"
                          value={jobDetails.joiningDate}
                          onChange={(e) => handleJobChange('joiningDate', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Reporting Manager <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomSelect
                        value={jobDetails.reportingManager}
                        onChange={(val) => handleJobChange('reportingManager', val)}
                        placeholder="Select manager"
                        icon={Users}
                        options={[
                          { value: 'Amit Verma', label: 'Amit Verma' },
                          { value: 'Rajesh Sharma', label: 'Rajesh Sharma' },
                          { value: 'Pooja Patel', label: 'Pooja Patel' },
                          { value: 'Anil Kumar', label: 'Anil Kumar' }
                        ]}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Work Location <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomSelect
                        value={jobDetails.workLocation}
                        onChange={(val) => handleJobChange('workLocation', val)}
                        placeholder="Select location"
                        icon={MapPin}
                        placement="bottom"
                        options={[
                          { value: 'Bangalore', label: 'Bangalore' },
                          { value: 'Hyderabad', label: 'Hyderabad' },
                          { value: 'Chennai', label: 'Chennai' },
                          { value: 'Mumbai', label: 'Mumbai' },
                          { value: 'Pune', label: 'Pune' },
                          { value: 'Delhi NCR', label: 'Delhi NCR' },
                          { value: 'Kolkata', label: 'Kolkata' },
                          { value: 'Ahmedabad', label: 'Ahmedabad' },
                          { value: 'Visakhapatnam', label: 'Visakhapatnam' },
                          { value: 'Vijayawada', label: 'Vijayawada' },
                          { value: 'Plant 1 - Unit A', label: 'Plant 1 - Unit A' },
                          { value: 'Plant 1 - Unit B', label: 'Plant 1 - Unit B' },
                          { value: 'Warehouse East', label: 'Warehouse East' },
                          { value: 'Central Facility', label: 'Central Facility' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                /* Step 3: Salary Details */
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-sm relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e45809] to-amber-500" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#e45809] text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
                        <IndianRupee className="w-3 h-3" />
                        <span>Step 3 of 5</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b2138] tracking-tight">
                        Salary & Statutory Details
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Enter compensation package, payroll frequency, and government statutory registrations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-lg bg-orange-100/80 text-[#e45809] flex items-center justify-center">
                            <IndianRupee className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#0c233c] uppercase tracking-wider">Salary Details</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Monthly Salary (CTC) <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="text-xs font-bold">₹</span>
                              </div>
                              <input
                                type="text"
                                placeholder="e.g. 50000"
                                value={salaryDetails.monthlySalary}
                                onChange={(e) => handleSalaryChange('monthlySalary', e.target.value)}
                                className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Pay Frequency <span className="text-red-500 font-bold">*</span>
                            </label>
                            <CustomSelect
                              value={salaryDetails.payFrequency}
                              onChange={(val) => handleSalaryChange('payFrequency', val)}
                              options={[
                                { value: 'Monthly', label: 'Monthly' },
                                { value: 'Bi-Weekly', label: 'Bi-Weekly' },
                                { value: 'Weekly', label: 'Weekly' }
                              ]}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#0c233c] uppercase tracking-wider">Statutory Details</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                              PF Eligibility <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className="flex items-center gap-5 mt-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="radio"
                                  name="pfEligibility"
                                  value="Yes"
                                  checked={salaryDetails.pfEligibility === 'Yes'}
                                  onChange={() => handleSalaryChange('pfEligibility', 'Yes')}
                                  className="w-4 h-4 accent-[#e45809] cursor-pointer"
                                />
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="radio"
                                  name="pfEligibility"
                                  value="No"
                                  checked={salaryDetails.pfEligibility === 'No'}
                                  onChange={() => handleSalaryChange('pfEligibility', 'No')}
                                  className="w-4 h-4 accent-[#e45809] cursor-pointer"
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              UAN Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 101234567890"
                              value={salaryDetails.uanNumber}
                              onChange={(e) => handleSalaryChange('uanNumber', e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                              ESI Eligibility <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className="flex items-center gap-5 mt-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="radio"
                                  name="esiEligibility"
                                  value="Yes"
                                  checked={salaryDetails.esiEligibility === 'Yes'}
                                  onChange={() => handleSalaryChange('esiEligibility', 'Yes')}
                                  className="w-4 h-4 accent-[#e45809] cursor-pointer"
                                />
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="radio"
                                  name="esiEligibility"
                                  value="No"
                                  checked={salaryDetails.esiEligibility === 'No'}
                                  onChange={() => handleSalaryChange('esiEligibility', 'No')}
                                  className="w-4 h-4 accent-[#e45809] cursor-pointer"
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              ESI Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 3100012345678"
                              value={salaryDetails.esiNumber}
                              onChange={(e) => handleSalaryChange('esiNumber', e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-white border border-orange-200/70 rounded-2xl p-6 shadow-sm">
                      <div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-[#e45809] text-[10.5px] font-bold uppercase tracking-wider mb-1">
                          Breakup Preview
                        </div>
                        <h3 className="text-sm font-extrabold text-[#0c233c] tracking-tight">
                          Salary Structure <span className="font-medium text-slate-500 text-xs">(Optional)</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 mb-4">
                          Detailed allowances and compensation component breakdown.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-slate-700 shrink-0">
                            Basic Salary
                          </span>
                          <div className="relative w-44">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                              <span className="text-[11px] font-medium">₹</span>
                            </div>
                            <input
                              type="text"
                              placeholder="0"
                              value={salaryDetails.basicSalary}
                              onChange={(e) => handleSalaryChange('basicSalary', e.target.value)}
                              className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-slate-700 shrink-0">
                            HRA
                          </span>
                          <div className="relative w-44">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                              <span className="text-[11px] font-medium">₹</span>
                            </div>
                            <input
                              type="text"
                              placeholder="0"
                              value={salaryDetails.hra}
                              onChange={(e) => handleSalaryChange('hra', e.target.value)}
                              className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-slate-700 shrink-0">
                            Special Allowance
                          </span>
                          <div className="relative w-44">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                              <span className="text-[11px] font-medium">₹</span>
                            </div>
                            <input
                              type="text"
                              placeholder="0"
                              value={salaryDetails.specialAllowance}
                              onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
                              className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-slate-700 shrink-0">
                            Other Allowances
                          </span>
                          <div className="relative w-44">
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                              <span className="text-[11px] font-medium">₹</span>
                            </div>
                            <input
                              type="text"
                              placeholder="0"
                              value={salaryDetails.otherAllowances}
                              onChange={(e) => handleSalaryChange('otherAllowances', e.target.value)}
                              className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 flex items-center justify-between px-4 py-3 bg-[#1a334e] text-white rounded-xl shadow-xs">
                          <span className="text-xs font-bold tracking-wide uppercase">Total CTC</span>
                          <span className="text-sm font-black text-amber-300">₹ {computedTotalCtc()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                /* Step 4: Bank Details */
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-sm relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e45809] to-amber-500" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#e45809] text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
                        <CreditCard className="w-3 h-3" />
                        <span>Step 4 of 5</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b2138] tracking-tight">
                        Bank Details
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Enter salary disbursement account details and IFSC routing information.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Account Holder Name <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={bankDetails.accountHolderName}
                          onChange={(e) => handleBankChange('accountHolderName', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Bank Account Number <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. 50100234567890"
                          value={bankDetails.bankAccountNumber}
                          onChange={(e) => handleBankChange('bankAccountNumber', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm Account Number <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="Re-enter account number"
                          value={bankDetails.confirmAccountNumber}
                          onChange={(e) => handleBankChange('confirmAccountNumber', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        IFSC Code <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. HDFC0001234"
                          value={bankDetails.ifscCode}
                          onChange={(e) => handleBankChange('ifscCode', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium uppercase focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Bank Name
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. HDFC Bank"
                          value={bankDetails.bankName}
                          onChange={(e) => handleBankChange('bankName', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Branch Name
                      </label>
                      <div className="relative rounded-xl shadow-2xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Indiranagar Branch"
                          value={bankDetails.branchName}
                          onChange={(e) => handleBankChange('branchName', e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#e45809] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                /* Step 5: Documents Upload */
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-sm relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e45809] to-amber-500" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#e45809] text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
                        <FileText className="w-3 h-3" />
                        <span>Step 5 of 5</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b2138] tracking-tight">
                        Documents Upload
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Attach mandatory identity proofs (Aadhaar & PAN) and supporting credentials.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Aadhaar Card */}
                    <div className="border border-slate-200/90 bg-slate-50/50 hover:bg-white rounded-2xl p-5 shadow-2xs transition-all duration-200">
                      <div className="flex items-start gap-3 mb-3.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${documents.aadhaar ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-[#e45809]'}`}>
                          {documents.aadhaar ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <FileText className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0c233c]">
                            Aadhaar Card <span className="text-red-500 font-bold">*</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Upload a clear, legible copy of the Aadhaar card.
                          </div>
                        </div>
                      </div>

                      <label className="border-2 border-dashed border-slate-200 hover:border-[#e45809]/50 rounded-xl p-5 flex flex-col items-center justify-center bg-white hover:bg-orange-50/30 transition-all cursor-pointer group">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('aadhaar', e.target.files?.[0] || null)}
                        />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-orange-100 text-slate-500 group-hover:text-[#e45809] flex items-center justify-center transition-colors mb-2">
                            <Upload className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#e45809] transition-colors truncate max-w-[220px]">
                            {documents.aadhaar ? documents.aadhaar.name : 'Click to upload or drag & drop'}
                          </span>
                          <span className="text-[10.5px] text-slate-400 mt-0.5">
                            PDF, JPG, PNG (Max 5 MB)
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* PAN Card */}
                    <div className="border border-slate-200/90 bg-slate-50/50 hover:bg-white rounded-2xl p-5 shadow-2xs transition-all duration-200">
                      <div className="flex items-start gap-3 mb-3.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${documents.pan ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-[#e45809]'}`}>
                          {documents.pan ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <FileText className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0c233c]">
                            PAN Card <span className="text-red-500 font-bold">*</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Upload a clear, legible copy of the PAN card.
                          </div>
                        </div>
                      </div>

                      <label className="border-2 border-dashed border-slate-200 hover:border-[#e45809]/50 rounded-xl p-5 flex flex-col items-center justify-center bg-white hover:bg-orange-50/30 transition-all cursor-pointer group">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('pan', e.target.files?.[0] || null)}
                        />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-orange-100 text-slate-500 group-hover:text-[#e45809] flex items-center justify-center transition-colors mb-2">
                            <Upload className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#e45809] transition-colors truncate max-w-[220px]">
                            {documents.pan ? documents.pan.name : 'Click to upload or drag & drop'}
                          </span>
                          <span className="text-[10.5px] text-slate-400 mt-0.5">
                            PDF, JPG, PNG (Max 5 MB)
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Experience Letter */}
                    <div className="border border-slate-200/90 bg-slate-50/50 hover:bg-white rounded-2xl p-5 shadow-2xs transition-all duration-200">
                      <div className="flex items-start justify-between mb-3.5">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${documents.experience ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {documents.experience ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <FileText className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0c233c]">
                              Experience Letters
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Upload previous employer relieving/experience letters.
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          Optional
                        </span>
                      </div>

                      <label className="border-2 border-dashed border-slate-200 hover:border-[#e45809]/50 rounded-xl p-5 flex flex-col items-center justify-center bg-white hover:bg-orange-50/30 transition-all cursor-pointer group">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('experience', e.target.files?.[0] || null)}
                        />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-orange-100 text-slate-500 group-hover:text-[#e45809] flex items-center justify-center transition-colors mb-2">
                            <Upload className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#e45809] transition-colors truncate max-w-[220px]">
                            {documents.experience ? documents.experience.name : 'Click to upload or drag & drop'}
                          </span>
                          <span className="text-[10.5px] text-slate-400 mt-0.5">
                            PDF, JPG, PNG (Max 5 MB)
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Education Certificate */}
                    <div className="border border-slate-200/90 bg-slate-50/50 hover:bg-white rounded-2xl p-5 shadow-2xs transition-all duration-200">
                      <div className="flex items-start justify-between mb-3.5">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${documents.education ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {documents.education ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <FileText className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0c233c]">
                              Education Documents
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Upload highest qualification degrees or marksheets.
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          Optional
                        </span>
                      </div>

                      <label className="border-2 border-dashed border-slate-200 hover:border-[#e45809]/50 rounded-xl p-5 flex flex-col items-center justify-center bg-white hover:bg-orange-50/30 transition-all cursor-pointer group">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('education', e.target.files?.[0] || null)}
                        />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-orange-100 text-slate-500 group-hover:text-[#e45809] flex items-center justify-center transition-colors mb-2">
                            <Upload className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#e45809] transition-colors truncate max-w-[220px]">
                            {documents.education ? documents.education.name : 'Click to upload or drag & drop'}
                          </span>
                          <span className="text-[10.5px] text-slate-400 mt-0.5">
                            PDF, JPG, PNG (Max 5 MB)
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                /* Step 6: Review & Submit */
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-sm relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e45809] to-amber-500" />

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Step 6 of 6 • Summary</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0b2138] tracking-tight">
                        {isViewMode ? 'Employee Profile Summary' : 'Review & Confirm Registration'}
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {isViewMode
                          ? 'Detailed information and uploaded documents for this employee.'
                          : 'Verify all registered details below before finalizing and syncing with the company database.'}
                      </p>
                    </div>
                    {!isViewMode && (
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-[#e45809] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit All</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    {/* Basic Details Card */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#0c233c]">Basic Details</span>
                          </div>
                          {!isViewMode && (
                            <button
                              onClick={() => setCurrentStep(1)}
                              className="text-[11px] font-bold text-[#e45809] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Full Name</span>
                            <span className="font-bold text-slate-800">{basicDetails.firstName} {basicDetails.lastName}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Date of Birth</span>
                            <span className="font-semibold text-slate-800">{basicDetails.dateOfBirth || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Gender</span>
                            <span className="font-semibold text-slate-800">{basicDetails.gender || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Email</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[140px]">{basicDetails.emailAddress || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Phone</span>
                            <span className="font-semibold text-slate-800">{basicDetails.phoneNumber || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job Details Card */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                              <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#0c233c]">Job Details</span>
                          </div>
                          {!isViewMode && (
                            <button
                              onClick={() => setCurrentStep(2)}
                              className="text-[11px] font-bold text-[#e45809] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Employee ID</span>
                            <span className="font-bold text-[#0c233c] bg-white px-2 py-0.5 rounded border border-slate-200">{jobDetails.employeeId || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Department</span>
                            <span className="font-semibold text-slate-800">{jobDetails.department || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Designation</span>
                            <span className="font-semibold text-slate-800">{jobDetails.designation || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Type</span>
                            <span className="font-semibold text-slate-800">{jobDetails.employmentType || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Joining Date</span>
                            <span className="font-semibold text-slate-800">{jobDetails.joiningDate || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Location</span>
                            <span className="font-semibold text-slate-800">{jobDetails.workLocation || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Salary Details Card */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <IndianRupee className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#0c233c]">Salary Details</span>
                          </div>
                          {!isViewMode && (
                            <button
                              onClick={() => setCurrentStep(3)}
                              className="text-[11px] font-bold text-[#e45809] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Monthly CTC</span>
                            <span className="font-bold text-emerald-700">₹ {salaryDetails.monthlySalary || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">Frequency</span>
                            <span className="font-semibold text-slate-800">{salaryDetails.payFrequency || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">PF Eligible</span>
                            <span className="font-semibold text-slate-800">{salaryDetails.pfEligibility || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">ESI Eligible</span>
                            <span className="font-semibold text-slate-800">{salaryDetails.esiEligibility || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500">UAN No.</span>
                            <span className="font-semibold text-slate-800">{salaryDetails.uanNumber || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Bank Details Card */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[#0c233c]">Bank Details</span>
                        </div>
                        {!isViewMode && (
                          <button
                            onClick={() => setCurrentStep(4)}
                            className="text-[11px] font-bold text-[#e45809] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500">Account Holder</span>
                          <span className="font-semibold text-slate-800">{bankDetails.accountHolderName || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500">Account Number</span>
                          <span className="font-semibold text-slate-800">{bankDetails.bankAccountNumber || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500">IFSC Code</span>
                          <span className="font-semibold text-slate-800 uppercase">{bankDetails.ifscCode || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500">Bank Name</span>
                          <span className="font-semibold text-slate-800">{bankDetails.bankName || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500">Branch Name</span>
                          <span className="font-semibold text-slate-800">{bankDetails.branchName || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Documents Card */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-orange-100 text-[#e45809] flex items-center justify-center">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[#0c233c]">Attached Documents</span>
                        </div>
                        {!isViewMode && (
                          <button
                            onClick={() => setCurrentStep(5)}
                            className="text-[11px] font-bold text-[#e45809] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5 text-xs">
                        {/* Helper function to view document in new tab */}
                        {(() => {
                          const openDocInNewTab = (fileObj: File | null, fileUrl: string | null | undefined) => {
                            if (fileObj) {
                              const blobUrl = URL.createObjectURL(fileObj);
                              window.open(blobUrl, '_blank', 'noopener,noreferrer');
                              return;
                            }
                            if (fileUrl) {
                              const fullUrl = fileUrl.startsWith('http') || fileUrl.startsWith('/')
                                ? fileUrl
                                : `/api/documents/view/${fileUrl}`;
                              window.open(fullUrl, '_blank', 'noopener,noreferrer');
                            }
                          };

                          const docItems = [
                            {
                              label: 'Aadhaar Card',
                              fileObj: documents.aadhaar,
                              fileUrl: viewDocUrls.aadhaar,
                              required: true
                            },
                            {
                              label: 'PAN Card',
                              fileObj: documents.pan,
                              fileUrl: viewDocUrls.pan,
                              required: true
                            },
                            {
                              label: 'Experience Letter',
                              fileObj: documents.experience,
                              fileUrl: viewDocUrls.experience,
                              required: false
                            },
                            {
                              label: 'Education Proof',
                              fileObj: documents.education,
                              fileUrl: viewDocUrls.education,
                              required: false
                            }
                          ];

                          return docItems.map((item, idx) => {
                            const hasDoc = Boolean(item.fileObj || item.fileUrl);
                            const docName = item.fileObj
                              ? item.fileObj.name
                              : item.fileUrl
                              ? item.fileUrl.split('/').pop()
                              : 'No file chosen';

                            return (
                              <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-b-0">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span className="text-slate-700 font-semibold text-[11.5px]">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-slate-500 text-[11px] truncate max-w-[120px] sm:max-w-[150px]">
                                    {docName}
                                  </span>
                                  {hasDoc ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openDocInNewTab(item.fileObj, item.fileUrl);
                                      }}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#e45809] bg-orange-50 hover:bg-orange-100 hover:text-[#cf4d05] px-3 py-1 rounded-lg border border-orange-200/80 shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                      title={`View ${item.label} in new browser tab`}
                                    >
                                      <span>View</span>
                                      <ExternalLink className="w-3 h-3 stroke-[2.2]" />
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                                      {item.required ? 'Not uploaded' : 'Optional'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM ACTIONS / FOOTER BUTTONS */}
            <div className="w-full flex justify-end mt-7">
              {currentStep === 0 && (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="group flex items-center gap-2.5 bg-gradient-to-r from-[#e45809] to-[#c24102] hover:from-[#f26522] hover:to-[#d84d03] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {currentStep === 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStepError(null);
                      setCurrentStep(0);
                    }}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(1)) {
                        setCurrentStep(2);
                      }
                    }}
                    className="group flex items-center gap-2 bg-gradient-to-r from-[#e45809] to-[#c24102] hover:from-[#f26522] hover:to-[#d84d03] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="w-full flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStepError(null);
                      setCurrentStep(1);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(2)) {
                        setCurrentStep(3);
                      }
                    }}
                    className="group flex items-center gap-2 bg-gradient-to-r from-[#e45809] to-[#c24102] hover:from-[#f26522] hover:to-[#d84d03] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="w-full flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStepError(null);
                      setCurrentStep(2);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(3)) {
                        setCurrentStep(4);
                      }
                    }}
                    className="group flex items-center gap-2 bg-gradient-to-r from-[#e45809] to-[#c24102] hover:from-[#f26522] hover:to-[#d84d03] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {currentStep === 4 && (
                <div className="w-full flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStepError(null);
                      setCurrentStep(3);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(4)) {
                        setCurrentStep(5);
                      }
                    }}
                    className="group flex items-center gap-2 bg-gradient-to-r from-[#e45809] to-[#c24102] hover:from-[#f26522] hover:to-[#d84d03] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {currentStep === 5 && (
                <div className="w-full flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStepError(null);
                      setCurrentStep(4);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep(5)) {
                        setCurrentStep(6);
                      }
                    }}
                    className="group flex items-center gap-2 bg-gradient-to-r from-[#e45809] to-[#c24102] hover:from-[#f26522] hover:to-[#d84d03] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>Review & Confirm</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {currentStep === 6 && (
                <div className="w-full flex justify-between items-center">
                  {isViewMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('leave-management');
                        setCurrentStep(0);
                        setIsViewMode(false);
                      }}
                      className="px-6 py-2.5 bg-[#e45809] hover:bg-[#cf4d05] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-2 ml-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Employees</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={async () => {
                          if (isSubmitting) return;

                          if (!basicDetails.firstName?.trim() || !basicDetails.lastName?.trim() || !basicDetails.emailAddress?.trim()) {
                            showToast('Please fill in required fields (First Name, Last Name, Email).', 'error');
                            return;
                          }

                          const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/i;
                          if (!emailPattern.test(basicDetails.emailAddress.trim())) {
                            showToast('Invalid email address. Please enter a valid email (@gmail.com or @companyname.com).', 'error');
                            return;
                          }

                          setIsSubmitting(true);

                          try {
                            // Upload avatar & document files safely
                            let uploadedAvatarUrl: string | undefined = undefined;
                            let aadhaarUrl: string | undefined = undefined;
                            let panUrl: string | undefined = undefined;
                            let expUrl: string | undefined = undefined;
                            let eduUrl: string | undefined = undefined;

                            const uploadFile = async (f: File | null) => {
                              if (!f) return null;
                              const fd = new FormData();
                              fd.append('file', f);
                              try {
                                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                if (res.ok) {
                                  const data = await res.json();
                                  return data.url;
                                }
                              } catch (e) {
                                console.warn('Document upload warning, saving filename locally:', e);
                              }
                              return null;
                            };

                            if (avatarFile) {
                              setAvatarUploading(true);
                              uploadedAvatarUrl = (await uploadFile(avatarFile)) || undefined;
                              setAvatarUploading(false);
                            }

                            const [aadhaarRes, panRes, expRes, eduRes] = await Promise.all([
                              uploadFile(documents.aadhaar),
                              uploadFile(documents.pan),
                              uploadFile(documents.experience),
                              uploadFile(documents.education)
                            ]);
                            aadhaarUrl = aadhaarRes || undefined;
                            panUrl = panRes || undefined;
                            expUrl = expRes || undefined;
                            eduUrl = eduRes || undefined;

                            const payload = {
                              employee_id: jobDetails.employeeId === 'Auto-generated' || !jobDetails.employeeId ? null : jobDetails.employeeId,
                              first_name: basicDetails.firstName.trim(),
                              last_name: basicDetails.lastName.trim(),
                              avatar_url: uploadedAvatarUrl || null,
                              date_of_birth: basicDetails.dateOfBirth || null,
                              gender: basicDetails.gender || null,
                              email: basicDetails.emailAddress.trim(),
                              phone: basicDetails.phoneNumber?.trim() || 'N/A',
                              
                              department: jobDetails.department || 'Operations',
                              designation: jobDetails.designation || 'Specialist',
                              employment_type: jobDetails.employmentType || 'Full Time',
                              joining_date: jobDetails.joiningDate || new Date().toISOString().split('T')[0],
                              reporting_manager: jobDetails.reportingManager || null,
                              work_location: jobDetails.workLocation || 'Bangalore',
                              
                              monthly_salary: salaryDetails.monthlySalary || null,
                              pay_frequency: salaryDetails.payFrequency || 'Monthly',
                              pf_eligibility: salaryDetails.pfEligibility || 'Yes',
                              uan_number: salaryDetails.uanNumber || null,
                              esi_eligibility: salaryDetails.esiEligibility || 'Yes',
                              esi_number: salaryDetails.esiNumber || null,
                              basic_salary: salaryDetails.basicSalary || null,
                              hra: salaryDetails.hra || null,
                              special_allowance: salaryDetails.specialAllowance || null,
                              other_allowances: salaryDetails.otherAllowances || null,
                              
                              account_holder_name: bankDetails.accountHolderName || null,
                              account_number: bankDetails.bankAccountNumber || null,
                              ifsc_code: bankDetails.ifscCode || null,
                              bank_name: bankDetails.bankName || null,
                              branch_name: bankDetails.branchName || null,
                              
                              aadhaar_file: aadhaarUrl || documents.aadhaar?.name || null,
                              pan_file: panUrl || documents.pan?.name || null,
                              experience_file: expUrl || documents.experience?.name || null,
                              education_file: eduUrl || documents.education?.name || null,
                              status: 'Active'
                            };

                            if (editingEmployee) {
                              const empId = editingEmployee.rawData?.employee_id || editingEmployee.id;
                              const updatePayload = {
                                first_name: basicDetails.firstName.trim(),
                                last_name: basicDetails.lastName.trim(),
                                avatar_url: uploadedAvatarUrl || editingEmployee.avatarUrl || null,
                                date_of_birth: basicDetails.dateOfBirth || null,
                                gender: basicDetails.gender || null,
                                email: basicDetails.emailAddress.trim(),
                                phone: basicDetails.phoneNumber?.trim() || 'N/A',
                                department: jobDetails.department || 'Operations',
                                designation: jobDetails.designation || 'Specialist',
                                employment_type: jobDetails.employmentType || 'Full Time',
                                joining_date: jobDetails.joiningDate || new Date().toISOString().split('T')[0],
                                reporting_manager: jobDetails.reportingManager || null,
                                work_location: jobDetails.workLocation || 'Bangalore',
                                monthly_salary: salaryDetails.monthlySalary || null,
                                pay_frequency: salaryDetails.payFrequency || 'Monthly',
                                pf_eligibility: salaryDetails.pfEligibility || 'Yes',
                                uan_number: salaryDetails.uanNumber || null,
                                esi_eligibility: salaryDetails.esiEligibility || 'Yes',
                                esi_number: salaryDetails.esiNumber || null,
                                basic_salary: salaryDetails.basicSalary || null,
                                hra: salaryDetails.hra || null,
                                special_allowance: salaryDetails.specialAllowance || null,
                                other_allowances: salaryDetails.otherAllowances || null,
                                account_holder_name: bankDetails.accountHolderName || null,
                                account_number: bankDetails.bankAccountNumber || null,
                                ifsc_code: bankDetails.ifscCode || null,
                                bank_name: bankDetails.bankName || null,
                                branch_name: bankDetails.branchName || null,
                                aadhaar_file: aadhaarUrl || documents.aadhaar?.name || viewDocUrls.aadhaar || null,
                                pan_file: panUrl || documents.pan?.name || viewDocUrls.pan || null,
                                experience_file: expUrl || documents.experience?.name || viewDocUrls.experience || null,
                                education_file: eduUrl || documents.education?.name || viewDocUrls.education || null,
                                status: editingEmployee.status || 'Active'
                              };

                              const res = await fetch(`/api/employees/${empId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updatePayload)
                              });

                              if (!res.ok) {
                                const errData = await res.json().catch(() => ({}));
                                showToast(errData.detail || 'Failed to update employee', 'error');
                                return;
                              }

                              const updated = await res.json();
                              showToast(`Employee ${updated.first_name} ${updated.last_name} (${updated.employee_id}) updated successfully!`, 'success');
                            } else {
                              const res = await fetch('/api/employees', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                              });

                              if (!res.ok) {
                                const errData = await res.json().catch(() => ({}));
                                showToast(errData.detail || 'Failed to register employee', 'error');
                                return;
                              }

                              const saved = await res.json();
                              showToast(`Employee ${saved.first_name} ${saved.last_name} (${saved.employee_id}) registered successfully!`, 'success');
                            }

                            // Refresh table and stats
                            await Promise.all([fetchEmployees(), fetchStats()]);

                            // Reset form and view cleanly
                            setEditingEmployee(null);
                            setViewMode('leave-management');
                            setCurrentStep(0);
                            setAvatarPreview(null);
                            setAvatarFile(null);
                            
                            // Reset form fields
                            setBasicDetails({ firstName: '', lastName: '', dateOfBirth: '', gender: '', emailAddress: '', phoneNumber: '' });
                            setJobDetails({ employeeId: '', department: '', designation: '', employmentType: 'Full Time', joiningDate: '', reportingManager: '', workLocation: 'Bangalore' });
                            setSalaryDetails({ monthlySalary: '', payFrequency: 'Monthly', pfEligibility: 'Yes', uanNumber: '', esiEligibility: 'Yes', esiNumber: '', basicSalary: '', hra: '', specialAllowance: '', otherAllowances: '' });
                            setBankDetails({ accountHolderName: '', bankAccountNumber: '', confirmAccountNumber: '', ifscCode: '', bankName: '', branchName: '' });
                            setDocuments({ aadhaar: null, pan: null, experience: null, education: null });
                            setViewDocUrls({});
                          } catch (err) {
                            console.error('Error submitting employee:', err);
                            showToast('Failed to connect to backend API', 'error');
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        className={`group flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-7 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95 cursor-pointer ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[3] group-hover:scale-110 transition-transform" />
                            <span>{editingEmployee ? 'Save Changes' : 'Submit Registration'}</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      {/* MODERN FLOATING TOAST NOTIFICATION (Replaces browser alert prompts) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500/95 text-white border-emerald-600/30 shadow-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-rose-500/95 text-white border-rose-600/30 shadow-rose-500/20'
                : 'bg-slate-800/95 text-white border-slate-700/50 shadow-slate-900/30'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-white" />}
            {toast.type === 'info' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />}
            <span className="max-w-xs">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-0.5 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL POPUP (Replaces browser window.confirm top alert) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur & dark overlay */}
          <div
            onClick={() => {
              if (!deleteModal.isDeleting) {
                setDeleteModal(prev => ({ ...prev, isOpen: false }));
              }
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Modal Dialog Card */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Top decorative stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm text-rose-600">
                  <Trash2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {deleteModal.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                    {deleteModal.description}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deleteModal.isDeleting}
                  onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Warning note */}
              <div className="mt-4 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>This record will be permanently deleted from database.</span>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={deleteModal.isDeleting}
                  onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteModal.isDeleting}
                  onClick={() => deleteModal.onConfirm()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/25 active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {deleteModal.isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Yes, Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
