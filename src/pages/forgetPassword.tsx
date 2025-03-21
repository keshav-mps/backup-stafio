import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./../assets/staffiop.svg";
import { authAPI } from "../services/apiService";

const ForgetPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [resendOtpTimer, setResendOtpTimer] = useState<number>(120);
  const [isResendEnabled, setIsResendEnabled] = useState<boolean>(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [lastOtpRequestTime, setLastOtpRequestTime] = useState<number | null>(
    null
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (otpSent && !otpVerified) {
      const timer = setInterval(() => {
        setResendOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [otpSent, otpVerified]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const currentTime = Date.now();
    if (
      lastOtpRequestTime &&
      currentTime - lastOtpRequestTime < 60000 &&
      !isResendEnabled
    ) {
      setError(
        `Please wait ${Math.ceil(
          (60000 - (currentTime - lastOtpRequestTime)) / 1000
        )} seconds before requesting another OTP.`
      );
      setLoading(false);
      return;
    }

    try {
      if (!email) {
        throw new Error("Please enter a valid email.");
      }

      const data = await authAPI.sendOtp(email);
      console.log("OTP send response:", data);

      setOtpSent(true);
      setIsResendEnabled(false);
      setAttemptsLeft(3);
      setMessage(
        "If your email exists, you will receive a reset link and OTP shortly and will get only 3 chances to enter correct OTP."
      );
      setLastOtpRequestTime(currentTime);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid OTP.");
      }

      const data = await authAPI.verifyOtp(email, otp);
      console.log("OTP verification response:", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user_id.toString());
      localStorage.setItem("role_id", data.role_id.toString());
      localStorage.setItem("user_name", data.user_name);
      localStorage.getItem("token");
      localStorage.getItem("role_id");
      localStorage.getItem("userid");
      localStorage.getItem("user_name");
      setOtpVerified(true);
      setMessage("Login successful!");
      switch (data.role_id.toString()) {
        case "1":
          navigate("/admindashboard");
          break;
        case "2":
          navigate("/postAjob");
          break;
        case "3":
          navigate("/requriterprofile");
          break;
        default:
          console.error("Unknown role_id:", data.role_id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setOtpVerified(false);
      setAttemptsLeft((prev) => prev - 1);

      if (attemptsLeft - 1 <= 0) {
        setMessage(
          "You have exhausted your attempts. Please request a new OTP."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (value.match(/[0-9]/)) {
      const newOtp = otp.split("");
      newOtp[index] = value;
      setOtp(newOtp.join(""));
      if (index < 5 && value) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newOtp = otp.split("");
      newOtp[index] = "";
      setOtp(newOtp.join(""));
      if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await authAPI.sendOtp(email);
      console.log("OTP resend response:", data);

      setIsResendEnabled(false);
      setAttemptsLeft(3);
      setMessage("A new OTP has been sent to your email.");
      setLastOtpRequestTime(Date.now());
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center text-white">
      <div className="w-full max-w-md p-6 bg-indigo-500/10 rounded-lg shadow-lg">
        <div className="flex items-center justify-center p-4">
          <img className="h-12 w-auto" src={logo} alt="Logo" />
        </div>
        <h2 className="text-2xl font-semibold font-sans text-center mb-6 text-black">
          {otpSent ? "Verify OTP" : "Login With OTP"}
        </h2>

        {!otpSent ? (
          <form onSubmit={handleSubmitEmail}>
            {message && <div className="text-green-500 mb-4">{message}</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 p-2 w-full border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md bg-slate-600 text-white font-semibold 
                  ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-slate-700"
                  }`}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        ) : otpVerified ? (
          <div className="text-slate-500 mb-4">{message}</div>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            {message && <div className="text-slate-500 mb-4">{message}</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-black"
              >
                Enter OTP
              </label>
              <div className="flex space-x-2">
                {[...Array(6)].map((_, index) => (
                  <input
                    id={`otp-${index}`}
                    key={index}
                    type="text"
                    maxLength={1}
                    className="w-9 h-12 text-black text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpInput(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    autoFocus={index === 0}
                    required
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md bg-slate-600 text-white font-semibold 
                  ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-slate-700"
                  }`}
                disabled={loading || attemptsLeft <= 0}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {!otpVerified && otpSent && attemptsLeft > 0 && (
          <div className="text-center text-sm text-slate-500">
            Attempts left: {attemptsLeft}
          </div>
        )}

        {!otpVerified && otpSent && attemptsLeft <= 0 && (
          <div className="text-center text-sm text-red-500">
            You have exhausted your attempts. Please request a new OTP.
          </div>
        )}

        {!otpVerified && otpSent && isResendEnabled && attemptsLeft <= 0 && (
          <div className="text-center">
            <button
              onClick={handleResendOtp}
              className="text-blue-600 hover:underline"
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        )}

        {otpSent && !otpVerified && resendOtpTimer > 0 && (
          <div className="text-center text-sm text-gray-500">
            Resend OTP in {resendOtpTimer}s
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
