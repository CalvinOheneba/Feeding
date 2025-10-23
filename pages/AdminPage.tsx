
import React, { useState, useMemo, FC } from 'react';
import { DashboardLayout, Card, Table, Button, Modal, Input, Select } from '../components/ui/CommonComponents';
import { useApp } from '../context/AppContext';
import { BusIcon, GraduationCapIcon, TeacherIcon, UsersIcon, EditIcon, DeleteIcon, PlusIcon } from '../components/ui/Icons';
import { Station, Student, User, Role, Payment, PaymentStatus, ReportData } from '../types';
import { exportToExcel, exportToPdf } from '../lib/reportUtils';

// Helper to get today's date in YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const AdminDashboardView = () => {
    const { stations, students, payments } = useApp();
    const today = getTodayDate();
    const paymentsToday = payments.filter(p => p.date === today && p.status === PaymentStatus.Paid);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Total Bus Stations" value={stations.length} icon={<BusIcon className="h-6 w-6" />} />
                <Card title="Total Students" value={students.length} icon={<GraduationCapIcon className="h-6 w-6" />} />
                <Card title="Payments Received Today" value={`$${(paymentsToday.length * 5).toFixed(2)}`} icon={<UsersIcon className="h-6 w-6" />} />
            </div>
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Station-wise Collection Summary (Today)</h2>
                <Table headers={['Station Name', 'Students Paid', 'Total Collection']}>
                    {stations.map(station => {
                        const stationStudents = students.filter(s => s.stationId === station.id);
                        const paidCount = stationStudents.filter(s => payments.some(p => p.studentId === s.id && p.date === today && p.status === PaymentStatus.Paid)).length;
                        return (
                            <tr key={station.id} className="text-gray-700 dark:text-gray-300">
                                <td className="px-6 py-4 whitespace-nowrap">{station.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{paidCount} / {stationStudents.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${(paidCount * 5).toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </Table>
            </div>
        </div>
    );
};

const ManageStationsView = () => {
    const { stations, deleteStation, addStation, updateStation, getTeacherForStation } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<Station | null>(null);
    const [stationName, setStationName] = useState('');

    const openModal = (station: Station | null = null) => {
        setEditingStation(station);
        setStationName(station ? station.name : '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStation(null);
        setStationName('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStation) {
            updateStation(editingStation.id, stationName);
        } else {
            addStation(stationName);
        }
        closeModal();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Stations</h1>
                <Button onClick={() => openModal()} className="flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Add Station</Button>
            </div>
            <Table headers={['Station Name', 'Teacher In-Charge', 'Actions']}>
                {stations.map(station => {
                    const teacher = getTeacherForStation(station.id);
                    return (
                        <tr key={station.id} className="text-gray-700 dark:text-gray-300">
                            <td className="px-6 py-4 whitespace-nowrap">{station.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher ? teacher.name : 'Unassigned'}</td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <button onClick={() => openModal(station)} className="text-sky-600 hover:text-sky-800"><EditIcon className="h-5 w-5" /></button>
                                <button onClick={() => window.confirm("Are you sure? This will delete related students and unassign teachers.") && deleteStation(station.id)} className="text-red-600 hover:text-red-800"><DeleteIcon className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    );
                })}
            </Table>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStation ? 'Edit Station' : 'Add Station'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Station Name" id="stationName" value={stationName} onChange={e => setStationName(e.target.value)} required />
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit">{editingStation ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const ManageTeachersView = () => {
    const { users, stations, addUser, updateUser, deleteUser } = useApp();
    const teachers = users.filter(u => u.role === Role.Teacher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', stationId: '' });

    const openModal = (user: User | null = null) => {
        setEditingUser(user);
        setFormData(user ? { name: user.name, email: user.email, stationId: user.stationId || '' } : { name: '', email: '', stationId: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateUser(editingUser.id, formData.name, formData.email, Role.Teacher, formData.stationId);
        } else {
            addUser(formData.name, formData.email, Role.Teacher, formData.stationId);
        }
        closeModal();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Teachers</h1>
                <Button onClick={() => openModal()} className="flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Add Teacher</Button>
            </div>
            <Table headers={['Name', 'Email', 'Assigned Station', 'Actions']}>
                {teachers.map(teacher => {
                    const station = stations.find(s => s.id === teacher.stationId);
                    return (
                        <tr key={teacher.id} className="text-gray-700 dark:text-gray-300">
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{station ? station.name : 'Unassigned'}</td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <button onClick={() => openModal(teacher)} className="text-sky-600 hover:text-sky-800"><EditIcon className="h-5 w-5" /></button>
                                <button onClick={() => window.confirm("Are you sure?") && deleteUser(teacher.id)} className="text-red-600 hover:text-red-800"><DeleteIcon className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    );
                })}
            </Table>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Edit Teacher' : 'Add Teacher'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    <Select label="Assign to Station" name="stationId" value={formData.stationId} onChange={handleChange}>
                        <option value="">Unassigned</option>
                        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit">{editingUser ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const ManageStudentsView = () => {
    const { students, stations, addStudent, updateStudent, deleteStudent } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({ fullName: '', stationId: '' });

    const openModal = (student: Student | null = null) => {
        setEditingStudent(student);
        setFormData(student ? { fullName: student.fullName, stationId: student.stationId } : { fullName: '', stationId: '' });
        setIsModalOpen(true);
    };
    
    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.stationId === '') return alert("Please select a station.");
        if (editingStudent) {
            updateStudent(editingStudent.id, formData.fullName, formData.stationId);
        } else {
            addStudent(formData.fullName, formData.stationId);
        }
        closeModal();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Students</h1>
                <Button onClick={() => openModal()} className="flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Add Student</Button>
            </div>
            <Table headers={['Full Name', 'Station', 'Actions']}>
                {students.map(student => {
                    const station = stations.find(s => s.id === student.stationId);
                    return (
                        <tr key={student.id} className="text-gray-700 dark:text-gray-300">
                            <td className="px-6 py-4 whitespace-nowrap">{student.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{station ? station.name : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <button onClick={() => openModal(student)} className="text-sky-600 hover:text-sky-800"><EditIcon className="h-5 w-5" /></button>
                                <button onClick={() => window.confirm("Are you sure?") && deleteStudent(student.id)} className="text-red-600 hover:text-red-800"><DeleteIcon className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    );
                })}
            </Table>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStudent ? 'Edit Student' : 'Add Student'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    <Select label="Assign to Station" name="stationId" value={formData.stationId} onChange={handleChange} required>
                        <option value="">Select a station</option>
                        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit">{editingStudent ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const AdminReportsView: FC = () => {
    const { payments, students, stations } = useApp();
    const [filterDate, setFilterDate] = useState(getTodayDate());
    const [filterStation, setFilterStation] = useState('all');

    const reportData = useMemo((): ReportData[] => {
        return payments
            .filter(p => filterDate === '' || p.date === filterDate)
            .map(p => {
                const student = students.find(s => s.id === p.studentId);
                const station = stations.find(s => s.id === student?.stationId);
                if (!student || !station) return null;
                if (filterStation !== 'all' && student.stationId !== filterStation) return null;
                return {
                    studentName: student.fullName,
                    stationName: station.name,
                    date: p.date,
                    status: p.status === PaymentStatus.Paid ? 'Paid' : 'Not Paid',
                    amount: p.status === PaymentStatus.Paid ? 5.00 : 0.00,
                };
            })
            .filter((item): item is ReportData => item !== null)
            .sort((a, b) => a.stationName.localeCompare(b.stationName) || a.studentName.localeCompare(b.studentName));
    }, [payments, students, stations, filterDate, filterStation]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Payment Reports</h1>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center">
                <Input label="Filter by Date" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                <Select label="Filter by Station" value={filterStation} onChange={e => setFilterStation(e.target.value)}>
                    <option value="all">All Stations</option>
                    {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <div className="flex gap-2 mt-auto">
                    <Button onClick={() => exportToExcel(reportData, `payment_report_${filterDate}`)}>Export Excel</Button>
                    <Button onClick={() => exportToPdf(reportData, `Payment Report for ${filterDate}`, `payment_report_${filterDate}`)}>Export PDF</Button>
                </div>
            </div>

            <Table headers={['Student Name', 'Station', 'Date', 'Status', 'Amount']}>
                {reportData.map((item, index) => (
                    <tr key={index} className="text-gray-700 dark:text-gray-300">
                        <td className="px-6 py-4 whitespace-nowrap">{item.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.stationName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">${item.amount.toFixed(2)}</td>
                    </tr>
                ))}
            </Table>
        </div>
    );
};


const AdminPage = () => {
    const [activePage, setActivePage] = useState('dashboard');

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return <AdminDashboardView />;
            case 'stations': return <ManageStationsView />;
            case 'teachers': return <ManageTeachersView />;
            case 'students': return <ManageStudentsView />;
            case 'reports': return <AdminReportsView />;
            default: return <AdminDashboardView />;
        }
    };

    return (
        <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default AdminPage;
