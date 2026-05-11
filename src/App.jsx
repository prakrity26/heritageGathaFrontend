import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import OTPVerification from "./pages/OTPVerification";
import MonumentDetail from "./pages/MonumentDetail";
import ProvideFeedback from "./pages/ProvideFeedback";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import MonumentManagement from "./pages/admin/MonumentManagement";
import MonumentEditor from "./pages/admin/MonumentEditor";
import AnalyzingMonument from "./pages/admin/AnalyzingMonument";
import FeedbackHub from "./pages/admin/FeedbackHub";
import AudioGeneration from "./pages/admin/AudioGeneration";
import Settings from "./pages/admin/Settings";
import UserDashboard from "./pages/UserDashboard";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";

export default function App() {
	return (
		<Router>
			<Toaster position="top-right" />
			<Routes>
				{/* Public Routes */}
				<Route element={<PublicLayout />}>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />{" "}
					<Route path="/verify-otp" element={<OTPVerification />} />{" "}
					<Route path="/monument/:id" element={<MonumentDetail />} />
					<Route
						path="/monument/:id/feedback"
						element={<ProvideFeedback />}
					/>
					<Route path="/dashboard" element={<UserDashboard />} />
				</Route>

				{/* Admin Routes */}
				<Route element={<AdminLayout />}>
					<Route
						path="/admin/dashboard"
						element={<AdminDashboard />}
					/>
					<Route
						path="/admin/monuments"
						element={<MonumentManagement />}
					/>
					<Route
						path="/admin/monument/new"
						element={<MonumentEditor />}
					/>
					<Route
						path="/admin/monument/:id/edit"
						element={<MonumentEditor />}
					/>
					<Route
						path="/admin/monument/:id/analyze"
						element={<AnalyzingMonument />}
					/>
					<Route path="/admin/feedback" element={<FeedbackHub />} />
					<Route
						path="/admin/audio-gen"
						element={<AudioGeneration />}
					/>
					<Route path="/admin/settings" element={<Settings />} />
				</Route>

				{/* Catch all */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Router>
	);
}

