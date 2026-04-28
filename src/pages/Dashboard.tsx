import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService, studentService, attendanceService, leaveRequestService, announcementService } from '../services/api';
import {
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartPieIcon,
  MegaphoneIcon,
  XMarkIcon,
  } from '@heroicons/react/24/outline';

interface Announcement {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  attachment_path?: string;
  attachment_type?: string;
  attachment_name?: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalStudents: 0,
    todayAttendance: 0,
    pendingLeaveRequests: 0,
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementViewModal, setShowAnnouncementViewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get user info from localStorage
  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const userInfo = getUserInfo();
  const canCreateAnnouncement = userInfo?.role === 'master' || userInfo?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employees, students, attendances, leaveRequests, announcementsData] = await Promise.all([
          employeeService.getAll(),
          studentService.getAll(),
          attendanceService.getAll(),
          leaveRequestService.getAll(),
          announcementService.getAll(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        
        const newStats = {
          totalEmployees: employees.length,
          totalStudents: students.length,
          todayAttendance: attendances.filter((a: any) => a.date === today).length,
          pendingLeaveRequests: leaveRequests.filter((lr: any) => lr.status === 'pending').length,
        };

        setStats(newStats);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Dashboard: Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      const formData = new FormData();
      formData.append('title', announcementData.title);
      formData.append('message', announcementData.message);
      formData.append('target_audience', announcementData.target_audience);
      formData.append('is_active', announcementData.is_active ? '1' : '0');
      if (announcementData.expires_at && announcementData.expires_at !== '') {
        formData.append('expires_at', announcementData.expires_at);
      }
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      console.log('FormData being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await announcementService.create(formData);
      // Refresh announcements
      const announcementsData = await announcementService.getAll();
      setAnnouncements(announcementsData);
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error creating announcement:', error);
      console.error('Error response:', (error as any).response?.data);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  const handleUpdateAnnouncement = async (announcementData: any) => {
    try {
      const formData = new FormData();
      formData.append('title', announcementData.title);
      formData.append('message', announcementData.message);
      formData.append('target_audience', announcementData.target_audience);
      formData.append('is_active', announcementData.is_active ? '1' : '0');
      if (announcementData.expires_at && announcementData.expires_at !== '') {
        formData.append('expires_at', announcementData.expires_at);
      }
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }
      formData.append('_method', 'PUT');

      console.log('FormData being sent for update:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await announcementService.update(parseInt(editingAnnouncement!.id), formData);
      // Refresh announcements
      const announcementsData = await announcementService.getAll();
      setAnnouncements(announcementsData);
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      console.error('Error response:', (error as any).response?.data);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.delete(parseInt(id));
        // Refresh announcements
        const announcementsData = await announcementService.getAll();
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'clamp(12px, 3vw, 24px)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: 'clamp(8px, 1.5vw, 16px)',
        marginBottom: 'clamp(12px, 3vw, 20px)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          padding: 'clamp(12px, 2.5vw, 20px)',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.15)';
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: 'clamp(60px, 8vw, 80px)',
            height: 'clamp(60px, 8vw, 80px)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: '0 clamp(12px, 2vw, 16px) 0 clamp(60px, 8vw, 80px)'
          }}></div>
          <div style={{ 
            fontSize: 'clamp(12px, 2vw, 14px)', 
            color: '#64748b', 
            marginBottom: 'clamp(8px, 2vw, 12px)',
            textTransform: 'uppercase',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Total Employees
          </div>
          <div style={{ 
            fontSize: 'clamp(24px, 4vw, 36px)', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {stats.totalEmployees}
          </div>
          <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#64748b', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <UserGroupIcon style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', marginRight: '8px', color: '#3b82f6' }} />
            <span>Staff Members</span>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          padding: 'clamp(16px, 3vw, 24px)',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.15)';
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: 'clamp(60px, 8vw, 80px)',
            height: 'clamp(60px, 8vw, 80px)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
            borderRadius: '0 clamp(12px, 2vw, 16px) 0 clamp(60px, 8vw, 80px)'
          }}></div>
          <div style={{ 
            fontSize: 'clamp(12px, 2vw, 14px)', 
            color: '#64748b', 
            marginBottom: 'clamp(8px, 2vw, 12px)',
            textTransform: 'uppercase',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Total Students
          </div>
          <div style={{ 
            fontSize: 'clamp(24px, 4vw, 36px)', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {stats.totalStudents}
          </div>
          <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#64748b', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <AcademicCapIcon style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', marginRight: '8px', color: '#10b981' }} />
            <span>Enrolled Students</span>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          padding: 'clamp(16px, 3vw, 24px)',
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.15)';
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: 'clamp(60px, 8vw, 80px)',
            height: 'clamp(60px, 8vw, 80px)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            borderRadius: '0 clamp(12px, 2vw, 16px) 0 clamp(60px, 8vw, 80px)'
          }}></div>
          <div style={{ 
            fontSize: 'clamp(12px, 2vw, 14px)', 
            color: '#64748b', 
            marginBottom: 'clamp(8px, 2vw, 12px)',
            textTransform: 'uppercase',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Today's Attendance
          </div>
          <div style={{ 
            fontSize: 'clamp(24px, 4vw, 36px)', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {stats.todayAttendance}
          </div>
          <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#64748b', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <CalendarDaysIcon style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', marginRight: '8px', color: '#8b5cf6' }} />
            <span>Present Today</span>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          padding: 'clamp(16px, 3vw, 24px)',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.15)';
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: 'clamp(60px, 8vw, 80px)',
            height: 'clamp(60px, 8vw, 80px)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
            borderRadius: '0 clamp(12px, 2vw, 16px) 0 clamp(60px, 8vw, 80px)'
          }}></div>
          <div style={{ 
            fontSize: 'clamp(12px, 2vw, 14px)', 
            color: '#64748b', 
            marginBottom: 'clamp(8px, 2vw, 12px)',
            textTransform: 'uppercase',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            Pending Requests
          </div>
          <div style={{ 
            fontSize: 'clamp(24px, 4vw, 36px)', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {stats.pendingLeaveRequests}
          </div>
          <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: '#64748b', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <DocumentTextIcon style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', marginRight: '8px', color: '#f59e0b' }} />
            <span>Leave Requests</span>
          </div>
        </div>
      </div>

      {/* Quick Actions and System Status */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Quick Actions */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
            borderRadius: '0 16px 0 100px'
          }}></div>
          
          <h2 style={{ 
            margin: '0 0 24px', 
            fontSize: '20px', 
            color: '#1e293b',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              borderRadius: '50%'
            }}></div>
            Quick Actions
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => navigate('/employees')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#1d4ed8',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.25)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
                e.currentTarget.style.color = '#1d4ed8';
              }}
            >
              <PlusCircleIcon style={{ width: '24px', height: '24px' }} />
              <span>Add Employee</span>
            </button>
            
            <button
              onClick={() => navigate('/students')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                color: '#166534',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(34, 197, 94, 0.25)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
                e.currentTarget.style.color = '#166534';
              }}
            >
              <AcademicCapIcon style={{ width: '24px', height: '24px' }} />
              <span>Add Student</span>
            </button>
            
            <button
              onClick={() => navigate('/attendance')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                color: '#7c3aed',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.25)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
                e.currentTarget.style.color = '#7c3aed';
              }}
            >
              <CalendarDaysIcon style={{ width: '24px', height: '24px' }} />
              <span>Attendance</span>
            </button>
            
            <button
              onClick={() => navigate('/leave-requests')}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                color: '#c2410c',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.25)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)';
                e.currentTarget.style.color = '#c2410c';
              }}
            >
              <DocumentTextIcon style={{ width: '24px', height: '24px' }} />
              <span>Leave Requests</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
            borderRadius: '0 16px 0 100px'
          }}></div>
          
          <h2 style={{ 
            margin: '0 0 24px', 
            fontSize: '20px', 
            color: '#1e293b',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            System Status
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(40, 167, 69, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)',
                borderRadius: '0 12px 0 40px'
              }}></div>
              <div style={{ 
                fontWeight: '600', 
                color: '#155724', 
                marginBottom: '6px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                System Operational
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#155724',
                paddingLeft: '34px'
              }}>
                All systems are running normally
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(23, 162, 184, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(23, 162, 184, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(23, 162, 184, 0.1) 0%, rgba(23, 162, 184, 0.05) 100%)',
                borderRadius: '0 12px 0 40px'
              }}></div>
              <div style={{ 
                fontWeight: '600', 
                color: '#0c5460', 
                marginBottom: '6px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClockIcon style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                Last Sync
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#0c5460',
                paddingLeft: '34px'
              }}>
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 193, 7, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                borderRadius: '0 12px 0 40px'
              }}></div>
              <div style={{ 
                fontWeight: '600', 
                color: '#856404', 
                marginBottom: '6px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ChartPieIcon style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                Performance
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#856404',
                paddingLeft: '34px'
              }}>
                Response time under 200ms
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(255, 107, 53, 0.02) 100%)',
            borderRadius: '0 16px 0 100px'
          }}></div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '20px', 
              color: '#1e293b',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                borderRadius: '50%'
              }}></div>
              Announcements
            </h2>
            {canCreateAnnouncement && (
              <button
                onClick={() => setShowAnnouncementModal(true)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.3)';
                }}
              >
                <PlusCircleIcon style={{ width: '18px', height: '18px' }} />
                Create Announcement
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.length === 0 ? (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                color: '#64748b',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <MegaphoneIcon style={{ width: '30px', height: '30px', color: '#64748b' }} />
                </div>
                <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                  No Announcements Yet
                </h3>
                <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.5' }}>
                  {canCreateAnnouncement 
                    ? 'Create your first announcement to keep everyone informed.'
                    : 'No announcements available at this time. Check back later for updates.'
                  }
                </p>
              </div>
            ) : (
              announcements.map(announcement => {
                return (
                  <div key={announcement.id} style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => {
                    setSelectedAnnouncement(announcement);
                    setShowAnnouncementViewModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                      borderRadius: '12px 0 0 12px'
                    }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                          {announcement.title}
                        </h4>
                        <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.4' }}>
                          {announcement.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{
                              fontSize: '12px',
                              background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                              color: 'white',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              textTransform: 'capitalize',
                              fontWeight: '500'
                            }}>
                              {announcement.target_audience}
                            </span>
                          </div>
                        {canCreateAnnouncement && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAnnouncement(announcement);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAnnouncement(announcement.id);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginLeft: '16px',
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        minWidth: '120px'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '500',
                          color: '#475569'
                        }}>
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#94a3b8'
                        }}>
                          {new Date(announcement.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#2c3e50' }}>
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  <XMarkIcon style={{ width: '24px', height: '24px' }} />
                </button>
              </div>

              <AnnouncementForm
                onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                onCancel={() => {
                  setShowAnnouncementModal(false);
                  setEditingAnnouncement(null);
                  setSelectedFile(null);
                }}
                editingAnnouncement={editingAnnouncement}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />
            </div>
          </div>
        )}

        {/* Announcement View Modal */}
        {showAnnouncementViewModal && selectedAnnouncement && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  color: '#2c3e50',
                  fontWeight: '600',
                  lineHeight: '1.3'
                }}>
                  {selectedAnnouncement.title}
                </h2>
                <button
                  onClick={() => {
                    setShowAnnouncementViewModal(false);
                    setSelectedAnnouncement(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'capitalize'
                }}>
                  {selectedAnnouncement.target_audience}
                </span>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {new Date(selectedAnnouncement.created_at).toLocaleDateString()}
                </span>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {new Date(selectedAnnouncement.created_at).toLocaleTimeString()}
                </span>
                {selectedAnnouncement.attachment_type && (
                  <span style={{
                    fontSize: '12px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {selectedAnnouncement.attachment_type}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#2c3e50',
                whiteSpace: 'pre-wrap',
                marginBottom: '20px'
              }}>
                {selectedAnnouncement.message}
              </div>

              {/* Attachment Display */}
              {selectedAnnouncement.attachment_path && selectedAnnouncement.attachment_type && (
                <div style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2c3e50' }}>
                    Attachment: {selectedAnnouncement.attachment_name}
                  </h4>
                  {selectedAnnouncement.attachment_type === 'image' && (
                    <img
                      src={`http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`}
                      alt={selectedAnnouncement.attachment_name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '6px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        console.error('Image URL:', `http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully');
                      }}
                    />
                  )}
                  {selectedAnnouncement.attachment_type === 'video' && (
                    <video
                      controls
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '6px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        console.error('Video failed to load:', e);
                      }}
                    >
                      <source src={`http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`} />
                      Your browser does not support video tag.
                    </video>
                  )}
                  {selectedAnnouncement.attachment_type === 'audio' && (
                    <audio
                      controls
                      style={{
                        width: '100%',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        console.error('Audio failed to load:', e);
                      }}
                    >
                      <source src={`http://localhost:8000/storage/${selectedAnnouncement.attachment_path}`} />
                      Your browser does not support audio element.
                    </audio>
                  )}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  onClick={() => {
                    setShowAnnouncementViewModal(false);
                    setSelectedAnnouncement(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Announcement Form Component
const AnnouncementForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingAnnouncement?: Announcement | null;
  selectedFile?: File | null;
  setSelectedFile?: (file: File | null) => void;
}> = ({ onSubmit, onCancel, editingAnnouncement, selectedFile, setSelectedFile }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all',
    is_active: true,
    expires_at: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title,
        message: editingAnnouncement.message,
        target_audience: editingAnnouncement.target_audience,
        is_active: true,
        expires_at: ''
      });
    } else {
      setFormData({
        title: '',
        message: '',
        target_audience: 'all',
        is_active: true,
        expires_at: ''
      });
    }
  }, [editingAnnouncement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Selected file:', selectedFile);
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }
    
    console.log('Validation passed, submitting form');
    const submissionData = {
      ...formData,
      expires_at: formData.expires_at || null
    };
    onSubmit(submissionData);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={handleInputChange('title')}
          placeholder="Enter announcement title"
          style={{
            width: '100%',
            padding: '10px',
            border: errors.title ? '2px solid #e74c3c' : '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {errors.title && (
          <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
            {errors.title}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Message *
        </label>
        <textarea
          value={formData.message}
          onChange={handleInputChange('message')}
          placeholder="Enter your announcement message"
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            border: errors.message ? '2px solid #e74c3c' : '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
        {errors.message && (
          <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
            {errors.message}
          </div>
        )}
      </div>

      
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Target Audience
        </label>
        <select
          value={formData.target_audience}
          onChange={handleInputChange('target_audience')}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="all">All Users</option>
          <option value="students">Students Only</option>
          <option value="faculty">Faculty Only</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Attachment (Optional)
        </label>
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={(e) => {
            console.log('File input changed');
            const file = e.target.files?.[0];
            console.log('Selected file:', file);
            if (file) {
              console.log('File details:', {
                name: file.name,
                size: file.size,
                type: file.type
              });
              // Check file size (10MB max)
              if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                e.target.value = '';
                return;
              }
              console.log('File accepted, setting selected file');
              setSelectedFile?.(file);
            } else {
              console.log('No file selected');
            }
          }}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {selectedFile && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        {editingAnnouncement?.attachment_name && !selectedFile && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
            Current attachment: {editingAnnouncement.attachment_name}
          </div>
        )}
      </div>

      
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Expires At (Optional)
        </label>
        <input
          type="datetime-local"
          value={formData.expires_at}
          onChange={handleInputChange('expires_at')}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
        </button>
      </div>
    </form>
  );
};

export default Dashboard;
