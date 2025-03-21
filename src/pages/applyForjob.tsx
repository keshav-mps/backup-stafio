import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../componentes/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";


interface Question {
  id: number;
  question: string;
  hint?: string;
  type: "MC" | "OE";
  option?: string[];
}

interface UserData {
  name: string;
  email: string;
  phone_no: string;
  experience: string;
  address: string;
  cover_letter: string;
  resume?: string;
}

const ApplicationForm = () => {
  
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNo, setPhoneNo] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [postId, setPostId] = useState<string | null>("");
  const [resumeData, setResumeData] = useState<string | null>("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedPostId = localStorage.getItem("post_id");
    if (storedUserId) setUserId(storedUserId);
    if (storedPostId) setPostId(storedPostId);
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Please login to fetch user data");

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/user/${userId}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch user data.");

          const data = await response.json();
          console.log("Fetched user data:", data);
          setUserData(data);
          setName(data.name);
          setEmail(data.email);
          setPhoneNo(data.profile.number || "");
          setExperience(data.experience || "");
          setAddress(data.profile.address || "");
          setCoverLetter(data.cover_letter || "");
          if (data.profile.resume) {
            setResumeData(`${data.profile.resume}`);
            setResumeUrl(
              `${import.meta.env.VITE_API_BASE_URL}/storage/resumes/${data.profile.resume}`
            );
          }
        } catch (err) {
          
          setError("Sorry, we couldn't fetch your user data.");
        }
      };
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (postId) {
      const fetchQuestions = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Please login to fetch questions.");

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/post/${postId}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch questions.");

          const data = await response.json();
          console.log("Fetched questions:", data.ques);
          setQuestions(data.ques || []);
        } catch (err) {
          console.error(`Error fetching questions: ${err.message}`);
          setError("Sorry, we couldn't fetch the questions you have already applied for this post.");
        }
      };
      fetchQuestions();
    }
  }, [postId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file);
      if (
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResume(file);
        setResumeUrl(URL.createObjectURL(file));
        setError(null);
      } else {
        setError("Please upload a PDF or Word document");
        setResume(null);
        setResumeUrl(null);
      }
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    console.log(`Answer for question ${questionId}:`, value);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      
      if (!name || !email || !experience || !address || !coverLetter) {
        throw new Error("All fields are required. Please fill in all the details.");
      }
      
      const unansweredQuestions = questions.filter(
        (q) => !answers[q.id] || answers[q.id].trim() === ""
      );
      if (unansweredQuestions.length > 0) {
        console.log("Unanswered questions:", unansweredQuestions);
        throw new Error("Please answer all questions before submitting.");
      }
      
      if (!resume) {
        throw new Error("Resume file is required.");
      }
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone_no", phoneNo);
      formData.append("post_id", postId);
      formData.append("user_id", userId);
      formData.append("experience", experience);
      formData.append("address", address);
      formData.append("cover_letter", coverLetter);
      
      const answersArray = questions.map((question) => ({
        question_id: question.id,
        answer: answers[question.id] || "",
      }));
      
      answersArray.forEach((item, index) => {
        formData.append(`answers[${index}][question_id]`, item.question_id.toString());
        formData.append(`answers[${index}][ans]`, item.answer);
      });
    
      formData.append("resume", resume);
      
      console.log("Resume being sent:", resume);
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to apply.");
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const responseData = await response.text();
        console.log("Backend error response:", responseData);
        
        // Check if the error is because the user already applied
        if (responseData.includes("You can not apply for this post more than once")) {
          setAlreadyApplied(true);
          toast.error("You have already applied for this position!");
          setTimeout(() => {
            navigate("/appliedpost");
          }, 3000);
          return;
        }
        
        throw new Error(`Failed to submit application. Error: ${responseData}`);
      }
      
      toast.success("Application submitted successfully!");
      navigate("/appliedpost"); 
      setSuccess(true);
      
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during form submission.";
      console.error(`Error submitting application: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (alreadyApplied) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Already Applied</h2>
              <p className="text-gray-600 mb-4">You have already applied for this position. You cannot apply more than once for the same job.</p>
              <Button onClick={() => navigate("/appliedpost")} className="w-full">
                View Your Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (success) {
    return (
      <Card className="max-w-xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Application Submitted!</h2>
            <p className="text-gray-600">Thank you for applying. We'll review your application and get back to you soon.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="-mt-8 ml-28 font-bold mb-3">Apply For Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="name" className="block mb-2">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
            <Label htmlFor="email" className="block mb-2 mt-4">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <Label htmlFor="phone_no" className="block mb-2 mt-4">
              Phone Number
            </Label>
            <Input
              id="phone_no"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="Enter your phone number"
            />
            <Label htmlFor="resume-upload" className="block mb-2 mt-4">
              Resume
            </Label>
            <Input
              type="file"
              onChange={handleFileChange}
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              required
            />
            <Label
              htmlFor="resume-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-600">
                {"Upload your CV or Resume"}
              </span>
            </Label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="experience" className="block mb-2">
              Experience
            </Label>
            <Input
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Enter your experience"
              required
            />
            <Label htmlFor="address" className="block mb-2 mt-4">
              Address
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              required
            />
            <Label htmlFor="cover_letter" className="block mb-2 mt-4">
              Cover Letter
            </Label>
            <Input
              id="cover_letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a cover letter"
              required
            />
          </CardContent>
        </Card>

        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <Label htmlFor={`answer-${question.id}`} className="block mb-2">
                {question.question}
              </Label>
              {question.type === "MC" &&
              question.option &&
              question.option.length > 0 ? (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) =>
                    handleAnswerChange(question.id, value)
                  }
                >
                  {question.option.map((options, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={options}
                        id={`answer-${question.id}-${idx}`}
                      />
                      <Label htmlFor={`answer-${question.id}-${idx}`}>
                        {options}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  id={`answer-${question.id}`}
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder={question.hint || "Your answer"}
                  required
                />
              )}
            </CardContent>
          </Card>
        ))}

        {error && <Alert className="mt-6">{error}</Alert>}

        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ApplicationForm;
