import logo from "./../assets/staffiop.svg";
import { Label } from "../components/ui/label";
import { Input } from "@/components/ui/input";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link } from "react-router-dom";
import { withFormik, FormikProps, Form } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { authAPI } from "../services/apiService";


interface FormData {
  email: string;
  password: string;
}

interface SigninProps {
  initialEmail?: string;
  message?: string;
  navigate: (path: string) => void;
}

const SigninForm = (props: FormikProps<FormData> & SigninProps) => {
  const { touched, errors, values, handleChange, handleBlur } = props;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <div className="mt-10">
        <div className="flex items-center justify-center mb-8">
          <img src={logo} alt="staffio logo" />
        </div>
        <div className="mx-auto w-full max-w-[300px]">
          <Form>
          <div className="flex mt-2">
          <FaEnvelope className="mr-2  text-blue-600" size={14} />
          <Label htmlFor="email">Email</Label>
          </div>
            <Input
              className="inputtext mt-2 p-2 border border-gray-300 rounded-md w-full"
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email && (
              <div className="text-red-500">{errors.email}</div>
            )}
            <div className="flex  mt-2">
          <FaLock className=" text-blue-600" size={14} />
          <Label htmlFor="password" className=" ml-2">Password</Label>
          </div>
            <div className="relative">
              <Input
                className="inputtext mt-2 p-2 border border-gray-300 rounded-md w-full pr-10"
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                {!passwordVisible ? (
                  <AiOutlineEyeInvisible className="h-5 w-5 text-gray-500" />
                ) : (
                  <AiOutlineEye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <div className="text-red-500">{errors.password}</div>
            )}
            <div className="flex items-center justify-center mt-6 mb-8">
              <button
                type="submit"
                className="buttons bg-slate-600 text-white px-4 py-2 rounded-md"
                disabled={props.isSubmitting}
              >
                Sign in
              </button>
            </div>
          </Form>

          <hr />
          <p className="ml-10 mt-5 text-sm">
            Not a member yet?{" "}
            <span className="font-bold">
              <Link to="/">Sign up here</Link>
            </span>
          </p>
          <p className="ml-20 mt-5 font-bold">
            <Link to="/forgetpassword">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </>
  );
};

const EnhancedSigninForm = withFormik<SigninProps, FormData>({
  mapPropsToValues: (props) => ({
    email: props.initialEmail || "",
    password: "",
  }),

  validationSchema: Yup.object().shape({
    email: Yup.string()
      .email("*Invalid email address*")
      .required("*Email is required*"),
    password: Yup.string().required("*Password is required*"),
  }),

  handleSubmit: async (values, { setSubmitting, setErrors, props }) => {
    try {
      console.log("Form data being sent:", values);

      const result = await authAPI.login(values.email, values.password);
      console.log("Response data:", result);

      if (result.token && result.user_id && result.user_name) {
        const roleId = localStorage.getItem("role_id");
        if (roleId === "2") {
          props.navigate("/profile");
        } else if (roleId === "3") {
          props.navigate("/profile");
        } 
        toast.success("Sign in successful!");
      } else {
        setErrors({ email: "*Invalid email or password*" });
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setErrors({ email: "*An unexpected error occurred, please try again.*" });
      toast.error("An unexpected error occurred, please try again.");
    } finally {
      setSubmitting(false);
    }
  },
})(SigninForm);

const SignInPage = () => {
  const navigate = useNavigate();
  return <EnhancedSigninForm navigate={navigate} />;
};

export default SignInPage;
