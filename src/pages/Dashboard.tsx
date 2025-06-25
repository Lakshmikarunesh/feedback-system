import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Analytics {
  member_feedback_counts: Record<string, number>;
  sentiment_distribution: Record<string, number>;
}

interface Feedback {
  id: number;
  manager_id: number;
  employee_id: number;
  employee_name: string;
  strengths: string;
  improvements: string;
  sentiment: string;
  acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const credentials = localStorage.getItem('credentials');
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      // Fetch feedback data
      const feedbackResponse = await fetch('http://localhost:8000/feedback', { headers });
      const feedbackData = await feedbackResponse.json();
      setFeedback(feedbackData);

      // Fetch analytics for managers
      if (user?.role === 'manager') {
        const analyticsResponse = await fetch('http://localhost:8000/analytics', { headers });
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const sentimentData = analytics ? Object.entries(analytics.sentiment_distribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: key === 'positive' ? '#10B981' : key === 'neutral' ? '#F59E0B' : '#EF4444'
  })) : [];

  const memberData = analytics ? Object.entries(analytics.member_feedback_counts).map(([name, count]) => ({
    name: name.split(' ')[0], // First name only for better display
    count
  })) : [];

  if (user?.role === 'manager') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <div className="text-sm text-gray-500">Welcome back, {user.full_name}</div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Team Members</div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics ? Object.keys(analytics.member_feedback_counts).length : 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Feedback</div>
                <div className="text-2xl font-bold text-gray-900">{feedback.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Acknowledged</div>
                <div className="text-2xl font-bold text-gray-900">
                  {feedback.filter(f => f.acknowledged).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">This Month</div>
                <div className="text-2xl font-bold text-gray-900">
                  {feedback.filter(f => new Date(f.created_at).getMonth() === new Date().getMonth()).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h3>
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No feedback data available
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback per Team Member</h3>
            {memberData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={memberData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No team data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {feedback.slice(0, 5).map((item) => (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.sentiment === 'positive' ? 'bg-green-400' :
                      item.sentiment === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="font-medium text-gray-900">{item.employee_name}</span>
                    {item.acknowledged && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.strengths}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome back, {user?.full_name}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Feedback</div>
              <div className="text-2xl font-bold text-gray-900">{feedback.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Acknowledged</div>
              <div className="text-2xl font-bold text-gray-900">
                {feedback.filter(f => f.acknowledged).length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">This Month</div>
              <div className="text-2xl font-bold text-gray-900">
                {feedback.filter(f => new Date(f.created_at).getMonth() === new Date().getMonth()).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback Timeline */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {feedback.length > 0 ? (
            feedback.slice(0, 5).map((item) => (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.sentiment === 'positive' ? 'bg-green-400' :
                      item.sentiment === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="font-medium text-gray-900 capitalize">{item.sentiment} Feedback</span>
                    {item.acknowledged && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="ml-6">
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Strengths:</span> {item.strengths}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Areas to improve:</span> {item.improvements}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No feedback received yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;