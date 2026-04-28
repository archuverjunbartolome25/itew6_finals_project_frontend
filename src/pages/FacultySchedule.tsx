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

const FacultySchedule: React.FC = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
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
      // Mock faculty data for now
      const facultyData = {
        id: facultyId,
        email: `faculty${facultyId}@pnc.edu.ph`,
        first_name: 'John',
        last_name: 'Doe',
        department: 'Computer Studies',
        status: 'active'
      };
      
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching faculty data:', error);
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
          <p style={{ marginTop: '20px', color: '#6c757d' }}>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#f8f9fa', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Sidebar */}
      <div 
        style={{
          width: (sidebarCollapsed && !sidebarHovered) ? '80px' : '280px',
          backgroundColor: '#1a1a1a',
          color: 'white',
          minHeight: '100vh',
          position: 'fixed',
          zIndex: 999
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: (sidebarCollapsed && !sidebarHovered) ? '15px 10px' : '20px',
          textAlign: 'center',
          borderBottom: '1px solid #34495e',
          transition: 'padding 0.3s ease'
        }}>
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
          onClick={() => navigate('/faculty-subjects')}
          >
            <BookOpenIcon style={{ width: '20px', height: '20px' }} />
            {!(sidebarCollapsed && !sidebarHovered) && " My Courses"}
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
                <CalendarDaysIcon style={{ width: '32px', height: '32px' }} />
                My Schedule
              </h1>
            </div>
          </div>

          {/* Schedule Content */}
          <div style={{
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
              📅 Weekly Schedule
            </h2>
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6c757d'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>
                📋
              </div>
              <h3 style={{
                margin: '0 0 10px',
                fontSize: '18px',
                color: '#2c3e50'
              }}>
                Schedule Coming Soon
              </h3>
              <p style={{
                margin: '0',
                fontSize: '14px'
              }}>
                Your weekly teaching schedule will be displayed here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultySchedule;
