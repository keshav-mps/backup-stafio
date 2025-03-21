import { useState } from "react";
import logo from "./../assets/staffiop.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";
import { withFormik, FormikProps, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { authAPI } from "../services/apiService";



interface FormData {
  email: string;
  password: string;
  role_id: number;
  acceptTerms: boolean;
  name: string;
}

interface SignupProps {
  initialEmail?: string;
  message?: string;
}

const SignupForm = (props: FormikProps<FormData> & SignupProps) => {
  const {
    touched,
    errors,
    isSubmitting,
    isValid,
    values,
    handleChange,
    handleBlur,
    handleSubmit,
  } = props;

  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
  return (
    <div className="mt-10">
      <div className="flex items-center justify-center mb-8">
        <img src={logo} alt="staffio logo" />
      </div>
      <div className="mx-auto w-full max-w-[300px] ">
        <Form onSubmit={handleSubmit}>
       <div className="flex">
       <FaUser className=" text-blue-600 mr-2" size={14} ></FaUser>

          <Label htmlFor="name"> Name</Label>
          </div>
         
          <Input
            className="inputtext mt-2 p-2 border border-gray-300 rounded-md w-full"
            type="text"
            name="name"
            id="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.name && errors.name && <div className="text-red-500">{errors.name}</div>}
          <div className="flex mt-2">
          <FaEnvelope className="mr-2  text-blue-600" size={14} />
          <Label htmlFor="email">Email</Label>
          </div>
          <Input
            className="inputtext mt-2 p-2 border border-gray-300 rounded-md w-full"
            type="email"
            name="email"
            id="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && errors.email && <div className="text-red-500">{errors.email}</div>}
          <div className="flex  mt-2">
          <FaLock className=" text-blue-600" size={14} />
          <Label htmlFor="password" className=" ml-2">Password</Label>
          </div>
          <div className="relative">
            <Input
              className="inputtext mt-2 p-2 border border-gray-300 rounded-md w-full"
            
              type={passwordVisible ? "text" : "password"}
              name="password"
              id="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-1/2 right-3 transform -translate-y-1/2"
            >
              {passwordVisible ? (
                <AiOutlineEye className="h-5 w-5 text-gray-500" />
              ) : (
                <AiOutlineEyeInvisible className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {touched.password && errors.password && <div className="text-red-500">{errors.password}</div>}

          <div className="mt-4 pl-16 mb-4">
            <RadioGroup
              value={values.role_id.toString()}
              onValueChange={(value) => {
                handleChange({ target: { name: "role_id", value: Number(value) } });
              }}
            >
              <div className="flex space-x-2">
                <RadioGroupItem value="3" id="seeker" checked={values.role_id === 3} />
                <Label htmlFor="seeker">Seeker</Label>

                <RadioGroupItem value="2" id="recruiter" checked={values.role_id === 2} />
                <Label htmlFor="recruiter">Recruiter</Label>
              </div>
            </RadioGroup>
            {touched.role_id && errors.role_id && <div className="text-red-500 mt-2">{errors.role_id}</div>}
          </div>

          <div className="mt-4">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={values.acceptTerms}
              onChange={handleChange}
            />
            <span className="ml-2">Accept terms and conditions</span>
            {touched.acceptTerms && errors.acceptTerms && (
              <p className="text-red-500 text-sm mt-2">{errors.acceptTerms}</p>
            )}
            <p className="text-xs mt-2 ml-5">
              You agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          <div className="flex items-center justify-center mt-6 mb-8">
            <button
              type="submit"
              className={`buttons px-4 py-2 rounded-md ${isSubmitting || !isValid ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-slate-400 text-white'}`}
              disabled={isSubmitting || !isValid}
            >
              Sign Up
            </button>
          </div>
        </Form>

        <hr />
        <p className="ml-10 mt-5 text-sm">
          Already a member?{" "}
          <span className="font-bold">
            <Link to="/signin">Sign in here</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

const EnhancedSignupForm = withFormik<SignupProps, FormData>({
  mapPropsToValues: (props) => ({
    email: props.initialEmail || "",
    password: "",
    role_id: 0,
    acceptTerms: false,
    name: "",
  }),

  validationSchema: Yup.object().shape({
    email: Yup.string().email("*Invalid email address*").required("*Email is required*"),
    name: Yup.string().required("*Name is required*").min(3, "*Name must be at least 3 characters*"),
    password: Yup.string()
      .min(6, "*Password must be at least 6 characters*")
      .required("*Password is required*")
      .matches(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/,
        "*Password must contain at least one uppercase letter, one number, and one special character*"
      ),
    role_id: Yup.number().required("*Role is required*").oneOf([2, 3], "*Invalid role selected*"),
    acceptTerms: Yup.bool().oneOf([true], "*You must accept the terms and conditions*"),
  }),

  handleSubmit: async (values, { setSubmitting, setErrors }) => {
    const { name, email, password, role_id } = values;
    const payload = { name, email, password, role_id };
    console.log("Payload being sent: ", payload);

    try {
      const data = await authAPI.register(payload);
      console.log("Response Data: ", data);

      if (data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_name", name); 
        toast.success("Sign-up successful!");
        window.location.href = "/signin";
      } else {
        setErrors({
          email: "*This email is already registered or something went wrong. Please try again.*",
        });

        if (data?.message) {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      setErrors({ email: "*Something went wrong. Please try again.*" });
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  },
})(SignupForm);

export default EnhancedSignupForm;
