import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";

// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM) & SECURITY CONTEXT
// ============================================================================
//
// SECURITY CONSIDERATIONS & THREAT MITIGATION:
// 1. Session Management (Crucial against XSS): Avoid storing JWTs in localStorage. Backend MUST issue `HttpOnly`, `Secure`, `SameSite=Strict` cookies for authentication tokens.
// 2. CSRF Protection: Backend must implement an Anti-CSRF token pattern for all state-changing operations (/login, /register).
// 3. Brute Force & Credential Stuffing: Implement rigorous rate-limiting recursively (e.g., max 5 attempts per 15 mins per IP/User) on authentication endpoints.
// 4. SQL/NoSQL Injection: All backend endpoints must strictly use Parameterized Queries or secure ORMs. Validate and sanitize every input string.
// 5. Password Hashing: Backend must strictly store passwords using heavily peppered modern algorithms (Argon2id or bcrypt).
// 6. Data Validation: Ensure strict regex validation for emails. Both frontend and backend must enforce password strength (e.g., min. 8 characters, mixed case, numbers, special characters).
//
// API: POST /api/v1/auth/login
// Description: Authenticates user credentials and sets an HttpOnly cookie session.
/*
Expected Request Headers: { "X-CSRF-Token": "string", "Content-Type": "application/json" }
Expected Request Body: { 
	email: "user@example.com (sanitized, validated format)", 
	password: "raw_password", 
	keepAuth: boolean 
}
Expected Response Success (200 OK): 
	{ 
		status: "success", 
		user: { id: "uuid", name: "string", email: "string", role: "user|admin" } 
	} // Tokens are handled intrinsically by the browser via 'Set-Cookie' header
Expected Response Error (401 Unauthorized / 429 Too Many Requests): 
	{ error: "Invalid credentials" | "Rate limit exceeded" }
*/

// API: POST /api/v1/auth/register
// Description: Registers a new user with strict data sanitization and password verification.
/*
Expected Request Headers: { "X-CSRF-Token": "string", "Content-Type": "application/json" }
Expected Request Body: { 
	name: "string (max 100 chars)", 
	email: "user@example.com (validated uniquely)", 
	nationality: "string", 
	password: "raw_password (complex)", 
	confirmPassword: "raw_password (verified to match password)" 
}
Expected Response Success (201 Created): 
	{ status: "success", user: { id: "uuid", name: "string" } }
Expected Response Error (400 Bad Request / 409 Conflict): 
	{ error: "Validation failed" | "Email already in use" }
*/

export default function Login() {
	const [activeTab, setActiveTab] = useState("signin");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const [errorMsg, setErrorMsg] = useState("");

	// Sign In Form
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [keepAuth, setKeepAuth] = useState(false);

	// Sign Up Form
	const [signupName, setSignupName] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupNationality, setSignupNationality] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

	const handleLoginFunc = (e) => {
		e.preventDefault();
		setErrorMsg("");

		// TODO: REPLACE THIS WITH ACTUAL API CALL ONCE INTEGRATED
		// e.g., const res = await fetch('/api/v1/auth/login', { ... });
		// const data = await res.json();

		if (email === "admin" && password === "admin") {
			// Mocking Admin role
			dispatch(
				login({ id: "1", name: "System Admin", role: "admin", email }),
			);
			navigate("/admin/dashboard");
		} else if (email === "user" && password === "user") {
			// Mocking Standard role
			dispatch(
				login({ id: "2", name: "Standard User", role: "user", email }),
			);
			const returnUrl = location.state?.returnUrl || "/";
			navigate(returnUrl);
		} else {
			setErrorMsg(
				"Invalid credentials. Hint: use admin/admin or user/user",
			);
		}
	};

	const handleSignupFunc = async (e) => {
		e.preventDefault();
		setErrorMsg("");

		// Validation
		if (
			!signupName ||
			!signupEmail ||
			!signupPassword ||
			!signupConfirmPassword
		) {
			setErrorMsg("All fields are required");
			return;
		}

		if (signupPassword !== signupConfirmPassword) {
			setErrorMsg("Passwords do not match");
			return;
		}

		if (signupPassword.length < 6) {
			setErrorMsg("Password must be at least 6 characters");
			return;
		}

		try {
			const res = await fetch(
				"http://localhost:8000/api/v1/auth/register",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						full_name: signupName,
						email: signupEmail,
						password: signupPassword,
						confirm_password: signupConfirmPassword,
					}),
				},
			);

			const data = await res.json();

			if (!res.ok) {
				setErrorMsg(
					data.message || "Registration failed. Please try again.",
				);
				return;
			}

			// On success, navigate to OTP verification
			navigate("/verify-otp", { state: { email: signupEmail } });
		} catch (err) {
			setErrorMsg("Network error. Please ensure the backend is running.");
		}
	};

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
						<span className="material-symbols-outlined text-3xl">
							account_balance
						</span>
						<h1 className="font-serif text-2xl font-bold">
							Heritage Gatha
						</h1>
					</div>
					<h2 className="font-serif text-3xl font-bold leading-tight mb-4">
						The stories of stone,
						<br />
						reimagined.
					</h2>
					<p className="text-white/90 text-sm font-body">
						Access the archival portal to curate monuments or share
						your echoes of history.
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
						<form onSubmit={handleLoginFunc}>
							<h3 className="font-serif text-2xl font-bold text-on-surface mb-8">
								Welcome Back
							</h3>

							{errorMsg && (
								<div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-bold rounded-lg border-l-4 border-error">
									{errorMsg}
								</div>
							)}

							<p className="text-on-surface-variant text-sm mb-6">
								Enter your credentials to access the archival
								gateway.
							</p>

							{/* Email Input */}
							<div className="mb-6">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
									Email Address
								</label>
								<input
									type="text"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="user@gmail.com"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
									required
								/>
							</div>

							{/* Password Input with Toggle */}
							<div className="mb-6">
								<div className="flex justify-between items-center mb-2">
									<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant">
										Password
									</label>
									<button
										type="button"
										className="text-primary text-sm font-bold hover:underline"
									>
										Forgot?
									</button>
								</div>
								<div className="relative">
									<input
										type={
											showPassword ? "text" : "password"
										}
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										placeholder="••••••••"
										className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors pr-12"
										required
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
										aria-label="Toggle password visibility"
									>
										<span className="material-symbols-outlined text-xl">
											{showPassword
												? "visibility"
												: "visibility_off"}
										</span>
									</button>
								</div>
							</div>

							{/* Checkbox */}
							<label className="flex items-center gap-3 mb-8">
								<input
									type="checkbox"
									checked={keepAuth}
									onChange={(e) =>
										setKeepAuth(e.target.checked)
									}
									className="w-4 h-4 accent-primary rounded"
								/>
								<span className="text-sm text-on-surface-variant font-body">
									Keep me authenticated for 30 days
								</span>
							</label>

							{/* Submit Button */}
							<button
								type="submit"
								className="w-full bg-primary text-white py-3 rounded-xl font-bold font-body flex items-center justify-center gap-2 hover:opacity-90 transition-all artifact-shadow mb-6"
							>
								Enter Portal
								<span className="material-symbols-outlined">
									arrow_forward
								</span>
							</button>

							{/* Footer Link */}
							<div className="text-center text-sm text-on-surface-variant mt-8 font-body">
								Temp Login Hints:
								<div className="flex justify-center gap-4 mt-2 font-mono text-xs">
									<button
										type="button"
										onClick={() => {
											setEmail("admin");
											setPassword("admin");
										}}
										className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-high transition-colors"
									>
										Admin: admin/admin
									</button>
									<button
										type="button"
										onClick={() => {
											setEmail("user");
											setPassword("user");
										}}
										className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-high transition-colors"
									>
										User: user/user
									</button>
								</div>
							</div>
						</form>
					)}

					{/* Sign Up Tab */}
					{activeTab === "signup" && (
						<form onSubmit={handleSignupFunc}>
							<h3 className="font-serif text-2xl font-bold text-on-surface mb-8">
								Create Account
							</h3>
							<p className="text-on-surface-variant text-sm mb-6">
								Join our community of heritage enthusiasts.
							</p>

							{errorMsg && (
								<div className="mb-6 p-4 bg-error-container text-on-error-container text-sm font-bold rounded-lg border-l-4 border-error">
									{errorMsg}
								</div>
							)}

							{/* Name Input */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
									Full Name
								</label>
								<input
									type="text"
									value={signupName}
									onChange={(e) =>
										setSignupName(e.target.value)
									}
									placeholder="Your full name"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
								/>
							</div>

							{/* Email Input */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
									Email Address
								</label>
								<input
									type="email"
									value={signupEmail}
									onChange={(e) =>
										setSignupEmail(e.target.value)
									}
									placeholder="example@example.com"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
								/>
							</div>

							{/* Nationality Input */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
									Nationality
								</label>
								<input
									type="text"
									value={signupNationality}
									onChange={(e) =>
										setSignupNationality(e.target.value)
									}
									placeholder="e.g., Nepalese"
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
								/>
							</div>

							{/* Password Input with Toggle */}
							<div className="mb-5">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
									Password
								</label>
								<div className="relative">
									<input
										type={
											showPassword ? "text" : "password"
										}
										value={signupPassword}
										onChange={(e) =>
											setSignupPassword(e.target.value)
										}
										placeholder="Create a password"
										className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors pr-12"
									/>
									<button
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
										aria-label="Toggle password visibility"
									>
										<span className="material-symbols-outlined text-xl">
											{showPassword
												? "visibility"
												: "visibility_off"}
										</span>
									</button>
								</div>
							</div>

							{/* Confirm Password Input with Toggle */}
							<div className="mb-6">
								<label className="block font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">
									Confirm Password
								</label>
								<div className="relative">
									<input
										type={
											showConfirmPassword
												? "text"
												: "password"
										}
										value={signupConfirmPassword}
										onChange={(e) =>
											setSignupConfirmPassword(
												e.target.value,
											)
										}
										placeholder="Confirm your password"
										className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors pr-12"
									/>
									<button
										onClick={() =>
											setShowConfirmPassword(
												!showConfirmPassword,
											)
										}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
										aria-label="Toggle confirm password visibility"
									>
										<span className="material-symbols-outlined text-xl">
											{showConfirmPassword
												? "visibility"
												: "visibility_off"}
										</span>
									</button>
								</div>
							</div>

							{/* Create Account Button */}
							<button
								type="submit"
								className="w-full bg-primary text-white py-3 rounded-xl font-bold font-body flex items-center justify-center gap-2 hover:opacity-90 transition-all artifact-shadow mb-6"
							>
								Create Account
								<span className="material-symbols-outlined">
									person_add
								</span>
							</button>

							{/* Sign In Link */}
							<p className="text-center text-sm text-on-surface-variant mt-6 font-body">
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => setActiveTab("signin")}
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
