import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { FaEdit, FaEye, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaBriefcase, FaUserTie, FaFileAlt, FaChevronLeft, FaChevronRight, FaUsers } from "react-icons/fa";
import { postsAPI, applicationsAPI } from "../services/apiService";
import { getAuthToken, getUserId } from "../services/tokenManager";

interface Post {
  id: number;
  title: string;
  description: string;
  role: string;
  requirement: string;
  salary_range: string;
  due_date: string;
  job_nature: string;
  location: string;
  user_id: number;
  application_count: number;
}

interface Candidate {
  id: number;
  application_id: number;
  status: string;
  name?: string;
  email?: string;
}

const PostsList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [postsPerPage] = useState<number>(5);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const userId = getUserId();
      const token = getAuthToken();

      if (!userId) {
        setError("User ID not found in local storage.");
        setLoading(false);
        navigate("/signin");  
        return;
      }

      if (!token) {
        setError("Authorization token not found in local storage.");
        setLoading(false);
        navigate("/signin");  
        return;
      }

      try {
        const data = await postsAPI.getUserPosts(userId);
        setPosts(data);
        console.log("Fetched Posts:", data);

        const candidatesPromises = data.map(post => 
          applicationsAPI.getApplicationsByPost(post.id.toString())
            .catch(err => {
              console.error(`Error fetching candidates for post ${post.id}:`, err);
              return [];
            })
        );

        const candidatesResults = await Promise.all(candidatesPromises);
        const allCandidates = candidatesResults.flat();
        console.log("candidateresults", candidatesResults);
        setCandidates(allCandidates);
        console.log("Fetched Candidates:", allCandidates);
      } catch (err) {
        setError("Failed to fetch posts.");
        console.error("Error fetching posts:", err);
        navigate("/requriterdashboard");  
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const handleEditClick = (postId: number) => {
    localStorage.setItem("post_id", postId.toString());
    navigate(`/postajob/${postId}`);
  };

  const handleViewClick = (postId: number) => {
    localStorage.setItem("postId", postId.toString());
    navigate(`/applied-candidates/${postId}`);
  };

  const handleVideoChat = (candidateId: number, applicationId: number) => {
    localStorage.setItem("candidate_id", candidateId.toString());
    localStorage.setItem("application_id", applicationId.toString());
    navigate(`/video-chat/${applicationId}`);
  };

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const maxVisiblePages = 5;
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
  }, [currentPage, posts.length, postsPerPage]);

  const hasScheduledCandidates = (postId: number) => {
    return candidates.some(candidate => 
      candidate.application_id === postId && 
      candidate.status?.toLowerCase() === "scheduled"
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">Job Posts</h1>
        <Link to="/postajob">
  <button
    onClick={() => localStorage.removeItem("post_id")} 
    className="bg-blue-500 text-white rounded-md p-2 flex items-center hover:bg-blue-600 transition-colors"
  >
    <FaPlus className="mr-2" /> New Post
  </button>
</Link>
      </div>
     
      {currentPosts.length > 0 ? (
        <ul className="space-y-4">
          {currentPosts.map((post) => (
            <li key={post.id} className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
              <div className="flex flex-col md:flex-row justify-between">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <div className="mt-2 md:mt-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-1 px-3 rounded-full flex items-center shadow-md">
                    <FaUsers className="mr-2" /> 
                    <span className="font-bold">{post.application_count}</span>
                    <span className="ml-1 text-sm">Applications</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mt-2">{post.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                <p className="text-gray-600 flex items-center">
                  <FaUserTie className="mr-2 text-blue-500" /> <strong>Role:</strong> {post.role}
                </p>
                <p className="text-gray-600 flex items-center">
                  <FaFileAlt className="mr-2 text-green-500" /> <strong>Requirement:</strong> {post.requirement}
                </p>
                <p className="text-gray-600 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-yellow-500" /> <strong>Salary:</strong> {post.salary_range}
                </p>
                <p className="text-gray-600 flex items-center">
                  <FaCalendarAlt className="mr-2 text-red-500" /> <strong>Due Date:</strong> {post.due_date}
                </p>
                <p className="text-gray-600 flex items-center">
                  <FaBriefcase className="mr-2 text-purple-500" /> <strong>Job Type:</strong> {post.job_nature}
                </p>
                <p className="text-gray-600 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-orange-500" /> <strong>Location:</strong> {post.location}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleEditClick(post.id)}
                  className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
                <button
                  onClick={() => handleViewClick(post.id)}
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FaEye className="mr-2" /> View
                </button>
                {hasScheduledCandidates(post.id) && (
                  <button
                    onClick={() => {
                      const scheduledCandidate = candidates.find(
                        c => c.application_id === post.id && c.status?.toLowerCase() === "scheduled"
                      );
                      if (scheduledCandidate) {
                        handleVideoChat(scheduledCandidate.id, scheduledCandidate.application_id);
                      }
                    }}
                    className="bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 transition-colors flex items-center"
                  >
                    <FaCalendarAlt className="mr-2" /> Video Chat
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 border border-gray-300 rounded-lg">
          <FaFileAlt className="text-4xl mb-2" />
          <p>No job posts found.</p>
        </div>
      )}
      {posts.length > postsPerPage && (
        <div className="flex justify-center mt-6">
          <div className="flex flex-wrap gap-1 items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
            >
              <FaChevronLeft />
            </button>
            <div className="hidden md:flex">
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md mx-1 ${
                    currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <div className="md:hidden px-3 py-2">
              <span>{currentPage} of {totalPages}</span>
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default PostsList;