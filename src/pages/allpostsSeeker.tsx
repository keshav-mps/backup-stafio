import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdFilterList, MdOutlineWorkOutline, MdVideocam } from "react-icons/md";
import { FaChevronLeft, FaChevronRight, FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaFilter, FaSearch, FaBuilding, FaRegClock, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Post {
  id: number;
  title: string;
  description: string;
  role: string;
  requirement: string;
  salary_range: string;
  due_date: string; // Assuming this includes both date and time (e.g., "2025-03-20T14:00:00Z")
  job_nature: string;
  location: string;
  user_id: number;
  daysRemaining?: number;
  status?: string; // Add status field
}

const SeekerPostsList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterJobType, setFilterJobType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [timeUntilVideoCall, setTimeUntilVideoCall] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Check if we should show the timer (only for SCHEDULED status)
  const shouldShowTimer = (post: Post) => {
    return post.status === "SCHEDULED";
  };

  // Function to calculate time until video call button appears
  const getTimeUntilVideoCall = (dueDate: string) => {
    const now = new Date();
    const scheduledTime = new Date(dueDate);
    const sevenMinutesBefore = new Date(scheduledTime.getTime() - 7 * 60 * 1000);
    const diffMs = sevenMinutesBefore.getTime() - now.getTime();

    if (diffMs <= 0) return null; 

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJobType = filterJobType === "" ||
      post.job_nature.toLowerCase() === filterJobType.toLowerCase();

    return matchesSearch && matchesJobType;
  }).sort((a, b) => {
    const daysA = a.daysRemaining !== undefined ? a.daysRemaining : getDaysRemaining(a.due_date);
    const daysB = b.daysRemaining !== undefined ? b.daysRemaining : getDaysRemaining(b.due_date);

    if (daysA <= 0 && daysB <= 0) return 0;
    else if (daysA <= 0) return 1;
    else if (daysB <= 0) return -1;

    return sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
  });

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authorization token not found in local storage.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/posts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Response Data:", responseData);
        if (responseData && Array.isArray(responseData)) {
          const postsWithDaysRemaining = responseData.map((post: Post) => ({
            ...post,
            daysRemaining: getDaysRemaining(post.due_date),
          }));
          setPosts(postsWithDaysRemaining);
        } else {
          throw new Error("Invalid data format received from the API.");
        }
      } catch (err) {
        setError("NO POST FOUND");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeUntilVideoCall: { [key: number]: string } = {};
      posts.forEach(post => {
        // Only calculate timer for posts with SCHEDULED status
        if (shouldShowTimer(post)) {
          const timeLeft = getTimeUntilVideoCall(post.due_date);
          if (timeLeft) {
            newTimeUntilVideoCall[post.id] = timeLeft;
          }
        }
      });
      setTimeUntilVideoCall(newTimeUntilVideoCall);
    }, 1000);

    return () => clearInterval(interval); 
  }, [posts]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    setVisiblePages(pages);
  }, [currentPage, posts.length, itemsPerPage, filteredPosts.length]);

  const handleApplyClick = (postId: number) => {
    localStorage.setItem("post_id", postId.toString());
    console.log("Stored postId:", postId.toString());
    navigate(`/applyforjob/${postId}`);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ behavior: 'smooth' });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getJobTypeBadgeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'freelance': return 'bg-yellow-100 text-yellow-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toUpperCase()) {
      case 'SCHEDULED': return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeColor = (daysRemaining: number) => {
    if (daysRemaining <= 0) return 'bg-gray-100 text-gray-800';
    else if (daysRemaining <= 3) return 'bg-red-100 text-red-800';
    else if (daysRemaining <= 7) return 'bg-orange-100 text-orange-800';
    else if (daysRemaining <= 14) return 'bg-yellow-100 text-yellow-800';
    else return 'bg-green-100 text-green-800';
  };

  const indexOfLastPost = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading job listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-8 text-center shadow-xl max-w-md w-full">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 md:py-16 px-4 relative -mt-11">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63" stroke="white" strokeWidth="100" fill="none" />
          </svg>
        </div>
        <div className="container mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">Find Your Dream Job</h1>
          <p className="text-blue-100 mb-6 md:mb-8 max-w-2xl text-sm md:text-base">Browse through our latest job postings and find the perfect match for your skills and career goals</p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs by title, description, or location"
                className="pl-12 pr-4 py-3 md:py-4 w-full rounded-lg border-none focus:ring-2 focus:ring-blue-400 shadow-md text-gray-800 text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="w-full md:w-64 relative">
              <button
                className="md:hidden w-full flex items-center justify-between bg-white py-3 px-4 rounded-lg shadow-md text-gray-700 text-sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <span className="flex items-center">
                  <FaFilter className="mr-2" />
                  {filterJobType ? filterJobType.charAt(0).toUpperCase() + filterJobType.slice(1) : "All Job Types"}
                </span>
                <svg className={`w-5 h-5 transition-transform ${isFilterOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isFilterOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg md:hidden">
                  <div className="py-2">
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${filterJobType === "" ? "font-medium text-blue-600" : ""}`}
                      onClick={() => {
                        setFilterJobType("");
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      All Job Types
                    </button>
                    {["full-time", "part-time", "contract", "freelance", "internship"].map(type => (
                      <button
                        key={type}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${filterJobType === type ? "font-medium text-blue-600" : ""}`}
                        onClick={() => {
                          setFilterJobType(type);
                          setIsFilterOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <select
                className="hidden md:block w-full py-4 px-4 rounded-lg border-none focus:ring-2 focus:ring-blue-400 shadow-md appearance-none bg-white text-gray-800"
                value={filterJobType}
                onChange={(e) => {
                  setFilterJobType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
              <div className="hidden md:block absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaFilter className="h-5 w-5 text-gray-400" />
              </div>
              <Link to="/appliedpost">
                <button className="text-xl md:text-xl mt-4 text-black md:mb-4 border border-white rounded p-2">Applied Posts</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'Job' : 'Jobs'} Found
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSortOrder}
              className="flex items-center text-xs md:text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <>
                  <FaSortAmountDown className="mr-2" />
                  <span>Urgent first</span>
                </>
              ) : (
                <>
                  <FaSortAmountUp className="mr-2" />
                  <span>Later deadlines first</span>
                </>
              )}
            </button>
            <div className="flex items-center text-xs md:text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
              <MdFilterList className="mr-2" />
              <span>Filtered by deadline</span>
            </div>
          </div>
        </div>

        {currentPosts.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {currentPosts.map((post) => {
              const daysRemaining = post.daysRemaining !== undefined ? post.daysRemaining : getDaysRemaining(post.due_date);

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">{post.title}</h3>
                          {daysRemaining > 0 && daysRemaining <= 7 && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeColor(daysRemaining)}`}>
                              {daysRemaining <= 3 ? 'Very Urgent' : 'Urgent'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJobTypeBadgeColor(post.job_nature)}`}>
                            <FaBriefcase className="mr-1" /> {post.job_nature}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaMapMarkerAlt className="mr-1" /> {post.location}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FaMoneyBillWave className="mr-1" /> {post.salary_range}
                          </span>
                          {post.status && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(post.status)}`}>
                              {post.status}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2">{post.description}</p>
                        <div className="hidden md:flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                          <span className="flex items-center">
                            <FaBuilding className="mr-1" /> Role: {post.role}
                          </span>
                          <span className="flex items-center">
                            <FaRegClock className="mr-1" /> Due: {formatDate(post.due_date)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center">
                        <div className={`text-xs ${daysRemaining <= 3 && daysRemaining > 0 ? 'text-red-500 font-semibold' : 'text-gray-500'} flex items-center mb-3`}>
                          <FaCalendarAlt className="mr-1" />
                          {daysRemaining > 0 ? (
                            <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left to apply</span>
                          ) : (
                            <span className="text-red-500">Application deadline passed</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          <button
                            onClick={() => handleApplyClick(post.id)}
                            className={`px-4 md:px-6 py-2 rounded-md transition-colors w-full md:w-auto flex items-center justify-center ${
                              daysRemaining > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 cursor-not-allowed text-gray-600'
                            }`}
                            disabled={daysRemaining <= 0}
                          >
                            <MdOutlineWorkOutline className="mr-2" />
                            Apply Now
                          </button>
                          {/* Show timer only for posts with SCHEDULED status */}
                          {shouldShowTimer(post) && timeUntilVideoCall[post.id] && (
                            <div className="text-xs text-gray-600 bg-gray-100 px-4 py-2 rounded-md w-full md:w-auto text-center">
                              Video call in: <span className="font-mono">{timeUntilVideoCall[post.id]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="md:hidden border-t border-gray-200 mt-4 pt-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 uppercase font-semibold">Role</p>
                          <p>{post.role}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 uppercase font-semibold">Due Date</p>
                          <p>{formatDate(post.due_date)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Requirements</p>
                        <p className="text-xs md:text-sm line-clamp-1">{post.requirement}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 md:p-8 text-center shadow-md">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-gray-600 mb-4 text-sm md:text-base">No jobs found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterJobType("");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm md:text-base"
            >
              Clear Filters
            </button>
          </div>
        )}
        {filteredPosts.length > itemsPerPage && (
          <div className="mt-6 md:mt-8 flex justify-center">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="mr-2 p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <FaChevronLeft className={currentPage === 1 ? "text-gray-400" : "text-gray-700"} />
              </button>
              <div className="flex space-x-2">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2 p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <FaChevronRight className={currentPage === totalPages ? "text-gray-400" : "text-gray-700"} />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerPostsList