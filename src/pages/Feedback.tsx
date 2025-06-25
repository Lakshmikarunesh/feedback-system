import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Edit2, Check, Plus, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const Feedback: React.FC = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState<number | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch('http://localhost:8000/feedback', {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeFeedback = async (feedbackId: number) => {
    setAcknowledging(feedbackId);
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(`http://localhost:8000/feedback/${feedbackId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFeedback(feedback.map(f => 
          f.id === feedbackId ? { ...f, acknowledged: true } : f
        ));
      }
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
    } finally {
      setAcknowledging(null);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentDot = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-400';
      case 'neutral': return 'bg-yellow-400';
      case 'negative': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'manager' ? 'Feedback Given' : 'My Feedback'}
          </h1>
        </div>
        {user?.role === 'manager' && (
          <Link
            to="/feedback/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Feedback
          </Link>
        )}
      </div>

      {feedback.length > 0 ? (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSentimentDot(item.sentiment)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {user?.role === 'manager' && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{item.employee_name}</span>
                          </div>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                          {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.acknowledged && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">Acknowledged</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Strengths</h4>
                          <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-md">{item.strengths}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Areas to Improve</h4>
                          <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-md">{item.improvements}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {user?.role === 'manager' && (
                      <Link
                        to={`/feedback/edit/${item.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    )}
                    
                    {user?.role === 'employee' && !item.acknowledged && (
                      <button
                        onClick={() => acknowledgeFeedback(item.id)}
                        disabled={acknowledging === item.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {acknowledging === item.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
                
                {item.created_at !== item.updated_at && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {user?.role === 'manager' ? 'No feedback given yet' : 'No feedback received yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'manager' 
              ? 'Start giving feedback to your team members.' 
              : 'Your manager hasn\'t given you any feedback yet.'
            }
          </p>
          {user?.role === 'manager' && (
            <div className="mt-6">
              <Link
                to="/feedback/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Give First Feedback
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feedback;