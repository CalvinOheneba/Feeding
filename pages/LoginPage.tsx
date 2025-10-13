
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Logo } from '../components/ui/CommonComponents';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const { login } = useAppContext();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = login(email);
        if (!user) {
            setError('Invalid email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded-t-lg">
                    <Logo />
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-b-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">Welcome Back</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Sign in to continue</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g., admin@school.com"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <p><b>Admin:</b> admin@school.com</p>
                        <p><b>Teacher:</b> alice@school.com or bob@school.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
