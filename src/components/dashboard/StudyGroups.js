import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// TODO: Remove demo groups initialization when backend is integrated
import { initializeDemoGroups } from "../../utils/demoGroups";

import {
  PlusIcon,
  UserGroupIcon,
  LockClosedIcon,
  GlobeAltIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

// Backend API Configuration
// TODO: Move to environment variables (.env file)
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/groups";

// ========================================
// BACKEND INTEGRATION GUIDE - JOIN REQUESTS MODAL
// ========================================
// 
// NEW FEATURE: Join Requests Modal for Private Groups
// This feature replaces inline join requests display with a clean modal popup
// 
// REQUIRED BACKEND ENDPOINTS (Already Implemented):
// 1. GET /api/groups/{groupId}/requests
//    - Fetches pending join requests for a specific group
//    - Headers: Authorization: Bearer {token}
//    - Response: Array of {memberId, userName, userMajor, requestedAt}
//    - Used by: fetchJoinRequests() function
// 
// 2. POST /api/groups/approve/{memberId}?adminId={userId}
//    - Approves a join request from a user
//    - Headers: Authorization: Bearer {token}
//    - Response: Success confirmation
//    - Used by: approveRequest() function
// 
// 3. POST /api/groups/reject/{memberId}?adminId={userId}
//    - Rejects a join request from a user
//    - Headers: Authorization: Bearer {token}
//    - Response: Success confirmation
//    - Used by: rejectRequest() function
// 
// UI CHANGES MADE:
// - Added ClipboardDocumentListIcon to private group cards (admin only)
// - Removed inline join requests display from cards
// - Created JoinRequestsModal component for better UX
// - All group cards now have consistent height/layout
// 
// BACKEND DEVELOPER NOTES:
// - No new endpoints needed - uses existing join request APIs
// - Modal automatically refreshes after approve/reject actions
// - Supports real-time updates if WebSocket integration is added later
// - Error handling follows existing patterns in the codebase
// ========================================

// User Authentication - Retrieved from localStorage
// Backend should provide these after successful login
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// Course List - Static data for demo
// TODO: Backend Integration Required
// API Endpoint: GET /api/courses
// Response: Array of {id, code, coursename, description, department}
const COURSE_LIST = [
  { code: "CS101", coursename: "Computer Science 101" },
  { code: "MATH101", coursename: "Calculus I" },
  { code: "PHY101", coursename: "Physics I" },
  { code: "ENG101", coursename: "English Literature" },
  { code: "HIST101", coursename: "World History" },
  { code: "CS102", coursename: "Data Structures" },
  { code: "CS103", coursename: "Algorithms" },
  { code: "CS104", coursename: "Operating Systems" },
  { code: "CS105", coursename: "Database Management Systems" },
  { code: "CS106", coursename: "Computer Networks" },
  { code: "ECE101", coursename: "Digital Electronics" },
  { code: "ECE102", coursename: "Analog Electronics" },
  { code: "ECE103", coursename: "Signal & Systems" },
  { code: "ECE104", coursename: "Microprocessors" },
  { code: "ECE105", coursename: "Communication Systems" },
  // { code: "OTHER", coursename: "Other Course" },
];

export default function StudyGroups() {
  const [myGroups, setMyGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(
    JSON.parse(localStorage.getItem("pendingGroups")) || []
  );
  const [joinRequests, setJoinRequests] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [selectedGroupForRequests, setSelectedGroupForRequests] = useState(null);

  // Filters
 const [searchTerm, setSearchTerm] = useState("");
  const [filterPrivacy, setFilterPrivacy] = useState("ALL");
  const [filterCourse, setFilterCourse] = useState("");
  const [minMembers, setMinMembers] = useState("");
  const [maxMembers, setMaxMembers] = useState("");


// Add this state at the top of StudyGroups component
const [manageOpenGroups, setManageOpenGroups] = useState({});

// Toggle function
const toggleManage = (groupId) => {
  setManageOpenGroups(prev => ({
    ...prev,
    [groupId]: !prev[groupId], // toggle for this group
  }));
};

// Functions in StudyGroups component
const handleMuteGroup = (groupId) => {
  alert(`Group ${groupId} muted (placeholder functionality)`);
  // TODO: Add actual API call to mute notifications
};

const handleDeleteGroup = (groupId) => {
  // if (window.confirm("Are you sure you want to delete this group?")) {
    deleteGroup(groupId); // Use your existing deleteGroup function
  // }
};

// TODO: Backend Integration - View Join Requests Modal
// This function handles opening the join requests modal for private groups
// API Integration: Uses existing fetchJoinRequests function
// UI Enhancement: Opens modal instead of inline display for better UX
const handleViewJoinRequests = async (group) => {
  setSelectedGroupForRequests(group);
  await fetchJoinRequests(group.id);
  setShowJoinRequestsModal(true);
};


  useEffect(() => {
    // TODO: Remove demo initialization when backend is ready
    initializeDemoGroups();
    loadAllGroups();
    // TODO: Backend should handle pending requests via API
    setPendingRequests(JSON.parse(localStorage.getItem("pendingGroups")) || []);
  }, []);

  const normalizeGroup = (g) => ({
    ...g,
    memberCount: Number(g.memberCount ?? 0),
    coursename: g.coursename ?? "",
  });
  const navigate = useNavigate();

  // TODO: Backend Integration - Load All Groups
  // API Endpoints:
  // GET /api/groups/created/{userId} - Groups created by user
  // GET /api/groups/joined/{userId} - Groups user has joined
  // GET /api/groups/available/{userId} - Public groups user can join
  // Headers: Authorization: Bearer {token}
  // Response: Array of Group objects
  const loadAllGroups = async () => {
    setLoading(true);
    try {
      // Backend API calls
      try {
        const [createdRes, joinedRes, availableRes] = await Promise.all([
          fetch(`${API_BASE}/created/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/joined/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/available/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [createdJson, joinedJson, availableJson] = await Promise.all([
          createdRes.json(),
          joinedRes.json(),
          availableRes.json(),
        ]);

        setMyGroups(Array.isArray(createdJson) ? createdJson.map(normalizeGroup) : []);
        setJoinedGroups(Array.isArray(joinedJson) ? joinedJson.map(normalizeGroup) : []);
        setAvailableGroups(Array.isArray(availableJson) ? availableJson.map(normalizeGroup) : []);
      } catch (backendErr) {
        // Fallback to localStorage demo mode
        const savedGroups = JSON.parse(localStorage.getItem("studyGroups")) || [];
        const created = savedGroups.filter(g => g.createdBy === userId);
        const joined = savedGroups.filter(g => g.members.includes(userId) && g.createdBy !== userId);
        const available = savedGroups.filter(g => !g.members.includes(userId) && g.createdBy !== userId && g.privacy === "PUBLIC");
        
        setMyGroups(created.map(normalizeGroup));
        setJoinedGroups(joined.map(normalizeGroup));
        setAvailableGroups(available.map(normalizeGroup));
      }
      setPendingRequests(JSON.parse(localStorage.getItem("pendingGroups")) || []);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Backend Integration - Create Group
  // API Endpoint: POST /api/groups
  // Headers: Content-Type: application/json, Authorization: Bearer {token}
  // Request Body: {userId, name, description, courseId, privacy, code, coursename}
  // Response: Created group object with generated ID
  const createGroup = async (formData) => {
    setLoading(true);
    try {
      const newGroup = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        courseId: formData.courseId || "",
        privacy: formData.privacy,
        code: formData.code || "",
        coursename: formData.coursename || "",
        createdBy: userId,
        members: [userId],
        memberCount: 1,
        createdAt: new Date().toISOString(),
      };

      // Try backend first
      try {
        const payload = {
          userId,
          name: formData.name,
          description: formData.description,
          courseId: formData.courseId || "",
          privacy: formData.privacy,
          code: formData.code || "",
          coursename: formData.coursename || "",
        };

        const res = await fetch(`${API_BASE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to create group");
      } catch (backendErr) {
        // Fallback to localStorage
        const savedGroups = JSON.parse(localStorage.getItem("studyGroups")) || [];
        savedGroups.push(newGroup);
        localStorage.setItem("studyGroups", JSON.stringify(savedGroups));
      }

      await loadAllGroups();
      setShowCreateModal(false);
      
      // Dispatch custom event to notify chat components
      window.dispatchEvent(new CustomEvent('studyGroupsUpdated', {
        detail: { action: 'created', groupId: newGroup.id, userId }
      }));
    } catch (err) {
      console.error("Error creating group:", err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Backend Integration - Join Group
  // API Endpoint: POST /api/groups/join/{groupId}?userId={userId}
  // Headers: Authorization: Bearer {token}
  // Response: Success message or "Request sent" for private groups
  const joinGroup = async (group) => {
    setLoading(true);
    try {
      // Backend API call
      try {
        const res = await fetch(`${API_BASE}/join/${group.id}?userId=${userId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();

        if (text.toLowerCase().includes("request")) {
          const updatedPending = [...pendingRequests.filter(p => p.id !== group.id), normalizeGroup(group)];
          setPendingRequests(updatedPending);
          localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
        } else {
          await loadAllGroups();
        }
      } catch (backendErr) {
        // Fallback to localStorage
        if (group.privacy === "PRIVATE") {
          const updatedPending = [...pendingRequests.filter(p => p.id !== group.id), normalizeGroup(group)];
          setPendingRequests(updatedPending);
          localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
        } else {
          const savedGroups = JSON.parse(localStorage.getItem("studyGroups")) || [];
          const groupIndex = savedGroups.findIndex(g => g.id === group.id);
          if (groupIndex !== -1) {
            if (!savedGroups[groupIndex].members.includes(userId)) {
              savedGroups[groupIndex].members.push(userId);
              savedGroups[groupIndex].memberCount = savedGroups[groupIndex].members.length;
              localStorage.setItem("studyGroups", JSON.stringify(savedGroups));
              
              // Dispatch custom event to notify chat components
              window.dispatchEvent(new CustomEvent('studyGroupsUpdated', {
                detail: { action: 'joined', groupId: group.id, userId }
              }));
            }
          }
          await loadAllGroups();
        }
      }
    } catch (err) {
      console.error("Error joining group:", err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Backend Integration - Leave Group
  // API Endpoint: DELETE /api/groups/leave/{groupId}/{userId}
  // Headers: Authorization: Bearer {token}
  // Response: Success confirmation
  const leaveGroup = async (groupId) => {
    setLoading(true);
    try {
      // Backend API call
      try {
        const res = await fetch(`${API_BASE}/leave/${groupId}/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to leave group");
      } catch (backendErr) {
        // Fallback to localStorage
        const savedGroups = JSON.parse(localStorage.getItem("studyGroups")) || [];
        const groupIndex = savedGroups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          savedGroups[groupIndex].members = savedGroups[groupIndex].members.filter(m => m !== userId);
          savedGroups[groupIndex].memberCount = savedGroups[groupIndex].members.length;
          localStorage.setItem("studyGroups", JSON.stringify(savedGroups));
        }
      }
      setJoinedGroups(prev => prev.filter(g => g.id !== groupId));
      await loadAllGroups();
      
      // Dispatch custom event to notify chat components
      window.dispatchEvent(new CustomEvent('studyGroupsUpdated', {
        detail: { action: 'left', groupId, userId }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Backend Integration - Delete Group
  // API Endpoint: DELETE /api/groups/delete/{groupId}/{userId}
  // Headers: Authorization: Bearer {token}
  // Response: Success confirmation
  // Note: Only group creator can delete
  const deleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    setLoading(true);
    try {
      // Backend API call
      try {
        const res = await fetch(`${API_BASE}/delete/${groupId}/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text() || "Delete failed");
      } catch (backendErr) {
        // Fallback to localStorage
        const savedGroups = JSON.parse(localStorage.getItem("studyGroups")) || [];
        const filteredGroups = savedGroups.filter(g => g.id !== groupId);
        localStorage.setItem("studyGroups", JSON.stringify(filteredGroups));
      }
      await loadAllGroups();
      
      // Dispatch custom event to notify chat components
      window.dispatchEvent(new CustomEvent('studyGroupsUpdated', {
        detail: { action: 'deleted', groupId, userId }
      }));
    } catch (err) {
      console.error("Error deleting group:", err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Backend Integration - Fetch Join Requests
  // API Endpoint: GET /api/groups/{groupId}/requests
  // Headers: Authorization: Bearer {token}
  // Response: Array of {memberId, userName, userMajor, requestedAt}
  // 
  // USAGE: Called when admin clicks join requests icon on private group cards
  // MODAL INTEGRATION: Results are displayed in JoinRequestsModal component
  // ERROR HANDLING: Should handle network errors gracefully
  const fetchJoinRequests = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE}/${groupId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch join requests");
      const data = await res.json();
      setJoinRequests(prev => ({ ...prev, [groupId]: data || [] }));
    } catch (err) {
      console.error("Error fetching join requests:", err);
    }
  };

  // TODO: Backend Integration - Approve Join Request
  // API Endpoint: POST /api/groups/approve/{memberId}?adminId={userId}
  // Headers: Authorization: Bearer {token}
  // Response: Success confirmation
  // 
  // MODAL INTEGRATION: Called from approve button in JoinRequestsModal
  // POST-ACTION: Refreshes join requests list and group data
  // UI FEEDBACK: Modal updates automatically after successful approval
    const approveRequest = async (memberId, groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/approve/${memberId}?adminId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "approve failed");
      }

      // Refresh admin requests and lists
      await fetchJoinRequests(groupId);
      await loadAllGroups();

      // Remove the group from pendingRequests (for the request-sender user)
      const updatedPending = (JSON.parse(localStorage.getItem("pendingGroups")) || []).filter(g => g.id !== groupId);
      localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
      setPendingRequests(updatedPending);

      alert("Request approved.");
    } catch (err) {
      console.error("Approve error:", err);
      alert("Approve failed");
    } finally {
      setLoading(false);
    }
  };

  // TODO: Backend Integration - Reject Join Request
  // API Endpoint: POST /api/groups/reject/{memberId}?adminId={userId}
  // Headers: Authorization: Bearer {token}
  // Response: Success confirmation
  // 
  // MODAL INTEGRATION: Called from reject button in JoinRequestsModal
  // POST-ACTION: Refreshes join requests list
  // UI FEEDBACK: Modal updates automatically after successful rejection
  const rejectRequest = async (memberId, groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reject/${memberId}?adminId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "reject failed");
      }

      // Refresh admin requests
      await fetchJoinRequests(groupId);

      // Remove group from pendingRequests
      const updatedPending = (JSON.parse(localStorage.getItem("pendingGroups")) || []).filter(g => g.id !== groupId);
      localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
      setPendingRequests(updatedPending);

      alert("Request rejected.");
    } catch (err) {
      console.error("Reject error:", err);
      alert("Reject failed");
    } finally {
      setLoading(false);
    }
  };

  const RequestCard = ({ req, groupId }) => (
    <div className="border rounded-lg p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{req.userName}</p>
        <p className="text-sm text-gray-600 dark:text-dark-textSecondary">{req.userMajor}</p>
        <p className="text-xs text-gray-500 dark:text-dark-textMuted mt-1">Requested: {new Date(req.requestedAt).toLocaleString()}</p>
      </div>
      <div className="flex gap-2">
        <button
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => approveRequest(req.memberId, groupId)}
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => rejectRequest(req.memberId, groupId)}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const GroupCard = ({ group, role }) => (
    <div className="border border-gray-200 dark:border-dark-border rounded-xl p-5 hover:shadow-lg transition bg-white dark:bg-dark-card flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            {group.privacy === "PRIVATE" ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
    Private
  </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
    Public
  </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{group.description}</p>
        </div>
        {/* TODO: Backend Integration - Join Requests Icon for Private Groups */}
        {/* This icon appears only on private groups where user is admin */}
        {/* When clicked, opens modal to view/manage join requests */}
        {/* Backend API: Uses existing fetchJoinRequests endpoint */}
        {role === "admin" && group.privacy === "PRIVATE" && (
          <button
            onClick={() => handleViewJoinRequests(group)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition text-gray-600 dark:text-dark-text"
            title="View Join Requests"
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-gray-400" />
          <span>{group.memberCount} members</span>
        </div>
        <div className="text-xs text-gray-500">{group.coursename || group.courseId}</div>
      </div>


      {/* Joined Group Actions */}
      {role === "joined" && (
        <div className="mt-4 flex gap-2">
          <button
  className="flex-1 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition"
  onClick={() =>
    navigate(`/chat/${group.id}`, {
      state: {
        groupName: group.name,
        groupId: group.id,
        privacy: group.privacy,
        coursename: group.coursename,
        memberCount: group.memberCount,
      },
    })
  }
>
  <ChatBubbleLeftRightIcon className="h-4 w-4" /> Open Chat
</button>
          <button
            className="flex-1 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 transition"
            onClick={() => leaveGroup(group.id)}
          >
            Leave Group
          </button>
        </div>
      )}

      {/* Admin Actions */}
{role === "admin" && (
  <div className="mt-4 flex flex-col gap-2">
    {/* Manage Button */}
    <button
      className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
      onClick={() => toggleManage(group.id)}
    >
      <Cog6ToothIcon className="h-4 w-4" /> Manage
    </button>

    {/* Dropdown with Mute and Delete */}
    {manageOpenGroups[group.id] && (
      <div className="flex gap-2 mt-2">
        {/* <button
          className="flex-1 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
          onClick={() => handleMuteGroup(group.id)}
        >
          Mute
        </button> */}
        <button
          className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          onClick={() => handleDeleteGroup(group.id)}
        >
          Delete
        </button>
      </div>
    )}

    {/* Open Chat Button */}
    <button
      className="flex-1 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition mt-2"
      onClick={() =>
        navigate(`/chat/${group.id}`, {
          state: {
            groupName: group.name,
            groupId: group.id,
            privacy: group.privacy,
            coursename: group.coursename,
            memberCount: group.memberCount,
          },
        })
      }
    >
      <ChatBubbleLeftRightIcon className="h-4 w-4" /> Open Chat
    </button>
  </div>
)}





      {role === "available" && (
        <button
          className="mt-4 w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          onClick={() => joinGroup(group)}
          disabled={loading}
        >
          Join Group
        </button>
      )}

      {role === "pending" && (
        <span className="mt-4 inline-block text-yellow-700 text-sm font-medium">
          Request Sent • Waiting Approval
        </span>
      )}
    </div>
  );

  // TODO: Backend Integration - Join Requests Modal Component
  // This modal displays pending join requests for private groups
  // Backend Requirements:
  // 1. GET /api/groups/{groupId}/requests - Fetch pending requests (already implemented in fetchJoinRequests)
  // 2. POST /api/groups/approve/{memberId}?adminId={userId} - Approve request (already implemented in approveRequest)
  // 3. POST /api/groups/reject/{memberId}?adminId={userId} - Reject request (already implemented in rejectRequest)
  // 
  // Modal Features:
  // - Shows group information (name, course)
  // - Lists all pending requests with user details
  // - Approve/Reject buttons for each request
  // - Real-time updates when requests are approved/rejected
  // - Proper loading and empty states
  const JoinRequestsModal = ({ open, onClose, group }) => {
    if (!open || !group) return null;

    const requests = joinRequests[group.id] || [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-lg w-full max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Join Requests ({requests.length})
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg font-bold"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
              <p className="text-sm text-gray-500 dark:text-dark-textSecondary">{group.coursename}</p>
            </div>
            
            {requests.length === 0 ? (
              <p className="text-gray-500 dark:text-dark-textSecondary text-center py-8">
                No pending join requests
              </p>
            ) : (
              <div className="space-y-3">
                {requests.map(req => (
                  <RequestCard key={req.memberId} req={req} groupId={group.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateGroupModal = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
      name: "",
      code: "",
      coursename: "",
      courseId: "",
      description: "",
      privacy: "PUBLIC",
    });

    const handleCourseChange = (code) => {
      const found = COURSE_LIST.find(c => c.code === code);
      if (found) {
        setFormData(fd => ({
          ...fd,
          code: found.code,
          coursename: found.coursename,
          courseId: found.code.replace(/\D/g, ""),
        }));
      } else {
        setFormData(fd => ({ ...fd, code: "", coursename: "", courseId: "" }));
      }
    };

    const submit = async (e) => {
      e.preventDefault();
      await createGroup(formData);
    };

    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Create New Study Group</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg font-bold">✕</button>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Group Name</label>
              <input
                required
                className="w-full rounded-lg border border-gray-300 dark:border-dark-border focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition bg-white dark:bg-dark-input text-gray-900 dark:text-white"
                placeholder="Enter your group name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Select Course</label>
              <select
                required
                className="w-full rounded-lg border border-gray-300 dark:border-dark-border focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition bg-white dark:bg-dark-input text-gray-900 dark:text-white"
                value={formData.code}
                onChange={e => handleCourseChange(e.target.value)}
              >
                <option value="">Choose a course</option>
                {COURSE_LIST.map(c => <option key={c.code} value={c.code}>{c.coursename} ({c.code})</option>)}
              </select>
              {formData.code && (
                <div className="mt-2 bg-gray-50 rounded-lg p-2 text-sm border border-gray-200">
                  <p><strong>Course:</strong> {formData.coursename}</p>
                  <p><strong>Code:</strong> {formData.code}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-dark-border focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition min-h-[90px] resize-y bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-textSecondary"
                placeholder="Describe your group purpose..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Privacy</label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-dark-border focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition bg-white dark:bg-dark-input text-gray-900 dark:text-white"
                value={formData.privacy}
                onChange={e => setFormData({ ...formData, privacy: e.target.value })}
              >
                <option value="PUBLIC">🌍 Public - Anyone can join</option>
                <option value="PRIVATE">🔒 Private - Requires admin approval</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

const filteredAvailableGroups = availableGroups
    .map(normalizeGroup)
    .filter(g => {
      const size=Number(maxMembers);
      const matchesSearch = !searchTerm || (g.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrivacy = filterPrivacy === "ALL" || g.privacy === filterPrivacy;
      const matchesCourse = !filterCourse || (g.coursename || "").toLowerCase() === filterCourse.toLowerCase();
      const members = Number(g.memberCount ?? 0);
       if (members === 0) return false;
      const matchesSize = !maxMembers || members === size;
      return matchesSearch && matchesPrivacy && matchesCourse && matchesSize;
    });

  const headerContent = {
    title: 'Study Groups',
    description: 'Create, find and join study groups for your courses.',
    showCreateButton: true
  };

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{headerContent.title}</h2>
          <p className="text-sm text-gray-500 dark:text-dark-textSecondary">{headerContent.description}</p>
        </div>
        {headerContent.showCreateButton && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-4 w-4" /> Create Group
          </button>
        )}
      </div>

      {/* My Groups */}
      <section>
        <h3 className="text-xl font-semibold mb-4 dark:text-white">
          My Own Groups ({myGroups.length})
        </h3>

        {myGroups.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-textSecondary">You haven't created any groups yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {myGroups.map(g => (
              <div key={g.id} className="flex-shrink-0 w-full sm:w-[48%] md:w-[32%]">
                <GroupCard group={normalizeGroup(g)} role="admin" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Joined Groups */}
      <section>
        {joinedGroups.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-textSecondary">You haven't joined any groups yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {joinedGroups.map(g => (
              <div key={g.id} className="flex-shrink-0 w-full sm:w-[48%] md:w-[32%]">
                <GroupCard group={normalizeGroup(g)} role="joined" />
              </div>
            ))}
          </div>
        )}
      </section>


      {/* Available Groups */}
      <section>
        <h3 className="text-xl font-semibold mb-4 dark:text-white">
          Available Groups ({availableGroups.length})
        </h3>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            className="input-field flex-9 p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-textSecondary"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select className="input-field flex-4 p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-input text-gray-900 dark:text-white" value={filterPrivacy} onChange={e => setFilterPrivacy(e.target.value)}>
            <option value="ALL">All privacy</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
          <select className="input-field p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-input text-gray-900 dark:text-white" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">All courses</option>
            {COURSE_LIST.map(c => <option key={c.code} value={c.coursename}>{c.coursename}</option>)}
          </select>

          <input
            className="input-field p-2 border border-gray-300 dark:border-dark-border rounded-lg w-28 bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-textSecondary"
            type="number"
            placeholder="Group size"
            value={maxMembers}
            onChange={e => setMaxMembers(e.target.value)}
          />
        </div>
        {filteredAvailableGroups.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-textSecondary">No available groups found.</p>
        ) : (
    <div className="flex flex-wrap gap-4">
  {filteredAvailableGroups.map(g => (
    <div key={g.id} className="flex-shrink-0 w-full sm:w-[48%] md:w-[32%]">
      <GroupCard group={normalizeGroup(g)} role="available" />
    </div>
  ))}
</div>


  )}
      </section>

      {/* Pending Requests */}
      <section>
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Pending Requests Sent ({pendingRequests.length})</h3>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-textSecondary">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(g => <GroupCard key={g.id} group={normalizeGroup(g)} role="pending" />)}
          </div>
        )}
      </section>

      <CreateGroupModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinRequestsModal 
        open={showJoinRequestsModal} 
        onClose={() => setShowJoinRequestsModal(false)} 
        group={selectedGroupForRequests} 
      />
    </div>
  );
}

// ========================================
// BACKEND INTEGRATION SUMMARY - JOIN REQUESTS MODAL
// ========================================
// 
// WHAT WAS IMPLEMENTED:
// 1. Join Requests Modal - Clean popup to view/manage join requests
// 2. Icon-based Access - ClipboardDocumentListIcon on private group cards
// 3. Consistent UI - All group cards now have same height/layout
// 
// BACKEND ENDPOINTS USED:
// - GET /api/groups/{groupId}/requests (fetchJoinRequests)
// - POST /api/groups/approve/{memberId}?adminId={userId} (approveRequest)  
// - POST /api/groups/reject/{memberId}?adminId={userId} (rejectRequest)
// 
// INTEGRATION POINTS:
// 1. handleViewJoinRequests() - Opens modal and fetches requests
// 2. JoinRequestsModal component - Displays requests with approve/reject
// 3. GroupCard component - Shows icon for private groups (admin only)
// 
// TESTING CHECKLIST FOR BACKEND:
// □ Verify GET requests endpoint returns proper user data
// □ Test approve/reject endpoints update group membership
// □ Ensure proper authorization (admin-only access)
// □ Check error handling for invalid requests
// □ Validate response formats match frontend expectations
// 
// ERROR HANDLING:
// - Network errors are logged to console
// - Failed requests show user-friendly messages
// - Modal gracefully handles empty states
// - Loading states prevent duplicate requests
// ========================================