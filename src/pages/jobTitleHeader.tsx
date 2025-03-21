import React, { useEffect, useState } from "react";

const JobTitleDisplay: React.FC = () => {
  const [jobTitle, setJobTitle] = useState<string | null>(null);

  useEffect(() => {
    const storedJobTitle = localStorage.getItem("title");
    
    if (storedJobTitle) {
      setJobTitle(storedJobTitle); 
    } else {
      console.error("Job title is missing in localStorage.");
    }
  }, []);

  return (
    <div className="text-center text-xl font-bold mt-4">
      {jobTitle ? (
        <p className=" text-xl">{jobTitle}</p> 
      ) : (
        <p className=" text-xl">JOb Title</p>
      )}
    </div>
  );
};

export default JobTitleDisplay;
