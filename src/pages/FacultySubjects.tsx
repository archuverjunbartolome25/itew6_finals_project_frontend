import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon, BookOpenIcon, CalendarDaysIcon, UserGroupIcon, DocumentTextIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface Faculty {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  status: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  schedule: string;
  room: string;
}

const FacultySubjects: React.FC = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  useEffect(() => {
    const getUserInfo = () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    };

    const userInfo = getUserInfo();
    if (!userInfo || userInfo.role !== 'faculty') {
      navigate('/login');
      return;
    }

    fetchFacultyData(userInfo.facultyId);
  }, [navigate]);

  const fetchFacultyData = async (facultyId: number) => {
    try {
      // Get user info from localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
        return;
      }
      
      const userData = JSON.parse(user);
      
      // Use the actual logged-in user's data
      const facultyData: Faculty = {
        id: userData.id || facultyId,
        email: userData.email || `faculty${facultyId}@pnc.edu.ph`,
        first_name: userData.first_name || 'Unknown',
        last_name: userData.last_name || 'User',
        department: userData.department || 'Computer Studies',
        status: userData.status || 'active'
      };
      
      setFaculty(facultyData);
      fetchSubjects();
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // Use mock courses data for now (will be fetched from backend later)
      const facultySubjects = [
        { id: 1, code: 'IT101', name: 'Introduction to Information Technology', description: 'Basic concepts of IT and computer fundamentals', credits: 3, schedule: 'MWF 8:00-9:00 AM', room: 'Room 101' },
        { id: 2, code: 'IT103', name: 'Programming Fundamentals', description: 'Introduction to programming concepts and logic', credits: 4, schedule: 'TTH 10:00-11:30 AM', room: 'Room 202' },
        { id: 3, code: 'IT105', name: 'Database Management', description: 'Database design and SQL programming', credits: 3, schedule: 'MWF 1:00-2:00 PM', room: 'Room 303' },
      ];
      
      setSubjects(facultySubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/faculty-dashboard');
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
          <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Sidebar */}
      <div 
        style={{
          width: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
          color: 'white',
          minHeight: '100vh',
          position: 'fixed',
          zIndex: 999,
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '20px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
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
              border: (sidebarCollapsed && !sidebarHovered) ? '1px solid #ff6b35' : '2px solid #ff6b35',
              marginBottom: '10px',
              transition: 'all 0.3s ease'
            }}
          />
            {!(sidebarCollapsed && !sidebarHovered) && (
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#8b5cf6',
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Faculty Subjects
              </div>
            )}
          </div>
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
            zIndex: 10
          }}
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        {/* Profile Section */}
        <div style={{
          padding: (sidebarCollapsed && !sidebarHovered) ? '20px 10px' : '30px 20px',
          borderBottom: '1px solid #34495e',
          textAlign: 'center',
          transition: 'padding 0.3s ease'
        }}>
          <div style={{
            width: (sidebarCollapsed && !sidebarHovered) ? '40px' : '80px',
            height: (sidebarCollapsed && !sidebarHovered) ? '40px' : '80px',
            borderRadius: '50%',
            backgroundColor: '#ff6b35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            fontSize: (sidebarCollapsed && !sidebarHovered) ? '16px' : '32px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            {(sidebarCollapsed && !sidebarHovered) ? faculty?.first_name?.[0] : `${faculty?.first_name?.[0]}${faculty?.last_name?.[0]}`}
          </div>
          {!(sidebarCollapsed && !sidebarHovered) && (
            <>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                {faculty?.first_name} {faculty?.last_name}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#bdc3c7',
                marginBottom: '10px'
              }}>
                {faculty?.email}
              </p>
              <span style={{
                backgroundColor: faculty?.status === 'active' ? '#ff6b35' : '#e74c3c',
                color: faculty?.status === 'active' ? '#ffffff' : '#ffffff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {faculty?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={handleBackToDashboard}
          >
            <ChartBarIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Dashboard"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            backgroundColor: '#ff6b35',
            borderLeft: (sidebarCollapsed && !sidebarHovered) ? 'none' : '4px solid #e55a2b',
            cursor: 'pointer',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            transition: 'all 0.3s ease',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <BookOpenIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " My Courses"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/faculty-schedule')}
          >
            <CalendarDaysIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Schedule"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/faculty-students')}
          >
            <UserGroupIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Students"}
          </div>
          <div style={{
            padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '15px 20px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            textAlign: (sidebarCollapsed && !sidebarHovered) ? 'center' : 'left',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff6b35'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => navigate('/faculty-leave-requests')}
          >
            <DocumentTextIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Leave Requests"}
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ padding: (sidebarCollapsed && !sidebarHovered) ? '20px 10px' : '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: (sidebarCollapsed && !sidebarHovered) ? '10px' : '12px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: (sidebarCollapsed && !sidebarHovered) ? '12px' : '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px',
        padding: '40px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
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
                <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
                Back to Dashboard
              </button>
              <h1 style={{
                margin: '0',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <BookOpenIcon style={{ width: '32px', height: '32px' }} />
                My Courses
              </h1>
            </div>
          </div>

          {/* Courses Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {subjects.map((subject) => (
              <div key={subject.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.15)';
                e.currentTarget.style.borderColor = '#ff6b35';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    backgroundColor: '#ff6b35',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: '0 4px 10px rgba(255, 107, 53, 0.3)'
                  }}>
                    📚
                  </div>
                  <div>
                    <h3 style={{
                      margin: '0',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      {subject.code}
                    </h3>
                    <p style={{
                      margin: '5px 0 0',
                      fontSize: '14px',
                      color: '#6c757d',
                      fontStyle: 'italic'
                    }}>
                      {subject.credits} credits
                    </p>
                  </div>
                </div>
                
                <h4 style={{
                  margin: '0 0 15px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  lineHeight: '1.3'
                }}>
                  {subject.name}
                </h4>
                
                <p style={{
                  margin: '0 0 20px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#6c757d'
                }}>
                  {subject.description}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '20px',
                  borderTop: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>Schedule:</div>
                    <div>{subject.schedule}</div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    textAlign: 'right'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>Room:</div>
                    <div>{subject.room}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div style={{
            marginTop: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{
              margin: '0 0 20px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2c3e50',
              borderBottom: '2px solid #ff6b35',
              paddingBottom: '10px'
            }}>
              📊 Teaching Summary
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  marginBottom: '10px'
                }}>
                  {subjects.length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  Total Courses
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#17a2b8',
                  marginBottom: '10px'
                }}>
                  {subjects.reduce((sum, s) => sum + s.credits, 0)}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  Total Credits
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#28a745',
                  marginBottom: '10px'
                }}>
                  {subjects.filter(s => s.schedule.includes('MWF')).length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  MWF Classes
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ffc107',
                  marginBottom: '10px'
                }}>
                  {subjects.filter(s => s.schedule.includes('TTH')).length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600'
                }}>
                  TTH Classes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultySubjects;
