import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import Employees from './pages/Employees';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import StudentSubjects from './pages/StudentSubjects';
import StudentProfile from './pages/StudentProfile';
import StudentAssignments from './pages/StudentAssignments';
import StudentGrades from './pages/StudentGrades';
import StudentSettings from './pages/StudentSettings';
import FacultySubjects from './pages/FacultySubjects';
import FacultySchedule from './pages/FacultySchedule';
import FacultyStudents from './pages/FacultyStudents';
import FacultyLeaveRequests from './pages/FacultyLeaveRequests';
import Curriculum from './pages/Curriculum';
import Deployments from './pages/Deployments';
import StudentProfilingDashboard from './pages/StudentProfilingDashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected Route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = localStorage.getItem('user');
  const isAuthenticated = user && JSON.parse(user).isAuthenticated;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Student Protected Route component
const StudentProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = localStorage.getItem('user');
  const isAuthenticated = user && JSON.parse(user).isAuthenticated;
  const isStudent = user && JSON.parse(user).role === 'student';
  
  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Faculty Protected Route component
const FacultyProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = localStorage.getItem('user');
  const isAuthenticated = user && JSON.parse(user).isAuthenticated;
  const isFaculty = user && JSON.parse(user).role === 'faculty';
  
  if (!isAuthenticated || !isFaculty) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/student-dashboard" element={
          <StudentProtectedRoute>
            <StudentDashboard />
          </StudentProtectedRoute>
        } />
        <Route path="/student-subjects" element={
          <StudentProtectedRoute>
            <StudentSubjects />
          </StudentProtectedRoute>
        } />
        <Route path="/student-profile" element={
          <StudentProtectedRoute>
            <StudentProfile />
          </StudentProtectedRoute>
        } />
        <Route path="/student-assignments" element={
          <StudentProtectedRoute>
            <StudentAssignments />
          </StudentProtectedRoute>
        } />
        <Route path="/student-grades" element={
          <StudentProtectedRoute>
            <StudentGrades />
          </StudentProtectedRoute>
        } />
        <Route path="/student-settings" element={
          <StudentProtectedRoute>
            <StudentSettings />
          </StudentProtectedRoute>
        } />
        <Route path="/faculty-dashboard" element={
          <FacultyProtectedRoute>
            <FacultyDashboard />
          </FacultyProtectedRoute>
        } />
        <Route path="/faculty-subjects" element={
          <FacultyProtectedRoute>
            <FacultySubjects />
          </FacultyProtectedRoute>
        } />
        <Route path="/faculty-schedule" element={
          <FacultyProtectedRoute>
            <FacultySchedule />
          </FacultyProtectedRoute>
        } />
        <Route path="/faculty-students" element={
          <FacultyProtectedRoute>
            <FacultyStudents />
          </FacultyProtectedRoute>
        } />
        <Route path="/faculty-leave-requests" element={
          <FacultyProtectedRoute>
            <FacultyLeaveRequests />
          </FacultyProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute>
            <Layout>
              <Employees />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute>
            <Layout>
              <Students />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute>
            <Layout>
              <Subjects />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/curriculum" element={
          <ProtectedRoute>
            <Layout>
              <Curriculum />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/deployments" element={
          <ProtectedRoute>
            <Layout>
              <Deployments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/student-profiling" element={
          <ProtectedRoute>
            <Layout>
              <StudentProfilingDashboard />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
