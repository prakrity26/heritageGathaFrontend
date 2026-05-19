import { useLocation, useNavigate } from "react-router-dom";

export default function ScanError() {
	const navigate = useNavigate();
	const location = useLocation();

	// Default fallback values if navigated to directly
	const errorType = location.state?.errorType || "UNRECOGNIZED";
	const message = location.state?.message || "We could not recognize the monument. Please try to capture the monument or be physically present to the monument.";
	const distance = location.state?.distance;

	const isGeofenceError = errorType === "GEOFENCE";

	return (
		<div className="w-full min-h-screen bg-gradient-to-br from-[#fef8f5] via-surface to-[#f5f8fd] flex items-center justify-center p-6 relative overflow-hidden">
			{/* Decorative ambient background glows */}
			<div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
			<div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

			{/* Custom Close/Cross Icon at Top Left */}
			<button
				onClick={() => navigate("/")}
				className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-white border border-outline-variant/40 hover:bg-surface-container-low text-on-surface flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md group"
				aria-label="Back to Home"
			>
				<span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">
					close
				</span>
			</button>

			{/* Main Exception Card */}
			<div className="relative z-10 bg-white/80 backdrop-blur-xl border border-outline-variant/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center transform transition-all duration-500 scale-100">
				
				{/* Stylized Circular Ambient Header Icon */}
				<div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
					{/* Pulsing Outer Ring */}
					<div className={`absolute inset-0 rounded-full animate-ping opacity-15 ${isGeofenceError ? 'bg-primary' : 'bg-secondary'}`}></div>
					{/* Secondary Pulse Ring */}
					<div className={`absolute -inset-2 rounded-full opacity-10 ${isGeofenceError ? 'bg-primary' : 'bg-secondary'}`}></div>
					
					{/* Core Icon Container */}
					<div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
						isGeofenceError 
							? 'bg-gradient-to-br from-primary to-primary-container text-white' 
							: 'bg-gradient-to-br from-secondary to-[#8f7400] text-white'
					}`}>
						<span className="material-symbols-outlined text-4xl">
							{isGeofenceError ? "location_off" : "center_focus_weak"}
						</span>
					</div>
				</div>

				{/* Title and Subtitle */}
				<h1 className="font-serif text-3xl font-bold text-on-surface tracking-tight mb-2">
					{isGeofenceError ? "Verification Required" : "Heritage Scan Alert"}
				</h1>
				<p className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">
					Handled Scanner Exception
				</p>

				{/* Handled Exception Statement */}
				<p className="text-on-surface-variant text-sm leading-relaxed mb-6">
					HeritageGatha utilizes strict geolocation geofencing and computer vision checks to maintain narrative authenticity.
				</p>

				{/* Beautiful Custom Highlight Box */}
				<div className="bg-surface-container-low border-l-4 border-primary p-5 rounded-r-2xl my-6 text-left shadow-sm">
					<div className="flex items-start gap-3">
						<span className="material-symbols-outlined text-primary text-xl mt-0.5 select-none">
							info
						</span>
						<div>
							<h3 className="font-bold text-xs text-on-surface uppercase tracking-wider mb-1">
								Verification Log
							</h3>
							<p className="text-on-surface-variant font-medium text-sm leading-relaxed">
								{message}
							</p>
							{isGeofenceError && distance !== undefined && (
								<p className="text-primary text-xs font-bold mt-2">
									Detected Distance: {Math.round(distance)} meters from target
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Recommendations Panel */}
				<div className="text-left space-y-4 mb-8">
					<h3 className="font-bold text-sm text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2 mb-3">
						How to resolve this:
					</h3>

					<div className="flex gap-4 items-start">
						<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
							1
						</div>
						<div>
							<h4 className="font-bold text-sm text-on-surface">
								{isGeofenceError ? "Be Physically Present" : "Position Monument Centrally"}
							</h4>
							<p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
								{isGeofenceError 
									? "You must be standing within 500 meters of the monument's historical coordinates to unlock its narrative audio."
									: "Center the monument's primary structure within your camera frame. Avoid close-up shots of single bricks or steps."
								}
							</p>
						</div>
					</div>

					<div className="flex gap-4 items-start">
						<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
							2
						</div>
						<div>
							<h4 className="font-bold text-sm text-on-surface">
								{isGeofenceError ? "Verify Location Accuracy" : "Avoid Inactive Backgrounds"}
							</h4>
							<p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
								{isGeofenceError 
									? "Make sure your device has location permissions active and has a strong GPS/Internet signal for high-accuracy telemetry."
									: "Exclude highly crowded streets, passing traffic, vehicles, or unrelated landscapes from the screenshot to prevent false classifications."
								}
							</p>
						</div>
					</div>

					<div className="flex gap-4 items-start">
						<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
							3
						</div>
						<div>
							<h4 className="font-bold text-sm text-on-surface">
								{isGeofenceError ? "Refresh Scanner Context" : "Verify Supported Monument"}
							</h4>
							<p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
								{isGeofenceError 
									? "Return to the home dashboard and trigger the scanner again once you have moved closer to the site."
									: "Confirm that the monument is listed in HeritageGatha catalog. Unlisted buildings or general nature blocks are omitted."
								}
							</p>
						</div>
					</div>
				</div>

				{/* Action CTA Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						onClick={() => navigate("/", { state: { autoOpenScanner: true } })}
						className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
					>
						Try Scanning Again
						<span className="material-symbols-outlined text-sm">
							photo_camera
						</span>
					</button>
					<button
						onClick={() => navigate("/monuments")}
						className="w-full sm:w-auto px-6 py-3.5 bg-surface-container text-primary font-bold rounded-xl hover:bg-surface-container-high transition-all active:scale-95"
					>
						Explore Monuments
					</button>
				</div>
			</div>
		</div>
	);
}
