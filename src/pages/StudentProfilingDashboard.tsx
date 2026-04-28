import React, { useEffect, useMemo, useState } from 'react';
import { studentProfileService, studentService } from '../services/api';
import { useToast } from '../components/ToastProvider';
import jsPDF from 'jspdf';

interface StudentOption {
  id: number;
  full_name: string;
  student_id: string;
}

interface StudentProfile {
  id: number;
  student_id: string;
  student: {
    id: number;
    full_name: string;
    student_id: string;
    email: string;
    program: string;
    year_level: number;
  };
  academic_profile: {
    academic_history: string;
    gpa: number;
    career_aspiration: string;
  };
  activities: {
    non_academic_activities: string;
    violations: string;
    skills: string[];
    affiliations: string[];
  };
}

interface Filters {
  search: string;
}

interface FormState {
  student_id: string;
  academic_history: string;
  non_academic_activities: string;
  violations: string;
  skills: string;
  affiliations: string;
  gpa: string;
  career_aspiration: string;
}

const initialForm: FormState = {
  student_id: '',
  academic_history: '',
  non_academic_activities: '',
  violations: '',
  skills: '',
  affiliations: '',
  gpa: '',
  career_aspiration: '',
};

const StudentProfilingDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ search: '' });
  const [showForm, setShowForm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const toast = useToast();

  useEffect(() => {
    void loadStudents();
    void loadProfiles();
  }, []);

  const loadStudents = async () => {
    const data = await studentService.getAll();
    setStudents(data);
  };

  const loadProfiles = async (activeFilters: Filters = filters) => {
    try {
      setLoading(true);
      const data = await studentProfileService.getAll(activeFilters);
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  // Real-time search with debounce
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search
    const timeout = setTimeout(() => {
      void loadProfiles({ search: value });
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
  };

  const studentOptions = useMemo(
    () => students.map((s) => ({ value: String(s.id), label: `${s.full_name} (${s.student_id})` })),
    [students],
  );

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const openCreate = () => {
    setEditingProfile(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEdit = (profile: StudentProfile) => {
    setEditingProfile(profile);
    setForm({
      student_id: String(profile.student.id),
      academic_history: profile.academic_profile.academic_history ?? '',
      non_academic_activities: profile.activities.non_academic_activities ?? '',
      violations: profile.activities.violations ?? '',
      skills: (profile.activities.skills || []).join(', '),
      affiliations: (profile.activities.affiliations || []).join(', '),
      gpa: profile.academic_profile.gpa ? String(profile.academic_profile.gpa) : '',
      career_aspiration: profile.academic_profile.career_aspiration ?? '',
    });
    setShowForm(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) {
      toast.error('Please select a student');
      return;
    }

    const payload = {
      student_id: Number(form.student_id),
      academic_history: form.academic_history,
      non_academic_activities: form.non_academic_activities,
      violations: form.violations,
      skills: parseList(form.skills),
      affiliations: parseList(form.affiliations),
      gpa: form.gpa ? Number(form.gpa) : null,
      career_aspiration: form.career_aspiration,
      needs_intervention: false, // Required boolean field
    };

    console.log('Submitting payload:', payload);
    console.log('Form data:', form);

    try {
      if (editingProfile) {
        await studentProfileService.update(editingProfile.id, payload);
        toast.success('Profile updated');
      } else {
        await studentProfileService.create(payload);
        toast.success('Profile created');
      }
      setShowForm(false);
      setForm(initialForm);
      await loadProfiles();
    } catch (error) {
      console.error('Save failed', error);
      // Log detailed error response for debugging
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        console.error('Validation errors:', axiosError.response?.data?.errors);
      }
      toast.error('Failed to save profile');
    }
  };

  const deleteProfile = async (profile: StudentProfile) => {
    if (!window.confirm(`Delete profile for ${profile.student.full_name}?`)) return;
    try {
      await studentProfileService.delete(profile.id);
      toast.success('Profile deleted');
      await loadProfiles();
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to delete profile');
    }
  };

  const generatePDF = async () => {
    try {
      toast.info('Generating PDF report...');
      
      // Create a new jsPDF instance in landscape orientation for better table fit
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set up PDF dimensions and styling
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;
      
      // Add title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Student Profiles Report', margin, yPosition);
      yPosition += 12;
      
      // Add filter information if search is applied
      if (filters.search) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Filter: "${filters.search}"`, margin, yPosition);
        yPosition += 8;
      }
      
      // Add generation date and summary
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 6;
      
      if (profiles.length > 0) {
        pdf.text(`Total Records: ${profiles.length} student${profiles.length !== 1 ? 's' : ''}`, margin, yPosition);
        yPosition += 10;
      }
      
      // Add horizontal line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Check if there are profiles to include
      if (profiles.length === 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('No student profiles found matching the current filter.', margin, yPosition);
      } else {
        // Define table columns and widths (optimized for A4 landscape ~280mm usable width)
        const tableColumns = [
          { header: '#', width: 10, dataKey: 'index' },
          { header: 'Student Name', width: 35, dataKey: 'name' },
          { header: 'Student ID', width: 20, dataKey: 'studentId' },
          { header: 'Program', width: 25, dataKey: 'program' },
          { header: 'Year', width: 12, dataKey: 'yearLevel' },
          { header: 'GPA', width: 12, dataKey: 'gpa' },
          { header: 'Academic History', width: 35, dataKey: 'academicHistory' },
          { header: 'Activities', width: 35, dataKey: 'activities' },
          { header: 'Skills', width: 35, dataKey: 'skills' },
          { header: 'Affiliations', width: 30, dataKey: 'affiliations' },
          { header: 'Career', width: 30, dataKey: 'career' }
        ];
        
        // Calculate total table width
        const totalTableWidth = tableColumns.reduce((sum, col) => sum + col.width, 0);
        const startX = margin;
        const endX = margin + totalTableWidth;
        
        // Function to draw table header
        const drawTableHeader = (y: number) => {
          let x = startX;
          
          // Draw header background
          pdf.setFillColor(240, 240, 240);
          pdf.rect(startX, y - 6, totalTableWidth, 10, 'F');
          
          // Draw header borders
          pdf.setLineWidth(0.3);
          pdf.rect(startX, y - 6, totalTableWidth, 10);
          
          // Draw vertical lines and headers
          tableColumns.forEach((col, index) => {
            if (index > 0) {
              pdf.line(x, y - 6, x, y + 4);
            }
            
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text(col.header, x + 2, y);
            x += col.width;
          });
          
          return y + 10;
        };
        
        // Function to draw table row
        const drawTableRow = (y: number, data: any, isEven: boolean) => {
          let x = startX;
          
          // Draw row background for even rows
          if (isEven) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(startX, y - 6, totalTableWidth, 8, 'F');
          }
          
          // Draw row borders
          pdf.setLineWidth(0.2);
          pdf.rect(startX, y - 6, totalTableWidth, 8);
          
          // Draw vertical lines and cell data
          tableColumns.forEach((col, index) => {
            if (index > 0) {
              pdf.line(x, y - 6, x, y + 2);
            }
            
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'normal');
            
            let cellText = '';
            switch (col.dataKey) {
              case 'index':
                cellText = String(data.index);
                break;
              case 'name':
                cellText = data.student.full_name;
                break;
              case 'studentId':
                cellText = data.student.student_id;
                break;
              case 'program':
                cellText = data.student.program;
                break;
              case 'yearLevel':
                cellText = String(data.student.year_level);
                break;
              case 'gpa':
                cellText = data.academic_profile.gpa ? String(data.academic_profile.gpa) : 'N/A';
                break;
              case 'academicHistory':
                cellText = data.academic_profile.academic_history || 'N/A';
                break;
              case 'activities':
                cellText = data.activities.non_academic_activities || 'N/A';
                break;
              case 'skills':
                cellText = (data.activities.skills || []).join(', ') || 'N/A';
                break;
              case 'affiliations':
                cellText = (data.activities.affiliations || []).join(', ') || 'N/A';
                break;
              case 'career':
                cellText = data.academic_profile.career_aspiration || 'N/A';
                break;
            }
            
            // Truncate text if too long for cell (more aggressive truncation for smaller columns)
            const maxTextWidth = col.width - 3; // Reduced padding for smaller columns
            const textWidth = pdf.getTextWidth(cellText);
            if (textWidth > maxTextWidth) {
              let truncatedText = cellText;
              while (pdf.getTextWidth(truncatedText + '...') > maxTextWidth && truncatedText.length > 0) {
                truncatedText = truncatedText.slice(0, -1);
              }
              cellText = truncatedText + '...';
            }
            
            pdf.text(cellText, x + 2, y);
            x += col.width;
          });
          
          return y + 12;
        };
        
        // Draw table header
        yPosition = drawTableHeader(yPosition);
        
        // Draw table rows
        profiles.forEach((profile, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
            yPosition = drawTableHeader(yPosition);
          }
          
          // Draw row
          yPosition = drawTableRow(yPosition, { ...profile, index: index + 1 }, index % 2 === 0);
        });
        
        // Draw table bottom border
        pdf.setLineWidth(0.5);
        pdf.line(startX, yPosition - 6, endX, yPosition - 6);
      }
      
      // Save the PDF with a descriptive filename
      const filename = filters.search 
        ? `student-profiles-${filters.search.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
        : `student-profiles-${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(filename);
      toast.success('PDF report generated successfully!');
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(profiles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProfiles = profiles.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div style={{
      padding: 'clamp(8px, 2vw, 16px)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{ marginBottom: 'clamp(12px, 2.5vw, 20px)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(10px, 1.5vw, 14px)',
          marginBottom: 'clamp(8px, 1.5vw, 12px)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: 'clamp(8px, 1.5vw, 10px)',
            height: 'clamp(8px, 1.5vw, 10px)',
            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
            borderRadius: '50%'
          }}></div>
          <h1 style={{ fontSize: 'clamp(18px, 3.5vw, 28px)', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
            Student Profile Module
          </h1>
        </div>
        <p style={{ color: '#64748b', marginTop: 'clamp(4px, 1vw, 6px)', fontSize: 'clamp(12px, 2vw, 14px)', lineHeight: '1.4' }}>
          Manage comprehensive student data, view profiles, and run filters for skills/activities. 
          <strong><br></br>Tip:</strong> Use comma-separated values in filters to search for multiple items (e.g., "Programming, JavaScript, Python").
        </p>
      </div>



      <div style={{ 
        marginBottom: 'clamp(12px, 2.5vw, 20px)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 'clamp(10px, 2vw, 14px)',
        padding: 'clamp(12px, 2.5vw, 20px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
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
        
        <h3 style={{ 
          fontSize: 'clamp(14px, 2.5vw, 16px)', 
          fontWeight: '600', 
          color: '#1e293b', 
          marginBottom: 'clamp(12px, 2.5vw, 16px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(6px, 1.5vw, 8px)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: 'clamp(5px, 1vw, 6px)',
            height: 'clamp(5px, 1vw, 6px)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '50%'
          }}></div>
          Filter Student Profiles
        </h3>
        
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <label style={{ display: 'block', fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: '600', color: '#374151', marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)' }}>
              <div style={{
                width: 'clamp(6px, 1.5vw, 8px)',
                height: 'clamp(6px, 1.5vw, 8px)',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: '50%'
              }}></div>
              Search Student Profiles
            </div>
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: 'clamp(12px, 3vw, 16px)',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'clamp(16px, 3vw, 18px)',
              color: '#6366f1',
              pointerEvents: 'none'
            }}>
              
            </div>
            <input 
              placeholder="Search by name, student ID, skills, activities, or affiliations..." 
              value={filters.search} 
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: 'clamp(8px, 2vw, 12px) clamp(8px, 2vw, 12px) clamp(8px, 2vw, 12px) clamp(30px, 6vw, 40px)',
                border: '2px solid #e5e7eb',
                borderRadius: 'clamp(8px, 1.5vw, 10px)',
                fontSize: 'clamp(12px, 2vw, 14px)',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 15px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              }}
            />
          </div>
          {filters.search && (
            <div style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              fontSize: '11px',
              color: '#0369a1',
              textAlign: 'center'
            }}>
              <span>Searching for: </span>
              <strong>"{filters.search}"</strong>
              {profiles.length > 0 && (
                <span style={{ marginLeft: '8px', color: '#059669' }}>
                  ({profiles.length} result{profiles.length !== 1 ? 's' : ''} found)
                </span>
              )}
            </div>
          )}
          <div style={{
            marginTop: '12px',
            fontSize: '11px',
            color: '#64748b',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Tip: Search for anything - skills like "JavaScript", activities like "basketball", or affiliations like "Student Council"
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 'clamp(10px, 1.5vw, 14px)', 
        marginBottom: 'clamp(16px, 3vw, 28px)', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => loadProfiles()}
          style={{
            padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3.5vw, 24px)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(8px, 1.5vw, 10px)',
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(5px, 1vw, 6px)',
            flex: '1',
            minWidth: '100px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
          }}
        >
          <span>⌕</span> Apply Filters
        </button>
        <button
          onClick={() => {
            const cleared = { search: '' };
            setFilters(cleared);
            void loadProfiles(cleared);
          }}
          style={{
            padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3.5vw, 24px)',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#475569',
            border: '2px solid #e2e8f0',
            borderRadius: 'clamp(10px, 2vw, 12px)',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            flex: '1',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <span>X</span> Clear
        </button>
        <button 
          onClick={openCreate}
          style={{
            padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3.5vw, 24px)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(10px, 2vw, 12px)',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            flex: '1',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
          }}
        >
          <span>+</span> Add Student Profile
        </button>
        <button 
          onClick={generatePDF}
          disabled={profiles.length === 0}
          style={{
            padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3.5vw, 24px)',
            background: profiles.length === 0 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'clamp(10px, 2vw, 12px)',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: '600',
            cursor: profiles.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: profiles.length === 0 
              ? '0 4px 15px rgba(156, 163, 175, 0.3)' 
              : '0 4px 15px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 8px)',
            flex: '1',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            if (profiles.length > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (profiles.length > 0) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }
          }}
        >
          <span>📄</span> Generate PDF
        </button>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '256px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            border: '4px solid #6366f1',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : (
        <div style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
            borderRadius: '0 16px 0 150px'
          }}></div>
          
          <table style={{ borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
            <thead style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
              borderBottom: '2px solid #e2e8f0'
            }}>
              <tr>
                <th style={{ 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Student
                  </div>
                </th>
                <th style={{ 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Academic History
                  </div>
                </th>
                <th style={{ 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Activities
                  </div>
                </th>
                <th style={{ 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Skills
                  </div>
                </th>
                <th style={{ 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Affiliations
                  </div>
                </th>
                <th style={{ 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
                      borderRadius: '50%'
                    }}></div>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {currentProfiles.map((profile, index) => (
                <tr 
                  key={profile.id} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'all 0.3s ease',
                    background: index % 2 === 0 ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                <td style={{ padding: '55px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '3px' }}>
                      {profile.student.full_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '50%'
                      }}></div>
                      {profile.student.student_id}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#374151', 
                      maxWidth: '180px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }} title={profile.academic_profile.academic_history || 'N/A'}>
                      {profile.academic_profile.academic_history || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#374151', 
                      maxWidth: '180px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }} title={profile.activities.non_academic_activities || 'N/A'}>
                      {profile.activities.non_academic_activities || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#374151', 
                      maxWidth: '150px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }} title={(profile.activities.skills || []).join(', ') || 'N/A'}>
                      {(profile.activities.skills || []).join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#374151', 
                      maxWidth: '150px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }} title={(profile.activities.affiliations || []).join(', ') || 'N/A'}>
                      {(profile.activities.affiliations || []).join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => setSelectedProfile(profile)}
                        style={{
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }}
                        title="View Profile"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => openEdit(profile)}
                        style={{
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                        title="Edit Profile"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => void deleteProfile(profile)}
                        style={{
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }}
                        title="Delete Profile"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
          padding: '10px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Previous
          </button>

          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              borderRadius: '0 16px 0 120px'
            }}></div>
            
            <div style={{ 
              padding: '32px', 
              borderBottom: '1px solid #e2e8f0',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  borderRadius: '50%'
                }}></div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  {editingProfile ? 'Edit Student Profile' : 'Add New Student Profile'}
                </h2>
              </div>
            </div>
            <form onSubmit={submitForm} style={{ padding: '32px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Student
                    </div>
                  </label>
                  <select 
                    value={form.student_id} 
                    onChange={(e) => setForm((prev) => ({ ...prev, student_id: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select student</option>
                    {studentOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Academic History
                    </div>
                  </label>
                  <textarea 
                    placeholder="Enter academic history..." 
                    value={form.academic_history} 
                    onChange={(e) => setForm((prev) => ({ ...prev, academic_history: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      minHeight: '100px',
                      resize: 'vertical',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Non-Academic Activities
                    </div>
                  </label>
                  <textarea 
                    placeholder="Enter non-academic activities..." 
                    value={form.non_academic_activities} 
                    onChange={(e) => setForm((prev) => ({ ...prev, non_academic_activities: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      minHeight: '100px',
                      resize: 'vertical',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#f59e0b';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Violations
                    </div>
                  </label>
                  <textarea 
                    placeholder="Enter any violations..." 
                    value={form.violations} 
                    onChange={(e) => setForm((prev) => ({ ...prev, violations: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      minHeight: '100px',
                      resize: 'vertical',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ef4444';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Skills (comma-separated)
                    </div>
                  </label>
                  <input 
                    placeholder="e.g. Programming, JavaScript, Python" 
                    value={form.skills} 
                    onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#8b5cf6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Affiliations (comma-separated)
                    </div>
                  </label>
                  <input 
                    placeholder="e.g. Student Council, Tech Club" 
                    value={form.affiliations} 
                    onChange={(e) => setForm((prev) => ({ ...prev, affiliations: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ef4444';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '50%'
                      }}></div>
                      GPA
                    </div>
                  </label>
                  <input 
                    placeholder="Enter GPA (0.0 - 4.0)" 
                    type="number" 
                    min="0" 
                    max="4" 
                    step="0.01" 
                    value={form.gpa} 
                    onChange={(e) => setForm((prev) => ({ ...prev, gpa: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#f59e0b';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%'
                      }}></div>
                      Career Aspiration
                    </div>
                  </label>
                  <input 
                    placeholder="Enter career aspiration..." 
                    value={form.career_aspiration} 
                    onChange={(e) => setForm((prev) => ({ ...prev, career_aspiration: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    color: '#475569',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <span>❌</span> Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                  }}
                >
                  <span>💾</span> {editingProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Individual Student Profile
              </h2>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Student Information</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Name:</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.full_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Student ID:</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.student_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Email:</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Program:</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.program}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Year Level:</span>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{selectedProfile.student.year_level}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Academic Information</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Academic History:</span>
                    <p style={{ fontSize: '12px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.academic_profile.academic_history || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>GPA:</span>
                    <p style={{ fontSize: '12px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.academic_profile.gpa || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Career Aspiration:</span>
                    <p style={{ fontSize: '12px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.academic_profile.career_aspiration || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Activities & Skills</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Non-Academic Activities:</span>
                    <p style={{ fontSize: '12px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.activities.non_academic_activities || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Skills:</span>
                    <p style={{ fontSize: '12px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {(selectedProfile.activities.skills || []).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Affiliations:</span>
                    <p style={{ fontSize: '12px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {(selectedProfile.activities.affiliations || []).join(', ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Violations:</span>
                    <p style={{ fontSize: '12px', color: '#111827', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {selectedProfile.activities.violations || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilingDashboard;
