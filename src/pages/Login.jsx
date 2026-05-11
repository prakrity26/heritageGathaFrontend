import { useState, useRef } from "react";          // ← Added useRef
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	loginStart,
	loginSuccess,
	loginFailure,
	registerStart,
	registerSuccess,
	registerFailure,
	clearError,
} from "../store/authSlice";
import authService from "../services/auth.service";

export default function Login() {
	const [activeTab, setActiveTab] = useState("signin");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	// ── Redux state ──
	const { loading, error, successMessage, isLoggedIn } = useSelector(
		(state) => state.auth,
	);

	// ── Double‑submit guard ref ──
	const isSubmitting = useRef(false);

	// Sign In Form State
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [keepAuth, setKeepAuth] = useState(false);
	const [localError, setLocalError] = useState("");

	// Sign Up Form State
	const [signupName, setSignupName] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupNationality, setSignupNationality] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
	const [signupLocalError, setSignupLocalError] = useState("");

	const clearErrors = () => {
		setLocalError("");
		dispatch(clearError());
	};

	const clearSignupErrors = () => {
		setSignupLocalError("");
		dispatch(clearError());
	};

	// ── LOGIN HANDLER ──
	const handleLoginSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting.current) return;
		isSubmitting.current = true;
		clearErrors();

		if (!email || !password) {
			setLocalError("Please enter your email and password");
			isSubmitting.current = false;
			return;
		}

		try {
			dispatch(loginStart());
			const result = await authService.login(email, password);

			if (result.success) {
				const userData = result.data;
				dispatch(
					loginSuccess({
						user: userData.user || {
							id: userData.id,
							full_name: userData.full_name,
							email: userData.email,
							role: userData.role,
							nationality: userData.nationality,
							verified: userData.verified,
						},
						accessToken: userData.accessToken,
						refreshToken: userData.refreshToken,
					}),
				);

				const returnUrl = location.state?.returnUrl || "/";
				navigate(returnUrl);
			} else {
				dispatch(loginFailure(result.message));
				setLocalError(result.message);
			}
		} catch (err) {
			const errorMsg = err.message || "An unexpected error occurred";
			dispatch(loginFailure(errorMsg));
			setLocalError(errorMsg);
		} finally {
			isSubmitting.current = false;
		}
	};

	// ── REGISTER HANDLER ──
	const handleSignupSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting.current) return;
		isSubmitting.current = true;
		clearSignupErrors();

		// Client‑side validation
		if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
			setSignupLocalError("All fields are required");
			isSubmitting.current = false;
			return;
		}
		if (signupPassword !== signupConfirmPassword) {
			setSignupLocalError("Passwords do not match");
			isSubmitting.current = false;
			return;
		}
		if (signupPassword.length < 8) {
			setSignupLocalError("Password must be at least 8 characters long");
			isSubmitting.current = false;
			return;
		}
		if (!/[A-Z]/.test(signupPassword)) {
			setSignupLocalError("Password must contain at least one uppercase letter");
			isSubmitting.current = false;
			return;
		}
		if (!/\d/.test(signupPassword)) {
			setSignupLocalError("Password must contain at least one number");
			isSubmitting.current = false;
			return;
		}

		try {
			dispatch(registerStart());
			const result = await authService.register({
				full_name: signupName,
				email: signupEmail,
				password: signupPassword,
				nationality: signupNationality || null,
			});

			if (result.success) {
				dispatch(registerSuccess({ message: result.message }));
				navigate("/verify-otp", { state: { email: signupEmail } });
			} else {
				dispatch(registerFailure(result.message));
				setSignupLocalError(result.message);
			}
		} catch (err) {
			const errorMsg = err.message || "An unexpected error occurred";
			dispatch(registerFailure(errorMsg));
			setSignupLocalError(errorMsg);
		} finally {
			isSubmitting.current = false;
		}
	};

	// ── Redirect if already logged in ──
	if (isLoggedIn) {
		navigate("/");
		return null;
	}

	// ── JSX (unchanged) ──
	return (
		<div className="w-full min-h-screen flex items-center justify-center p-4 md:p-8">
			{/* Background Elements */}
			<div className="fixed inset-0 pointer-events-none opacity-15">
				<div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[100px]"></div>
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-container rounded-full blur-[100px]"></div>
			</div>

			<main className="relative z-10 w-full max-w-md">
				{/* Card Header */}
				<div className="bg-primary rounded-2xl p-8 md:p-10 text-white mb-6">
					<div className="flex items-center gap-2 mb-6">
						<span className="material-symbols-outlined text-3xl">account_balance</span>
						<h1 className="font-serif text-2xl font-bold">Heritage Gatha</h1>
					</div>
					<h2 className="font-serif text-3xl font-bold leading-tight mb-4">
						The stories of stone,
						<br />
						reimagined.
					</h2>
					<p className="text-white/90 text-sm font-body">
						Access the archival portal to curate monuments or share your echoes of history.
					</p>
				</div>

				{/* Login Form */}
				<div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-lg">
					{/* Tabs */}
					<div className="flex gap-4 mb-8">
						<button
							onClick={() => setActiveTab("signin")}
							className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
								activeTab === "signin"
									? "text-primary border-primary"
									: "text-on-surface-variant border-transparent hover:text-on-surface"
							}`}
						>
							Sign In
						</button>
						<button
							onClick={() => setActiveTab("signup")}
							className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
								activeTab === "signup"
									? "text-primary border-primary"
									: "text-on-surface-variant border-transparent hover:text-on-surface"
							}`}
						>
							Sign Up
						</button>
					</div>

					{/* Sign In Tab */}
					{activeTab === "signin" && (
						<form onSubmit={handleLoginSubmit}>
							<h3 className="font-serif text-2xl font-bold text-on-surface mb-8">Welcome Back</h3>

							{(error || localError) && (
								<div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-bold rounded-lg border-l-4 border-error">
									{error || localError}
									<button
										type="button"
										onClick={clearErrors}
										className="float-right text-lg hover:opacity-70"
									>
										×
									</button>
								</div>
							)}

							{successMessage && (
								<div className="mb-6 p-4 bg-success-container text-on-success-container text-sm font-bold rounded-lg border-l-4 border-success">
									{successMessage}
								</div>
							)}

							<p className="text-on-surface-variant text-sm mb-6">
								Enter your credentials to access the archival gateway.
							</p>

							{/* Email Input */}
							<div className="mb-6">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
									Email Address
								</label>
								<input
									type="email"
									value={email}
									onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
									placeholder="user@example.com"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
									required
									disabled={loading}
								/>
							</div>

							{/* Password Input */}
							<div className="mb-6">
								<div className="flex justify-between items-center mb-2">
									<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant">Password</label>
									<Link to="/forgot-password" className="text-primary text-sm font-bold hover:underline">
										Forgot?
									</Link>
								</div>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
										placeholder="••••••••"
										className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors pr-12 disabled:opacity-50"
										required
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
										disabled={loading}
									>
										<span className="material-symbols-outlined text-xl">
											{showPassword ? "visibility" : "visibility_off"}
										</span>
									</button>
								</div>
							</div>

							{/* Keep Auth Checkbox */}
							<label className="flex items-center gap-3 mb-8">
								<input
									type="checkbox"
									checked={keepAuth}
									onChange={(e) => setKeepAuth(e.target.checked)}
									className="w-4 h-4 accent-primary rounded disabled:opacity-50"
									disabled={loading}
								/>
								<span className="text-sm text-on-surface-variant font-body">
									Keep me authenticated for 30 days
								</span>
							</label>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-primary text-white py-3 rounded-xl font-bold font-body flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
							>
								{loading ? (
									<>
										<span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
										Signing in...
									</>
								) : (
									<>
										Enter Portal
										<span className="material-symbols-outlined">arrow_forward</span>
									</>
								)}
							</button>
						</form>
					)}

					{/* Sign Up Tab */}
					{activeTab === "signup" && (
						<form onSubmit={handleSignupSubmit}>
							<h3 className="font-serif text-2xl font-bold text-on-surface mb-8">Create Account</h3>

							{(error || signupLocalError) && (
								<div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-bold rounded-lg border-l-4 border-error">
									{error || signupLocalError}
									<button
										type="button"
										onClick={clearSignupErrors}
										className="float-right text-lg hover:opacity-70"
									>
										×
									</button>
								</div>
							)}

							<p className="text-on-surface-variant text-sm mb-6">Join our community of heritage enthusiasts.</p>

							{/* Full Name */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Full Name</label>
								<input
									type="text"
									value={signupName}
									onChange={(e) => { setSignupName(e.target.value); clearSignupErrors(); }}
									placeholder="Your full name"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
									disabled={loading}
								/>
							</div>

							{/* Email */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Email Address</label>
								<input
									type="email"
									value={signupEmail}
									onChange={(e) => { setSignupEmail(e.target.value); clearSignupErrors(); }}
									placeholder="example@example.com"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
									disabled={loading}
								/>
							</div>

							{/* Nationality */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Nationality</label>
								<input
									type="text"
									value={signupNationality}
									onChange={(e) => { setSignupNationality(e.target.value); clearSignupErrors(); }}
									placeholder="e.g., Nepalese"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
									disabled={loading}
								/>
							</div>

							{/* Password */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Password</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										value={signupPassword}
										onChange={(e) => { setSignupPassword(e.target.value); clearSignupErrors(); }}
										placeholder="Create a strong password"
										className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors pr-12 disabled:opacity-50"
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
										disabled={loading}
									>
										<span className="material-symbols-outlined text-xl">
											{showPassword ? "visibility" : "visibility_off"}
										</span>
									</button>
								</div>
								<p className="text-xs text-on-surface-variant mt-2">
									Min 8 chars, 1 uppercase, 1 number
								</p>
							</div>

							{/* Confirm Password */}
							<div className="mb-6">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">Confirm Password</label>
								<div className="relative">
									<input
										type={showConfirmPassword ? "text" : "password"}
										value={signupConfirmPassword}
										onChange={(e) => { setSignupConfirmPassword(e.target.value); clearSignupErrors(); }}
										placeholder="Confirm your password"
										className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors pr-12 disabled:opacity-50"
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
										disabled={loading}
									>
										<span className="material-symbols-outlined text-xl">
											{showConfirmPassword ? "visibility" : "visibility_off"}
										</span>
									</button>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-primary text-white py-3 rounded-xl font-bold font-body flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
							>
								{loading ? (
									<>
										<span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
										Creating Account...
									</>
								) : (
									<>
										Create Account
										<span className="material-symbols-outlined">person_add</span>
									</>
								)}
							</button>

							<p className="text-center text-sm text-on-surface-variant mt-6 font-body">
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => { setActiveTab("signin"); clearSignupErrors(); }}
									className="text-primary font-bold hover:underline"
								>
									Sign In
								</button>
							</p>
						</form>
					)}
				</div>
			</main>
		</div>
	);
}