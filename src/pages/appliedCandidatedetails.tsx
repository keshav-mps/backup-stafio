// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// interface AppliedCandidate {
//   id: number;
//   name: string;
//   email: string;
//   phone_no: string;
// }

// const CandidateDetails: React.FC = () => {
//   const { postId, candidateId } = useParams<{
//     postId: string;
//     candidateId: string;
//   }>();
//   const [candidate, setCandidate] = useState<AppliedCandidate | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCandidateDetails = async () => {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         toast.error("Authorization token not found.");
//         setLoading(false);
//         return;
//       }

//       if (!postId || !candidateId) {
//         setError("Post ID or Candidate ID is missing.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(
//           `http://staffio-dev.999r.in:82/api/application/${candidateId}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("API Response:", data);

        
//         if (Array.isArray(data) && data.length > 0) {
          
//           const candidateData = data[0];
//           setCandidate(candidateData);
//         } else {
//           setError("Invalid response format.");
//         }
//       } catch (err) {
//         setError("Failed to fetch candidate details.");
//         console.error("Error fetching candidate details:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCandidateDetails();
//   }, [postId, candidateId]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   if (!candidate) {
//     return <div>Candidate not found.</div>;
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Candidate Details</h1>
//       <div className="border border-gray-300 rounded-lg p-4">
//         <p>
//           <strong>Name:</strong> {candidate.name}
//         </p>
//         <p>
//           <strong>Email:</strong> {candidate.email}
//         </p>
//         <p>
//           <strong>Phone Number:</strong> {candidate.phone_no}
//         </p>
//         <p>
//           <strong>cover_letter:</strong> {candidate.cover_letter}
//         </p>
//         <p><strong>Experience:</strong> {candidate.experience}</p>
//         <p><strong>Address:</strong> {candidate.address}</p>
//         <p>
//                      <strong>Resume:</strong>{" "}
//                      <a
//                        href={`http://staffio-dev.999r.in:82/storage/resumes/${candidate.resume}`}
//                        target="_blank"
//                        rel="noopener noreferrer"
//                        className="text-blue-500 underline"
//                      >
//                         View Resume
//                      </a>
//                   </p>
//       </div>
//       <button
//         onClick={() => navigate(-1)}
//         className="mt-6 bg-red-500 text-white p-2 rounded-sm hover:bg-red-600"
//       >
//         Go Back
//       </button>
//     </div>
//   );
// };

// export default CandidateDetails;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Answer {
  id: number;
  ans: string;
  question_id: number;
  application_id: number;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: number;
  question: string;
  type: string;
  hint: string | null;
  option: string[] | null;
  answer: Answer[];
}

interface AppliedCandidate {
  id: number;
  name: string;
  email: string;
  phone_no: string;
  cover_letter: string;
  experience: string;
  address: string;
  resume: string;
  status?: string;
}

const CandidateDetails: React.FC = () => {
  const { postId, candidateId } = useParams<{ postId: string; candidateId: string }>();
  const [candidate, setCandidate] = useState<AppliedCandidate | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authorization token not found.");
        setLoading(false);
        return;
      }

      if (!postId || !candidateId) {
        setError("Post ID or Candidate ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://staffio-dev.999r.in:82/api/application/${candidateId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);
        if (Array.isArray(data) && data.length > 0) {
          const candidateData = data[0];
          const questionsData = data[1];
          setCandidate(candidateData);
          setQuestions(questionsData);
        } else {
          setError("Invalid response format.");
        }
      } catch (err) {
        setError("Failed to fetch candidate details.");
        console.error("Error fetching candidate details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetails();
  }, [postId, candidateId]);

  const updateCandidateStatus = async (status: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authorization token not found.");
      return;
    }

    try {
      const response = await fetch(
        `http://staffio-dev.999r.in:82/api/application/${candidateId}?_method=PATCH`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        console.log("Response as Text:", responseText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Status Update Response:", data);

      if (candidate) {
        setCandidate({ ...candidate, status });
      }

      toast.success(`Candidate status updated to ${status}`);

    
      if (status === "ACCEPTED") {
        navigate(`/interview/${candidateId}`); 
      } else if (status === "REJECTED") {
        navigate(`/applied-candidates/${postId}`); 
      }
    } catch (err) {
      toast.error("Failed to update candidate status.");
      console.error("Error updating candidate status:", err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Candidate Details</h1>
      <div className="border border-gray-300 rounded-lg p-4 mb-6">
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone Number:</strong> {candidate.phone_no}</p>
        <p><strong>Cover Letter:</strong> {candidate.cover_letter}</p>
        <p><strong>Experience:</strong> {candidate.experience}</p>
        <p><strong>Address:</strong> {candidate.address}</p>
        <p>
          <strong>Resume:</strong>{" "}
          <a
            href={`http://staffio-dev.999r.in:82/storage/resumes/${candidate.resume}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Resume
          </a>
        </p>
        <p><strong>Status:</strong> {candidate.status || "Pending"}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Questions and Answers</h2>
      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.id} className="border border-gray-300 rounded-lg p-4 mb-4">
            <p><strong>Question:</strong> {question.question}</p>
            <p><strong>Type:</strong> {question.type}</p>
            {question.hint && <p><strong>Hint:</strong> {question.hint}</p>}
            {question.option && (
              <p><strong>Options:</strong> {`[${question.option.join(", ")}]`}</p>
            )}
            <p>
              <strong>Answer:</strong>{" "}
              {question.answer && question.answer.length > 0 ? (
                question.answer.map((ans) => ans.ans).join(", ")
              ) : (
                "No answer provided"
              )}
            </p>
          </div>
        ))
      ) : (
        <p>No questions available for this candidate.</p>
      )}

      <div className="flex gap-16 mt-6 items-center justify-center">
        <button
          onClick={() => updateCandidateStatus("ACCEPTED")}
          className="bg-green-500 text-white p-2 rounded-sm hover:bg-green-600"
        >
          Accept
        </button>
        <button
          onClick={() => updateCandidateStatus("REJECTED")}
          className="bg-red-500 text-white p-2 rounded-sm hover:bg-red-600"
        >
          Reject
        </button>
      </div>
      <div className="flex gap-4 mt-6 items-center">
        <button
          onClick={() => navigate(-1)}
          className="mt-6 bg-gray-500 text-white p-2 rounded-sm hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default CandidateDetails;