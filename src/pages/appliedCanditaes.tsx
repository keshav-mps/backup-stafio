import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser } from "react-icons/fa";
import { MdOutlineEmail, MdVideocam } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { applicationsAPI } from "../services/apiService";
import { getAuthToken } from "../services/tokenManager";

interface AppliedCandidate {
  id: number;
  name: string;
  email: string;
  phone_no: string;
  experience: string;
  address: string;
  cover_letter: string;
  resume: string;
  status?: string;
  application_id?: number;
}

const AppliedCandidates: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [appliedCandidates, setAppliedCandidates] = useState<AppliedCandidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>(""); 

  useEffect(() => {
    const fetchAppliedCandidates = async () => {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authorization token not found.");
        setLoading(false);
        return;
      }

      try {
        const data = await applicationsAPI.getApplicants(postId);
        console.log("Fetched Applied Candidates:", data);
        setAppliedCandidates(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (err) {
        setError("Failed to fetch applied candidates.");
        console.error("Error fetching applied candidates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedCandidates();
  }, [postId, itemsPerPage]);

  useEffect(() => {
    let filteredCandidates = appliedCandidates;
    
    if (statusFilter) {
      filteredCandidates = appliedCandidates.filter((candidate) =>
        candidate.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setTotalPages(Math.ceil(filteredCandidates.length / itemsPerPage));
    setCurrentPage(1); 
  }, [statusFilter, appliedCandidates, itemsPerPage]);

  useEffect(() => {
    const maxVisiblePages = 3;
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

  const handleViewClick = (candidateId: number) => {
    navigate(`/candidate-details/${postId}/${candidateId}`);
  };

  const handleVideoChat = (applicationId: number) => {
    localStorage.setItem("candidate_id",applicationId.toString());
    localStorage.setItem("application_id", applicationId.toString());
    localStorage.setItem("postId", postId || "");
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

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentCandidates = appliedCandidates
    .filter((candidate) => (statusFilter ? candidate.status?.toLowerCase() === statusFilter.toLowerCase() : true))
    .slice(indexOfFirstItem, indexOfLastItem);

  const isStatusScheduled = (status?: string) => {
    return status?.toLowerCase() === "scheduled";
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Applied Candidates</h1>
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="border rounded p-2 w-full md:w-1/3"
        >
          <option value="">All</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="received">Received</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {currentCandidates.length > 0 ? (
        <>
          <div className="mb-4 flex justify-between items-center text-sm">
            <div>
              <span className="mr-2">Show:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded p-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <ul className="space-y-3">
            {currentCandidates.map((candidate) => (
              <li
                key={candidate.id}
                className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50"
              >
                <p className="flex items-center text-sm">
                  <FaUser className="mr-1" />
                  <strong className="mr-1">Name:</strong> {candidate.name}
                </p>
                <p className="flex items-center text-sm my-1 break-all">
                  <MdOutlineEmail className="mr-1" />
                  <strong className="mr-1">Email:</strong> {candidate.email}
                </p>
                <p className="flex items-center text-sm my-1 break-all">
                  <strong className="mr-1">Status:</strong> 
                  <span className={isStatusScheduled(candidate.status) ? "text-green-600 font-semibold" : ""}>
                    {candidate.status}
                  </span>
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleViewClick(candidate.id)}
                    className="bg-blue-500 text-white p-2 rounded-sm hover:bg-blue-600 text-sm"
                  >
                    View
                  </button>
                  
                  {isStatusScheduled(candidate.status) && (
                    <button
                      onClick={() => handleVideoChat(candidate.id)}
                      className="bg-purple-500 text-white p-2 rounded-sm hover:bg-purple-600 text-sm flex items-center"
                    >
                      <MdVideocam className="mr-1" /> Video Chat
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-center mt-4">
            <div className="flex items-center">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 border rounded-l ${
                  currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700"
                }`}
                aria-label="Previous page"
              >
                <FaChevronLeft size={14} />
              </button>

              {visiblePages.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageClick(number)}
                  className={`px-3 py-1 border-t border-b ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 border rounded-r ${
                  currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700"
                }`}
                aria-label="Next page"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center py-4">No candidates found with the selected status.</p>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-4 bg-red-500 text-white p-2 rounded-sm hover:bg-red-600 w-auto"
      >
        Go Back
      </button>

      <ToastContainer />
    </div>
  );
};

export default AppliedCandidates;