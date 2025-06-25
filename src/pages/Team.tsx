import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamMember {
  id: number;
  username: string;
  role: string;
  full_name: string;
  manager_id?: number;
}

interface Feedback {
  id: number;
  employee_id: number;
  employee_name: string;
  sentiment: string;
  created_at: string;
}

const Team: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const credentials = localStorage.getItem('credentials');
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      // Fetch team members
      const teamResponse = await fetch('http://localhost:8000/team', { headers });
      const teamData = await teamResponse.json();
      setTeamMembers(teamData);

      // Fetch feedback data
      const feedbackResponse = await fetch('http://localhost:8000/feedback', { headers });
      const feedbackData = await feedbackResponse.json();
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackCountForMember = (memberId: number) => {
    return feedback.filter(f => f.employee_id === memberId).length;
  };

  const getLatestFeedbackForMember = (memberId: number) => {
    const memberFeedback = feedback.filter(f => f.employee_id === memberId);
    return memberFeedback.length > 0 ? memberFeedback[0] : null;
  };

  if (user?.role !== 'manager') {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Access denied. Only managers can view team information.</div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
        </div>
        <Link
          to="/feedback/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Give Feedback
        </Link>
      </div>

      {teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => {
            const feedbackCount = getFeedbackCountForMember(member.id);
            const latestFeedback = getLatestFeedbackForMember(member.id);
            
            return (
              <div key={member.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {member.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {member.full_name}
                      </p>
                      <p className="text-sm text-gray-500">@{member.username}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Feedback Given:</span>
                      <span className="text-sm font-medium text-gray-900">{feedbackCount}</span>
                    </div>

                    {latestFeedback && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Latest:</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            latestFeedback.sentiment === 'positive' ? 'bg-green-400' :
                            latestFeedback.sentiment === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-sm text-gray-600">
                            {new Date(latestFeedback.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <Link
                        to={`/feedback/new?employee=${member.id}`}
                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Give Feedback
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any team members assigned to you yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Team;