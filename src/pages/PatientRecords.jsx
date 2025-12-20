/**
 * Patient Records Page
 * Manage patient records with CRUD operations
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { fetchPatients, setFilters } from '../store/slices/patientSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import { formatDate } from '../utils/helpers';

const PatientRecords = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { patients, loading, filters } = useSelector((state) => state.patients);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch patients on mount
        dispatch(fetchPatients({ page: 1, limit: 10 }));
    }, [dispatch]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Debounce search - In production, use debounce helper
        dispatch(setFilters({ search: query }));
    };

    const handleAddPatient = () => {
        navigate('/patients/add');
    };

    const handleEditPatient = (patient) => {
        // TODO: Open modal to edit patient
        alert(`Edit patient: ${patient.name || patient.id}`);
    };

    const handleDeletePatient = (patient) => {
        // TODO: Confirm and delete patient
        if (confirm(`Are you sure you want to delete this patient?`)) {
            alert(`Delete patient: ${patient.name || patient.id}`);
        }
    };

    // Table columns
    const columns = [
        {
            header: 'Patient ID',
            accessor: 'id',
            render: (row) => (
                <span className="font-mono text-sm">{row.id || 'P-001'}</span>
            ),
        },
        {
            header: 'Name',
            accessor: 'name',
            render: (row) => (
                <div>
                    <p className="font-medium text-neutral-900">{row.name || 'Patient Name'}</p>
                    <p className="text-xs text-neutral-500">{row.email || 'patient@example.com'}</p>
                </div>
            ),
        },
        {
            header: 'Age / Gender',
            accessor: 'age',
            render: (row) => `${row.age || '45'} / ${row.gender || 'M'}`,
        },
        {
            header: 'Phone',
            accessor: 'phone',
            render: (row) => row.phone || '+1 234 567 8900',
        },
        {
            header: 'Last Visit',
            accessor: 'lastVisit',
            render: (row) => formatDate(row.lastVisit || new Date()),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const status = row.status || 'active';
                const statusColors = {
                    active: 'badge-secondary',
                    inactive: 'badge-primary',
                    discharged: 'badge-accent',
                };
                return (
                    <span className={`badge ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            },
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEditPatient(row)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeletePatient(row)}
                        className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const displayData = patients;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Patient Records</h1>
                    <p className="text-neutral-600 mt-1">
                        Manage and view all patient information
                    </p>
                </div>
                <Button variant="primary" icon={Plus} onClick={handleAddPatient}>
                    Add Patient
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by name, ID, or email..."
                            value={searchQuery}
                            onChange={handleSearch}
                            icon={Search}
                        />
                    </div>
                    <select className="input w-48">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="discharged">Discharged</option>
                    </select>
                </div>
            </Card>

            {/* Patients Table */}
            <Card>
                <Table
                    columns={columns}
                    data={patients}
                    loading={loading}
                    emptyMessage="No patients found. Add your first patient to get started."
                />
            </Card>
        </div>
    );
};

export default PatientRecords;
