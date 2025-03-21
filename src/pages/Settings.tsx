import React, { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode, MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name?: string;
  image?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if dark mode preference is stored
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode) {
      setDarkMode(storedDarkMode === "true");
    }

    // Apply the theme
    applyTheme(storedDarkMode === "true");

    // Fetch user details
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetchUserDetails(userId);
    }
  }, []);

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    applyTheme(newDarkMode);
  };

  const fetchUserDetails = (userId: string) => {
    const API_URL = `http://staffio-dev.999r.in:82/user/${userId}`;
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token is missing or invalid.");
      return;
    }

    fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.profile) {
          setUserProfile({
            name: data.profile.name || data.name,
            image: data.profile.image 
              ? `http://staffio-dev.999r.in:82/storage/uploads/${data.profile.image}`
              : null,
            email: data.profile.email || data.email,
            phone: data.profile.phone,
            address: data.profile.address,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto transition-colors duration-300 dark:bg-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="mb-8 p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
            {userProfile.image ? (
              <img 
                src={userProfile.image} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Name</p>
              <p className="font-medium">{userProfile.name || "Not available"}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Email</p>
              <p className="font-medium">{userProfile.email || "Not available"}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Phone</p>
              <p className="font-medium">{userProfile.phone || "Not available"}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 dark:text-gray-300 text-sm">Address</p>
              <p className="font-medium">{userProfile.address || "Not available"}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8 p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              darkMode ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {darkMode ? (
              <MdLightMode className="text-xl" />
            ) : (
              <MdDarkMode className="text-xl" />
            )}
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Settings; 