import React, { useState, useEffect } from 'react';
import { 
  UserIcon, AcademicCapIcon, MapPinIcon, 
  MagnifyingGlassIcon, UserPlusIcon, ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline';

const userId = parseInt(localStorage.getItem('userId'));
const token = localStorage.getItem('token');

const PeerSuggestions = () => {
  const [suggestedPeers, setSuggestedPeers] = useState([]);
  const [currentUserCourses, setCurrentUserCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestedPeers();
  }, []);

  const loadSuggestedPeers = async () => {
    try {
      setLoading(true);

      const userResponse = await fetch(`http://localhost:8080/courses/enrolled/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const myCourses = await userResponse.json();
      setCurrentUserCourses(myCourses);

      const peersResponse = await fetch(`http://localhost:8080/courses/${userId}/peers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const peersData = await peersResponse.json();

      const peersWithScore = peersData
        .filter(peer => parseInt(peer.id) !== userId)
        .map(peer => {
          const sharedCourses = peer.courses.filter(peerCourse =>
            myCourses.some(myCourse => myCourse.id === peerCourse.id)
          );
          const matchScore = myCourses.length > 0
            ? Math.round((sharedCourses.length / myCourses.length) * 100)
            : 0;
          return { ...peer, matchScore };
        });

      setSuggestedPeers(peersWithScore);
    } catch (error) {
      console.error('Error fetching peers:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = (peerId) => {
    setSuggestedPeers(peers =>
      peers.map(peer =>
        peer.id === peerId ? { ...peer, connectionStatus: 'pending' } : peer
      )
    );
  };

  const startChat = (peerId) => {
    alert('Chat feature will be implemented soon!');
  };

  const filteredPeers = suggestedPeers.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (peer.major && peer.major.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = !filterCourse || peer.courses.some(c => c.id === filterCourse);
    return matchesSearch && matchesCourse;
  });

  const uniqueCourses = [...new Map(
    suggestedPeers.flatMap(peer => peer.courses).map(course => [course.id, course])
  ).values()];

  const PeerCard = ({ peer }) => (
    <div className="border border-gray-200 dark:border-dark-border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all bg-white dark:bg-dark-card flex flex-col">
      {/* Avatar + Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {peer.avatar ? (
              <img src={peer.avatar} alt={peer.name} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{peer.name}</h3>
            {peer.major && <p className="text-sm text-gray-500 dark:text-dark-textSecondary">{peer.major}</p>}
          </div>
        </div>
        {/* <span className="text-sm font-medium text-primary-600">{peer.matchScore}% match</span> */}
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mb-3">
        {peer.universityName && (
          <div className="flex items-center space-x-1">
            <MapPinIcon className="h-4 w-4" />
            <span>{peer.universityName}</span>
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">Courses:</p>
        <div className="flex flex-wrap gap-1">
          {peer.courses.map(course => (
            <span key={course.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
              {course.name}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex space-x-2">
        {peer.connectionStatus === 'pending' ? (
          <button disabled className="btn-secondary text-sm flex-1 opacity-50">Request Sent</button>
        ) : (
          <button onClick={() => sendConnectionRequest(peer.id)} disabled={loading} className="btn-primary text-sm flex-1">
            <UserPlusIcon className="h-4 w-4 mr-1" /> Connect
          </button>
        )}
        <button onClick={() => startChat(peer.id)} className="btn-secondary text-sm flex-1">
          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" /> Message
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header & Filters */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Find Study Partners</h3>
            <p className="text-sm text-gray-500 dark:text-dark-textSecondary">Connect with classmates who share your courses</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name or major..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Peers */}
      <div className="card p-5">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Suggested Peers ({filteredPeers.length})</h4>
        {filteredPeers.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{searchTerm || filterCourse ? 'No peers found matching your criteria.' : 'No peer suggestions available at the moment.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeers.map(peer => (
              <PeerCard key={peer.id} peer={peer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerSuggestions;
