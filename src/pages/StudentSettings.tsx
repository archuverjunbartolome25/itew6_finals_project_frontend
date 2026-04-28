import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight, faBook, faChartLine, faGear, faPercent, faUser } from "@fortawesome/free-solid-svg-icons";
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

const StudentSettings: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const isCollapsed = sidebarCollapsed && !sidebarHovered;

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
      const studentData = students.find((s: Student) => s.id === studentId);

      if (studentData) {
        setStudent(studentData);
      } else {
        console.error('Student not found');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!newPassword.trim()) errors.newPassword = 'New password is required';
    else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
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
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ff6b35',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading settings...</p>
        </div>
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
          width: isCollapsed ? '80px' : '280px',
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
          padding: isCollapsed ? '15px 10px' : '20px',
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
          <img
            src="/1.jpg"
            alt="CCS Logo"
            style={{
              width: isCollapsed ? '30px' : '50px',
              height: isCollapsed ? '30px' : '50px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: isCollapsed ? '2px solid #ff6b35' : '3px solid #ff6b35',
              marginBottom: '10px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
            }}
          />
          {!isCollapsed && (
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

        {/* Burger Button */}
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
            fontSize: '16px',
            fontWeight: 'bold',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        {/* Profile Section */}
        <div style={{
          padding: isCollapsed ? '20px 10px' : '30px 20px',
          borderBottom: '1px solid #34495e',
          textAlign: 'center',
          transition: 'padding 0.3s ease'
        }}>
          <div style={{
            width: isCollapsed ? '40px' : '80px',
            height: isCollapsed ? '40px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#ff6b35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            fontSize: isCollapsed ? '16px' : '32px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            {isCollapsed
              ? student?.first_name?.[0]
              : `${student?.first_name?.[0] ?? ''}${student?.last_name?.[0] ?? ''}`}
          </div>
          {!isCollapsed && (
            <>
              <h3 style={{ margin: '0 0 5px', fontSize: '18px' }}>
                {student?.full_name}
              </h3>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: '#bdc3c7',
                marginBottom: '10px'
              }}>
                {student?.student_id}
              </p>
              <span style={{
                backgroundColor: student?.status === 'active' ? '#ff6b35' : '#e74c3c',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {student?.status === 'active' ? 'Enrolled' : 'Not Enrolled'}
              </span>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          {[
            { icon: faBarChart, label: 'Dashboard', action: handleBackToDashboard, active: false },
            { icon: faUser, label: 'Profile', action: () => navigate('/student-profile'), active: false },
            { icon: faBook, label: 'Subject', action: () => navigate('/student-subjects'), active: false },
            { icon: faChartLine, label: 'Assignments', action: () => navigate('/student-assignments'), active: false },
            { icon: faPercent, label: 'Grades', action: () => navigate('/student-grades'), active: false },
            { icon: faGear, label: 'Settings', action: () => {}, active: true },
          ].map(({ icon, label, action, active }) => (
            <div
              key={label}
              style={{
                padding: isCollapsed ? '15px 10px' : '15px 20px',
                backgroundColor: active ? '#ff6b35' : 'transparent',
                borderLeft: active && !isCollapsed ? '4px solid #e55a2b' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                textAlign: isCollapsed ? 'center' : 'left',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#ff6b35'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={action}
            >
              <FontAwesomeIcon icon={icon} />
              {!isCollapsed && ` ${label}`}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div style={{ padding: isCollapsed ? '20px 10px' : '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: isCollapsed ? '10px' : '12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: isCollapsed ? '12px' : '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isCollapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isCollapsed ? '80px' : '280px',
        padding: '40px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(255,107,53,0.15)',
            border: '2px solid #ff6b35'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <button
                onClick={handleBackToDashboard}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e55a2b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
              >
                <FontAwesomeIcon icon={faArrowAltCircleRight} />
                Back to Dashboard
              </button>
              <h1 style={{
                margin: '0',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#ff6b35',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FontAwesomeIcon icon={faGear} />
                Settings
              </h1>
            </div>
          </div>

          {/* Settings Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {/* Account Settings */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(255,107,53,0.15)',
              border: '2px solid #ff6b35'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ff6b35',
                borderBottom: '2px solid #ff6b35',
                paddingBottom: '10px'
              }}>
                🔐 Account Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e55a2b'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
                >
                  🔑 Change Password
                </button>
                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
                >
                  📧 Update Email
                </button>
                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                >
                  📱 Update Phone
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(255,107,53,0.15)',
              border: '2px solid #ff6b35'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ff6b35',
                borderBottom: '2px solid #ff6b35',
                paddingBottom: '10px'
              }}>
                🔒 Privacy Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[
                  { label: 'Profile Visibility', defaultChecked: true },
                  { label: 'Email Notifications', defaultChecked: true },
                  { label: 'SMS Notifications', defaultChecked: false },
                ].map(({ label, defaultChecked }) => (
                  <div key={label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0'
                  }}>
                    <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{label}</span>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '50px',
                      height: '24px'
                    }}>
                      <input type="checkbox" defaultChecked={defaultChecked} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: defaultChecked ? '#ff6b35' : '#ccc',
                        transition: '.4s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '18px',
                          width: '18px',
                          left: defaultChecked ? 'auto' : '3px',
                          right: defaultChecked ? '3px' : 'auto',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '.4s',
                          borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* System Settings */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(255,107,53,0.15)',
              border: '2px solid #ff6b35'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ff6b35',
                borderBottom: '2px solid #ff6b35',
                paddingBottom: '10px'
              }}>
                ⚙️ System Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[
                  { label: 'Dark Mode', defaultChecked: false },
                  { label: 'Auto-save', defaultChecked: true },
                ].map(({ label, defaultChecked }) => (
                  <div key={label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0'
                  }}>
                    <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{label}</span>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '50px',
                      height: '24px'
                    }}>
                      <input type="checkbox" defaultChecked={defaultChecked} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: defaultChecked ? '#ff6b35' : '#ccc',
                        transition: '.4s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '18px',
                          width: '18px',
                          left: defaultChecked ? 'auto' : '3px',
                          right: defaultChecked ? '3px' : 'auto',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '.4s',
                          borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>
                ))}
                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#ffc107',
                    color: '#212529',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                >
                  🗑️ Clear Cache
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
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            borderRadius: '16px',
            padding: '30px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 10px 30px rgba(255,107,53,0.3)',
            border: '2px solid #ff6b35'
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#ff6b35',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🔐 Change Password
            </h3>

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ff6b35',
                  marginBottom: '8px'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: passwordErrors.newPassword ? '1px solid #e74c3c' : '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: '#0a0a0a',
                    color: 'white'
                  }}
                />
                {passwordErrors.newPassword && (
                  <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>
                    {passwordErrors.newPassword}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ff6b35',
                  marginBottom: '8px'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: passwordErrors.confirmPassword ? '1px solid #e74c3c' : '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: '#0a0a0a',
                    color: 'white'
                  }}
                />
                {passwordErrors.confirmPassword && (
                  <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>
                    {passwordErrors.confirmPassword}
                  </div>
                )}
              </div>

              {passwordErrors.general && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '20px',
                  color: '#721c24',
                  fontSize: '14px'
                }}>
                  {passwordErrors.general}
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordErrors({});
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSettings;
