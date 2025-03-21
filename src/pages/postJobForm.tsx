// import { useState, ChangeEvent, FormEvent } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "./headercomponent";
// interface FormData {
//   title: string;
//   description: string;
//   role: string;
//   requirement: string;
//   salary_range: string;
//   due_date: string;
//   job_nature: string;
//   location: string;
// }

// const PostaJob = () => {
//   const [formData, setFormData] = useState<FormData>({
//     title: "",
//     description: "",
//     role: "",
//     requirement: "",
//     salary_range: "",
//     due_date: "",
//     job_nature: "Permanent",
//     location: "",
//   });

//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const navigate = useNavigate();

//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const validateForm = () => {
//     return (
//       formData.title &&
//       formData.description &&
//       formData.role &&
//       formData.requirement &&
//       formData.salary_range &&
//       formData.due_date &&
//       formData.job_nature &&
//       formData.location
//     );
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       setError("Please fill out all fields.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccessMessage(null);

//     const token = localStorage.getItem("token");
//     const user_id = localStorage.getItem("user_id");
//     console.log("User ID from localStorage:", user_id);
//     console.log("Token from localStorage:", token);

//     if (!token || !user_id) {
//       setError("Authorization token or user ID is missing. Please log in again.");
//       setLoading(false);
//       return;
//     }
//     const dataToSend = {
//       ...formData,
//       user_id: parseInt(user_id, 10),
//     };

//     try {
//       const response = await fetch("https://staffio-dev.999r.in/api/posts", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(dataToSend),
//       });
//       console.log(dataToSend);

//       if (response.ok) {
//         const responseData = await response.json();
//         console.log("Success Response:", responseData);
//         const postId = responseData.post.id;
//         localStorage.setItem("post_id", postId);
//         setSuccessMessage("Job created successfully!");
//         localStorage.setItem("title", formData.title);

//         setFormData({
//           title: "",
//           description: "",
//           role: "",
//           requirement: "",
//           salary_range: "",
//           due_date: "",
//           job_nature: "",
//           location: "",
//         });

//         navigate("/addpostquestionlist");
//       } else {
//         const text = await response.text();
//         console.log("Error response:", text);
//         setError("Failed to create job. Please try again.");
//       }
//     } catch (err) {
//       setError("An unexpected error occurred. Please try again later.");
//       console.error("Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//     <Header />
//       <p className="ml-28 -mt-7 text-lg font-bold sm:-mt-4">ADD A JOB</p>
//       <div className="flex justify-center p-4 sm:p-8">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-full">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
//               <input
//                 placeholder=" Software Developer"
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
//               <textarea
//                 placeholder="Enter the job description"
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 rows={4}
//                 className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label htmlFor="requirement" className="block text-sm font-medium text-gray-700">Requirement</label>
//               <textarea
//                 placeholder="Enter the job requirements"
//                 id="requirement"
//                 name="requirement"
//                 value={formData.requirement}
//                 onChange={handleChange}
//                 required
//                 rows={4}
//                 className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">Salary Range</label>
//               <input
//                 placeholder="Rs20000-Rs500000/month"
//                 type="text"
//                 id="salary_range"
//                 name="salary_range"
//                 value={formData.salary_range}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="  grid container grid-flow-row">
//               <div className=" w-auto">
//                 <label htmlFor="due_date" className="block text-xs font-medium text-gray-700">Last Date</label>
//                 <input
//                   type="date"
//                   placeholder="Enter the last due date"
//                   id="due_date"
//                   name="due_date"
//                   value={formData.due_date}
//                   onChange={handleChange}
//                   required
//                   className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="job_nature" className="block text-sm font-medium text-gray-700">Job Nature</label>
//                 <select
//                   name="job_nature"
//                   id="job_nature"
//                   value={formData.job_nature}
//                   onChange={handleChange}
//                   required
//                   className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="Permanent">Permanent</option>
//                   <option value="Hybrid">Hybrid</option>
//                   <option value="Remote">Remote</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label htmlFor="location" className="block text-sm font-medium text-gray-700">Job Location</label>
//               <input
//                 placeholder="Enter the job location"
//                 type="text"
//                 id="location"
//                 name="location"
//                 value={formData.location}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
//               <input
//                 placeholder="Enter the job role"
//                 type="text"
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 required
//                 className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="flex justify-center">
//               <button
//                 type="submit"
//                 className="mt-6 p-1 bg-slate-700 text-white font-semibold rounded-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
//                 disabled={loading}
//               >
//                 {loading ? "Posting..." : "+ Save draft and continue >"}
//               </button>
//             </div>

//             {error && <div className="text-red-500 text-center mt-4">{error}</div>}
//             {successMessage && <div className="text-green-500 text-center mt-4">{successMessage}</div>}
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default PostaJob;

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface FormData {
  title: string;
  description: string;
  role: string;
  requirement: string;
  salary_range: string;
  due_date: string;
  job_nature: string;
  location: string;
}

const PostaJob = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    role: "",
    requirement: "",
    salary_range: "",
    due_date: "",
    job_nature: "Permanent",
    location: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get post_id from localStorage
  const postid = localStorage.getItem("post_id");

  useEffect(() => {
    if (postid) {
      // Fetch post data if postid is present (edit mode)
      const fetchPostData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authorization token not found.");
          return;
        }

        try {
          const response = await fetch(`http://staffio-dev.999r.in:82/post/${postid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const post = await response.json();
            setFormData(post); // Populate form with fetched data
          } else {
            setError("Failed to fetch post data.");
          }
        } catch (err) {
          setError("An error occurred while fetching post data.");
        }
      };

      fetchPostData();
    }
  }, [postid]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    return (
      formData.title &&
      formData.description &&
      formData.role &&
      formData.requirement &&
      formData.salary_range &&
      formData.due_date &&
      formData.job_nature &&
      formData.location
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const token = localStorage.getItem("token");
    const user_id = localStorage.getItem("user_id");
    if (!token || !user_id) {
      setError("Authorization token or user ID is missing.");
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      user_id: parseInt(user_id, 10),
    };

    try {
      const url = postid ? `http://staffio-dev.999r.in:82/api/post/${postid}` : "http://staffio-dev.999r.in:82/api/posts";
      const method = postid ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const responseData = await response.json();
        localStorage.setItem("post_id", responseData.post.id); 
        localStorage.setItem("title", formData.title); 
        console.log("responsedata", responseData);
        setSuccessMessage("Job saved successfully!");
        navigate("/postlist");
        if (!postid) navigate(`/addpostquestionlist`); 
      } else {
        const text = await response.text();
        console.log("Backend error response:", text);
        setError(`Failed to save job. ${text}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="ml-28 -mt-7 text-lg font-bold sm:-mt-4">{postid ? "Edit Job" : "Add A Job"}</p>
      <div className="flex justify-center p-4 sm:p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                placeholder="Software Developer"
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                placeholder="Enter the job description"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="requirement" className="block text-sm font-medium text-gray-700">Requirement</label>
              <textarea
                placeholder="Enter the job requirements"
                id="requirement"
                name="requirement"
                value={formData.requirement}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">Salary Range</label>
              <input
                placeholder="Rs20000-Rs500000/month"
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                required
                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid container grid-flow-row">
              <div className="w-auto">
                <label htmlFor="due_date" className="block text-xs font-medium text-gray-700">Last Date</label>
                <input
                  type="date"
                  placeholder="Enter the last due date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                  className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="job_nature" className="block text-sm font-medium text-gray-700">Job Nature</label>
                <select
                  name="job_nature"
                  id="job_nature"
                  value={formData.job_nature}
                  onChange={handleChange}
                  required
                  className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Job Location</label>
              <input
                placeholder="Enter the job location"
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <input
                placeholder="Enter the job role"
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-center">
            
              {postid && (
                <Link to="/addpostquestionlist">
                  <button className="text-white mt-7 mr-2 bg-slate-700 border border-blue-600 p-4 rounded">
                    Edit Question
                  </button>
                </Link>
              )}
              <button
                type="submit"
                className="mt-6 p-1 bg-slate-700 text-white font-semibold rounded-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                disabled={loading}
              >
                {loading ? "Saving..." : "+ Save draft and continue >"}
              </button>
            </div>

            {error && <div className="text-red-500 text-center mt-4">{error}</div>}
            {successMessage && <div className="text-green-500 text-center mt-4">{successMessage}</div>}
          </form>
        </div>
      </div>
    </>
  );
};

export default PostaJob;