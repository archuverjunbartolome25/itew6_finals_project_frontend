import axios from 'axios';
import type { Employee, Department, Attendance, LeaveRequest } from '../types';

// Define Student type locally since it's not in types/index.ts yet
interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  year_level: number;
  program: string;
  status: 'active' | 'inactive' | 'graduated';
  date_enrolled: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const employeeService = {
  getAll: (): Promise<Employee[]> => api.get('/employees').then(res => res.data.data),
  getById: (id: number): Promise<Employee> => api.get(`/employees/${id}`).then(res => res.data),
  create: (employee: Partial<Employee>): Promise<Employee> => api.post('/employees', employee).then(res => res.data),
  update: (id: number, employee: Partial<Employee>): Promise<Employee> => api.put(`/employees/${id}`, employee).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/employees/${id}`).then(res => res.data),
  getAttendances: (id: number): Promise<Attendance[]> => api.get(`/employees/${id}/attendances`).then(res => res.data),
  getLeaveRequests: (id: number): Promise<LeaveRequest[]> => api.get(`/employees/${id}/leave-requests`).then(res => res.data),
};

export const studentService = {
  getAll: (): Promise<Student[]> => api.get('/students').then(res => res.data.data),
  getById: (id: number): Promise<Student> => api.get(`/students/${id}`).then(res => res.data),
  create: (student: Partial<Student>): Promise<Student> => api.post('/students', student).then(res => res.data),
  update: (id: number, student: Partial<Student>): Promise<Student> => api.put(`/students/${id}`, student).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/students/${id}`).then(res => res.data),
};

export const facultyService = {
  getAll: (): Promise<Employee[]> => api.get('/employees').then(res => res.data.data),
  getById: (id: number): Promise<Employee> => api.get(`/employees/${id}`).then(res => res.data),
  getCourses: (id: number): Promise<any[]> => api.get(`/employees/${id}/courses`).then(res => res.data),
  getSchedule: (id: number): Promise<any[]> => api.get(`/employees/${id}/schedule`).then(res => res.data),
  getStudents: (id: number): Promise<any[]> => api.get(`/employees/${id}/students`).then(res => res.data),
  getAnnouncements: (id: number): Promise<any[]> => api.get(`/employees/${id}/announcements`).then(res => res.data),
};

export const departmentService = {
  getAll: (): Promise<Department[]> => api.get('/departments').then(res => res.data.data),
  getById: (id: number): Promise<Department> => api.get(`/departments/${id}`).then(res => res.data),
  create: (department: Partial<Department>): Promise<Department> => api.post('/departments', department).then(res => res.data),
  update: (id: number, department: Partial<Department>): Promise<Department> => api.put(`/departments/${id}`, department).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/departments/${id}`).then(res => res.data),
};

export const subjectService = {
  getAll: (): Promise<any[]> => api.get('/subjects').then(res => res.data.data),
  getById: (id: number): Promise<any> => api.get(`/subjects/${id}`).then(res => res.data),
  create: (subject: Partial<any>): Promise<any> => api.post('/subjects', subject).then(res => res.data),
  update: (id: number, subject: Partial<any>): Promise<any> => api.put(`/subjects/${id}`, subject).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/subjects/${id}`).then(res => res.data),
};

export const attendanceService = {
  getAll: (): Promise<Attendance[]> => api.get('/attendances').then(res => res.data.data),
  getById: (id: number): Promise<Attendance> => api.get(`/attendances/${id}`).then(res => res.data),
  create: (attendance: Partial<Attendance>): Promise<Attendance> => api.post('/attendances', attendance).then(res => res.data),
  update: (id: number, attendance: Partial<Attendance>): Promise<Attendance> => api.put(`/attendances/${id}`, attendance).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/attendances/${id}`).then(res => res.data),
};

export const leaveRequestService = {
  getAll: (): Promise<LeaveRequest[]> => api.get('/leave-requests').then(res => res.data.data),
  getById: (id: number): Promise<LeaveRequest> => api.get(`/leave-requests/${id}`).then(res => res.data),
  create: (leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest> => api.post('/leave-requests', leaveRequest).then(res => res.data),
  update: (id: number, leaveRequest: Partial<LeaveRequest>): Promise<LeaveRequest> => api.put(`/leave-requests/${id}`, leaveRequest).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/leave-requests/${id}`).then(res => res.data),
  approve: (id: number, managerId: number, notes?: string): Promise<LeaveRequest> => 
    api.post(`/leave-requests/${id}/approve`, { manager_id: managerId, notes }).then(res => res.data),
  reject: (id: number, managerId: number, notes?: string): Promise<LeaveRequest> => 
    api.post(`/leave-requests/${id}/reject`, { manager_id: managerId, notes }).then(res => res.data),
};

// Student Profile Service
export const studentProfileService = {
  getAll: (filters?: any): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters?.interests) params.append('interests', filters.interests);
    if (filters?.interest_category) params.append('interest_category', filters.interest_category);
    if (filters?.gpa_min) params.append('gpa_min', filters.gpa_min);
    if (filters?.gpa_max) params.append('gpa_max', filters.gpa_max);
    if (filters?.needs_intervention) params.append('needs_intervention', filters.needs_intervention);
    if (filters?.learning_style) params.append('learning_style', filters.learning_style);
    // Unified search - searches across name, student_id, skills, activities, and affiliations
    if (filters?.search) params.append('search', filters.search);

    return api.get(`/student-profiles?${params.toString()}`).then(res => res.data.data || res.data);
  },
  getById: (id: number): Promise<any> => api.get(`/student-profiles/${id}`).then(res => res.data),
  create: (profile: any): Promise<any> => api.post('/student-profiles', profile).then(res => res.data),
  update: (id: number, profile: any): Promise<any> => api.put(`/student-profiles/${id}`, profile).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/student-profiles/${id}`).then(res => res.data),
  addInterest: (interest: any): Promise<any> => api.post('/student-interests', interest).then(res => res.data),
  removeInterest: (id: number): Promise<void> => api.delete(`/student-interests/${id}`),
  getPopularInterests: (): Promise<any> => api.get('/popular-interests').then(res => res.data),
  generateMissingProfiles: (): Promise<any> => api.post('/student-profiles/generate-missing').then(res => res.data),
};

export const announcementService = {
  getAll: (audience?: string, department?: string): Promise<any[]> => {
    const params = new URLSearchParams();
    if (audience) params.append('audience', audience);
    if (department) params.append('department', department);
    return api.get(`/announcements?${params.toString()}`).then(res => res.data.data);
  },
  getById: (id: number): Promise<any> => api.get(`/announcements/${id}`).then(res => res.data),
  create: (announcement: any): Promise<any> => {
    // Handle FormData for file uploads
    if (announcement instanceof FormData) {
      return api.post('/announcements', announcement, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => res.data);
    }
    return api.post('/announcements', announcement).then(res => res.data);
  },
  update: (id: number, announcement: any): Promise<any> => {
    // Handle FormData for file uploads
    if (announcement instanceof FormData) {
      return api.post(`/announcements/${id}`, announcement, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => res.data);
    }
    return api.put(`/announcements/${id}`, announcement).then(res => res.data);
  },
  delete: (id: number): Promise<void> => api.delete(`/announcements/${id}`).then(res => res.data),
};

export default api;
