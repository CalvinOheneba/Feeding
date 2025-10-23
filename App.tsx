
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Role } from './types';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import TeacherPage from './pages/TeacherPage';

const AppContent = () => {
    const { currentUser, loading } = useApp();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <LoginPage />;
    }

    if (currentUser.role === Role.Admin) {
        return <AdminPage />;
    }

    if (currentUser.role === Role.Teacher) {
        return <TeacherPage />;
    }

    return <div>Error: Unknown user role.</div>;
};


function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;
