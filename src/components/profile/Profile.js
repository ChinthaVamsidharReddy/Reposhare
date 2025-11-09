// from vamsi side 
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CameraIcon, UserIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8080"; // Backend URL

// Helper InputField Component
const InputField = ({ label, name, value, editMode, type = "text", onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={!editMode}
      className={`input-field mt-1 ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  </div>
);

const Profile = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    secondarySchool: '',
    secondarySchoolPassingYear: '',
    secondarySchoolPercentage: '',
    higherSecondarySchool: '',
    higherSecondaryPassingYear: '',
    higherSecondaryPercentage: '',
    universityName: '',
    universityPassingYear: '',
    universityPassingGPA: '',
    major:'',
    bio: '',
    avatar: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Change Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordType, setPasswordType] = useState("");

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      const data = response.data;
      setFormData({
        name: data.name || '',
        email: data.email || '',
        secondarySchool: data.secondarySchool || '',
        secondarySchoolPassingYear: data.secondarySchoolPassingYear || '',
        secondarySchoolPercentage: data.secondarySchoolPercentage || '',
        higherSecondarySchool: data.higherSecondarySchool || '',
        higherSecondaryPassingYear: data.higherSecondaryPassingYear || '',
        higherSecondaryPercentage: data.higherSecondaryPercentage || '',
        universityName: data.universityName || '',
        universityPassingYear: data.universityPassingYear || '',
        universityPassingGPA: data.universityPassingGPA || '',
        major: data.major || '',
        bio: data.bio || '',
        avatar: data.avatar || ''
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Failed to load profile.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (location.pathname === "/profile") {
      fetchProfile();
    }
  }, [location.pathname]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setEditMode(!editMode);
    setMessage('');
  };

  // Avatar upload
  const handleAvatarClick = () => {
    if (editMode) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFormData({ ...formData, avatar: e.target.result });
      reader.readAsDataURL(file);
    }
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        id: userId,
        name: formData.name,
        email: formData.email,
        password: formData.password, 
        secondarySchool: formData.secondarySchool,
        secondarySchoolPassingYear: Number(formData.secondarySchoolPassingYear),
        secondarySchoolPercentage: Number(formData.secondarySchoolPercentage),
        higherSecondarySchool: formData.higherSecondarySchool,
        higherSecondaryPassingYear: Number(formData.higherSecondaryPassingYear),
        higherSecondaryPercentage: Number(formData.higherSecondaryPercentage),
        universityName: formData.universityName,
        universityPassingYear: Number(formData.universityPassingYear),
        universityPassingGPA: Number(formData.universityPassingGPA),
        major:formData.major,
        bio: formData.bio,
        avatar: formData.avatar
      };
      alert(updateData.major)

      await axios.put(`${API_BASE_URL}/profile/update/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Profile updated successfully!');
      setMessageType('success');
      setEditMode(false);
    } catch (error) {
      console.error(error);
      if (error.response) {
        setMessage(`Failed to update profile: ${error.response.data.message || error.response.statusText}`);
      } else {
        setMessage('Failed to update profile.');
      }
      setMessageType('error');
    }

    setLoading(false);
  };

  // Handle change password
  // Inside Profile.js
const handlePasswordUpdate = async (e) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    setMessage("New password and confirm password do not match!");
    setMessageType("error");
    return;
  }

  try {
    const response = await axios.put(
      `${API_BASE_URL}/profile/update-password/${userId}`,
      // {
      //   oldPassword: oldPassword,
      //   newPassword: newPassword,
      // },
      {},
      {
        params: {
          oldPassword: oldPassword,
          newPassword: newPassword
        },
          headers: {
            Authorization: `Bearer ${token}`,  // ✅ Include JWT
            "Content-Type": "application/json"
          },
      }
    );

    alert("Password updated successfully!")
    setMessage("Password updated successfully!");
    setMessageType("success");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    console.error("Password update error:", error);
    if (error.response && error.response.status === 403) {
      setMessage("Unauthorized! Please login again.");
    } else {
      setMessage("Failed to update password.");
    }
    setMessageType("error");
  }
};


  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-dark-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Settings</h3>
            <button
              onClick={handleEditToggle}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-500"
            >
              <PencilIcon className="h-5 w-5" />
              <span>{editMode ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {formData.avatar ? (
  <img src={formData.avatar} alt="Profile" className="h-full w-full object-cover" />
) : (
  <UserIcon className="h-12 w-12 text-gray-400" />
)}

                </div>
                {editMode && (
                  <>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"
                    >
                      <CameraIcon className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="name" value={formData.name} editMode={editMode} onChange={handleChange} />
              <InputField label="Email" name="email" type="email" value={formData.email} editMode={editMode} onChange={handleChange} />
            </div>

            {/* Secondary School */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
              <h3 className="text-md font-medium text-gray-900 dark:text-white">Secondary School</h3>
              <InputField label="School Name" name="secondarySchool" value={formData.secondarySchool} editMode={editMode} onChange={handleChange} />
              <InputField label="Passing Year" name="secondarySchoolPassingYear" type="number" value={formData.secondarySchoolPassingYear} editMode={editMode} onChange={handleChange} />
              <InputField label="Percentage" name="secondarySchoolPercentage" type="number" value={formData.secondarySchoolPercentage} editMode={editMode} onChange={handleChange} />
            </div>

            {/* Higher Secondary School */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
              <h3 className="text-md font-medium text-gray-900 dark:text-white">Higher Secondary School</h3>
              <InputField label="School Name" name="higherSecondarySchool" value={formData.higherSecondarySchool} editMode={editMode} onChange={handleChange} />
              <InputField label="Passing Year" name="higherSecondaryPassingYear" type="number" value={formData.higherSecondaryPassingYear} editMode={editMode} onChange={handleChange} />
              <InputField label="Percentage" name="higherSecondaryPercentage" type="number" value={formData.higherSecondaryPercentage} editMode={editMode} onChange={handleChange} />
            </div>

            {/* University */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
              <h3 className="text-md font-medium text-gray-900 dark:text-white">University</h3>
              <InputField label="University Name" name="universityName" value={formData.universityName} editMode={editMode} onChange={handleChange} />
              <InputField label="Passing Year" name="universityPassingYear" type="number" value={formData.universityPassingYear} editMode={editMode} onChange={handleChange} />
              <InputField label="GPA" name="universityPassingGPA" type="number" value={formData.universityPassingGPA} editMode={editMode} onChange={handleChange} />
              <InputField label="major" name="major" value={formData.major} editMode={editMode} onChange={handleChange} />
            </div>

            {/* <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Bio</label>
              <textarea
                name="bio"
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                disabled={!editMode}
                className={`input-field mt-1 ${!editMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div> */}

            {/* Submit Button */}
            {editMode && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            )}
          </form>

          <div className="mt-10 border-t pt-8">
  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
    Change Password
  </h3>

  {passwordMsg && (
    <div
      className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
        passwordType === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
      }`}
    >
      {passwordMsg}
    </div>
  )}

  <form
    onSubmit={handlePasswordUpdate}
    className="space-y-4 bg-gray-50 dark:bg-dark-card p-6 rounded-lg shadow-md"
  >
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
        Current Password
      </label>
      <input
        type="password"
        placeholder="Enter current password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        required
        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:outline-none bg-white dark:bg-dark-input text-gray-900 dark:text-white"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
        New Password
      </label>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:outline-none bg-white dark:bg-dark-input text-gray-900 dark:text-white"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
        Confirm New Password
      </label>
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:outline-none bg-white dark:bg-dark-input text-gray-900 dark:text-white"
      />
    </div>

    <button
      type="submit"
      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-md shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
    >
      Update Password
    </button>
  </form>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
