import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobTitleDisplay from "./jobTitleHeader";
import logo1 from "./../assets/mcq.svg";
import logo2 from "./../assets/regular.svg";
import { Link } from "react-router-dom";

interface Question {
  id: number;
  question: string;
  hint: string;
  option: string[] | null;
  type: "MC" | "OE";
  created_at: string | null;
  post_id: number;
}

const AddJobQuestionList = () => {
  console.log('Component rendered');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optionsVisibility, setOptionsVisibility] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useEffect triggered');

    const fetchQuestions = async () => {
      const postId = localStorage.getItem("post_id");
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      console.log('localStorage values:', {
        postId,
        token: token ? 'exists' : 'missing',
        userId
      });

      if (!postId || !token || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://staffio-dev.999r.in:82/post/${postId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuestions(data.ques);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        console.log('Setting loading state to false');
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const toggleOptions = (questionId: number) => {
    setOptionsVisibility(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleEditQuestion = (question: Question) => {
    navigate("/addpostquestion", { state: { question } });
  };

  if (isLoading) {
    return <p>Loading questions...</p>;
  }

  return (
    <>
      <div>
        </div>
      <div className="ml-[110px] -mt-12">
        <JobTitleDisplay />
      </div>

      <div className="flex justify-between items-center mx-6 mt-3">
        <p className="text-sm font-bold">PRESCREENING QUESTION</p>
        <button
          onClick={() => navigate("/addpostquestion")}
          className="bg-slate-500 text-white px-3 py-1 rounded-md"
        >
          +
        </button>
      </div>

      <div className="mt-6">
        <div className="border p-3 rounded-md shadow-sm">
          {questions.length > 0 ? (
            questions.map((question, index) => {
              console.log(`Rendering question ${index + 1}:`, question);
              return (
                <div
                  key={question.id}
                  className="border-b p-4 rounded-md cursor-pointer"
                  onClick={() => handleEditQuestion(question)}
                >
                  <div className="flex">
                    <div>
                      {question.type === "MC" && (
                        <button
                          onClick={() => toggleOptions(question.id)}
                          className="mr-2"
                        >
                          <img src={logo1} alt="MC Logo" />
                        </button>
                      )}
                      {question.type === "OE" && (
                        <img src={logo2} alt="OE Logo" className="mr-2" />
                      )}
                    </div>
                    <p className="italic text-sm text-black">
                      <b>Question {index + 1}: </b>  {question.question}
                    </p>
                  </div>

                  {question.hint && (
                    <p className="italic text-sm text-gray-500 ml-14 -mt-7">
                      Hint: {question.hint}
                    </p>
                  )}

                  <br />

                  {optionsVisibility[question.id] && question.type === "MC" && question.option && (
                    <div>
                      <p className="italic text-sm text-gray-500">Options:</p>
                      <ul className="list-disc pl-5 ml-14">
                        {question.option.map((option, idx) => (
                          <li key={idx} className="text-sm text-gray-500">
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No questions available.</p>
          )}
        </div>

        <Link to="/postlist">
          <div className="flex justify-center">
            <button
              onClick={() => console.log('Save draft button clicked')}
              type="submit"
              className="mt-6 p-1 bg-slate-700 text-white font-semibold rounded-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {"+ Save draft and continue >"}
            </button>
          </div>
        </Link>
      </div>
    </>
  );
};

export default AddJobQuestionList;


