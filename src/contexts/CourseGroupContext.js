import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CourseGroupContext = createContext();

export const useCourseGroups = () => {
  const context = useContext(CourseGroupContext);
  if (!context) throw new Error('useCourseGroups must be used within CourseGroupProvider');
  return context;
};

export const CourseGroupProvider = ({ children }) => {
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState([]);

  const dummyCourses = [
    {
      id: 'course1',
      name: 'CS101 - Introduction to Computer Science',
      code: 'CS101',
      instructor: 'Dr. Sarah Chen',
      description: 'Fundamentals of computer science and programming',
      groupId: 'group1',
      groupName: 'CS101 Study Group',
      members: 8,
      avatar: '💻'
    },
    {
      id: 'course2',
      name: 'MATH201 - Calculus II',
      code: 'MATH201',
      instructor: 'Prof. James Wilson',
      description: 'Advanced calculus concepts and applications',
      groupId: 'group2',
      groupName: 'MATH201 Study Group',
      members: 12,
      avatar: '📐'
    },
    {
      id: 'course3',
      name: 'PHYS301 - Quantum Mechanics',
      code: 'PHYS301',
      instructor: 'Dr. Emma Rodriguez',
      description: 'Principles of quantum mechanics and wave functions',
      groupId: 'group3',
      groupName: 'PHYS301 Study Group',
      members: 5,
      avatar: '⚛️'
    },
    {
      id: 'course4',
      name: 'ENG102 - English Literature',
      code: 'ENG102',
      instructor: 'Prof. Michael Brown',
      description: 'Classic and contemporary literature analysis',
      groupId: 'group4',
      groupName: 'ENG102 Study Group',
      members: 15,
      avatar: '📚'
    },
    {
      id: 'course5',
      name: 'BIO201 - Molecular Biology',
      code: 'BIO201',
      instructor: 'Dr. Lisa Anderson',
      description: 'Cellular and molecular biology fundamentals',
      groupId: 'group5',
      groupName: 'BIO201 Study Group',
      members: 10,
      avatar: '🧬'
    },
    {
      id: 'course6',
      name: 'CHEM101 - General Chemistry',
      code: 'CHEM101',
      instructor: 'Prof. David Kumar',
      description: 'Basic principles of chemistry',
      groupId: 'group6',
      groupName: 'CHEM101 Study Group',
      members: 18,
      avatar: '⚗️'
    },
    {
      id: 'course7',
      name: 'HIST301 - World History',
      code: 'HIST301',
      instructor: 'Dr. Patricia Johnson',
      description: 'Major events and civilizations throughout history',
      groupId: 'group7',
      groupName: 'HIST301 Study Group',
      members: 9,
      avatar: '🏛️'
    },
    {
      id: 'course8',
      name: 'ECON201 - Microeconomics',
      code: 'ECON201',
      instructor: 'Prof. Robert Martinez',
      description: 'Economic principles and market dynamics',
      groupId: 'group8',
      groupName: 'ECON201 Study Group',
      members: 14,
      avatar: '💰'
    }
  ];

  useEffect(() => {
    if (user?.id) {
      const savedGroups = localStorage.getItem(`joinedGroups_${user.id}`);
      if (savedGroups) {
        setJoinedGroups(JSON.parse(savedGroups));
      } else {
        const defaultGroups = dummyCourses.slice(0, 3);
        setJoinedGroups(defaultGroups);
        localStorage.setItem(`joinedGroups_${user.id}`, JSON.stringify(defaultGroups));
      }
    }
  }, [user?.id]);

  const joinGroup = (course) => {
    if (!joinedGroups.find((g) => g.id === course.id)) {
      const updatedGroups = [...joinedGroups, course];
      setJoinedGroups(updatedGroups);
      if (user?.id) {
        localStorage.setItem(`joinedGroups_${user.id}`, JSON.stringify(updatedGroups));
      }
      return true;
    }
    return false;
  };

  const leaveGroup = (courseId) => {
    const updatedGroups = joinedGroups.filter((g) => g.id !== courseId);
    setJoinedGroups(updatedGroups);
    if (user?.id) {
      localStorage.setItem(`joinedGroups_${user.id}`, JSON.stringify(updatedGroups));
    }
  };

  const isGroupJoined = (courseId) => {
    return joinedGroups.some((g) => g.id === courseId);
  };

  const value = {
    dummyCourses,
    joinedGroups,
    joinGroup,
    leaveGroup,
    isGroupJoined
  };

  return (
    <CourseGroupContext.Provider value={value}>
      {children}
    </CourseGroupContext.Provider>
  );
};
