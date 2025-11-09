import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from "axios";
import { useAuth } from "./AuthContext";

const CoursesContext = createContext();
const API_BASE_URL = "http://localhost:8080/courses"; 
export const useCourses = () => useContext(CoursesContext);

export const CoursesProvider = ({ children }) => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?.id) return;
      try {
        // const res = await axios.get(`/courses/enrolled/${user.id}`);
        const res = await axios.get(`${API_BASE_URL}/enrolled/${user.id}`);
        console.log("inside the coursecontect file endolred course are :"+res.data.length)

        localStorage.setItem('EnrolledCourses',res.data.length);
        setEnrolledCourses(res.data || []);
      } catch (error) {
        console.warn("Error fetching enrolled courses (backend unavailable), using demo data:", error.message);
        // Use demo data when backend is unavailable
        const demoCourses = [
          { id: 1, name: 'Introduction to Computer Science', code: 'CS101' },
          { id: 2, name: 'Data Structures', code: 'CS201' },
          { id: 3, name: 'Web Development', code: 'CS301' },
        ];
        localStorage.setItem('EnrolledCourses', demoCourses.length);
        setEnrolledCourses(demoCourses);
      }
    };
    fetchEnrolledCourses();
  }, [user]);

  return (
    <CoursesContext.Provider value={{ enrolledCourses }}>
      {children}
    </CoursesContext.Provider>
  );
};
