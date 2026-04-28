import React, { useState, useEffect } from 'react';
import { subjectService } from '../services/api';
import { useToast } from '../components/ToastProvider';
import {
  BookOpenIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
}

interface Curriculum {
  id: number;
  name: string;
  description: string;
  subjects: Subject[];
  totalCredits: number;
  duration: string;
  level: string;
}

const Curriculum: React.FC = () => {
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showCurriculumForm, setShowCurriculumForm] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Curriculum | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({ code: '', name: '', description: '' });
  const [curriculumFormData, setCurriculumFormData] = useState({ 
    name: '', 
    description: '', 
    totalCredits: 0, 
    duration: '', 
    level: 'Undergraduate' 
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Start with empty curriculum array - let users create their own programs
      let userCurriculum: Curriculum[] = [];
      
      // Try to load saved curriculum from localStorage (if any)
      const savedCurriculum = localStorage.getItem('userCurriculum');
      if (savedCurriculum) {
        try {
          userCurriculum = JSON.parse(savedCurriculum);
        } catch (error) {
          console.error('Error loading saved curriculum:', error);
        }
      }
      
      // If no saved curriculum, add default programs to show functionality
      if (userCurriculum.length === 0) {
        userCurriculum = [
          {
            id: 1,
            name: 'Bachelor of Science in Information Technology',
            description: 'Comprehensive IT program covering programming, networking, database management, web development, and system administration',
            subjects: [
              { id: 1, code: 'IT101', name: 'Introduction to Information Technology', description: 'Basic concepts of IT and computer fundamentals' },
              { id: 2, code: 'IT102', name: 'Computer Fundamentals', description: 'Hardware, software, and operating systems' },
              { id: 3, code: 'IT103', name: 'Programming Fundamentals', description: 'Introduction to programming concepts and logic' },
              { id: 4, code: 'IT104', name: 'Web Development Basics', description: 'HTML, CSS, and JavaScript fundamentals' },
              { id: 5, code: 'IT105', name: 'Database Management', description: 'SQL and database design principles' },
              { id: 6, code: 'IT106', name: 'Networking Essentials', description: 'Network protocols and infrastructure' },
              { id:7, code: 'IT107', name: 'Systems Analysis and Design', description: 'System development life cycle and methodologies' },
              { id: 8, code: 'IT108', name: 'IT Project Management', description: 'Managing IT projects and teams' },
              { id: 9, code: 'IT109', name: 'Cybersecurity Fundamentals', description: 'Information security principles and practices' },
              { id: 10, code: 'IT110', name: 'Cloud Computing', description: 'Cloud services and virtualization' },
              { id: 11, code: 'IT111', name: 'Mobile Development', description: 'iOS and Android application development' },
              { id: 12, code: 'IT112', name: 'Data Analytics', description: 'Business intelligence and data analysis' }
            ],
            totalCredits: 150,
            duration: '4 Years',
            level: 'Undergraduate'
          },
          {
            id: 2,
            name: 'Associate in Computer Technology',
            description: 'Foundational program in computer technology and support',
            subjects: [
              { id: 13, code: 'CT101', name: 'PC Hardware and Troubleshooting', description: 'Computer hardware diagnosis and repair' },
              { id: 14, code: 'CT102', name: 'Operating Systems', description: 'Windows, Linux, and macOS administration' },
              { id: 15, code: 'CT103', name: 'Help Desk Support', description: 'Technical support and customer service' },
              { id: 16, code: 'CT104', name: 'Network Fundamentals', description: 'Basic networking concepts and setup' },
              { id: 17, code: 'CT105', name: 'Security Basics', description: 'Cybersecurity fundamentals and best practices' }
            ],
            totalCredits: 90,
            duration: '2 Years',
            level: 'Associate'
          }
        ];
        
        // Save default programs to localStorage so they persist
        localStorage.setItem('userCurriculum', JSON.stringify(userCurriculum));
      }
      
      setCurriculum(userCurriculum);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectFormData.code || !subjectFormData.name) {
      toast.error('Please fill in both subject code and name');
      return;
    }

    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.id, subjectFormData);
      } else {
        await subjectService.create(subjectFormData);
      }
      
      setSubjectFormData({ code: '', name: '', description: '' });
      setEditingSubject(null);
      setShowSubjectForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Error saving subject. Please try again.');
    }
  };

  const handleCurriculumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!curriculumFormData.name || !curriculumFormData.description) {
      toast.error('Please fill in curriculum name and description');
      return;
    }

    try {
      if (editingCurriculum) {
        // Update existing curriculum
        const updatedCurriculum = curriculum.map(program => 
          program.id === editingCurriculum.id 
            ? { ...program, ...curriculumFormData }
            : program
        );
        setCurriculum(updatedCurriculum);
        localStorage.setItem('userCurriculum', JSON.stringify(updatedCurriculum));
        console.log('Updated curriculum:', editingCurriculum.id, curriculumFormData);
      } else {
        // Create new curriculum
        const newCurriculum = {
          id: Date.now(), // Generate unique ID
          name: curriculumFormData.name,
          description: curriculumFormData.description,
          totalCredits: curriculumFormData.totalCredits,
          duration: curriculumFormData.duration,
          level: curriculumFormData.level,
          subjects: [], // Start with empty subjects array
        };
        
        const updatedCurriculum = [...curriculum, newCurriculum];
        setCurriculum(updatedCurriculum);
        localStorage.setItem('userCurriculum', JSON.stringify(updatedCurriculum));
        console.log('Created new curriculum:', newCurriculum);
      }
      
      setCurriculumFormData({ 
        name: '', 
        description: '', 
        totalCredits: 0, 
        duration: '', 
        level: 'Undergraduate' 
      });
      setEditingCurriculum(null);
      setShowCurriculumForm(false);
      
      toast.success('Curriculum saved successfully!');
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast.error('Error saving curriculum. Please try again.');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description
    });
    setShowSubjectForm(true);
  };

  const handleEditCurriculum = (curriculumItem: Curriculum) => {
    setEditingCurriculum(curriculumItem);
    setCurriculumFormData({
      name: curriculumItem.name,
      description: curriculumItem.description,
      totalCredits: curriculumItem.totalCredits,
      duration: curriculumItem.duration,
      level: curriculumItem.level
    });
    setShowCurriculumForm(true);
  };

  const handleDeleteSubject = async (id: number) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Error deleting subject. Please try again.');
      }
    }
  };

  const handleDeleteCurriculum = (id: number) => {
    if (confirm('Are you sure you want to delete this curriculum?')) {
      // Remove from actual curriculum array
      const updatedCurriculum = curriculum.filter(c => c.id !== id);
      setCurriculum(updatedCurriculum);
      localStorage.setItem('userCurriculum', JSON.stringify(updatedCurriculum));
      
      console.log('Deleted curriculum:', id);
      toast.success('Curriculum deleted successfully!');
    }
  };

  const handleViewSubjects = (program: Curriculum) => {
    setSelectedProgram(program);
    setShowSubjectsModal(true);
  };

  const handleCloseSubjectsModal = () => {
    setShowSubjectsModal(false);
    setSelectedProgram(null);
  };

  const handleCancelSubject = () => {
    setSubjectFormData({ code: '', name: '', description: '' });
    setEditingSubject(null);
    setShowSubjectForm(false);
  };

  const handleCancelCurriculum = () => {
    setCurriculumFormData({ 
      name: '', 
      description: '', 
      totalCredits: 0, 
      duration: '', 
      level: 'Undergraduate' 
    });
    setEditingCurriculum(null);
    setShowCurriculumForm(false);
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
      padding: '24px', 
      backgroundColor: '#f8f9fa', 
      height: '100vh',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '18px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '18px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0,
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            Curriculum Management
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowSubjectForm(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <PlusCircleIcon style={{ width: '20px', height: '20px' }} />
              Add Subject
            </button>
            <button
              onClick={() => setShowCurriculumForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <AcademicCapIcon style={{ width: '20px', height: '20px' }} />
              Add Curriculum
            </button>
          </div>
        </div>
      </div>

      {/* Subject Modal */}
      {showSubjectForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#2c3e50',
                fontSize: '20px'
              }}>
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button
                onClick={handleCancelSubject}
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
            <form onSubmit={handleSubjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#2c3e50',
                  fontWeight: '600'
                }}>
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={subjectFormData.code}
                  onChange={(e) => setSubjectFormData({...subjectFormData, code: e.target.value})}
                  placeholder="e.g., CS101"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#2c3e50',
                  fontWeight: '600'
                }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData({...subjectFormData, name: e.target.value})}
                  placeholder="e.g., Computer Science 101"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#2c3e50',
                  fontWeight: '600'
                }}>
                  Description
                </label>
                <textarea
                  value={subjectFormData.description}
                  onChange={(e) => setSubjectFormData({...subjectFormData, description: e.target.value})}
                  placeholder="Brief description of the subject"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px'
                  }}
                >
                  <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubject}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Modal */}
      {showCurriculumForm && (
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
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            width: '90%',
            maxWidth: '600px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#2c3e50',
                fontSize: '20px'
              }}>
                {editingCurriculum ? 'Edit Curriculum' : 'Add New Curriculum'}
              </h2>
              <button
                onClick={handleCancelCurriculum}
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
            <form onSubmit={handleCurriculumSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#2c3e50',
                  fontWeight: '600'
                }}>
                  Curriculum Name *
                </label>
                <input
                  type="text"
                  value={curriculumFormData.name}
                  onChange={(e) => setCurriculumFormData({...curriculumFormData, name: e.target.value})}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#2c3e50',
                  fontWeight: '600'
                }}>
                  Description *
                </label>
                <textarea
                  value={curriculumFormData.description}
                  onChange={(e) => setCurriculumFormData({...curriculumFormData, description: e.target.value})}
                  placeholder="Comprehensive description of the curriculum program"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#2c3e50',
                    fontWeight: '600'
                  }}>
                    Total Credits
                  </label>
                  <input
                    type="number"
                    value={curriculumFormData.totalCredits}
                    onChange={(e) => setCurriculumFormData({...curriculumFormData, totalCredits: parseInt(e.target.value) || 0})}
                    placeholder="120"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#2c3e50',
                    fontWeight: '600'
                  }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={curriculumFormData.duration}
                    onChange={(e) => setCurriculumFormData({...curriculumFormData, duration: e.target.value})}
                    placeholder="4 Years"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#2c3e50',
                    fontWeight: '600'
                  }}>
                    Level
                  </label>
                  <select
                    value={curriculumFormData.level}
                    onChange={(e) => setCurriculumFormData({...curriculumFormData, level: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px'
                  }}
                >
                  <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
                  {editingCurriculum ? 'Update Curriculum' : 'Save Curriculum'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelCurriculum}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Overview */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          color: '#2c3e50',
          fontSize: '20px'
        }}>
          Academic Programs ({curriculum.length})
        </h2>
        
        {curriculum.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6c757d'
          }}>
            <AcademicCapIcon style={{ width: '60px', height: '60px', color: '#ff6b35', marginBottom: '20px' }} />
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '18px' }}>
              No Curriculum Programs Yet
            </h3>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Start by adding your first academic curriculum program.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {curriculum.map(program => (
              <div key={program.id} style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      color: '#2c3e50',
                      fontSize: '18px'
                    }}>
                      {program.name}
                    </h3>
                    <p style={{
                      margin: '0 0 12px 0',
                      color: '#6c757d',
                      fontSize: '14px'
                    }}>
                      {program.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleViewSubjects(program)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ff6b35',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <BookOpenIcon style={{ width: '16px', height: '16px' }} />
                      View Subjects
                    </button>
                    <button
                      onClick={() => handleEditCurriculum(program)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <PencilIcon style={{ width: '16px', height: '16px' }} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCurriculum(program.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <TrashIcon style={{ width: '16px', height: '16px' }} />
                      Delete
                    </button>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DocumentTextIcon style={{ width: '20px', height: '20px', color: '#ff6b35' }} />
                    <div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>Total Credits</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>{program.totalCredits}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockIcon style={{ width: '20px', height: '20px', color: '#ff6b35' }} />
                    <div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>Duration</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>{program.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AcademicCapIcon style={{ width: '20px', height: '20px', color: '#ff6b35' }} />
                    <div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>Level</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>{program.level}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpenIcon style={{ width: '20px', height: '20px', color: '#ff6b35' }} />
                    <div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>Subjects</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>{program.subjects.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subjects Modal */}
      {showSubjectsModal && selectedProgram && (
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
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{
                  margin: '0 0 8px 0',
                  color: '#2c3e50',
                  fontSize: '20px'
                }}>
                  {selectedProgram.name}
                </h2>
                <p style={{
                  margin: 0,
                  color: '#6c757d',
                  fontSize: '14px'
                }}>
                  Subjects ({selectedProgram.subjects.length})
                </p>
              </div>
              <button
                onClick={handleCloseSubjectsModal}
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

            {selectedProgram.subjects.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <BookOpenIcon style={{ width: '60px', height: '60px', color: '#ff6b35', marginBottom: '20px' }} />
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '18px' }}>
                  No Subjects Yet
                </h3>
                <p style={{ margin: 0, fontSize: '16px' }}>
                  This curriculum program doesn't have any subjects assigned yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedProgram.subjects.map(subject => (
                  <div key={subject.id} style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#2c3e50', fontSize: '16px' }}>{subject.code}</strong>
                        <span style={{ marginLeft: '8px', color: '#6c757d', fontSize: '16px' }}>{subject.name}</span>
                      </div>
                      {subject.description && (
                        <p style={{
                          margin: 0,
                          color: '#6c757d',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}>
                          {subject.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        onClick={() => handleEditSubject(subject)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <PencilIcon style={{ width: '14px', height: '14px' }} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <TrashIcon style={{ width: '14px', height: '14px' }} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #e9ecef'
            }}>
              <button
                onClick={handleCloseSubjectsModal}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curriculum;
