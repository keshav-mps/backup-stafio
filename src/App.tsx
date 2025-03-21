import { Routes, Route, useLocation } from "react-router-dom";
import EnhancedSigninForm from "./pages/Signin"
import EnhancedSignupForm from "./pages/SignUp";
import Profile from "./pages/Profile";
import Requiter from "./pages/recruiterDashboard";
import { ToastContainer } from "react-toastify";
import ForgetPassword from "./pages/forgetPassword";
import PostaJob from "./pages/postJobForm";
import Jobpostquestion from "./pages/addjobQuestions";
import AddjobQuestionlist from "./pages/addjobQuestionlist";
import ApplicationForm from "./pages/applyForjob";
import Chat from "./pages/chatPage";
import Header from "./pages/headerComponent";
import PostsList from "./pages/postsList";
import SeekerPostsList from "./pages/allpostsSeeker";
import AppliedPosts from "./pages/seekerAppliedpost";
import AppliedCandidates from "./pages/appliedCanditaes";
import ApplicationDetails from "./pages/applicationDetail";
import CandidateDetails from "./pages/appliedCandidatedetails";
import ScheduleInterview from "./pages/interviewPage";
import VideoChatComponent from "./pages/liveKit";
import Settings from "./pages/Settings";
import { useEffect } from "react";

function App() {
  const location = useLocation(); 
  const noHeaderRoutes = [
    "/signin",
    "/",
    "/forgetpassword",
    "/chatpage","/profile",
  ];

  // Load dark mode preference on app init
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "true") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 dark:bg-gray-900">
      {!noHeaderRoutes.includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<EnhancedSignupForm />} />
        <Route path="/signin" element={<EnhancedSigninForm />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/requriterdashboard" element={<Requiter />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<div>404 Page Not Found</div>} />
        <Route path="/postajob" element={<PostaJob />} />
        <Route path="/addpostquestion" element={<Jobpostquestion />} />
        <Route path="/addpostquestionlist" element={<AddjobQuestionlist />} />
        <Route path="/applyforjob" element={<ApplicationForm />} />
        <Route path="/applyforjob/:postid" element={<ApplicationForm />} />
        <Route path="/chatpage" element={<Chat />} />
        <Route path="/postlist" element={<PostsList />} />
        <Route path="/postajob/:postid" element={<PostaJob />} />
        <Route path="/allposts" element={<SeekerPostsList />} />
        <Route path="/appliedpost" element={<AppliedPosts />} />
        <Route path="/applied-candidates/:postId" element={<AppliedCandidates />} />
        <Route path="/application-details/:applicationId" element={<ApplicationDetails />} />
        <Route path="/candidate-details/:postId/:candidateId" element={<CandidateDetails />} />
        <Route path="/interview/:applicationId" element={<ScheduleInterview />} />
        <Route path="/livekit/:applicationId" element={<VideoChatComponent />} />
      </Routes>

      <ToastContainer />
    </div>
  );
}

export default App;
