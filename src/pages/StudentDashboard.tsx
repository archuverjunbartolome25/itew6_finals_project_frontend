import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight, faBook, faGear, faPercent, faUser } from "@fortawesome/free-solid-svg-icons";
import { faBarChart } from "@fortawesome/free-solid-svg-icons";
import { studentService } from '../services/api';
import { useToast } from '../components/ToastProvider';

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
  date_enrolled: string;
  status: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  useEffect(() => {
    const getUserInfo = () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    };

    const userInfo = getUserInfo();
    if (!userInfo || userInfo.role !== 'student') {
      navigate('/login');
      return;
    }

    fetchStudentData(userInfo.studentId);
  }, [navigate]);

  const fetchStudentData = async (studentId: number) => {
    try {
      const students = await studentService.getAll();
      const studentData = students.find(s => s.id === studentId);
      
      if (studentData) {
        setStudent(studentData);
      } else {
        console.error('Student not found');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newPassword.trim()) errors.newPassword = 'New password is required';
    if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      console.log('Password changed for student:', student?.student_id);
      console.log('New password:', newPassword);
      
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.needsPasswordChange = false;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({ general: 'Failed to change password. Please try again.' });
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
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', 
      display: 'flex',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Sidebar */}
      <div 
        style={{
          width: (sidebarCollapsed && !sidebarHovered) ? '80px' : (sidebarHovered ? '280px' : '280px'),
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          zIndex: 999,
          boxShadow: '4px 0 20px rgba(255,107,53,0.3)',
          borderRight: '2px solid #ff6b35'
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo Section */}
        <div style={{
          padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '20px',
          textAlign: 'center',
          borderBottom: '2px solid #ff6b35',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.08) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.3) 0%, rgba(255,107,53,0.15) 100%)',
            borderRadius: '0 0 0 60px'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <img 
              src="/1.jpg" 
              alt="CCS Logo" 
              style={{
                width: (sidebarCollapsed && !sidebarHovered) ? '30px' : '50px',
                height: (sidebarCollapsed && !sidebarHovered) ? '30px' : '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: (sidebarCollapsed && !sidebarHovered) ? '2px solid #ff6b35' : '3px solid #ff6b35',
                marginBottom: '10px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
              }}
            />
            {!(sidebarCollapsed && !sidebarHovered) && (
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#ff6b35',
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Student Portal
              </div>
            )}
          </div>
        </div>

        {/* Burger Button - Always visible when collapsed, hide only when expanded and not hovered */}
        
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '-15px',
              width: '30px',
              height: '30px',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {sidebarCollapsed ? '☰' : '✕'}
          </button>


        {/* Profile Section */}
        <div style={{
          padding: (sidebarCollapsed && !sidebarHovered) ? '20px 15px' : '35px 25px',
          borderBottom: '2px solid #ff6b35',
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(255,107,53,0.03) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.08) 100%)',
            borderRadius: '0 0 80px 0'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: (sidebarCollapsed && !sidebarHovered) ? '45px' : '85px',
              height: (sidebarCollapsed && !sidebarHovered) ? '45px' : '85px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: (sidebarCollapsed && !sidebarHovered) ? '18px' : '36px',
              fontWeight: 'bold',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 25px rgba(255,107,53,0.4)',
              border: '3px solid rgba(255,255,255,0.2)'
            }}>
              {(sidebarCollapsed && !sidebarHovered) ? student?.first_name?.[0] || 'S' : `${student?.first_name?.[0] || 'S'}${student?.last_name?.[0] || 'S'}`}
            </div>
            {!(sidebarCollapsed && !sidebarHovered) && (
              <>
                <h3 style={{ 
                  margin: '0 0 8px', 
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {student?.full_name || 'Student Name'}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginBottom: '12px',
                  fontStyle: 'italic'
                }}>
                  ID: {student?.student_id || 'STUDENT-ID'}
                </p>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  {student?.status === 'active' ? 'Active Student' : 'Inactive'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}>
          <div style={{ padding: '15px 0', position: 'relative' }}>
          <div style={{
              padding: (sidebarCollapsed && !sidebarHovered) ? '18px 15px' : '18px 25px',
              margin: (sidebarCollapsed && !sidebarHovered) ? '0 5px 8px 5px' : '0 10px 12px 10px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
              borderLeft: '4px solid #ff6b35',
              borderRadius: '0 12px 12px 0',
              cursor: 'pointer',
              textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: (sidebarCollapsed && !sidebarHovered) ? '0' : '15px',
              justifyContent: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'flex-start',
              textDecoration: 'none',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              transform: 'translateX(5px)',
              animation: `slideIn 0.3s ease 0s both`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                <FontAwesomeIcon icon={faBarChart} style={{ width: '18px', height: '18px', color: '#ffffff' }} />
              </div>
              {!(sidebarCollapsed && !sidebarHovered) && (
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  letterSpacing: '0.3px'
                }}>
                  Dashboard
                </div>
              )}
              <div style={{
                position: 'absolute',
                right: '20px',
                width: '6px',
                height: '6px',
                background: '#ffffff',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
            <div style={{
              padding: (sidebarCollapsed && !sidebarHovered) ? '18px 15px' : '18px 25px',
              margin: (sidebarCollapsed && !sidebarHovered) ? '0 5px 8px 5px' : '0 10px 12px 10px',
              background: 'transparent',
              borderLeft: 'none',
              borderRadius: '0 12px 12px 0',
              cursor: 'pointer',
              textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: (sidebarCollapsed && !sidebarHovered) ? '0' : '15px',
              justifyContent: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'flex-start',
              textDecoration: 'none',
              color: '#cbd5e1',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateX(0)',
              animation: `slideIn 0.3s ease 0.05s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.08) 100%)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateX(8px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate('/student-profile')}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.1) 100%)',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <FontAwesomeIcon icon={faUser} style={{ width: '18px', height: '18px', color: '#ff6b35' }} />
            </div>
            {!(sidebarCollapsed && !sidebarHovered) && (
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '0.3px'
              }}>
                Profile
              </div>
            )}
          </div>
          <div style={{
              padding: (sidebarCollapsed && !sidebarHovered) ? '18px 15px' : '18px 25px',
              margin: (sidebarCollapsed && !sidebarHovered) ? '0 5px 8px 5px' : '0 10px 12px 10px',
              background: 'transparent',
              borderLeft: 'none',
              borderRadius: '0 12px 12px 0',
              cursor: 'pointer',
              textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: (sidebarCollapsed && !sidebarHovered) ? '0' : '15px',
              justifyContent: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'flex-start',
              textDecoration: 'none',
              color: '#cbd5e1',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateX(0)',
              animation: `slideIn 0.3s ease 0.1s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.08) 100%)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateX(8px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate('/student-subjects')}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.1) 100%)',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <FontAwesomeIcon icon={faBook} style={{ width: '18px', height: '18px', color: '#ff6b35' }} />
            </div>
            {!(sidebarCollapsed && !sidebarHovered) && (
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '0.3px'
              }}>
                Subjects
              </div>
            )}
          </div>
          <div style={{
              padding: (sidebarCollapsed && !sidebarHovered) ? '18px 15px' : '18px 25px',
              margin: (sidebarCollapsed && !sidebarHovered) ? '0 5px 8px 5px' : '0 10px 12px 10px',
              background: 'transparent',
              borderLeft: 'none',
              borderRadius: '0 12px 12px 0',
              cursor: 'pointer',
              textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: (sidebarCollapsed && !sidebarHovered) ? '0' : '15px',
              justifyContent: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'flex-start',
              textDecoration: 'none',
              color: '#cbd5e1',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateX(0)',
              animation: `slideIn 0.3s ease 0.15s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.08) 100%)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateX(8px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate('/student-grades')}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.1) 100%)',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <FontAwesomeIcon icon={faPercent} style={{ width: '18px', height: '18px', color: '#ff6b35' }} />
            </div>
            {!(sidebarCollapsed && !sidebarHovered) && (
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '0.3px'
              }}>
                Grades
              </div>
            )}
          </div>
          <div style={{
              padding: (sidebarCollapsed && !sidebarHovered) ? '18px 15px' : '18px 25px',
              margin: (sidebarCollapsed && !sidebarHovered) ? '0 5px 8px 5px' : '0 10px 12px 10px',
              background: 'transparent',
              borderLeft: 'none',
              borderRadius: '0 12px 12px 0',
              cursor: 'pointer',
              textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: (sidebarCollapsed && !sidebarHovered) ? '0' : '15px',
              justifyContent: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'flex-start',
              textDecoration: 'none',
              color: '#cbd5e1',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateX(0)',
              animation: `slideIn 0.3s ease 0.2s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.08) 100%)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateX(8px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#cbd5e1';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setShowPasswordModal(true)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.1) 100%)',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <FontAwesomeIcon icon={faGear} style={{ width: '18px', height: '18px', color: '#ff6b35' }} />
            </div>
            {!(sidebarCollapsed && !sidebarHovered) && (
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '0.3px'
              }}>
                Settings
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ 
          padding: (sidebarCollapsed && !sidebarHovered) ? '20px 15px' : '30px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.02) 100%)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)',
            borderRadius: '0 0 0 80px'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: (sidebarCollapsed && !sidebarHovered) ? '14px' : '16px',
                background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: (sidebarCollapsed && !sidebarHovered) ? '13px' : '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'flex-start',
                gap: (sidebarCollapsed && !sidebarHovered) ? '0' : '12px',
                boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(239,68,68,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,68,68,0.3)';
              }}
            >
              <FontAwesomeIcon icon={faArrowAltCircleRight} style={{ 
                width: (sidebarCollapsed && !sidebarHovered) ? '14px' : '16px', 
                height: (sidebarCollapsed && !sidebarHovered) ? '14px' : '16px'
              }} />
              {!(sidebarCollapsed && !sidebarHovered) && (
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  letterSpacing: '0.3px'
                }}>
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        marginLeft: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px', 
        transition: 'margin-left 0.3s ease' 
      }}>
        {/* Header */}
        <div style={{
          padding: 'clamp(20px, 4vw, 40px)',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,26,0.9) 100%)',
          borderBottom: '2px solid #ff6b35',
          boxShadow: '0 4px 20px rgba(255,107,53,0.2)'
        }}>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 0 12px 0',
            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
          }}>
            Student Dashboard
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: '#ffffff',
            margin: '0',
            fontWeight: '500'
          }}>
            Welcome back, {student?.first_name || 'Student'}! Here's your academic overview.
          </p>
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          padding: 'clamp(20px, 4vw, 40px)',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          overflowY: 'auto'
        }}>
          {/* Student Info Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(20px, 3vw, 30px)',
            marginBottom: 'clamp(30px, 4vw, 40px)'
          }}>
            {/* Student ID Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(255,107,53,0.15)',
              border: '2px solid #ff6b35',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,53,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,53,0.15)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <FontAwesomeIcon icon={faUser} style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ff6b35',
                  margin: '0'
                }}>
                  Student Information
                </h3>
              </div>
              <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>ID:</strong> {student?.student_id || 'N/A'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Program:</strong> {student?.program || 'N/A'}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Year:</strong> {student?.year_level || 'N/A'}</p>
                <p style={{ margin: '0' }}><strong>Status:</strong> 
                  <span style={{
                    background: student?.status === 'active' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {student?.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(255,107,53,0.15)',
              border: '2px solid #ff6b35',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,53,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,53,0.15)';
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <FontAwesomeIcon icon={faBook} style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#ff6b35',
                  margin: '0'
                }}>
                  Quick Actions
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/student-subjects')}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 15px rgba(255,107,53,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
                  }}
                >
                  View Subjects
                </button>
                <button
                  onClick={() => navigate('/student-grades')}
                  style={{
                    background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 15px rgba(255,140,66,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,140,66,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,140,66,0.3)';
                  }}
                >
                  View Grades
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 24px 0'
            }}>
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                {passwordErrors.newPassword && (
                  <div style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '5px'
                  }}>
                    {passwordErrors.newPassword}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                {passwordErrors.confirmPassword && (
                  <div style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '5px'
                  }}>
                    {passwordErrors.confirmPassword}
                  </div>
                )}
              </div>
              {passwordErrors.general && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  {passwordErrors.general}
                </div>
              )}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordErrors({});
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
