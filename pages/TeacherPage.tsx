
import React, { useState, useMemo, FC } from 'react';
import { DashboardLayout, Card, Table, Button } from '../components/ui/CommonComponents';
import { useAppContext } from '../context/AppContext';
import { UsersIcon, PaymentIcon } from '../components/ui/Icons';
import { Student, PaymentStatus, ReportData } from '../types';
import { exportToExcel, exportToPdf } from '../lib/reportUtils';

// Helper to get today's date in YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const TeacherDashboardView = () => {
    const { currentUser, students, payments, stations } = useAppContext();
    const today = getTodayDate();
    
    const stationId = currentUser?.stationId;
    const station = stations.find(s => s.id === stationId);
    const assignedStudents = students.filter(s => s.stationId === stationId);
    
    const todaysPayments = payments.filter(p => p.date === today && assignedStudents.some(s => s.id === p.studentId));
    const paidTodayCount = todaysPayments.filter(p => p.status === PaymentStatus.Paid).length;
    
    const paidStudentIds = new Set(todaysPayments.filter(p => p.status === PaymentStatus.Paid).map(p => p.studentId));
    const unpaidStudents = assignedStudents.filter(s => !paidStudentIds.has(s.id));

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Teacher Dashboard</h1>
            <h2 className="text-xl font-semibold text-sky-700 dark:text-sky-300 mb-6">{station?.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Assigned Students" value={assignedStudents.length} icon={<UsersIcon className="h-6 w-6" />} />
                <Card title="Payments Received Today" value={`$${(paidTodayCount * 5).toFixed(2)}`} icon={<PaymentIcon className="h-6 w-6" />} />
            </div>
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Unpaid Students for Today</h2>
                {unpaidStudents.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {unpaidStudents.map(student => (
                            <li key={student.id} className="py-3 text-gray-700 dark:text-gray-300">{student.fullName}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">All students have paid for today. Great job!</p>
                )}
            </div>
        </div>
    );
};

const RecordPaymentsView = () => {
    const { currentUser, students, payments, recordPayment } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    const stationId = currentUser?.stationId;
    const assignedStudents = students.filter(s => s.stationId === stationId);

    const getPaymentStatus = (studentId: string) => {
        const payment = payments.find(p => p.studentId === studentId && p.date === selectedDate);
        return payment ? payment.status : PaymentStatus.NotPaid;
    };

    const handleStatusChange = (studentId: string, newStatus: PaymentStatus) => {
        recordPayment(studentId, selectedDate, newStatus);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Record Daily Payments</h1>
            <div className="mb-4">
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
                <input
                    type="date"
                    id="paymentDate"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="mt-1 block w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-900 dark:text-gray-100"
                />
            </div>
            <Table headers={['Student Name', 'Status']}>
                {assignedStudents.map(student => {
                    const status = getPaymentStatus(student.id);
                    return (
                        <tr key={student.id} className="text-gray-700 dark:text-gray-300">
                            <td className="px-6 py-4 whitespace-nowrap">{student.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={() => handleStatusChange(student.id, PaymentStatus.Paid)}
                                        variant={status === PaymentStatus.Paid ? 'primary' : 'secondary'}
                                        className={status === PaymentStatus.Paid ? 'ring-2 ring-offset-2 ring-sky-500' : ''}
                                    >
                                        Paid
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusChange(student.id, PaymentStatus.NotPaid)}
                                        variant={status === PaymentStatus.NotPaid ? 'danger' : 'secondary'}
                                        className={status === PaymentStatus.NotPaid ? 'ring-2 ring-offset-2 ring-red-500' : ''}
                                    >
                                        Not Paid
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </Table>
        </div>
    );
};

const TeacherReportsView: FC = () => {
    const { currentUser, payments, students, stations } = useAppContext();
    const [filterDate, setFilterDate] = useState(getTodayDate());

    const stationId = currentUser?.stationId;
    const station = stations.find(s => s.id === stationId);

    const reportData = useMemo((): ReportData[] => {
        if (!station) return [];
        
        const stationStudents = students.filter(s => s.stationId === stationId);
        const studentIds = new Set(stationStudents.map(s => s.id));

        return payments
            .filter(p => (filterDate === '' || p.date === filterDate) && studentIds.has(p.studentId))
            .map(p => {
                const student = students.find(s => s.id === p.studentId);
                if (!student) return null;
                return {
                    studentName: student.fullName,
                    stationName: station.name,
                    date: p.date,
                    status: p.status === PaymentStatus.Paid ? 'Paid' : 'Not Paid',
                    amount: p.status === PaymentStatus.Paid ? 5.00 : 0.00,
                };
            })
            .filter((item): item is ReportData => item !== null)
            .sort((a, b) => a.studentName.localeCompare(b.studentName));
    }, [payments, students, station, stationId, filterDate]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Payment Reports</h1>
            <h2 className="text-xl font-semibold text-sky-700 dark:text-sky-300 mb-6">{station?.name}</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                    <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date</label>
                    <input
                        type="date"
                        id="reportDate"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="mt-1 block w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div className="flex gap-2 mt-auto">
                    <Button onClick={() => exportToExcel(reportData, `payment_report_${station?.name}_${filterDate}`)}>Export Excel</Button>
                    <Button onClick={() => exportToPdf(reportData, `Payment Report for ${filterDate}`, `payment_report_${station?.name}_${filterDate}`)}>Export PDF</Button>
                </div>
            </div>

            <Table headers={['Student Name', 'Date', 'Status', 'Amount']}>
                {reportData.map((item, index) => (
                    <tr key={index} className="text-gray-700 dark:text-gray-300">
                        <td className="px-6 py-4 whitespace-nowrap">{item.studentName}</td>
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

const TeacherPage = () => {
    const [activePage, setActivePage] = useState('dashboard');

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return <TeacherDashboardView />;
            case 'payments': return <RecordPaymentsView />;
            case 'reports': return <TeacherReportsView />;
            default: return <TeacherDashboardView />;
        }
    };

    return (
        <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default TeacherPage;
