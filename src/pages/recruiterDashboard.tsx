// import Header from "./headerComponent";
import { Link } from "react-router-dom";

const Recruiter: React.FC = () => {
  return (
    <>
      <div>
          {/* <Header /> */}
          <p className="ml-[120px] -mt-7 font-bold">WELCOME</p>
        <p className="text-center text-slate-500 text-sm mt-32">You have no updates</p>
        <div className="h-10 w-20 bg-slate-700 text-white m-auto rounded-md mt-2 mb-72">
          <Link to="/postajob">
            <button className="text-xs sm:text-sm pl-2 pt-3 md:text-base">
              +Add Jobs
            </button>
          </Link>
        </div>

        <div className="absolute bottom-auto left-1/2 transform -translate-x-1/2 mb-4 flex space-x-4 border-2 border-black p-2 rounded">
          <button className="text-sm sm:text-base md:text-lg hover:bg-slate-300">
            Homes
          </button>
          <button className="text-sm sm:text-base md:text-lg hover:bg-slate-300">
            Jobs
          </button>
          <button className="text-sm sm:text-base md:text-lg hover:bg-slate-300">
            Setting
          </button>
        </div>
      </div>
    </>
  );
};

export default Recruiter;
