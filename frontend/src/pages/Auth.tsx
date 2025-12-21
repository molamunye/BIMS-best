import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
// Supabase import removed
import { toast } from "sonner";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
}

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isActive, setIsActive] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const [signInErrors, setSignInErrors] = useState<ValidationErrors>({});
  const [signUpErrors, setSignUpErrors] = useState<ValidationErrors>({});

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return undefined;
  };

  const validateSignIn = (): boolean => {
    const errors: ValidationErrors = {};
    errors.email = validateEmail(signInData.email);
    errors.password = signInData.password ? undefined : "Password is required";

    setSignInErrors(errors);
    return !errors.email && !errors.password;
  };

  const validateSignUp = (): boolean => {
    const errors: ValidationErrors = {};
    errors.fullName = validateFullName(signUpData.fullName);
    errors.email = validateEmail(signUpData.email);
    errors.password = validatePassword(signUpData.password);

    if (!signUpData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setSignUpErrors(errors);
    return !errors.fullName && !errors.email && !errors.password && !errors.confirmPassword;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignIn()) return;

    setIsLoading(true);
    try {
      await signIn(signInData.email, signInData.password);
    } catch (error: any) {
      const message = error?.message || "Sign in failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUp()) return;

    setIsLoading(true);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.fullName, "client");
    } catch (error: any) {
      const message = error?.message || "Sign up failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    window.location.href = "/forgot-password";
  };

  // Clear errors when switching forms
  const handleToggleToSignUp = () => {
    setIsActive(true);
    setSignInErrors({});
  };

  const handleToggleToSignIn = () => {
    setIsActive(false);
    setSignUpErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-page-bg p-4">
      <div className={`auth-container ${isActive ? "active" : ""}`}>
        {/* Sign In Form */}
        <div className={`auth-form-box ${isActive ? "auth-form-box-hidden" : ""}`}>
          <form onSubmit={handleSignIn} className="w-full">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Welcome back to BIMS</p>

            <div className="auth-input-box">
              <input
                type="email"
                placeholder="Email"
                value={signInData.email}
                onChange={(e) => {
                  setSignInData({ ...signInData, email: e.target.value });
                  if (signInErrors.email) setSignInErrors({ ...signInErrors, email: undefined });
                }}
                className={signInErrors.email ? "border-red-500" : ""}
              />
              <Mail className="auth-input-icon" />
            </div>
            {signInErrors.email && (
              <p className="text-red-500 text-xs mt-1 mb-2 text-left">{signInErrors.email}</p>
            )}

            <div className="auth-input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={signInData.password}
                onChange={(e) => {
                  setSignInData({ ...signInData, password: e.target.value });
                  if (signInErrors.password) setSignInErrors({ ...signInErrors, password: undefined });
                }}
                className={signInErrors.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-input-icon-btn"
              >
                {showPassword ? <EyeOff className="auth-input-icon" /> : <Eye className="auth-input-icon" />}
              </button>
            </div>
            {signInErrors.password && (
              <p className="text-red-500 text-xs mt-1 mb-2 text-left">{signInErrors.password}</p>
            )}

            <div className="auth-forgot-link">
              <button type="button" onClick={handleForgotPassword}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className={`auth-form-box auth-form-register ${isActive ? "auth-form-register-visible" : ""}`}>
          <form onSubmit={handleSignUp} className="w-full">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join BIMS today</p>

            <div className="auth-input-box">
              <input
                type="text"
                placeholder="Full Name"
                value={signUpData.fullName}
                onChange={(e) => {
                  setSignUpData({ ...signUpData, fullName: e.target.value });
                  if (signUpErrors.fullName) setSignUpErrors({ ...signUpErrors, fullName: undefined });
                }}
                className={signUpErrors.fullName ? "border-red-500" : ""}
              />
              <User className="auth-input-icon" />
            </div>
            {signUpErrors.fullName && (
              <p className="text-red-500 text-xs mt-1 mb-2 text-left">{signUpErrors.fullName}</p>
            )}

            <div className="auth-input-box">
              <input
                type="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) => {
                  setSignUpData({ ...signUpData, email: e.target.value });
                  if (signUpErrors.email) setSignUpErrors({ ...signUpErrors, email: undefined });
                }}
                className={signUpErrors.email ? "border-red-500" : ""}
              />
              <Mail className="auth-input-icon" />
            </div>
            {signUpErrors.email && (
              <p className="text-red-500 text-xs mt-1 mb-2 text-left">{signUpErrors.email}</p>
            )}

            <div className="auth-input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={signUpData.password}
                onChange={(e) => {
                  setSignUpData({ ...signUpData, password: e.target.value });
                  if (signUpErrors.password) setSignUpErrors({ ...signUpErrors, password: undefined });
                }}
                className={signUpErrors.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-input-icon-btn"
              >
                {showPassword ? <EyeOff className="auth-input-icon" /> : <Eye className="auth-input-icon" />}
              </button>
            </div>
            {signUpErrors.password && (
              <p className="text-red-500 text-xs mt-1 mb-2 text-left">{signUpErrors.password}</p>
            )}

            <div className="auth-input-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={signUpData.confirmPassword}
                onChange={(e) => {
                  setSignUpData({ ...signUpData, confirmPassword: e.target.value });
                  if (signUpErrors.confirmPassword) setSignUpErrors({ ...signUpErrors, confirmPassword: undefined });
                }}
                className={signUpErrors.confirmPassword ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-input-icon-btn"
              >
                {showConfirmPassword ? <EyeOff className="auth-input-icon" /> : <Eye className="auth-input-icon" />}
              </button>
            </div>
            {signUpErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 mb-2 text-left">{signUpErrors.confirmPassword}</p>
            )}



            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* Toggle Box */}
        <div className="auth-toggle-box">
          <div className={`auth-toggle-panel auth-toggle-left ${isActive ? "auth-toggle-left-hidden" : ""}`}>
            <h1>Hello, Friend!</h1>
            <p>Don't have an account? Register with your personal details</p>
            <button className="auth-toggle-btn" onClick={handleToggleToSignUp}>
              Sign Up
            </button>
          </div>

          <div className={`auth-toggle-panel auth-toggle-right ${isActive ? "auth-toggle-right-visible" : ""}`}>
            <h1>Welcome Back!</h1>
            <p>Already have an account? Sign in to continue</p>
            <button className="auth-toggle-btn" onClick={handleToggleToSignIn}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
