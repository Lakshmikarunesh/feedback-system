import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, MessageSquare } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  const sampleUsers = [
    { username: 'manager1', password: 'password123', role: 'Manager', name: 'Alice Johnson' },
    { username: 'manager2', password: 'password123', role: 'Manager', name: 'Bob Smith' },
    { username: 'employee1', password: 'password123', role: 'Employee', name: 'Charlie Brown' },
    { username: 'employee2', password: 'password123', role: 'Employee', name: 'Diana Wilson' },
    { username: 'employee3', password: 'password123', role: 'Employee', name: 'Eve Davis' },
    { username: 'employee4', password: 'password123', role: 'Employee', name: 'Frank Miller' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Feedback System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage and view feedback
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Users:</h3>
          <div className="space-y-1 text-xs text-gray-600">
            {sampleUsers.map((user, index) => (
              <div key={index} className="flex justify-between">
                <span>{user.username}</span>
                <span className="text-gray-400">•</span>
                <span>{user.role}</span>
                <span className="text-gray-400">•</span>
                <span>{user.name}</span>
              </div>
            ))}
            <div className="mt-2 text-gray-500 text-xs">
              Password for all: password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;