import React, { useState, useEffect } from 'react';
import type { Employee } from '../types';
import { employeeService } from '../services/api';
import { useToast } from '../components/ToastProvider';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    date_created: '',
    status: 'active' as 'active' | 'inactive' | 'terminated',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const employeesData = await employeeService.getAll();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+63\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be a valid PH number, e.g. +639171234567';
    }
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.date_created) newErrors.date_created = 'Date created is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string) => {
    // Keep only digits
    let digits = value.replace(/\D/g, '');

    // Normalize common PH formats:
    //  - 09XXXXXXXXX  -> 9XXXXXXXXX
    //  - 63XXXXXXXXXX -> 9XXXXXXXXX (strip country code)
    if (digits.startsWith('63')) {
      digits = digits.slice(2);
    } else if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    // Limit to 10 digits (PH mobile local part)
    digits = digits.slice(0, 10);

    const formatted = digits ? `+63${digits}` : '';

    setFormData(prev => ({ ...prev, phone: formatted }));

    // Clear phone error as user corrects it
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isEditing = !!editingEmployee;

    try {
      const employeeData = {
        ...formData,
        // Add default values for required backend fields
        salary: 0, // Default salary for CSS department
        hire_date: formData.date_created, // Use date_created as hire_date
      };
      
      console.log('Sending employee data:', employeeData);

      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, employeeData);
      } else {
        await employeeService.create(employeeData);
      }

      await fetchData();
      setShowModal(false);
      setEditingEmployee(null);
      resetForm();
      setErrors({});

      toast.success(
        isEditing ? 'Employee updated successfully.' : 'Employee added successfully.',
      );
    } catch (error: any) {
      console.error('Error saving employee:', error);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        console.error('Error message:', error.response.data.message);
      } else {
        console.error('Unknown error:', error);
      }

      toast.error('Failed to save employee. Please try again.');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      date_created: employee.created_at || '',
      status: employee.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.delete(id);
        await fetchData();
        toast.success('Employee deleted successfully.');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
      // for new employees, use today's date automatically
      date_created: new Date().toISOString().slice(0, 10),
      status: 'active' as 'active' | 'inactive' | 'terminated',
    });
    setErrors({});
  };

  const filteredEmployees = Array.isArray(employees) ? employees.filter(employee =>
    employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div style={{ 
        padding: 'clamp(12px, 3vw, 24px)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '256px' 
        }}>
          <div style={{ 
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      overflow: 'auto',
      boxSizing: 'border-box',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'clamp(16px, 3vw, 24px)',
        flexWrap: 'wrap',
        gap: 'clamp(12px, 2vw, 20px)',
        padding: 'clamp(12px, 3vw, 24px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 2vw, 16px)'
        }}>
          <div style={{
            width: 'clamp(10px, 2vw, 12px)',
            height: 'clamp(10px, 2vw, 12px)',
            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
            borderRadius: '50%'
          }}></div>
          <h1 style={{ 
            fontSize: 'clamp(20px, 4vw, 28px)', 
            fontWeight: 'bold', 
            color: '#1e293b', 
            margin: 0,
            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Employees
          </h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingEmployee(null);
            setShowModal(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: 'clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 28px)',
            borderRadius: 'clamp(10px, 2vw, 12px)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            gap: 'clamp(6px, 1.5vw, 8px)'
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
          <span style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}>+</span>
          Add Employee
        </button>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 'clamp(12px, 2vw, 16px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        position: 'relative',
        margin: '0 clamp(12px, 3vw, 24px)'
      }}>
        <div style={{ 
          padding: 'clamp(12px, 2.5vw, 20px)', 
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: 'clamp(40px, 8vw, 50px)',
                paddingRight: 'clamp(16px, 3vw, 24px)',
                padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 24px)',
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: 'clamp(10px, 2vw, 12px)',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 15px rgba(16, 185, 129, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              }}
            />
            <div style={{
              position: 'absolute',
              left: 'clamp(12px, 3vw, 16px)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#10b981',
              fontSize: 'clamp(16px, 3vw, 18px)',
              pointerEvents: 'none'
            }}>
              
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderBottom: '2px solid rgba(255,107,53,0.1)'
            }}>
              <tr>
                <th style={{ 
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2.5vw, 16px)', 
                  textAlign: 'left', 
                  fontSize: 'clamp(11px, 2vw, 12px)', 
                  fontWeight: '600', 
                  color: '#475569', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Name
                </th>
                <th style={{ 
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2.5vw, 16px)', 
                  textAlign: 'left', 
                  fontSize: 'clamp(11px, 2vw, 12px)', 
                  fontWeight: '600', 
                  color: '#475569', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email
                </th>
                <th style={{ 
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2.5vw, 16px)', 
                  textAlign: 'left', 
                  fontSize: 'clamp(11px, 2vw, 12px)', 
                  fontWeight: '600', 
                  color: '#475569', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Position
                </th>
                <th style={{ 
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2.5vw, 16px)', 
                  textAlign: 'left', 
                  fontSize: 'clamp(11px, 2vw, 12px)', 
                  fontWeight: '600', 
                  color: '#475569', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Date Created
                </th>
                <th style={{ 
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2.5vw, 16px)', 
                  textAlign: 'left', 
                  fontSize: 'clamp(11px, 2vw, 12px)', 
                  fontWeight: '600', 
                  color: '#475569', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2.5vw, 16px)', 
                  textAlign: 'left', 
                  fontSize: 'clamp(11px, 2vw, 12px)', 
                  fontWeight: '600', 
                  color: '#475569', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {employee.first_name} {employee.last_name}
                    </div>
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{employee.email}</div>
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{employee.position}</div>
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      {new Date(employee.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '9999px',
                      backgroundColor: employee.status === 'active' ? '#dcfce7' :
                                    employee.status === 'inactive' ? '#fef3c7' : '#fee2e2',
                      color: employee.status === 'active' ? '#166534' :
                              employee.status === 'inactive' ? '#92400e' : '#991b1b',
                    }}>
                      {employee.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap', fontSize: '14px' }}>
                    <button
                      onClick={() => handleEdit(employee)}
                      style={{
                        color: '#3b82f6',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '12px',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Edit Employee"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                    >
                      <PencilIcon style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      style={{
                        color: '#ef4444',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete Employee"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                    >
                      <TrashIcon style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 50
        }}>
          <div style={{
            position: 'relative',
            marginTop: '80px',
            marginRight: 'auto',
            marginLeft: 'auto',
            padding: '20px',
            border: '1px solid #d1d5db',
            width: '600px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.first_name ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {errors.first_name && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.first_name}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.last_name ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {errors.last_name && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.last_name}
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.email ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {errors.email && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.email}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+639XXXXXXXXX"
                    maxLength={13}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.phone ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {errors.phone && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.phone}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Position
                  </label>
                  <select
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.position ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Position</option>
                    <option value="Dean">Dean</option>
                    <option value="Dept Chair">Dept Chair</option>
                    <option value="Prof">Prof</option>
                    <option value="Secretary">Secretary</option>
                  </select>
                  {errors.position && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.position}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Date Created
                  </label>
                  <input
                    type="date"
                    value={formData.date_created}
                    readOnly
                    disabled={!editingEmployee}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: errors.date_created ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {errors.date_created && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.date_created}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'terminated' })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    color: 'white',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
