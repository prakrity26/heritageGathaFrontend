import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

export default function AdminSidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const isActive = (path) => location.pathname.startsWith(path);

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
	};

	const navItems = [
		{ path: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
		{
			path: "/admin/monuments",
			icon: "account_balance",
			label: "Monuments",
		},
		{
			path: "/admin/audio-gen",
			icon: "record_voice_over",
			label: "Audio Generation",
		},
		{ path: "/admin/feedback", icon: "reviews", label: "Feedback" },
		{ path: "/admin/settings", icon: "settings", label: "Settings" },
	];

	return (
		<aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-surface-variant py-6 z-40">
			<div className="px-6 mb-10">
				<h1 className="text-xl font-bold text-primary font-serif">
					Heritage Admin
				</h1>
				<p className="font-body font-medium uppercase tracking-widest text-[10px] text-on-surface-variant mt-1">
					Curator Portal
				</p>
			</div>

			<nav className="flex-1 space-y-1 px-2">
				{navItems.map((item) => (
					<Link
						key={item.path}
						to={item.path}
						className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-lg transition-all ${
							isActive(item.path)
								? "bg-primary text-white"
								: "text-on-surface-variant hover:bg-surface-container"
						}`}
					>
						<span className="material-symbols-outlined text-lg">
							{item.icon}
						</span>
						<span className="font-body font-medium uppercase tracking-widest text-xs">
							{item.label}
						</span>
					</Link>
				))}
			</nav>

			<div className="px-4 mb-6">
				<Link
					to="/admin/monument/new"
					className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 artifact-shadow hover:opacity-90 transition-all"
				>
					<span className="material-symbols-outlined">add</span>
					New Monument
				</Link>
			</div>

			<div className="border-t border-outline-variant/10 pt-4 px-2 mt-auto">
				<button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all">
					<span className="material-symbols-outlined text-lg">
						help
					</span>
					<span className="font-body font-medium uppercase tracking-widest text-xs">
						Support
					</span>
				</button>
				<button
					onClick={handleLogout}
					className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container rounded-lg transition-all"
				>
					<span className="material-symbols-outlined text-lg">
						logout
					</span>
					<span className="font-body font-medium uppercase tracking-widest text-xs">
						Logout
					</span>
				</button>
			</div>
		</aside>
	);
}
