import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    secondarySchool: "",
    secondarySchoolPassingYear: "",
    secondarySchoolPercentage: "",
    higherSecondarySchool: "",
    higherSecondaryPassingYear: "",
    higherSecondaryPercentage: "",
    universityName: "",
    universityPassingYear: "",
    universityPassingGPA: "",
    major:'',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Prepare payload matching backend DTO
    const payload = {
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
      major: formData.major,
    };

    try {
      const result = await register(payload);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error(err);
      setError("Registration failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-gradient-to-r from-indigo-50 via-white to-indigo-100">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">
            Join <span className="font-semibold text-indigo-600">Study Group Finder</span> today 🚀
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              className="input-field mt-1"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="input-field mt-1"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Secondary School */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Secondary School</h3>
            <input
              name="secondarySchool"
              type="text"
              required
              className="input-field mb-2"
              placeholder="School name"
              value={formData.secondarySchool}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="secondarySchoolPassingYear"
                type="number"
                required
                className="input-field"
                placeholder="Passing Year"
                value={formData.secondarySchoolPassingYear}
                onChange={handleChange}
              />
              <input
                name="secondarySchoolPercentage"
                type="number"
                required
                className="input-field"
                placeholder="Percentage"
                value={formData.secondarySchoolPercentage}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Higher Secondary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Higher Secondary School</h3>
            <input
              name="higherSecondarySchool"
              type="text"
              required
              className="input-field mb-2"
              placeholder="School name"
              value={formData.higherSecondarySchool}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="higherSecondaryPassingYear"
                type="number"
                required
                className="input-field"
                placeholder="Passing Year"
                value={formData.higherSecondaryPassingYear}
                onChange={handleChange}
              />
              <input
                name="higherSecondaryPercentage"
                type="number"
                required
                className="input-field"
                placeholder="Percentage"
                value={formData.higherSecondaryPercentage}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* University */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-2">University</h3>
            <input
              name="universityName"
              type="text"
              className="input-field mb-2"
              placeholder="University Name"
              value={formData.universityName}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="universityPassingYear"
                type="number"
                className="input-field"
                placeholder="Passing Year"
                value={formData.universityPassingYear}
                onChange={handleChange}
              />
              <input
                name="universityPassingGPA"
                type="number"
                className="input-field"
                placeholder="GPA"
                value={formData.universityPassingGPA}
                onChange={handleChange}
              />
              <input
                name="major"
                type="text"
                className="input-field"
                placeholder="Major"
                value={formData.major}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="input-field pr-10"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative mt-1">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="input-field pr-10"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Already have account */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
