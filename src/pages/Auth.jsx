
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthContext } from "../context/AuthProvider";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [active, setActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    agreed: false,
  });

  const [otp, setOtp] = useState("");
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const otpInputRef = useRef(null);

  const {
    step,
    success,
    registeredEmail,
    setStep,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
  } = useAuthContext();

  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Loading states
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isVerifyOtpLoading, setIsVerifyOtpLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Handle login
  const handleLogin = async () => {
    if (isLoginLoading) return;

    setIsLoginLoading(true);

    if (!loginForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      setIsLoginLoading(false);
      return toast.error("Enter a valid email");
    }

    if (!loginForm.password || loginForm.password.length < 6) {
      setIsLoginLoading(false);
      return toast.error("Password must be at least 6 characters");
    }

    try {
      const response = await login(loginForm);

      if (response && response.success) {
        toast.success("Login successful");
      }
    } catch (error) {
      // ✅ Handle all error cases here
      toast.error(error.message || "Error logging in. Please try again");
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    if (isRegisterLoading) return;

    setIsRegisterLoading(true);

    if (!registerForm.name || registerForm.name.trim().length < 3) {
      setIsRegisterLoading(false);
      return toast.error("Name must be at least 3 characters");
    }

    if (!registerForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      setIsRegisterLoading(false);
      return toast.error("Enter valid email");
    }

    if (!registerForm.password || registerForm.password.length < 6) {
      setIsRegisterLoading(false);
      return toast.error("Password must be at least 6 characters");
    }

    if (!registerForm.agreed) {
      setIsRegisterLoading(false);
      return toast.error("You must agree that you are above 18");
    }

    try {
      const response = await register(registerForm);

      if (response?.success) {
        if (response.alreadyRegistered) {
          toast.info("OTP re-sent. Please verify your email.");
        } else {
          toast.success("Registration successful. OTP sent to your email.");
        }
      }
    } catch (error) {
      // ✅ Handle error messages properly
      const errorMsg = error.message || "Registration failed. Please try again.";
      
      if (errorMsg.includes("already exists and is verified")) {
        toast.error("User already exists. Please login.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP");
    if (isVerifyOtpLoading) return;

    setIsVerifyOtpLoading(true);
    
    try {
      const result = await verifyOtp(otp);
      
      // Check if verification was successful
      if (result && result.success) {
        toast.success("Email verified successfully! Please login.");
        
        // Redirect to login step after a short delay
        setTimeout(() => {
          setStep("auth");
          setActive(false);
          setOtp("");
          
          // Reset register form
          setRegisterForm({
            name: "",
            email: "",
            password: "",
            dob: "",
            agreed: false,
          });
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifyOtpLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    setStep("forgot");
    setForgotStep("email");
  };

  const handleForgotSubmit = async () => {
    if (isForgotLoading) return;

    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      return toast.error("Enter valid registered email");
    }

    setIsForgotLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      if (res) {
        toast.success("OTP sent to your email");
        setForgotStep("reset");
      }
    } catch (err) {
      toast.error(err.message || "Email not found or server error");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    if (isResetLoading) return;

    setIsResetLoading(true);

    if (!forgotOtp || forgotOtp.length !== 6) {
      setIsResetLoading(false);
      return toast.error("Enter valid 6-digit OTP");
    }

    if (!newPassword || newPassword.length < 6) {
      setIsResetLoading(false);
      return toast.error("New password must be at least 6 characters");
    }

    try {
      const res = await resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword,
      });
      if (res) {
        toast.success("Password reset successful. Please login.");
        setStep("auth");
        setForgotStep("email");
        setForgotEmail("");
        setForgotOtp("");
        setNewPassword("");
      }
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResendLoading) return;

    setIsResendLoading(true);
    try {
      await resendOtp();
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-center items-center min-h-screen w-full"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 flex flex-col items-center text-center">
              <svg
                className="w-20 h-20 text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h1 className="text-2xl font-bold mb-2 text-green-600">
                Success!
              </h1>
              <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        {step === "otp" && !success && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-screen w-full"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
              <h1 className="text-xl font-bold mb-4 text-orange-500">
                Verify OTP
              </h1>
              <p className="text-sm mb-4">
                An OTP has been sent to <strong>{registeredEmail}</strong>. It
                is valid for 5 minutes.
              </p>
              <input
                type="text"
                maxLength={6}
                ref={otpInputRef}
                placeholder="Enter 6-digit OTP"
                className="bg-gray-200 p-2 rounded w-full mt-4 text-sm text-center tracking-widest"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                }}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyOtpLoading}
                className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyOtpLoading ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={handleResendOtp}
                disabled={isResendLoading}
                className="text-sm text-blue-500 mt-3 hover:underline disabled:opacity-50"
              >
                {isResendLoading ? "Resending..." : "Resend OTP"}
              </button>
              <button
                onClick={() => setStep("auth")}
                className="text-sm text-gray-500 mt-3 hover:underline"
              >
                Back to Sign Up
              </button>
            </div>
          </motion.div>
        )}

        {step === "forgot" && !success && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-screen w-full"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
              <h1 className="text-xl font-bold mb-4 text-orange-500">
                {forgotStep === "email" ? "Forgot Password" : "Reset Password"}
              </h1>

              {forgotStep === "email" ? (
                <>
                  <input
                    type="email"
                    placeholder="Registered Email"
                    className="bg-gray-200 p-2 rounded w-full mt-4 text-sm"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <button
                    onClick={handleForgotSubmit}
                    disabled={isForgotLoading}
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isForgotLoading ? "Sending..." : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="bg-gray-200 p-2 rounded w-full mt-4 text-sm"
                    value={forgotOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setForgotOtp(val);
                    }}
                  />
                  <div className="relative w-full mt-4">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      className="bg-gray-200 p-2 rounded w-full text-sm pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 hover:text-black cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button
                    onClick={handleResetSubmit}
                    disabled={isResetLoading}
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setStep("auth");
                  setForgotStep("email");
                  setForgotEmail("");
                  setForgotOtp("");
                  setNewPassword("");
                }}
                className="text-sm text-gray-500 mt-4 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        )}

        {step === "auth" && !success && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold text-orange-400 mb-4 text-center">
              Hello Bitcoin Enthusiast!
            </h1>

            <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md md:max-w-2xl lg:max-w-3xl min-h-[480px] overflow-hidden">
              {/* Register */}
              <div
                className={`absolute inset-0 h-full w-full md:w-1/2 flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                  active
                    ? "translate-x-0 md:translate-x-full opacity-100 z-10"
                    : "opacity-0 -z-10 md:z-0"
                }`}
              >
                <h1 className="text-2xl font-bold">Create Account</h1>
                <input
                  type="text"
                  placeholder="Name"
                  className="bg-gray-200 p-2 rounded w-full max-w-[300px] mt-4 text-sm"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-gray-200 p-2 rounded w-full max-w-[300px] mt-4 text-sm"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                />
                <div className="relative w-full max-w-[300px] mt-4">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-200 p-2 rounded w-full text-sm pr-10"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 hover:text-black"
                  >
                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex items-center mt-4 max-w-[300px] w-full">
                  <input
                    type="checkbox"
                    id="ageCheckbox"
                    className="mr-2"
                    checked={registerForm.agreed}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        agreed: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="ageCheckbox"
                    className="text-sm text-gray-700"
                  >
                    I am 18 years or older
                  </label>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isRegisterLoading}
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded text-xs uppercase mt-4 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegisterLoading ? "Signing Up..." : "Sign Up"}
                </button>

                <button
                  onClick={() => setActive(false)}
                  className="text-xs text-blue-500 mt-2 hover:underline md:hidden"
                >
                  Already have an account? Sign In
                </button>
              </div>

              {/* Login */}
              <div
                className={`absolute inset-0 h-full w-full md:w-1/2 flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                  active
                    ? "opacity-0 -z-10 md:z-0 -translate-x-full md:translate-x-0"
                    : "opacity-100 z-10"
                }`}
              >
                <h1 className="text-2xl font-bold">Sign In</h1>
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-gray-200 p-2 rounded w-full max-w-[300px] mt-4 text-sm"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
                <div className="relative w-full max-w-[300px] mt-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-200 p-2 rounded w-full text-sm pr-10"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={isLoginLoading}
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:opacity-90 text-white px-6 py-2 rounded text-xs uppercase mt-4 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoginLoading ? "Signing In..." : "Sign In"}
                </button>
                <button
                  onClick={handleForgotPassword}
                  className="text-xs text-orange-400 mt-2 hover:underline"
                >
                  Forgot Password?
                </button>
                <button
                  onClick={() => setActive(true)}
                  className="text-xs text-blue-500 mt-2 hover:underline md:hidden"
                >
                  Don't have an account? Sign Up
                </button>
              </div>

              {/* Toggle panel (desktop only) */}
              <div
                className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-500 ${
                  active
                    ? "-translate-x-full rounded-l-none rounded-r-[150px]"
                    : "rounded-r-none rounded-l-[150px]"
                }`}
              >
                <div className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white absolute inset-0 flex flex-col justify-center items-center text-center p-4 transition-all duration-500">
                  {active ? (
                    <>
                      <h1 className="text-2xl font-bold">Welcome Back!</h1>
                      <p className="text-xs mt-2">
                        Already have an account? Sign in
                      </p>
                      <button
                        onClick={() => setActive(false)}
                        className="border border-white mt-4 px-4 py-1 rounded text-xs uppercase hover:shadow-lg"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">Hello!</h1>
                      <p className="text-xs mt-2">
                        Don&apos;t have an account? Register now.
                      </p>
                      <button
                        onClick={() => setActive(true)}
                        className="border border-white mt-4 px-4 py-1 rounded text-xs uppercase hover:shadow-lg"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}