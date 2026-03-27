import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
	const location = useLocation();

	// Auth Guard for all admin routes
	if (!isLoggedIn) {
		return (
			<Navigate
				to="/login"
				state={{ returnUrl: location.pathname }}
				replace
			/>
		);
	}

	return (
		<div className="w-full min-h-screen bg-surface flex">
			<AdminSidebar />
			<main className="flex-1 lg:ml-64">
				<Outlet />
			</main>
		</div>
	);
}
