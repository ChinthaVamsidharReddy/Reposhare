import React, { useState } from 'react';
import { useCourseGroups } from '../../contexts/CourseGroupContext';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline';

const BrowseCourses = () => {
  const { dummyCourses, joinedGroups, joinGroup, leaveGroup, isGroupJoined } = useCourseGroups();
  const [filter, setFilter] = useState('all');

  const filteredCourses = filter === 'joined' 
    ? dummyCourses.filter(c => isGroupJoined(c.id))
    : dummyCourses;

  const handleJoinLeave = (course) => {
    if (isGroupJoined(course.id)) {
      leaveGroup(course.id);
    } else {
      joinGroup(course);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
          Available Courses
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-dark-input text-gray-900 dark:text-dark-text'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter('joined')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'joined'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-dark-input text-gray-900 dark:text-dark-text'
            }`}
          >
            My Groups ({joinedGroups.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const isJoined = isGroupJoined(course.id);
          return (
            <div
              key={course.id}
              className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{course.avatar}</div>
                <button
                  onClick={() => handleJoinLeave(course)}
                  className={`p-2 rounded-lg transition ${
                    isJoined
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                  }`}
                >
                  {isJoined ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <PlusIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-1">
                {course.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-textSecondary mb-3">
                {course.code}
              </p>

              <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-4">
                {course.description}
              </p>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-dark-textSecondary">
                  <span className="font-medium">Instructor:</span> {course.instructor}
                </p>
                <p className="text-gray-600 dark:text-dark-textSecondary">
                  <span className="font-medium">Members:</span> {course.members}
                </p>
              </div>

              {isJoined && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    ✓ You've joined this group
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-dark-textSecondary">
            No courses found. Join some courses to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;
