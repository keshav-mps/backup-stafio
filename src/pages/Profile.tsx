import React, { useState, useEffect } from "react";
import { MdOutlineFileUpload, MdEdit, MdSave, MdPerson, MdEmail, MdPhone, MdLocationOn, MdCake, MdWc, MdBusiness, MdLanguage, MdDescription, MdInsertDriveFile } from "react-icons/md";
import logo from "./../assets/short.svg";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { profileAPI } from "../services/apiService";
import { getAuthToken, getUserId } from "../services/tokenManager";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [DOB, setDOB] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [userId, setUserId] = useState<string | null>("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = getUserId();
    const storedRoleId = localStorage.getItem("role_id");

    if (storedUserName) {
      setUserName(storedUserName);
    }

    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserDetails(storedUserId);
    }

    if (storedRoleId) {
      setRoleId(parseInt(storedRoleId));
    }
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      const data = await profileAPI.getUserById(userId);
      console.log("User data:", data);
      
      setEmail(data.email || "");
      
      if (data.profile) {
        setAddress(data.profile.address || "");
        setDOB(data.profile.DOB || "");
        setGender(data.profile.gender || "");
        setCompany(data.profile.company_name || "");
        setWebsite(data.profile.website || "");
        setAbout(data.profile.about || "");
        setNumber(data.profile.number || "");

        if (data.profile.image) {
          const imageUrl = `http://staffio-dev.999r.in:82/storage/uploads/${data.profile.image}`;
          setProfileImage(imageUrl);
        } else {
          setProfileImage(null);
        }
        
        if (data.profile.resume) {
          const resumeUrl = `http://staffio-dev.999r.in:82/storage/uploads/${data.profile.resume}`;
          setResumeUrl(resumeUrl);
          console.log("resume", resumeUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load profile data");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResume(file);
      toast.info("Resume selected. Don't forget to save your profile.");
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      console.error("User ID is missing.");
      toast.error("User ID is missing");
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", userName || "");
    formData.append("email", email || "");
    formData.append("number", number || "");
    formData.append("website", website || "");
    formData.append("about", about || "");
    formData.append("address", address || "");
    formData.append("DOB", DOB || "");
    formData.append("gender", gender || "");
    formData.append("company_name", company || "");

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    if (resume && roleId === 3) {
      formData.append("resume", resume);
    }
    
    try {
      const data = await profileAPI.updateUserWithFormData(userId, formData);
      console.log("Profile updated successfully:", data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      setTimeout(() => {
        if(roleId === 2) {
          navigate("/postlist");
        } else if(roleId === 3) {
          navigate("/allposts");
        }
      }, 2000);
    } catch (error) {
      console.error("Error updating profile data:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">My Profile</h1>
          <img className="h-10 w-auto" src={logo} alt="Logo" />
        </div>
      </div> */}

      <div className="container mx-auto px-4 py-6">
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-40 rounded-t-xl shadow-md"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
            <div 
              className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
              onClick={() => document.getElementById("profileImageInput")?.click()}
            >
              {selectedImage ? (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center bg-blue-100 text-blue-800 text-3xl font-bold">
                  {getInitials(userName)}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
                <MdEdit className="text-white opacity-0 group-hover:opacity-100 w-8 h-8" />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Click to change photo</p>
          </div>
          <input
            id="profileImageInput"
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-20 transition-all duration-300 hover:shadow-lg">
          <div className="mb-6 text-center relative">
            <div className="absolute right-0 top-0">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
              >
                {isEditing ? <MdSave size={24} /> : <MdEdit size={24} />}
              </button>
            </div>
            <input
              type="text"
              value={userName || ""}
              onChange={(e) => setUserName(e.target.value)}
              className={`text-2xl font-bold text-center border-b-2 ${isEditing ? 'border-blue-500' : 'border-transparent'} outline-none px-2 py-1 w-full max-w-md mx-auto ${isEditing ? 'bg-blue-50' : 'bg-transparent'} rounded-md transition-all`}
              placeholder="Enter your name"
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roleId === 2 ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdBusiness className="mr-2 text-blue-600" /> Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Enter your company name"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdEmail className="mr-2 text-blue-600" /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdPhone className="mr-2 text-blue-600" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdLanguage className="mr-2 text-blue-600" /> Website
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="http://www.example.com"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdDescription className="mr-2 text-blue-600" /> About Company
                  </label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Enter additional details about company"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    rows={4}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdLocationOn className="mr-2 text-blue-600" /> Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdCake className="mr-2 text-blue-600" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={DOB}
                    onChange={(e) => setDOB(e.target.value)}
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdWc className="mr-2 text-blue-600" /> Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            ) : roleId === 3 ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdEmail className="mr-2 text-blue-600" /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdPhone className="mr-2 text-blue-600" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdLocationOn className="mr-2 text-blue-600" /> Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdCake className="mr-2 text-blue-600" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    value={DOB}
                    onChange={(e) => setDOB(e.target.value)}
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdWc className="mr-2 text-blue-600" /> Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`block w-full px-4 py-3 ${isEditing ? 'bg-white' : 'bg-gray-50'} border ${isEditing ? 'border-gray-300' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    disabled={!isEditing}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MdInsertDriveFile className="mr-2 text-blue-600" /> Resume
                  </label>
                  <div className={`mt-1 flex flex-col sm:flex-row items-center p-4 border ${isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'} rounded-lg`}>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${!isEditing && 'hidden'}`}
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <div className="text-sm text-gray-600">
                          {  "No resume uploaded yet"}
                        </div>
                      )}
                    </div>
                  
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              className={`px-8 py-3 font-medium rounded-lg shadow-sm transition-all duration-200 flex items-center ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : isEditing 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting || !isEditing}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <MdSave className="mr-2" /> Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;