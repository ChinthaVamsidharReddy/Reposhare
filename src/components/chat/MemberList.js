import React, { useState } from 'react';
import { UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MemberList = ({ groupId, groupName, members = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 👥 Button to open member modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-600 dark:text-dark-text"
        title="View members"
      >
        <UserGroupIcon className="h-6 w-6" />
      </button>

      {/* 🧾 Member modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto shadow-lg">
            
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                {groupName} Members ({members.length})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-input rounded transition"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Member list */}
            {members.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No members in this group yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-dark-border">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-input transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{member.avatar || '👤'}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-dark-text">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-textSecondary">
                          {member.role || 'Member'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        member.status === 'online'
                          ? 'bg-green-500'
                          : member.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MemberList;
