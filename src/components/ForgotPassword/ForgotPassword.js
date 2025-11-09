import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1=email, 2=otp verification, 3=reset password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();


  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const requestOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setStep(2);
      showMessage("OTP sent to your email!", "success");
    } catch (err) {
      console.error(err);
      showMessage("Error sending OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
      setStep(3);
      showMessage("OTP verified successfully!", "success");
    } catch (err) {
      console.error(err);
      showMessage("OTP incorrect or expired", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match!", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/reset-password`, {
        email,
        newPassword,
      });
      showMessage("Password updated! Please login again.", "success");
      setStep(4);// redirect back to step 1 or login
    } catch (err) {
      console.error(err);
      showMessage("Error updating password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Reset Password"}
        </h2>

        {message.text && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "error"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </div>
        )}
        {step === 4 && (
  <div className="text-center space-y-4">
    <p className="text-green-700 font-semibold">
      Your password has been updated successfully!
    </p>
    <button
      onClick={() => navigate("/login")} // redirect to login
      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
    >
      Go to Login
    </button>
  </div>
)}
      </div>
    </div>
  );
}
