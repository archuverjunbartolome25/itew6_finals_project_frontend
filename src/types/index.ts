export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  hire_date: string;
  status: 'active' | 'inactive' | 'terminated';
  department?: Department;
  attendances?: Attendance[];
  leave_requests?: LeaveRequest[];
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_name?: string;
  location?: string;
  budget?: number;
  employee_count?: number;
  employees?: Employee[];
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  work_hours?: number;
  employee?: Employee;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  type: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  manager_notes?: string;
  approved_by?: number;
  employee?: Employee;
  approvedBy?: Employee;
  created_at: string;
  updated_at: string;
}
