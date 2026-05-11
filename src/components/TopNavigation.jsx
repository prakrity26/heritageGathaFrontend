import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/languageSlice";
import { logout } from "../store/authSlice";

export default function TopNavigation() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const [showLanguageMenu, setShowLanguageMenu] = useState(false);
	const [showProfileMenu, setShowProfileMenu] = useState(false);

	const selectedLanguage = useSelector((state) => state.language.language);
	const { isLoggedIn, user } = useSelector((state) => state.auth);
	const isLoginPage = location.pathname === "/login";

	const languages = [
		{ code: "en", label: "English", icon: "🇺🇸" },
		{ code: "hi", label: "Hindi", icon: "🇮🇳" },
		{ code: "ne", label: "Nepali", icon: "🇳🇵" },
	];

	const handleLanguageSelect = (code) => {
		dispatch(setLanguage(code));
		setShowLanguageMenu(false);
	};

	const handleLogout = () => {
		dispatch(logout());
		setShowProfileMenu(false);
		navigate("/");
	};
	return (
		<header className="fixed top-0 w-full z-50 bg-gradient-to-br from-primary/8 to-surface backdrop-blur-md border-b border-surface-variant shadow-sm flex justify-between items-center px-6 h-16">
			<Link to="/" className="flex items-center gap-2">
				<span className="text-2xl font-serif italic text-primary">
					Heritage Gatha
				</span>
			</Link>

			<div className="hidden md:flex gap-8 items-center">
				<a
					href="#explore"
					className="text-on-surface-variant font-medium hover:text-primary transition-colors"
				>
					Explore
				</a>
				<a
					href="#map"
					className="text-on-surface-variant font-medium hover:text-primary transition-colors"
				>
					Map
				</a>
				<a
					href="#timeline"
					className="text-on-surface-variant font-medium hover:text-primary transition-colors"
				>
					Timeline
				</a>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative">
					<button
						onClick={() => setShowLanguageMenu(!showLanguageMenu)}
						className="p-1 hover:bg-surface-container-low rounded-xl transition-colors flex items-center gap-2"
					>
						<span className="text-2xl">
							{
								languages.find(
									(l) => l.code === selectedLanguage,
								)?.icon
							}
						</span>
						<span className="text-xs font-black text-on-surface uppercase tracking-widest hidden md:inline">
							{
								languages.find(
									(l) => l.code === selectedLanguage,
								)?.label
							}
						</span>
					</button>

					{showLanguageMenu && (
						<div className="absolute top-12 right-0 bg-surface border border-surface-variant rounded-xl shadow-lg p-2 z-50 min-w-40">
							{languages.map((lang) => (
								<button
									key={lang.code}
									onClick={() =>
										handleLanguageSelect(lang.code)
									}
									className={`w-full px-4 py-2 rounded-lg text-left flex items-center gap-2 transition-colors ${
										selectedLanguage === lang.code
											? "bg-primary/15 text-primary font-medium"
											: "text-on-surface hover:bg-surface-container"
									}`}
								>
									<span>{lang.icon}</span>
									<span>{lang.label}</span>
								</button>
							))}
						</div>
					)}
				</div>

				{isLoggedIn ? (
					<div className="relative">
						<button
							onClick={() => setShowProfileMenu(!showProfileMenu)}
							className="p-2 hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center"
						>
							{user?.profileImage ? (
								<img
									src={user.profileImage}
									alt={user.name}
									className="w-8 h-8 rounded-full object-cover"
								/>
							) : (
								<span className="material-symbols-outlined text-primary">
									account_circle
								</span>
							)}
						</button>

						{showProfileMenu && (
							<div className="absolute top-12 right-0 bg-surface border border-surface-variant rounded-xl shadow-lg p-3 z-50 min-w-48">
								<div className="px-3 py-2 border-b border-surface-variant mb-2">
									<p className="font-semibold text-on-surface">
										{user?.name || "User"}
									</p>
									<p className="text-xs text-on-surface-variant">
										{user?.email || ""}
									</p>
								</div>
								<Link
									to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
									onClick={() => setShowProfileMenu(false)}
									className="w-full px-3 py-2 rounded-lg text-left text-on-surface hover:bg-surface-container transition-colors block"
								>
									Dashboard
								</Link>
								<button
									onClick={handleLogout}
									className="w-full px-3 py-2 rounded-lg text-left text-error hover:bg-error-container transition-colors mt-2"
								>
									Logout
								</button>
							</div>
						)}
					</div>
				) : !isLoginPage ? (
					<Link
						to="/login"
						className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-all"
					>
						Sign In
					</Link>
				) : null}
			</div>
		</header>
	);
}
