import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';

interface TeamMember {
  id: number;
  username: string;
  role: string;
  full_name: string;
}

interface Feedback {
  id: number;
  employee_id: number;
  employee_name: string;
  strengths: string;
  improvements: string;
  sentiment: string;
}

const FeedbackForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const preselectedEmployee = searchParams.get('employee');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: preselectedEmployee ? parseInt(preselectedEmployee) : 0,
    strengths: '',
    improvements: '',
    sentiment: 'positive'
  });

  useEffect(() => {
    fetchTeamMembers();
    if (isEditing) {
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchTeamMembers = async () => {
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch('http://localhost:8000/team', {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch('http://localhost:8000/feedback', {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });
      const allFeedback: Feedback[] = await response.json();
      const feedback = allFeedback.find(f => f.id === parseInt(id!));
      
      if (feedback) {
        setFormData({
          employee_id: feedback.employee_id,
          strengths: feedback.strengths,
          improvements: feedback.improvements,
          sentiment: feedback.sentiment
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const credentials = localStorage.getItem('credentials');
      const url = isEditing 
        ? `http://localhost:8000/feedback/${id}`
        : 'http://localhost:8000/feedback';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/feedback');
      } else {
        console.error('Error submitting feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employee_id' ? parseInt(value) : value
    }));
  };

  if (user?.role !== 'manager') {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Access denied. Only managers can create feedback.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/feedback')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Feedback' : 'Give Feedback'}
        </h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Team Member
            </label>
            <select
              id="employee_id"
              name="employee_id"
              required
              value={formData.employee_id}
              onChange={handleInputChange}
              disabled={isEditing}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={0}>Select a team member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-2">
              Overall Sentiment
            </label>
            <select
              id="sentiment"
              name="sentiment"
              required
              value={formData.sentiment}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
              Strengths
            </label>
            <textarea
              id="strengths"
              name="strengths"
              rows={4}
              required
              value={formData.strengths}
              onChange={handleInputChange}
              placeholder="Describe what this person does well..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
              Areas to Improve
            </label>
            <textarea
              id="improvements"
              name="improvements"
              rows={4}
              required
              value={formData.improvements}
              onChange={handleInputChange}
              placeholder="Describe areas where this person can grow..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/feedback')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || formData.employee_id === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Update Feedback' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;