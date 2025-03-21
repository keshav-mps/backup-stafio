import React, { useEffect, useState } from "react";

import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiDeleteBin6Line } from "react-icons/ri";
import JobTitleDisplay from "./jobTitleHeader";
import { useLocation, useNavigate } from "react-router-dom";

interface QuestionData {
  id?: number;
  question: string;
  type: "OE" | "MC";
  hint: string;
  option: string[];
}

interface Errors {
  [key: string]: string | undefined;
}

const JobPostQuestion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionData[]>([
    { question: "", type: "OE", hint: "", option: [] },
  ]);
  const [errors, setErrors] = useState<Errors>({});
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedJobId = localStorage.getItem("post_id");

    if (token) {
      setAuthToken(token);
    } else {
      toast.error("Unauthorized access! Please log in.");
      console.error("Error: Token is missing. Please log in.");
    }

    if (storedJobId) {
      setJobId(storedJobId);
    } else {
      toast.error("Job ID is missing. Please create a job post first.");
      console.error("Error: Job ID is missing.");
    }

    if (location.state?.question) {
      const { id, question, hint, type, option } = location.state.question;
      setQuestions([
        {
          id,
          question,
          hint,
          type,
          option: typeof option === 'string' && option ? JSON.parse(option) : (option || []),
        },
      ]);
    }
  }, [location.state]);

  const validate = (): Errors => {
    const validationErrors: Errors = {};
    questions.forEach((question, idx) => {
      if (!question.question.trim()) {
        validationErrors[`question_${idx}`] = "Question is required";
      } else if (question.question.length < 3) {
        validationErrors[`question_${idx}`] =
          "Question must be at least 3 characters";
      }
      if (!question.type) {
        validationErrors[`type_${idx}`] = "Question type is required";
      }
      if (question.type === "MC") {
        if (question.option.length < 2) {
          validationErrors[`option_${idx}`] =
            "At least two options are required";
        } else {
          question.option.forEach((option, optionIdx) => {
            if (!option.trim()) {
              validationErrors[`option_${idx}_${optionIdx}`] =
                "Option cannot be empty";
            }
          });
        }
      }
    });

    setErrors(validationErrors);
    return validationErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } },
    idx: number,
    field: keyof QuestionData
  ) => {
    const { value } = e.target;
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const updatedQuestion = { ...updatedQuestions[idx] };

      if (field === "type" && (value === "MC" || value === "OE")) {
        updatedQuestion.type = value;
        updatedQuestion.option = value === "MC" ? [""] : [];
      } else {
        (updatedQuestion[field] as string) = value;
      }

      updatedQuestions[idx] = updatedQuestion;
      return updatedQuestions;
    });
  };

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
    optionIdx: number
  ) => {
    const { value } = e.target;
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const updatedQuestion = { ...updatedQuestions[idx] };
      const updatedOptions = [...updatedQuestion.option];
      updatedOptions[optionIdx] = value;
      updatedQuestion.option = updatedOptions;
      updatedQuestions[idx] = updatedQuestion;
      return updatedQuestions;
    });
  };

  const handleAddOption = (idx: number) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const updatedQuestion = { ...updatedQuestions[idx] };
      updatedQuestion.option = [...updatedQuestion.option, ""];
      updatedQuestions[idx] = updatedQuestion;
      return updatedQuestions;
    });
  };

  const handleDeleteOption = (idx: number, optionIdx: number) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const updatedQuestion = { ...updatedQuestions[idx] };
      updatedQuestion.option = updatedQuestion.option.filter((_, i) => i !== optionIdx);
      updatedQuestions[idx] = updatedQuestion;
      return updatedQuestions;
    });
  };

  const handleDeleteQuestion = (idx: number) => {
    setQuestions(prevQuestions => prevQuestions.filter((_, i) => i !== idx));
  };

  // const handleAddQuestion = () => {
  //   setQuestions(prevQuestions => [
  //     ...prevQuestions,
  //     { question: "", type: "OE", hint: "", option: [] },
  //   ]);
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!jobId || !authToken) {
      toast.error("Missing required data. Please check your login status and job ID.");
      return;
    }

    try {
      if (location.state?.question) {
        const questionToUpdate = questions[0];
        const endpoint = questionToUpdate.id
          ? `http://staffio-dev.999r.in:82/api/ques/${questionToUpdate.id}`
          : `http://staffio-dev.999r.in:82/api/ques/${jobId}`;

        const response = await fetch(endpoint, {
          method: questionToUpdate.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            question: questionToUpdate.question,
            type: questionToUpdate.type,
            hint: questionToUpdate.hint.trim() || " ",
            option: questionToUpdate.type === "MC" ? JSON.stringify(questionToUpdate.option) : null,
          }),
        });
        console.log(questionToUpdate);
        const errorData = await response.json();
        console.log("errorrrr",errorData);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save question");
        }
      }
      else {
        const questionsPayload = {
          questions: questions.map(q => ({
            question: q.question,
            type: q.type,
            hint: q.hint.trim() || " ",
            option: q.type === "MC" ? JSON.stringify(q.option) : null,
          }))
        };

        const response = await fetch(
          `http://staffio-dev.999r.in:82/api/ques/${jobId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(questionsPayload),
          }
        );
        console.log("questions",questionsPayload)
        const errorData = await response.json();
        console.log("errorrr",errorData);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save questions");
        }
      }

      toast.success(location.state?.question ? "Question updated successfully!" : "Questions saved successfully!");
      navigate("/addpostquestionlist");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error saving the questions!";
      toast.error(errorMessage);
      console.error("Error:", error);
    }
  };

  return (
    <>
      
      <div className="ml-[90px] -mt-12">
        <JobTitleDisplay />
      </div>
      <div className="ml-0 sm:ml-52 p-6">
        <form onSubmit={handleSubmit} className="max-w-screen-sm mx-auto grid grid-cols-1 gap-6">
          {questions.map((question, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold ml-1 mt-2">Question {idx + 1}</h3>
                <div className="bg-red-200 pt-2 w-7 pl-1 rounded-sm">
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(idx)}
                    className="text-red-600 text-xl"
                    disabled={questions.length === 1 && location.state?.question}
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>

              <RadioGroup
                value={question.type}
                onValueChange={(value: "OE" | "MC") => handleChange({ target: { value } }, idx, "type")}
              >
                <div className="flex space-x-4 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="OE"
                      id={`OE_${idx}`}
                    />
                    <Label htmlFor={`OE_${idx}`}>Regular</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="MC"
                      id={`MC_${idx}`}
                    />
                    <Label htmlFor={`MC_${idx}`}>Multiple Choice</Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="mt-4">
                <Label htmlFor={`question_${idx}`}>Question</Label>
                <Input
                  name={`question_${idx}`}
                  id={`question_${idx}`}
                  value={question.question}
                  onChange={(e) => handleChange(e, idx, "question")}
                  className="inputtext mt-2 p-2 border border-gray-300 rounded-md w-full"
                />
                {errors[`question_${idx}`] && (
                  <div className="text-red-500">{errors[`question_${idx}`]}</div>
                )}
              </div>

              <div className="mt-4">
                <Label htmlFor={`hint_${idx}`}>Question Hint</Label>
                <textarea
                  name={`hint_${idx}`}
                  id={`hint_${idx}`}
                  value={question.hint}
                  onChange={(e) => handleChange(e, idx, "hint")}
                  className="inputtext mt-2 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>

              {question.type === "MC" && (
                <div className="mt-4">
                  <Label>Options</Label>
                  <button
                    type="button"
                    className="mt-2 ml-2 pb-2 border-2 h-8 w-7 mb-2 border-slate rounded-sm"
                    onClick={() => handleAddOption(idx)}
                  >
                    +
                  </button>
                  <div className="space-y-4">
                    {question.option.map((option, optionIdx) => (
                      <div key={optionIdx} className="flex items-center space-x-2">
                        <Input
                          name={`option_${optionIdx}`}
                          value={option}
                          onChange={(e) => handleOptionChange(e, idx, optionIdx)}
                          className="inputtext p-2 border border-gray-300 rounded-md w-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(idx, optionIdx)}
                          className="text-red-600"
                        >
                          <RiDeleteBin6Line />
                        </button>
                        {errors[`option_${idx}_${optionIdx}`] && (
                          <div className="text-red-500">{errors[`option_${idx}_${optionIdx}`]}</div>
                        )}
                      </div>
                    ))}
                    {errors[`option_${idx}`] && (
                      <div className="text-red-500">{errors[`option_${idx}`]}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center mt-44 mb-0 space-x-4 flex-wrap">
            <button
              type="submit"
              className={`buttons px-1 ml-1 py-2 w-auto rounded-md  mr-7 sm:w-auto ${
                questions.some((q) => !q.question || !q.type)
                  ? " bg-slate-500 text-black cursor-not-allowed"
                  : "bg-slate-700 text-white"
              }`}
              disabled={questions.some((q) => !q.question || !q.type)}
            >
              +Save Questions
            </button>

            {/* <button
              type="button"
              className="buttons px-4 py-2 mt-1 rounded-md bg-slate-500 text-white w-auto sm:w-auto"
              onClick={handleAddQuestion}
            >
              +Add Question
            </button> */}
          </div>
        </form>
      </div>
    </>
  );
};

export default JobPostQuestion;


