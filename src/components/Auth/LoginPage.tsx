import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password');
      } else if (code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak (at least 6 characters required)');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('An error occurred: ' + (err?.message || 'Please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏥</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Health Management System
            </h1>
            <p className="text-gray-500 mt-1">
              {isRegister ? 'Create a new account' : 'Sign in to continue'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter password"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {loading
                ? '⏳ Processing...'
                : isRegister
                  ? 'Register'
                  : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2025 Student Health Management System
        </p>
      </div>
    </div>
  );
}
