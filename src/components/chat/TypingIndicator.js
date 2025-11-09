// import React from "react";
// import { useAuth } from "../../contexts/AuthContext";
// const TypingIndicator = ({ users = [] }) => {
//   const { user } = useAuth();
//   const currentUserId = user?.id || localStorage.getItem("userId");

//   // Filter out current user
//   const filtered = users.filter(
//     (u) => String(u.userId) !== String(currentUserId)
//   );


//   // alert(u.names)
//   if (!filtered.length) return null;
//   const names = filtered.map((u) => u.userName).filter(Boolean);

//   const text =
//     names.length === 1
//       ? `${names[0]} is typing...`
//       : `${names.join(", ")} are typing...`;

//   return (
//     <div className="text-xs text-gray-500 italic px-2 py-1 animate-pulse">
//       {text}
//     </div>
//   );
// };


// export default TypingIndicator;




import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const TypingIndicator = ({ users = [] }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || localStorage.getItem("userId");

  // Filter out the current user
  const filtered = users.filter(
    (u) => String(u.userId) !== String(currentUserId)
  );

  if (!filtered.length) return null;

  // Extract clean names
  const names = filtered.map(
    (u) => u.userName || u.username || u.name || "Someone"
  );

  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.join(", ")} are typing...`;

  return (
    <div className="text-xs text-gray-500 italic px-3 py-2 animate-pulse transition-opacity duration-300 ease-in-out">
      {text}
    </div>
  );
};

export default TypingIndicator;
