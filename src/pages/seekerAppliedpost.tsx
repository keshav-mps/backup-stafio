import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
import {Card,CardContent} from "../components/ui/card"

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaEye, FaVideo, FaFilter, FaSearch, FaBriefcase, FaCalendarAlt, FaClock } from "react-icons/fa";
import { MdOutlineWork } from "react-icons/md";
import { BiTime } from "react-icons/bi";


interface AppliedPost {
  id: number;
  resume: string;
  name: string;
  email: string;
  phone_no: string;
  cover_letter: string;
  experience: string;
  address: string;
  status: string;
  post_id: number;
  post: {
    title: string;
  };
  company: [number, string];
  questions: Array<{
    id: number;
    question: string;
    hint: string;
    type: string;
    option: string[];
    answer: Array<{
      id: number;
      ans: string;
      question_id: number;
      application_id: number;
      created_at: string;
      updated_at: string;
    }>;
  }>;
  created_at?: string;
  interview_date?: string;
}

const AppliedPosts = () => {
  const [appliedPosts, setAppliedPosts] = useState<AppliedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [filteredPosts, setFilteredPosts] = useState<AppliedPost[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAppliedPosts = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("User not authenticated. Please log in.");
        }

        const response = await
        fetch(
          `${import.meta.env.VITE_API_BASE_URL}/applications/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorResponse = await response.text();
          console.error("Error response from server:", errorResponse);
          throw new Error("Failed to fetch applied posts.");
        }

        const data = await response.json();
        console.log("Fetched applied posts:", data);

        const postsArray = Array.isArray(data) ? data : data.application || data[0] || [];
        if (Array.isArray(postsArray)) {
          setAppliedPosts(postsArray);
          setFilteredPosts(postsArray);
          setTotalPages(Math.ceil(postsArray.length / itemsPerPage));
        } else {
          console.error("Expected array but got:", postsArray);
          throw new Error("Unexpected data format from server");
        }
      } catch (err) {
        console.error("Error fetching applied posts:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppliedPosts();
  }, [itemsPerPage]);

  useEffect(() => {
    let filtered = [...appliedPosts];
    
    
    if (selectedStatus !== "All") {
      filtered = filtered.filter((post) => post.status === selectedStatus);
    }
    
  
    if (searchTerm) {
      filtered = filtered.filter((post) => 
        post.post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [selectedStatus, searchTerm, appliedPosts, itemsPerPage]);

  useEffect(() => {
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    setVisiblePages(pages);
  }, [currentPage, totalPages]);

  const handleViewInfoClick = (applicationId: number) => {
    localStorage.setItem("applicationId", applicationId.toString());
    console.log("Stored applicationId:", applicationId.toString());
    navigate(`/application-details/${applicationId}`);
  };

  const handleVideoCallClick = (applicationId: number) => {
    console.log("Initiate video call for application ID:", applicationId);
    localStorage.setItem("videoCallApplicationId", applicationId.toString());
    navigate(`/livekit/${applicationId}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "RECEIVED":
        return "bg-blue-100 text-blue-800";
      case "REVIEWED":
        return "bg-purple-100 text-purple-800";
      case "SCHEDULED":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);

  const canShowVideoCallButton = (interviewDate?: string): boolean => {
    if (!interviewDate || !interviewDate.trim()) return false;
    
    try {
      const interview = new Date(interviewDate);
      
      if (isNaN(interview.getTime())) return false;
      
      const sevenMinutesBefore = new Date(interview.getTime() - 7 * 60 * 1000);
      const oneHourAfter = new Date(interview.getTime() + 60 * 60 * 1000);
      
      return currentTime >= sevenMinutesBefore && currentTime <= oneHourAfter;
    } catch (error) {
      console.error("Error parsing interview date:", error);
      return false;
    }
  };

  const getTimeUntilInterview = (interviewDate?: string): string => {
    if (!interviewDate || !interviewDate.trim()) return "";
    
    try {
      const interview = new Date(interviewDate);
      
      if (isNaN(interview.getTime())) return "";
      
      const sevenMinutesBefore = new Date(interview.getTime() - 7 * 60 * 1000);
      
      if (canShowVideoCallButton(interviewDate)) {
        return "Interview in progress - join now!";
      }
      
      const timeDiff = sevenMinutesBefore.getTime() - currentTime.getTime();
      
      if (timeDiff <= 0) {
        return "";
      }
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `Video call available in ${hours}h ${minutes}m`;
      } else {
        return `Video call available in ${minutes}m`;
      }
    } catch (error) {
      console.error("Error calculating time until interview:", error);
      return "";
    }
  };

  const formatInterviewTime = (dateString?: string): string => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
        <div className="bg-white rounded-lg p-8 shadow-md max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (appliedPosts.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
        <div className="bg-white rounded-lg p-8 shadow-md max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <MdOutlineWork className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Applications Yet</h2>
          <p className="text-gray-600 mb-6">You haven't applied to any jobs yet. Start exploring opportunities!</p>
          <button 
            onClick={() => navigate("/allposts")} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 mb-6 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold">My Applications</h1>
        <p className="text-blue-100 mt-2">Track and manage your job applications</p>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden flex items-center justify-between w-full px-4 py-2 bg-white border rounded-md shadow-sm"
              >
                <span className="flex items-center">
                  <FaFilter className="mr-2 text-gray-500" />
                  <span>{selectedStatus === "All" ? "All Statuses" : selectedStatus}</span>
                </span>
                <svg className={`w-5 h-5 transition-transform ${isFilterOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isFilterOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg md:hidden">
                  <div className="py-1">
                    {["All", "PENDING", "ACCEPTED", "REJECTED", "RECEIVED", "REVIEWED", "SCHEDULED"].map((status) => (
                      <button
                        key={status}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${selectedStatus === status ? 'font-medium text-blue-600' : ''}`}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsFilterOpen(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="hidden md:block px-4 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="RECEIVED">Received</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-4 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {currentPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                        <FaBriefcase />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">{post.post.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(post.status)}`}>
                            {post.status}
                          </span>
                          {post.created_at && (
                            <span className="inline-flex items-center text-xs text-gray-500">
                              <FaCalendarAlt className="mr-1" /> Applied: {formatDate(post.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-400" />
                        <span>Status updated: {post.status === "SCHEDULED" ? "Interview scheduled" : post.status.toLowerCase()}</span>
                      </div>

                      {post.status === "SCHEDULED" && post.interview_date && (
                        <div className="flex items-center mt-1">
                          <BiTime className="mr-2 text-gray-400" />
                          <span>Interview time: {formatDate(post.interview_date)} at {formatInterviewTime(post.interview_date)}</span>
                        </div>
                      )}
                      
                      {post.status === "SCHEDULED" && post.interview_date && !canShowVideoCallButton(post.interview_date) && (
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          {getTimeUntilInterview(post.interview_date)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                    <button
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2 transition-colors text-sm md:text-base"
                      onClick={() => handleViewInfoClick(post.id)}
                    >
                      <FaEye className="text-gray-600" />
                      <span>Details</span>
                    </button>
                    
                    {post.status === "SCHEDULED" && post.interview_date && canShowVideoCallButton(post.interview_date) && (
                      <button
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 transition-colors text-sm md:text-base"
                        onClick={() => handleVideoCallClick(post.id)}
                      >
                        <FaVideo />
                        <span>Join Call</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredPosts.length > itemsPerPage && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 border rounded-l ${
                currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Previous page"
            >
              <FaChevronLeft size={14} />
            </button>

            <div className="hidden sm:flex">
              {visiblePages.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageClick(number)}
                  className={`w-10 h-10 flex items-center justify-center border-t border-b ${
                    currentPage === number
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <div className="sm:hidden flex items-center border-t border-b px-3 py-1 bg-white">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 border rounded-r ${
                currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Next page"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AppliedPosts;