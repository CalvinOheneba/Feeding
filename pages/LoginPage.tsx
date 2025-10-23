
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/ui/CommonComponents';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (!user) {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err: any) {
            let errorMessage = 'Failed to login. Please try again.';
            
            // Handle specific Firebase auth errors
            switch (err.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many login attempts. Please try again later.';
                    break;
            }
            
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
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
                                placeholder="Enter your email"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
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
