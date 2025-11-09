/// import React, { useEffect, useState, useRef } from "react";
// import { useChat } from '../../contexts/ChatContext';
// import {
//   PaperClipIcon,
//   ArrowRightIcon,
//   UserGroupIcon,
//   ArrowLeftIcon,
// } from "@heroicons/react/24/outline";
// import { useNavigate } from "react-router-dom";

// const API_BASE = "http://localhost:8080/api/groups";
// const token = localStorage.getItem("token");
// const userId = localStorage.getItem("userId");

// export default function GroupChat() {

//   const { connected, setActiveGroup, openGroup, ...rest } = useChat();
// console.log('[useChat value]', { connected, setActiveGroup, openGroup, rest });
  
//   const [groups, setGroups] = useState([]); // Own + joined groups combined
//   // const [activeGroup, setActiveGroup] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [showMembers, setShowMembers] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState({});
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchUserGroups();
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   /** 🔹 Fetch both Created and Joined groups */
//   const fetchUserGroups = async () => {
//     try {
//       const [createdRes, joinedRes] = await Promise.all([
//         fetch(`${API_BASE}/created/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch(`${API_BASE}/joined/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const createdData = await createdRes.json();
//       const joinedData = await joinedRes.json();

//       // Mark the type for frontend distinction
//       const createdGroups = (createdData || []).map((g) => ({
//         ...g,
//         type: "OWN",
//       }));
//       const joinedGroups = (joinedData || []).map((g) => ({
//         ...g,
//         type: "JOINED",
//       }));

//       const allGroups = [...createdGroups, ...joinedGroups];
//       setGroups(allGroups);

//       // Auto-load first group (optional)
//       if (allGroups?.length) fetchGroupDetails(allGroups[0].id);
//     } catch (err) {
//       console.error(err);
//       // alert("Failed to load groups");
//     }
//   };

//   const fetchGroupDetails = async (groupId) => {
//     try {
//       const res = await fetch(`${API_BASE}/${groupId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setActiveGroup(data);
//       setMessages([]);
//       setShowMembers(false);
//       fetchMessages(groupId);
//       markAsRead(groupId);
//     } catch (err) {
//       console.error(err);
//       // alert("Failed to load group details");
//     }
//   };

//   const fetchMessages = async (groupId) => {
//     try {
//       const res = await fetch(`${API_BASE}/${groupId}/messages`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setMessages(data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !activeGroup) return;

//     const messagePayload = {
//       senderId: userId,
//       text: newMessage,
//       timestamp: new Date().toISOString(),
//     };

//     try {
//       const res = await fetch(`${API_BASE}/${activeGroup.id}/messages`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(messagePayload),
//       });

//       if (!res.ok) throw new Error("Failed to send message");

//       setMessages((prev) => [...prev, messagePayload]);
//       setNewMessage("");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to send message");
//     }
//   };

//   const markAsRead = (groupId) => {
//     setUnreadCounts((prev) => ({ ...prev, [groupId]: 0 }));
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* LEFT PANE - List of Own + Joined Groups */}
//       <div className="w-72 bg-white shadow-md flex flex-col">
//         <div className="flex items-center justify-between p-4 border-b">
//           <h2 className="font-bold text-lg">My Groups</h2>
//           <button
//             onClick={() => navigate("/study-groups")}
//             className="p-1 text-gray-500 hover:text-gray-700"
//           >
//             {/* <ArrowLeftIcon className="h-6 w-6" /> */}
//             Back
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           {groups.length === 0 && (
//             <p className="text-gray-500 text-center mt-6">
//               No groups available.
//             </p>
//           )}

//           {groups.map((g) => (
//             <div
//               key={g.id}
//               className={`flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 ${
//                 activeGroup?.id === g.id ? "bg-blue-100 font-semibold" : ""
//               }`}
//               onClick={() => fetchGroupDetails(g.id)}
//             >
//               <div>
//                 <p>{g.name}</p>
//                 <p className="text-xs text-gray-500">
//                   {g.coursename || g.courseId}
//                 </p>
//                 <p
//                   className={`text-[10px] mt-1 ${
//                     g.type === "OWN" ? "text-green-600" : "text-blue-500"
//                   }`}
//                 >
//                   {g.type === "OWN" ? "Owned Group" : "Joined Group"}
//                 </p>
//               </div>
//               {unreadCounts[g.id] > 0 && (
//                 <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
//                   {unreadCounts[g.id]}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* RIGHT PANE - Chat Section */}
//       <div className="flex-1 flex flex-col">
//         {activeGroup ? (
//           <>
//             {/* HEADER */}
//             <div className="flex items-center justify-between bg-white p-4 shadow-md border-b">
//               <div
//                 className="flex items-center gap-3 cursor-pointer"
//                 onClick={() => setShowMembers(!showMembers)}
//               >
//                 <img
//                   src={`https://ui-avatars.com/api/?name=${activeGroup.name}&background=random`}
//                   alt="Group Avatar"
//                   className="h-10 w-10 rounded-full"
//                 />
//                 <div>
//                   <h2 className="text-lg font-semibold">{activeGroup.name}</h2>
//                   <p className="text-sm text-gray-500">
//                     {activeGroup.description}
//                   </p>
//                 </div>
//               </div>
//               <span className="text-sm text-gray-400">
//                 {activeGroup.members.length + 1} members
//               </span>
//             </div>

//             {/* TOGGLE MEMBERS */}
//             {showMembers && (
//               <div className="bg-gray-50 p-3 flex flex-col space-y-1 border-b">
//                 <h3 className="font-semibold mb-1">Admin</h3>
//                 <div className="flex items-center gap-2 mb-2">
//                   <UserGroupIcon className="h-5 w-5 text-gray-500" />
//                   <span>{activeGroup.createdBy.name}</span>
//                   <span className="text-xs text-gray-400">
//                     {activeGroup.createdBy.major}
//                   </span>
//                 </div>

//                 <h3 className="font-semibold mt-1">Members</h3>
//                 {activeGroup.members.map((m) => (
//                   <div key={m.id} className="flex items-center gap-2">
//                     <UserGroupIcon className="h-5 w-5 text-gray-500" />
//                     <span>{m.name}</span>
//                     <span className="text-xs text-gray-400">{m.major}</span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* CHAT MESSAGES */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
//               {messages.map((msg, idx) => (
//                 <div
//                   key={idx}
//                   className={`flex ${
//                     msg.senderId === userId ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-xs px-3 py-2 rounded-lg ${
//                       msg.senderId === userId
//                         ? "bg-blue-600 text-white"
//                         : "bg-white text-gray-800 shadow"
//                     }`}
//                   >
//                     <p className="text-sm">{msg.text}</p>
//                     <span className="text-xs text-gray-400 block text-right mt-1">
//                       {new Date(msg.timestamp).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef}></div>
//             </div>

//             {/* INPUT */}
//             <div className="flex items-center gap-2 p-3 bg-white border-t shadow-inner">
//               <label htmlFor="file-upload">
//                 <PaperClipIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
//               </label>
//               <input
//                 id="file-upload"
//                 type="file"
//                 className="hidden"
//                 onChange={() => alert("File upload coming soon")}
//               />
//               <input
//                 type="text"
//                 placeholder="Type a message..."
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring focus:ring-blue-200"
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               />
//               <button
//                 onClick={sendMessage}
//                 className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
//               >
//                 <ArrowRightIcon className="h-5 w-5" />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-500">
//             Select a group to start chatting
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
