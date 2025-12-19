import { useState } from "react";
import { toast } from "sonner";
import { Mail, Key, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            toast.success("Validation code sent to your email!");
            setStep(2);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reset code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: email.trim(),
                code: code.trim(),
                newPassword
            });
            toast.success("Password reset successful! You can now sign in.");
            navigate("/auth");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center auth-page-bg p-4 relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="auth-container !static !w-full !m-0" style={{
                maxWidth: "500px",
                height: "auto",
                minHeight: "550px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                zIndex: 10,
                position: "relative",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "30px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
            }}>
                <div
                    className="w-full h-full flex flex-col items-center justify-center p-8 md:p-12"
                    style={{ color: "#333", textAlign: "center" }}
                >
                    <Link
                        to="/auth"
                        className="absolute top-8 left-8 text-gray-400 hover:text-black transition-all transform hover:scale-110"
                    >
                        <div className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                    </Link>

                    <div className="w-full space-y-3 mb-10">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Forgot Password
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base max-w-[300px] mx-auto leading-relaxed">
                            {step === 1
                                ? "Forgot your password? No worries! Enter your email to get a reset code."
                                : "Great! Check your inbox for the validation code and enter it below."}
                        </p>
                    </div>

                    <div className="w-full max-w-sm mx-auto">
                        {step === 1 ? (
                            <form onSubmit={handleRequestCode} className="space-y-6">
                                <div className="auth-input-box !my-0">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full !bg-white border border-gray-200 focus:border-blue-500 transition-all shadow-sm !rounded-xl"
                                        required
                                    />
                                    <Mail className="auth-input-icon !text-gray-400" />
                                </div>
                                <button
                                    type="submit"
                                    className="auth-btn !mt-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all !rounded-xl"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending..." : "Request Reset Code"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="auth-input-box !my-0">
                                    <input
                                        type="text"
                                        placeholder="6-Digit Code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full !bg-white border border-gray-200 focus:border-blue-500 transition-all font-mono tracking-widest text-center !rounded-xl"
                                        maxLength={6}
                                        required
                                    />
                                    <Key className="auth-input-icon !text-gray-400" />
                                </div>

                                <div className="auth-input-box !my-0">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full !bg-white border border-gray-200 focus:border-blue-500 transition-all !rounded-xl"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="auth-input-icon-btn !right-4"
                                    >
                                        {showPassword ? <EyeOff className="auth-input-icon !text-gray-400" /> : <Eye className="auth-input-icon !text-gray-400" />}
                                    </button>
                                </div>

                                <div className="auth-input-box !my-0">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full !bg-white border border-gray-200 focus:border-blue-500 transition-all !rounded-xl"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="auth-input-icon-btn !right-4"
                                    >
                                        {showConfirmPassword ? <EyeOff className="auth-input-icon !text-gray-400" /> : <Eye className="auth-input-icon !text-gray-400" />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-btn !mt-4 shadow-lg shadow-blue-500/20 active:scale-95 transition-all !rounded-xl"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Updating..." : "Change Password"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-center mt-4 text-sm font-medium text-gray-400 hover:text-blue-500 transition-all"
                                    disabled={isLoading}
                                >
                                    Didn't receive a code? Send again
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
