import React, { useEffect, useState } from "react";
import logo from "./../assets/short.svg";
import { MdOutlineFileUpload } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string | null>("");
  const [profileImage, setProfileImage] = useState<string | null>("");

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (storedUserName) {
      setUserName(storedUserName);
    }

    if (storedUserId) {
      fetchUserDetails(storedUserId);
    }
  }, []);

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
          console.error(`Error: ${response.statusText}`);
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response Data:", data);
        console.log( "image",data.profile.image);

        if (data && data.profile && data.profile.image) {
          
          const imageUrl = `http://staffio-dev.999r.in:82/storage/uploads/${data.profile.image}`;
          setProfileImage(imageUrl);
          console.log("Profile",imageUrl);
        } else {
          console.warn("Profile image is missing in the API response.");
        }
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  };

  return (
    <>
      <div className="overflow-x-hidden z-20 relative">
        <div>
          <div className="bg-slate-200 w-full h-20 flex justify-between items-center px-5 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <p className="ml-[125px] font-bold sm:ml-20 md:ml-52 lg:ml-48 xl:ml-56">
                {userName || "User"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/settings" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
                <FiSettings className="text-2xl" />
              </Link>
              <img className="h-11" src={logo} alt="Logo" />
            </div>
          </div>
        </div>

        <div className="w-24 h-24 bg-slate-300 border-b-2 rounded-full ml-6 -mt-16 md:w-28 md:h-28 lg:w-40 lg:h-40 overflow-hidden relative">
          {profileImage ? (
            <img
              src={profileImage}
             
              className="w-full h-full object-contain rounded-full"
            />
          ) : (
            <div className="absolute inset-0 opacity-10 rounded-full flex justify-center items-center">
              <MdOutlineFileUpload className="w-full h-full object-cover rounded-full" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
