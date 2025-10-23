
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Station, Student, Payment, Role, PaymentStatus } from '../types';
import { 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  addDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  getDocument
} from '../lib/firebaseUtils';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  stations: Station[];
  students: Student[];
  payments: Payment[];
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  addStation: (name: string) => Promise<void>;
  updateStation: (id: string, name: string) => Promise<void>;
  deleteStation: (id: string) => Promise<void>;
  addStudent: (fullName: string, stationId: string) => Promise<void>;
  updateStudent: (id: string, fullName: string, stationId: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addUser: (name: string, email: string, role: Role, stationId?: string) => Promise<void>;
  updateUser: (id: string, name: string, email: string, role: Role, stationId?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  recordPayment: (studentId: string, date: string, status: PaymentStatus) => Promise<void>;
  getTeacherForStation: (stationId: string) => User | undefined;
  loading: boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, stationsData, studentsData, paymentsData] = await Promise.all([
          getDocuments<User>('users'),
          getDocuments<Station>('stations'),
          getDocuments<Student>('students'),
          getDocuments<Payment>('payments')
        ]);

        setUsers(usersData);
        setStations(stationsData);
        setStudents(studentsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getDocument<User>('users', firebaseUser.uid);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    loadData();
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await loginUser(email, password);
      const userData = await getDocument<User>('users', userCredential.user.uid);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addStation = async (name: string) => {
    try {
      await addDocument('stations', { name });
      const updatedStations = await getDocuments<Station>('stations');
      setStations(updatedStations);
    } catch (error) {
      console.error('Error adding station:', error);
    }
  };

  const updateStation = async (id: string, name: string) => {
    try {
      await updateDocument('stations', id, { name });
      const updatedStations = await getDocuments<Station>('stations');
      setStations(updatedStations);
    } catch (error) {
      console.error('Error updating station:', error);
    }
  };

  const deleteStation = async (id: string) => {
    try {
      await deleteDocument('stations', id);
      const updatedStations = await getDocuments<Station>('stations');
      setStations(updatedStations);
      
      // Update related students and users
      const studentsToUpdate = students.filter(s => s.stationId === id);
      const usersToUpdate = users.filter(u => u.stationId === id);
      
      await Promise.all([
        ...studentsToUpdate.map(s => deleteDocument('students', s.id)),
        ...usersToUpdate.map(u => updateDocument('users', u.id, { stationId: null }))
      ]);
      
      const [updatedStudents, updatedUsers] = await Promise.all([
        getDocuments<Student>('students'),
        getDocuments<User>('users')
      ]);
      
      setStudents(updatedStudents);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting station:', error);
    }
  };

  const addStudent = async (fullName: string, stationId: string) => {
    try {
      await addDocument('students', { fullName, stationId });
      const updatedStudents = await getDocuments<Student>('students');
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const updateStudent = async (id: string, fullName: string, stationId: string) => {
    try {
      await updateDocument('students', id, { fullName, stationId });
      const updatedStudents = await getDocuments<Student>('students');
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteDocument('students', id);
      const updatedStudents = await getDocuments<Student>('students');
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const addUser = async (name: string, email: string, role: Role, stationId?: string) => {
    try {
      await addDocument('users', { name, email, role, stationId });
      const updatedUsers = await getDocuments<User>('users');
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUser = async (id: string, name: string, email: string, role: Role, stationId?: string) => {
    try {
      await updateDocument('users', id, { name, email, role, stationId });
      const updatedUsers = await getDocuments<User>('users');
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDocument('users', id);
      const updatedUsers = await getDocuments<User>('users');
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const recordPayment = async (studentId: string, date: string, status: PaymentStatus) => {
    if (!currentUser) return;
    
    try {
      const payment = {
        studentId,
        date,
        status,
        recordedBy: currentUser.id,
        recordedAt: new Date().toISOString()
      };
      
      await addDocument('payments', payment);
      const updatedPayments = await getDocuments<Payment>('payments');
      setPayments(updatedPayments);
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };
  
  const getTeacherForStation = (stationId: string) => {
    return users.find(user => user.role === Role.Teacher && user.stationId === stationId);
  };


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
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
