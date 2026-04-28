import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';

interface StudentLoginFormData {
  student_id: string;
  password: string;
}

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentLoginFormData>({
    student_id: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.student_id.trim()) newErrors.student_id = 'Student ID is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Student login attempt:', formData);
      
      // Fetch all students to validate credentials
      const students = await studentService.getAll();
      console.log('Fetched students:', students);
      
      if (!students || students.length === 0) {
        setErrors({ general: 'No student data available. Please try again.' });
        return;
      }
      
      // Find student by student_id
      const student = students.find(stu => stu.student_id === formData.student_id);
      console.log('Student found:', student);
      
      if (!student) {
        setErrors({ general: 'Invalid Student ID or password' });
        return;
      }
      
      // Check if student is active
      if (student.status !== 'active') {
        setErrors({ general: 'Student account is not active. Please contact administrator.' });
        return;
      }
      
      // Validate password (default password or changed password)
      // For now, we'll use the default password
      const defaultPassword = 'pncdangalngbayan2026';
      if (formData.password !== defaultPassword) {
        setErrors({ general: 'Invalid Student ID or password' });
        return;
      }
      
      // Store student info in localStorage
      const userData = {
        id: formData.student_id,
        studentId: student.id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        role: 'student',
        isAuthenticated: true,
        needsPasswordChange: true // Flag to prompt password change
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Student user data stored:', userData);
      
      console.log('About to navigate to student dashboard...');
      navigate('/student-dashboard');
      return;
    } catch (error: any) {
      console.error('Student login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentLoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (errors.general) {
      setErrors({ ...errors, general: '' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            Student Portal
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            CSS Department - Office Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Student ID
            </label>
            <input
              type="text"
              value={formData.student_id}
              onChange={handleInputChange('student_id')}
              placeholder="Enter your Student ID"
              style={{
                width: '100%',
                padding: '12px',
                border: errors.student_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
            {errors.student_id && (
              <div style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                {errors.student_id}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: errors.password ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
            {errors.password && (
              <div style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                {errors.password}
              </div>
            )}
          </div>

          {errors.general && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px',
              color: '#991b1b',
              fontSize: '14px'
            }}>
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '500' }}>
            Login Information:
          </div>
          <div>• Username: Your Student ID</div>
          <div>• Default Password: pncdangalngbayan2026</div>
          <div>• Change password after first login</div>
          <div style={{ marginTop: '8px' }}>
            <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              ← Back to Faculty/Staff Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
