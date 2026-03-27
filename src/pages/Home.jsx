import { Link } from "react-router-dom";
import { useEffect } from "react";
import ScanButton from "../components/ScanButton";
import krishnaBackground from "../assets/krishnaBackground.png";

// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM) & SECURITY CONTEXT
// ============================================================================
//
// SECURITY CONSIDERATIONS & MEASURES:
// 1. Geolocation Privacy: Never track continuously without explicit explicit consent. Location should be collected strictly for targeted features (like finding nearby monuments).
// 2. Data Minimization: Any location data sent to the backend must be anonymized for unauthenticated users.
// 3. Content Security Policy (CSP): Enforce strict CSP headers on the server to mitigate Cross-Site Scripting (XSS) risks from embedded images or media.
// 4. Rate Limiting: Location logging should be rate-limited by IP to prevent API abuse or DoS.
//
// API: POST /api/v1/telemetry/location
// Description: Logs broad location telemetry for targeting featured content or nearby monuments.
/*
Expected Request Headers: 
  { 
    "Content-Type": "application/json",
    "X-CSRF-Token": "string (if session based)" 
  }
Expected Request Body: 
  { 
    latitude: number (sanitized), 
    longitude: number (sanitized), 
    accuracy: number 
  }
Expected Response (200 OK): 
  { 
    status: "success", 
    regionalConfig: { 
      recommendedLanguage: "en", 
      nearbyCount: number 
    } 
  }
*/

export default function Home() {
	// Request location permission on first visit
	useEffect(() => {
		const hasRequestedLocation = localStorage.getItem(
			"locationPermissionRequested",
		);

		if (!hasRequestedLocation && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					console.log("Location permission granted:", position);
					localStorage.setItem("locationPermissionRequested", "true");
				},
				(error) => {
					console.log("Location permission denied:", error);
					localStorage.setItem("locationPermissionRequested", "true");
				},
			);
		}
	}, []);
	return (
		<div className="w-full min-h-screen bg-surface flex flex-col">
			{/* Background Image Section with Header Overlay */}
			<div
				className="w-full h-96 relative flex flex-col items-center justify-end opacity-60"
				style={{
					backgroundImage: `url(${krishnaBackground})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				{/* Gradient overlay for better text readability */}
				<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/70"></div>

				{/* Header overlaid on background */}
				<div className="relative z-10 text-center space-y-3 pb-8 px-4">
					<h2
						className="font-label text-xs uppercase tracking-[0.2em] font-bold text-white"
						style={{ color: "#fef5f0" }}
					>
						Heritage Gatha
					</h2>
					<h1
						className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tight"
						style={{ color: "#fef5f0" }}
					>
						Every Stone
						<br />
						<span style={{ color: "#fef5f0" }}>Has a Story.</span>
					</h1>
				</div>
			</div>

			<main className="relative z-10 flex-1 w-full text-center space-y-8 px-4 md:px-8 py-12">
				{/* Description */}
				<div>
					<p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
						Uncover the hidden histories of ancient monuments using
						your digital lens.
					</p>
				</div>

				{/* Scan Button */}
				<div className="my-12 pt-8">
					<ScanButton />
				</div>

				{/* CTA Buttons */}
				<div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
					{/* <Link
						to="/login"
						className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all artifact-shadow"
					>
						SCAN NOW
					</Link> */}
					<Link
						to="/monument/1"
						className="px-8 py-4 bg-surface-container text-primary font-bold rounded-xl hover:bg-surface-container-high transition-all"
					>
						Explore Monuments
					</Link>
				</div>
			</main>
		</div>
	);
}
