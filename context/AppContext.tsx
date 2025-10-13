
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Station, Student, Payment, Role, PaymentStatus } from '../types';

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@school.com', role: Role.Admin },
  { id: 'user-2', name: 'Teacher Alice', email: 'alice@school.com', role: Role.Teacher, stationId: 'station-1' },
  { id: 'user-3', name: 'Teacher Bob', email: 'bob@school.com', role: Role.Teacher, stationId: 'station-2' },
];

const MOCK_STATIONS: Station[] = [
  { id: 'station-1', name: 'Central Station' },
  { id: 'station-2', name: 'North Station' },
  { id: 'station-3', name: 'West End' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 'student-1', fullName: 'John Doe', stationId: 'station-1' },
  { id: 'student-2', fullName: 'Jane Smith', stationId: 'station-1' },
  { id: 'student-3', fullName: 'Peter Jones', stationId: 'station-2' },
  { id: 'student-4', fullName: 'Mary Williams', stationId: 'station-2' },
  { id: 'student-5', fullName: 'David Brown', stationId: 'station-3' },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: 'payment-1', studentId: 'student-1', date: new Date().toISOString().split('T')[0], status: PaymentStatus.Paid, recordedBy: 'user-2', recordedAt: new Date().toISOString() },
  { id: 'payment-2', studentId: 'student-3', date: new Date().toISOString().split('T')[0], status: PaymentStatus.Paid, recordedBy: 'user-3', recordedAt: new Date().toISOString() }
];

// --- CONTEXT TYPE ---
interface AppContextType {
  currentUser: User | null;
  users: User[];
  stations: Station[];
  students: Student[];
  payments: Payment[];
  login: (email: string) => User | null;
  logout: () => void;
  addStation: (name: string) => void;
  updateStation: (id: string, name: string) => void;
  deleteStation: (id: string) => void;
  addStudent: (fullName: string, stationId: string) => void;
  updateStudent: (id: string, fullName: string, stationId: string) => void;
  deleteStudent: (id: string) => void;
  addUser: (name: string, email: string, role: Role, stationId?: string) => void;
  updateUser: (id: string, name: string, email: string, role: Role, stationId?: string) => void;
  deleteUser: (id: string) => void;
  recordPayment: (studentId: string, date: string, status: PaymentStatus) => void;
  getTeacherForStation: (stationId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users', MOCK_USERS);
  const [stations, setStations] = useLocalStorage<Station[]>('stations', MOCK_STATIONS);
  const [students, setStudents] = useLocalStorage<Student[]>('students', MOCK_STUDENTS);
  const [payments, setPayments] = useLocalStorage<Payment[]>('payments', MOCK_PAYMENTS);

  const login = (email: string): User | null => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addStation = (name: string) => {
    const newStation: Station = { id: `station-${Date.now()}`, name };
    setStations(prev => [...prev, newStation]);
  };

  const updateStation = (id: string, name: string) => {
    setStations(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };
  
  const deleteStation = (id: string) => {
    setStations(prev => prev.filter(s => s.id !== id));
    setStudents(prev => prev.filter(s => s.stationId !== id));
    setUsers(prev => prev.map(u => u.stationId === id ? {...u, stationId: undefined} : u));
  };

  const addStudent = (fullName: string, stationId: string) => {
    const newStudent: Student = { id: `student-${Date.now()}`, fullName, stationId };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, fullName: string, stationId: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, fullName, stationId } : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addUser = (name: string, email: string, role: Role, stationId?: string) => {
    const newUser: User = { id: `user-${Date.now()}`, name, email, role, stationId };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, name: string, email: string, role: Role, stationId?: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, name, email, role, stationId } : u));
  };
  
  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const recordPayment = (studentId: string, date: string, status: PaymentStatus) => {
    if (!currentUser) return;
    const existingPaymentIndex = payments.findIndex(p => p.studentId === studentId && p.date === date);
    if (existingPaymentIndex > -1) {
      setPayments(prev => {
        const newPayments = [...prev];
        newPayments[existingPaymentIndex] = {
            ...newPayments[existingPaymentIndex],
            status,
            recordedBy: currentUser.id,
            recordedAt: new Date().toISOString()
        };
        return newPayments;
      });
    } else {
      const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        studentId,
        date,
        status,
        recordedBy: currentUser.id,
        recordedAt: new Date().toISOString()
      };
      setPayments(prev => [...prev, newPayment]);
    }
  };
  
  const getTeacherForStation = useCallback((stationId: string) => {
    return users.find(u => u.role === Role.Teacher && u.stationId === stationId);
  }, [users]);


  const value = {
    currentUser,
    users,
    stations,
    students,
    payments,
    login,
    logout,
    addStation,
    updateStation,
    deleteStation,
    addStudent,
    updateStudent,
    deleteStudent,
    addUser,
    updateUser,
    deleteUser,
    recordPayment,
    getTeacherForStation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
