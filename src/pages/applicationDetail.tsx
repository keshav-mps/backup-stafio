// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaUser, FaBuilding, FaBriefcase, FaFileAlt } from "react-icons/fa";

// interface ApplicationDetails {
//   id: number;
//   resume: string;
//   name: string;
//   email: string;
//   phone_no: string;
//   experience: string;
//   address: string;
//   cover_letter: string;
//   status: string;
//   post: {
//     id: number;
//     title: string;
//   };
//   company: [number, string]; 
// }

// const ApplicationDetails: React.FC = () => {
//   const { applicationId } = useParams<{ applicationId: string }>();
//   const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();
// const [companyDetail,setCompanyDetail] = useState([])
//   useEffect(() => {
//     const fetchApplicationDetails = async () => {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         toast.error("Authorization token not found.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(
//           `http://staffio-dev.999r.in:82/application/${applicationId}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch application details.");
//         }

//         const data = await response.json();
//         console.log("Fetched application details:", data.company[1]);
//         setApplicationDetails(data.application); 
//         setCompanyDetail(data.company)
//       } catch (err) {
//         setError("Failed to fetch application details.");
//         console.error("Error fetching application details:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchApplicationDetails();
//   }, [applicationId]);
  
//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'approved':
//       case 'accepted':
//         return 'bg-green-100 text-green-800';
//       case 'rejected':
//         return 'bg-red-100 text-red-800';
//       case 'interviewed':
//         return 'bg-blue-100 text-blue-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) {
//     return <div className="p-4 text-center">Loading application details...</div>;
//   }

//   if (error) {
//     return <div className="p-4 text-center text-red-500">{error}</div>;
//   }
//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-xl font-bold mb-4">Application Details</h1>
      
//       {applicationDetails ? (
//         <div className="space-y-4">
          
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
//             <div className="flex items-center mb-3">
//               <FaUser className="text-blue-500 mr-2" />
//               <h2 className="text-lg font-semibold">Applicant Information</h2>
//             </div>
            
//             <div className="space-y-2 text-sm">
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Name:</span> 
//                 <span>{applicationDetails.name}</span>
//               </p>
              
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Email:</span> 
//                 <span className="break-all">{applicationDetails.email}</span>
//               </p>
              
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Phone:</span> 
//                 <span>{applicationDetails.phone_no}</span>
//               </p>
              
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Experience:</span> 
//                 <span>{applicationDetails.experience}</span>
//               </p>
              
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Address:</span> 
//                 <span>{applicationDetails.address}</span>
//               </p>
              
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Status:</span> 
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicationDetails.status)}`}>
//                   {applicationDetails.status}
//                 </span>
//               </p>
              
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Resume:</span> 
//                 <a
//                   href={`http://staffio-dev.999r.in:82/storage/resumes/${applicationDetails.resume}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 underline"
//                 >
//                   View Resume
//                 </a>
//               </p>
//             </div>
//           </div>

        
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
//             <div className="flex items-center mb-3">
//               <FaBriefcase className="text-green-500 mr-2" />
//               <h2 className="text-lg font-semibold">Job Information</h2>
//             </div>
            
//             <div className="space-y-2 text-sm">
//               <p className="flex items-start">
//                 <span className="font-medium w-28">Job Title:</span> 
//                 <span className="font-semibold">{applicationDetails.post.title}</span>
//               </p>
             
//             </div>
//           </div>

        
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
//             <div className="flex items-center mb-3">
//               <FaBuilding className="text-purple-500 mr-2" />
//               <h2 className="text-lg font-semibold">Company Information</h2>
//             </div>
            
//             <div className="space-y-2 text-sm">
//               {companyDetail ? (
//                 <>
//                   <p className="flex items-start">
//                     <span className="font-medium w-28">Company Name:</span> 
//                     <span>{companyDetail[1]}</span>
//                   </p>
//                 </>
//               ) : (
//                 <p>No company information available.</p>
//               )}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
//             <div className="flex items-center mb-3">
//               <FaFileAlt className="text-yellow-500 mr-2" />
//               <h2 className="text-lg font-semibold">Cover Letter</h2>
//             </div>
            
//             <div className="p-3 bg-gray-50 rounded text-sm">
//               {applicationDetails.cover_letter}
//             </div>
//           </div>

//           <button
//             onClick={() => navigate(-1)}
//             className="mt-4 bg-slate-500 rounded p-2 text-white w-full"
//           >
//             Go Back
//           </button>
//         </div>
//       ) : (
//         <p className="text-center py-4">No application details found.</p>
//       )}

//       <ToastContainer />
//     </div>
//   );
// };

// export default ApplicationDetails;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaBuilding, FaBriefcase, FaFileAlt } from "react-icons/fa";

interface ApplicationDetails {
  id: number;
  resume: string;
  name: string;
  email: string;
  phone_no: string;
  experience: string;
  address: string;
  cover_letter: string;
  status: string;
  post: {
    id: number;
    title: string;
  };
  company: [number, string];
}

interface CompanyDetails {
  id: number;
  name: string;
  profile: {
    company_name: string;
    website: string;
    about: string;
    number: string;
    address: string;
  } | null; // Allow profile to be null
  email: string;
}

const ApplicationDetails: React.FC = () => {
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [companyDetail, setCompanyDetail] = useState<[number, string] | null>(null);
  const [companyData, setCompanyData] = useState<CompanyDetails | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      const token = localStorage.getItem("token");
      const applicationId = localStorage.getItem("applicationId"); 

      if (!token || !applicationId) {
        toast.error("Authorization token or application ID not found.");
        setLoading(false);
        return;
      }

      try {
        // Fetch application details
        const response = await fetch(
          `http://staffio-dev.999r.in:82/application/${applicationId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch application details.");
        }

        const data = await response.json();
        console.log("Fetched application details:", data);
        setApplicationDetails(data.application);
        setCompanyDetail(data.company);

        // Fetch company details if company ID is available
        if (data.company && data.company[0]) {
          const companyId = data.company[0];
          const companyResponse = await fetch(
            `http://staffio-dev.999r.in:82/user/${companyId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!companyResponse.ok) {
            const response = await companyResponse.text();
            console.log("Company response:", response);
            throw new Error("Failed to fetch company details.");
          }

          const companyData = await companyResponse.json();
          console.log("Fetched company details:", companyData);
          setCompanyData(companyData);
        }
      } catch (err) {
        setError("Failed to fetch application or company details.");
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, []); // No dependency on URL params

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "interviewed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading application details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Application Details</h1>

      {applicationDetails ? (
        <div className="space-y-4">
          {/* Applicant Information */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center mb-3">
              <FaUser className="text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Applicant Information</h2>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex items-start">
                <span className="font-medium w-28">Name:</span>
                <span>{applicationDetails.name}</span>
              </p>

              <p className="flex items-start">
                <span className="font-medium w-28">Email:</span>
                <span className="break-all">{applicationDetails.email}</span>
              </p>

              <p className="flex items-start">
                <span className="font-medium w-28">Phone:</span>
                <span>{applicationDetails.phone_no}</span>
              </p>

              <p className="flex items-start">
                <span className="font-medium w-28">Experience:</span>
                <span>{applicationDetails.experience}</span>
              </p>

              <p className="flex items-start">
                <span className="font-medium w-28">Address:</span>
                <span>{applicationDetails.address}</span>
              </p>

              <p className="flex items-start">
                <span className="font-medium w-28">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    applicationDetails.status
                  )}`}
                >
                  {applicationDetails.status}
                </span>
              </p>

              <p className="flex items-start">
                <span className="font-medium w-28">Resume:</span>
                <a
                  href={`http://staffio-dev.999r.in:82/storage/resumes/${applicationDetails.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Resume
                </a>
              </p>
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center mb-3">
              <FaBriefcase className="text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Job Information</h2>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex items-start">
                <span className="font-medium w-28">Job Title:</span>
                <span className="font-semibold">{applicationDetails.post.title}</span>
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center mb-3">
              <FaBuilding className="text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold">Company Information</h2>
            </div>

            <div className="space-y-2 text-sm">
              {companyData && companyData.profile ? (
                <>
                  <p className="flex items-start">
                    <span className="font-medium w-28">Company Name:</span>
                    <span>{companyDetail[1]}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-28">Website URL:</span>
                    <span> {companyData.profile.website}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-28">About:</span>
                    <span>{companyData.profile.about}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-28">Phone Number:</span>
                    <span>{companyData.profile.number}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-28">Address:</span>
                    <span>{companyData.profile.address}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium w-28">Email:</span>
                    <span>{companyData.email}</span>
                  </p>
                </>
              ) : (
                <p>No company information available.</p>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center mb-3">
              <FaFileAlt className="text-yellow-500 mr-2" />
              <h2 className="text-lg font-semibold">Cover Letter</h2>
            </div>

            <div className="p-3 bg-gray-50 rounded text-sm">
              {applicationDetails.cover_letter}
            </div>
          </div>

          {/* Go Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-slate-500 rounded p-2 text-white w-auto"
          >
            Go Back
          </button>
        </div>
      ) : (
        <p className="text-center py-4">No application details found.</p>
      )}

      <ToastContainer />
    </div>
  );
};

export default ApplicationDetails;