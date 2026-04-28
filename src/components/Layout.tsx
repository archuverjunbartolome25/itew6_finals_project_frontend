import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UserGroupIcon },
  { name: 'Students', href: '/students', icon: UserGroupIcon },
  { name: 'Subjects', href: '/subjects', icon: BookOpenIcon },
  { name: 'Curriculum', href: '/curriculum', icon: AcademicCapIcon },
  { name: 'Student Profiling', href: '/student-profiling', icon: UserCircleIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check screen size and update mobile state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setSidebarHovered(false);
        setMobileMenuOpen(false);
      } else {
        setMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    const handleResize = () => {
      checkMobile();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Check if user is authenticated
  const getUserInfo = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const userInfo = getUserInfo();

  return (
    <div style={{ 
      display: 'flex',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              zIndex: 1000,
              boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.4)';
            }}
          >
            {mobileMenuOpen ? '×' : '|||'}
          </button>
          
          {/* Mobile Backdrop */}
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 998,
                transition: 'opacity 0.3s ease'
              }}
            />
          )}
        </>
      )}

      {/* Sidebar */}
      <div 
        style={{
          width: isMobile ? (mobileMenuOpen ? '280px' : '0') : ((sidebarCollapsed && !sidebarHovered) ? '80px' : '280px'),
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
          color: 'white',
          height: '100vh',
          position: 'fixed',
          zIndex: 999,
          boxShadow: isMobile && mobileMenuOpen ? '4px 0 30px rgba(0,0,0,0.5)' : '4px 0 20px rgba(0,0,0,0.3)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          overflow: 'hidden',
          left: 0,
          top: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={() => !isMobile && setSidebarHovered(true)}
        onMouseLeave={() => !isMobile && setSidebarHovered(false)}
      >
        {/* Logo Section */}
        <div style={{ 
          padding: (isMobile ? '15px 15px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '15px 15px' : '20px 20px'),
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0.05) 100%)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.1) 100%)',
            borderRadius: '0 0 0 60px'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <img 
              src="/1.jpg" 
              alt="CCS Logo" 
              style={{
                width: (isMobile ? '35px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '30px' : '45px'),
                height: (isMobile ? '35px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '30px' : '45px'),
                borderRadius: '50%',
                objectFit: 'cover',
                border: (isMobile ? '2px solid #ff6b35' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '2px solid #ff6b35' : '3px solid #ff6b35'),
                marginBottom: '8px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(255,107,53,0.3)'
              }}
            />
            {!(sidebarCollapsed && !sidebarHovered && !isMobile) && (
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#ff6b35',
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                CCS Portal
              </div>
            )}
          </div>
        </div>

        {/* Burger Button - Desktop Only */}
        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: 'absolute',
              top: '25px',
              right: '-18px',
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
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
              boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.4)';
            }}
          >
            {sidebarCollapsed ? '☰' : '✕'}
          </button>
        )}

        {/* Profile Section */}
        <div style={{ 
          padding: (isMobile ? '15px 15px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '20px 15px' : '25px 20px'),
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0.02) 100%)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)',
            borderRadius: '0 0 80px 0'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: (isMobile ? '40px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '35px' : '60px'),
              height: (isMobile ? '40px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '35px' : '60px'),
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 15px',
              fontSize: (isMobile ? '16px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '14px' : '24px'),
              fontWeight: 'bold',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 25px rgba(99,102,241,0.3)',
              border: '3px solid rgba(255,255,255,0.2)'
            }}>
              {(sidebarCollapsed && !sidebarHovered && !isMobile) ? userInfo?.name?.[0] || 'A' : userInfo?.name?.substring(0, 2) || 'AD'}
            </div>
            {!(sidebarCollapsed && !sidebarHovered && !isMobile) && (
              <>
                <h3 style={{ 
                  margin: '0 0 8px', 
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {userInfo?.name || 'Admin User'}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginBottom: '12px',
                  fontStyle: 'italic'
                }}>
                  {userInfo?.email || 'admin@pnc.edu.ph'}
                </p>
                <div style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(255,107,53,0.3)',
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
                  {userInfo?.role === 'master' ? 'Master Admin' : 'Administrator'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}>
          {/* Navigation Menu */}
          <div style={{ padding: '15px 0', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
              borderRadius: '0 0 0 100px',
              pointerEvents: 'none'
            }}></div>
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                style={{
                  padding: (isMobile ? '12px 20px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '15px 15px' : '15px 25px'),
                  margin: (isMobile ? '0 10px 6px 10px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '0 5px 6px 5px' : '0 10px 8px 10px'),
                  background: isActive 
                    ? 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)' 
                    : 'transparent',
                  borderLeft: isActive && !(sidebarCollapsed && !sidebarHovered && !isMobile) ? '4px solid #ff6b35' : 'none',
                  borderRadius: (sidebarCollapsed && !sidebarHovered && !isMobile) ? '12px' : '0 12px 12px 0',
                  cursor: 'pointer',
                  textAlign: (sidebarCollapsed && !sidebarHovered && !isMobile) ? 'center' : 'left',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: (isMobile ? '15px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '0' : '15px'),
                  justifyContent: (isMobile ? 'flex-start' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? 'center' : 'flex-start'),
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isActive ? '0 4px 15px rgba(255,107,53,0.3)' : 'none',
                  transform: isActive ? 'translateX(5px)' : 'translateX(0)',
                  animation: `slideIn 0.3s ease ${index * 0.05}s both`
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isMobile) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0.05) 100%)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isMobile) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: (isMobile ? '24px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '24px' : '28px'),
                  height: (isMobile ? '24px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '24px' : '28px'),
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,107,53,0.05) 100%)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  <item.icon style={{ 
                    width: (isMobile ? '18px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '16px' : '18px'), 
                    height: (isMobile ? '18px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '16px' : '18px'),
                    color: isActive ? '#ffffff' : '#ff6b35'
                  }} />
                </div>
                {!(sidebarCollapsed && !sidebarHovered && !isMobile) && (
                  <div style={{
                    fontSize: (isMobile ? '14px' : '15px'),
                    fontWeight: isActive ? '600' : '500',
                    letterSpacing: '0.3px'
                  }}>
                    {item.name}
                  </div>
                )}
                {isActive && !(sidebarCollapsed && !sidebarHovered && !isMobile) && (
                  <div style={{
                    position: 'absolute',
                    right: '20px',
                    width: '6px',
                    height: '6px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                )}
              </Link>
            );
          })}
          </div>
        </div>

        {/* Logout Button */}
          <div style={{ 
            padding: (isMobile ? '15px 15px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '20px 15px' : '25px 20px'),
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
                padding: (isMobile ? '14px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '14px' : '16px'),
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: (isMobile ? '14px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '13px' : '15px'),
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (isMobile ? 'flex-start' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? 'center' : 'flex-start'),
                gap: (isMobile ? '12px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '0' : '12px'),
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: (isMobile ? '20px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '20px' : '24px'),
                height: (isMobile ? '20px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '20px' : '24px'),
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}>
                <ArrowRightOnRectangleIcon style={{ 
                  width: (isMobile ? '16px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '14px' : '16px'), 
                  height: (isMobile ? '16px' : (sidebarCollapsed && !sidebarHovered && !isMobile) ? '14px' : '16px')
                }} />
              </div>
              {!(sidebarCollapsed && !sidebarHovered && !isMobile) && (
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
        marginLeft: isMobile ? '0' : ((sidebarCollapsed && !sidebarHovered) ? '80px' : '280px'),
        padding: isMobile ? '20px 15px' : '40px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingTop: isMobile ? '80px' : '40px'
      }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
