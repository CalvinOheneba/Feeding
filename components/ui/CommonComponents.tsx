
import React, { useState, ReactNode } from 'react';
import { useAppContext } from '../../context/AppContext';
import { GraduationCapIcon, HomeIcon, UsersIcon, BusIcon, ReportIcon, PaymentIcon, LogoutIcon, TeacherIcon } from './Icons';
import { Role } from '../../types';

export const Logo = () => (
    <div className="flex items-center space-x-3 text-white">
        <GraduationCapIcon className="h-8 w-8 text-sky-300" />
        <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">Advent Reformed Institute</span>
            <span className="text-xs text-gray-300">Fee Management System</span>
        </div>
    </div>
);

interface CardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}
export const Card: React.FC<CardProps> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-sky-500 text-white p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200';
    const variantClasses = {
        primary: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
export const Input: React.FC<InputProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input
      id={id}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-900 dark:text-gray-100"
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}
export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <select
            id={id}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md text-gray-900 dark:text-gray-100"
            {...props}
        >
            {children}
        </select>
    </div>
);


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};


interface TableProps {
    headers: string[];
    children: ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {children}
                </tbody>
            </table>
        </div>
    );
};


const Header = ({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) => {
    const { currentUser, logout } = useAppContext();
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-4 lg:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 dark:text-gray-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
                </div>
                <button onClick={logout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                    <LogoutIcon className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
};


const Sidebar = ({ activePage, onNavigate }: { activePage: string, onNavigate: (page: string) => void }) => {
    const { currentUser } = useAppContext();
    const isAdmin = currentUser?.role === Role.Admin;

    const navItems = isAdmin
        ? [
            { name: 'Dashboard', icon: HomeIcon, key: 'dashboard' },
            { name: 'Stations', icon: BusIcon, key: 'stations' },
            { name: 'Teachers', icon: TeacherIcon, key: 'teachers' },
            { name: 'Students', icon: UsersIcon, key: 'students' },
            { name: 'Reports', icon: ReportIcon, key: 'reports' },
        ]
        : [
            { name: 'Dashboard', icon: HomeIcon, key: 'dashboard' },
            { name: 'Record Payments', icon: PaymentIcon, key: 'payments' },
            { name: 'Reports', icon: ReportIcon, key: 'reports' },
        ];

    const NavLink = ({ item }: { item: typeof navItems[0] }) => (
        <button
            onClick={() => onNavigate(item.key)}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activePage === item.key
                    ? 'bg-sky-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
        </button>
    );

    return (
        <div className="bg-gray-800 dark:bg-gray-900 text-white h-full flex flex-col p-4">
            <div className="mb-8">
                <Logo />
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map(item => <NavLink key={item.key} item={item} />)}
            </nav>
        </div>
    );
};


export const DashboardLayout = ({ children, activePage, onNavigate }: { children: ReactNode; activePage: string; onNavigate: (page: string) => void; }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="relative flex-1 flex flex-col max-w-xs w-full">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                             <svg className="h-6 w-6 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <Sidebar activePage={activePage} onNavigate={(page) => { onNavigate(page); setSidebarOpen(false); }} />
                </div>
                 <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <Sidebar activePage={activePage} onNavigate={onNavigate} />
                </div>
            </div>

            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
