import { Outlet } from "react-router-dom";
import TopNavigation from "../components/TopNavigation";

export default function PublicLayout() {
	return (
		<div className="w-full min-h-screen bg-surface">
			<TopNavigation />
			<main className="pt-16">
				<Outlet />
			</main>
		</div>
	);
}
