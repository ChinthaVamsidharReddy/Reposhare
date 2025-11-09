// import React from 'react';
// import { CheckIcon } from '@heroicons/react/24/outline';

// const ReadReceipts = ({ message, readBy = [] }) => {
//   if (!readBy || readBy.length === 0) return null;

//   return (
//     <div className="flex items-center gap-1 mt-1">
//       {readBy.length === 1 ? (
//         <div className="flex items-center gap-1 text-xs text-gray-400">
//           <CheckIcon className="h-3 w-3" />
//           <span>Read by {readBy[0]}</span>
//         </div>
//       ) : (
//         <div className="flex items-center gap-1 text-xs text-gray-400">
//           <CheckIcon className="h-3 w-3" />
//           <CheckIcon className="h-3 w-3" />
//           <span>Read by {readBy.length}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ReadReceipts;




import React, { useEffect } from 'react';

const ReadReceipts = ({ message, groupId }) => {
  useEffect(() => {
    const el = document.querySelector(`[data-message-id='${message.id}']`);
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        window.dispatchEvent(
          new CustomEvent('chat:readReceipt', { detail: { groupId, messageIds: [message.id] } })
        );
        observer.disconnect();
      }
    }, { threshold: 0.8 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [message.id, groupId]);

  return null; // no visible UI; MessageBubble already shows ticks
};

export default ReadReceipts;
