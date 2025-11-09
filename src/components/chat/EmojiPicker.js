// import React, { useState } from 'react';
// import { FaceSmileIcon } from '@heroicons/react/24/outline';

// const EmojiPicker = ({ onEmojiSelect }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const emojis = [
//     '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
//     '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
//     '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
//     '🤪', '😌', '😔', '😑', '😐', '😶', '🤐', '🤨',
//     '🤔', '🤫', '🤭', '🤫', '🤬', '🤗', '🤡', '😈',
//     '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏'
//   ];

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-600 dark:text-dark-text"
//         title="Add emoji"
//       >
//         <FaceSmileIcon className="h-5 w-5" />
//       </button>

//       {isOpen && (
//         <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-3 grid grid-cols-8 gap-2 z-50 w-80">
//           {emojis.map((emoji, idx) => (
//             <button
//               key={idx}
//               onClick={() => {
//                 onEmojiSelect(emoji);
//                 setIsOpen(false);
//               }}
//               className="text-xl hover:scale-125 transition cursor-pointer"
//             >
//               {emoji}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmojiPicker;



import React, { useState } from 'react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

const EmojiPicker = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
    '🤪', '😌', '😔', '😑', '😐', '😶', '🤐', '🤨',
    '🤔', '🤫', '🤭', '🤫', '🤬', '🤗', '🤡', '😈',
    '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏'
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-600 dark:text-dark-text"
        title="Add emoji"
      >
        <FaceSmileIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-3 grid grid-cols-8 gap-3 z-50 w-96">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                onEmojiSelect(emoji);
                setIsOpen(false);
              }}
              className="text-3xl hover:scale-125 transition cursor-pointer p-1"
              // text-3xl ≈ 30px font size
              // hover:scale-125 gives a nice pop on hover
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
