import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";

export default function OTPVerification() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [error, setError] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [timer, setTimer] = useState(60);
	const [canResend, setCanResend] = useState(false);
	const inputRefs = useRef([]);

	// Get email from navigation state
	const email = location.state?.email || "";

	// Resend timer countdown
	useEffect(() => {
		if (timer > 0 && !canResend) {
			const interval = setTimeout(() => setTimer(timer - 1), 1000);
			return () => clearTimeout(interval);
		}
		if (timer === 0) {
			setCanResend(true);
		}
	}, [timer, canResend]);

	// Handle OTP input
	const handleOtpChange = (index, value) => {
		if (!/^[0-9]*$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	// Handle backspace
	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	// Verify OTP
	const handleVerify = async () => {
		const otpCode = otp.join("");

		if (otpCode.length !== 6) {
			setError("Please enter all 6 digits");
			return;
		}

		setIsVerifying(true);
		setError("");

		try {
			// API call to verify OTP
			// POST /api/v1/auth/verify-otp
			const response = await fetch(
				"http://localhost:8000/api/v1/auth/verify-otp",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, otp: otpCode }),
				},
			);

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Invalid OTP. Please try again.");
				return;
			}

			// On success, save token and redirect
			if (data.status === "success") {
				localStorage.setItem("token", data.data.token);
				dispatch(login({ ...data.data.user }));
				navigate("/");
			}
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setIsVerifying(false);
		}
	};

	// Resend OTP
	const handleResendOtp = async () => {
		setIsResending(true);
		setError("");

		try {
			// API call to resend OTP
			// POST /api/v1/auth/resend-otp
			const response = await fetch(
				"http://localhost:8000/api/v1/auth/resend-otp",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				},
			);

			const data = await response.json();

			if (response.ok && data.status === "success") {
				setOtp(["", "", "", "", "", ""]);
				setTimer(60);
				setCanResend(false);
			} else {
				setError(data.message || "Failed to resend OTP.");
			}
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	// Allow Enter key to verify
	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleVerify();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-surface to-surface-container-low flex items-center justify-center p-4">
			{/* Background decorative elements */}
			<div className="absolute top-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
			<div className="absolute bottom-20 left-10 w-56 h-56 bg-tertiary/10 rounded-full blur-3xl"></div>

			{/* Main card */}
			<div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full backdrop-blur">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center">
						<span className="material-symbols-outlined text-white text-3xl">
							verified_user
						</span>
					</div>
					<h1 className="font-serif text-3xl font-bold text-on-surface mb-2">
						Verify Email
					</h1>
					<p className="text-on-surface-variant text-sm">
						We've sent a 6-digit code to <br />
						<span className="font-bold text-primary">{email}</span>
					</p>
				</div>

				{/* OTP Input Grid */}
				<div className="mb-8">
					<div className="grid grid-cols-6 gap-3 mb-4">
						{otp.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type="text"
								maxLength="1"
								value={digit}
								onChange={(e) =>
									handleOtpChange(index, e.target.value)
								}
								onKeyDown={(e) => handleKeyDown(index, e)}
								onKeyPress={handleKeyPress}
								className={`w-full h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
									digit
										? "border-primary bg-primary/5"
										: "border-outline bg-surface-container-low"
								} focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
							/>
						))}
					</div>

					{error && (
						<div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg text-sm">
							<span className="material-symbols-outlined text-sm">
								error
							</span>
							{error}
						</div>
					)}
				</div>

				{/* Verify Button */}
				<button
					onClick={handleVerify}
					disabled={isVerifying || otp.join("").length !== 6}
					className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
				>
					{isVerifying ? (
						<>
							<span className="material-symbols-outlined animate-spin">
								loading
							</span>
							Verifying...
						</>
					) : (
						<>
							<span className="material-symbols-outlined">
								check_circle
							</span>
							Verify OTP
						</>
					)}
				</button>

				{/* Resend Section */}
				<div className="text-center">
					<p className="text-sm text-on-surface-variant mb-3">
						Didn't receive the code?
					</p>
					{canResend ? (
						<button
							onClick={handleResendOtp}
							disabled={isResending}
							className="text-primary font-bold hover:text-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
						>
							{isResending ? (
								<>
									<span className="material-symbols-outlined text-sm animate-spin">
										loading
									</span>
									Sending...
								</>
							) : (
								<>
									<span className="material-symbols-outlined text-lg">
										refresh
									</span>
									Resend OTP
								</>
							)}
						</button>
					) : (
						<p className="text-sm text-on-surface-variant">
							Resend in{" "}
							<span className="font-bold text-primary">
								{timer}s
							</span>
						</p>
					)}
				</div>

				{/* Help text */}
				<div className="mt-8 pt-6 border-t border-outline">
					<p className="text-xs text-on-surface-variant text-center">
						Having trouble?{" "}
						<button
							onClick={() => navigate("/login")}
							className="text-tertiary font-bold hover:underline"
						>
							Go back to login
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
