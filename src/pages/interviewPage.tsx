import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { interviewAPI } from "../services/apiService";
import { getAuthToken } from "../services/tokenManager";

interface ApiResponse {
  success?: string;
  error?: string;
}

const ScheduleInterview: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduledDate(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!scheduledDate) {
      setError("Please select a date and time for the interview.");
      setLoading(false);
      return;
    }

    const requestData = {
      scheduled_date: scheduledDate,
      application_id: applicationId,
    };
    console.log("Data to send:", requestData);

    const token = getAuthToken();
    if (!token) {
      setError("You are not authenticated. Please log in.");
      console.log("Error: No authToken found in localStorage.");
      return;
    }

    try {
      const response = await interviewAPI.scheduleInterview(requestData);
      console.log("Response received from API:", response);

      toast.success("Interview scheduled successfully!");
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error("Error scheduling interview:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Schedule Interview</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="scheduledDate" className="block text-gray-700 font-bold mb-2">
            Date and Time
          </label>
          <input
            type="datetime-local"
            id="scheduledDate"
            value={scheduledDate}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Scheduling..." : "Schedule Interview"}
          </button>
        </div>
      </form>
      
      <ToastContainer />
    </div>
  );
};

export default ScheduleInterview;