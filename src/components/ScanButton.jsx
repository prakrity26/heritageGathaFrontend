import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "react-hot-toast";
import API_CONFIG from "../services/api.config";
import httpClient from "../services/http.client";

/**
 * ---------------------------------------------------------------------------
 * BACKEND API CONTRACT: Vision Analysis Integration
 * ---------------------------------------------------------------------------
 *
 * Endpoint:    POST /api/v1/vision/analyze
 * Purpose:     Receives a base64 encoded image (or multipart/form-data) from
 *              the scanner to recognize monuments via AI/ML models.
 * Security:    - Publicly accessible endpoint (No JWT required for analysis).
 *              - Rate limit: e.g., 10 scans / minute per IP to prevent spam.
 *              - Payload size limit: e.g., 5MB max.
 *              - Only accept valid image MIME types (image/jpeg, image/png).
 *
 * Request (JSON Example):
 * {
 *   "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
 *   "timestamp": "2023-10-27T10:00:00Z",
 *   "location": { "lat": 27.6710, "lng": 85.3123 } // Optional geo-fencing
 * }
 *
 * Request (FormData Example - preferred for large files):
 * FormData.append("file", Blob(image_data), "scan.jpg")
 *
 * Response (Success - 200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "monument_id": "mon_001",
 *     "name": "Patan Durbar Square",
 *     "confidence_score": 0.98,
 *     "bounding_box": [100, 150, 400, 500]
 *   }
 * }
 *
 * Response (Error - 400 Bad Request / 404 Not Found):
 * {
 *   "success": false,
 *   "error": "No monument detected in the provided image.",
 *   "code": "VISION_NO_MATCH"
 * }
 * ---------------------------------------------------------------------------
 */

export default function ScanButton() {
	const navigate = useNavigate();
	const location = useLocation();
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [error, setError] = useState(null);
	const [particles, setParticles] = useState([]);
	const [capturedImage, setCapturedImage] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResult, setAnalysisResult] = useState(null);

	// Generate particle effects on mount
	useEffect(() => {
		const generatedParticles = Array.from({ length: 8 }).map((_, i) => ({
			id: i,
			angle: (360 / 8) * i,
			duration: 1.5 + Math.random() * 0.5,
			delay: (i * 0.1) % 1.5,
			distance: 60 + Math.random() * 20,
		}));
		setParticles(generatedParticles);
	}, []);

	// Auto-open scanner if navigated back with autoOpenScanner state
	useEffect(() => {
		if (location.state?.autoOpenScanner) {
			// Clear state context so it doesn't reopen unexpectedly
			navigate(location.pathname, { replace: true, state: {} });
			handleScanClick();
		}
	}, [location.state, navigate]);

	const handleScanClick = async () => {
		try {
			setError(null);
			setIsCameraOpen(true);
			// Prevent scrolling and page scroll
			document.body.style.overflow = "hidden";
			document.documentElement.style.overflow = "hidden";
			// Hide header when camera is open
			document.body.classList.add("camera-open");
		} catch (err) {
			setError("Failed to open camera. Please check permissions.");
			console.error("Camera error:", err);
		}
	};

	const handleCapture = () => {
		if (webcamRef.current) {
			try {
				const imageSrc = webcamRef.current.getScreenshot();
				setCapturedImage(imageSrc);
				setAnalysisResult(null); // Reset previous analysis when new image captured
				// Keep the modal open to show captured image
			} catch (err) {
				setError("Failed to capture image");
				console.error("Capture error:", err);
			}
		}
	};

	const closeCam = () => {
		setIsCameraOpen(false);
		setCapturedImage(null);
		setAnalysisResult(null);
		setIsAnalyzing(false);
		// Restore scrolling
		document.body.style.overflow = "unset";
		document.documentElement.style.overflow = "unset";
		// Show header again
		document.body.classList.remove("camera-open");
	};

	const retakePhoto = () => {
		setCapturedImage(null);
		setAnalysisResult(null);
		setIsAnalyzing(false);
	};

	const [loadingMessage, setLoadingMessage] = useState("");

	const handleAnalyze = async () => {
		if (!capturedImage) return;

		setIsAnalyzing(true);
		setError(null);
		setLoadingMessage("Acquiring location...");

		try {
			// 1. Get current geolocation
			const getLocation = () => {
				return new Promise((resolve, reject) => {
					if (!navigator.geolocation) {
						reject(new Error("Geolocation not supported"));
					}
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 0
					});
				});
			};

			let position;
			try {
				position = await getLocation();
			} catch (geoErr) {
				console.error("Geo error:", geoErr);
				setError("Location access required for monument verification.");
				setIsAnalyzing(false);
				return;
			}

			const { latitude, longitude } = position.coords;
			setLoadingMessage("Analyzing monument...");

			// 2. Convert base64 to Blob
			const response = await fetch(capturedImage);
			const blob = await response.blob();

			// 3. Prepare FormData
			const formData = new FormData();
			formData.append("userLat", latitude);
			formData.append("userLng", longitude);
			formData.append("image", blob, "monument-scan.jpg");

			// 4. Send to Backend using httpClient (to ensure Auth headers are included)
			const endpoint = API_CONFIG.ENDPOINTS.VISION.ANALYZE;
			const result = await httpClient.post(endpoint, formData);

			if (result.status === "error" || !result.data) {
				const errorMsg = result.message || "Identification failed. Please try again.";
				
				// Reset scanner state and restore scrolling
				setIsCameraOpen(false);
				setCapturedImage(null);
				setAnalysisResult(null);
				document.body.style.overflow = "unset";
				document.documentElement.style.overflow = "unset";
				document.body.classList.remove("camera-open");

				navigate("/scan-error", {
					state: {
						errorType: "UNRECOGNIZED",
						message: errorMsg
					}
				});
				return;
			}

			// 5. Success State
			setAnalysisResult({
				success: true,
				data: {
					monument_id: result.data.monument.id,
					name: result.data.monument.name,
					confidence_score: result.data.confidence || 0.9,
					distance: result.data.distance || 0
				},
			});

		} catch (err) {
			console.error("Analysis API failed:", err);
			
			if (err.status === 401) {
				// Clear tokens so subsequent requests don't fail
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				
				// Reset scanner state and restore scrolling
				setIsCameraOpen(false);
				setCapturedImage(null);
				setAnalysisResult(null);
				document.body.style.overflow = "unset";
				document.documentElement.style.overflow = "unset";
				document.body.classList.remove("camera-open");

				toast.error("Your session has expired. Please log in again.");
				navigate("/login");
				return;
			}
			
			let errorType = "UNRECOGNIZED";
			let errorMsg = "We could not recognize the monument. Please try to capture the monument or be physically present to the monument.";
			let extraInfo = {};

			if (err.status === 400 && err.response) {
				if (err.response.error === "GEOFENCE_VIOLATION") {
					errorType = "GEOFENCE";
					errorMsg = err.response.message || "You seem to be too far from this monument.";
					extraInfo = { distance: err.response.distance };
				} else if (err.response.error === "MONUMENT_NOT_FOUND") {
					errorType = "UNRECOGNIZED";
					errorMsg = "We could not recognize the monument. Please ensure you are capturing a supported heritage monument.";
				} else {
					errorMsg = err.response.message || errorMsg;
				}
			} else if (err.status === 404) {
				errorType = "UNRECOGNIZED";
				errorMsg = err.response?.message || "No monument detected with sufficient confidence. Please center the monument in your shot.";
			} else {
				errorMsg = err.message || errorMsg;
			}

			// Reset scanner state and restore scrolling
			setIsCameraOpen(false);
			setCapturedImage(null);
			setAnalysisResult(null);
			document.body.style.overflow = "unset";
			document.documentElement.style.overflow = "unset";
			document.body.classList.remove("camera-open");

			navigate("/scan-error", {
				state: {
					errorType,
					message: errorMsg,
					...extraInfo
				}
			});
		} finally {
			setIsAnalyzing(false);
		}
	};

	// Fullscreen Camera Modal
	if (isCameraOpen) {
		return (
			<div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] bg-black overflow-hidden flex flex-col">
				{!capturedImage ? (
					<>
						{/* Live Camera Feed */}
						<div className="relative flex-1 w-full h-full bg-black overflow-hidden">
							<Webcam
								ref={webcamRef}
								screenshotFormat="image/jpeg"
								videoConstraints={{
									facingMode: "environment",
									width: { ideal: 1920 },
									height: { ideal: 1080 },
								}}
								className="w-full h-full object-cover"
								muted
								playsInline
								onUserMediaError={(err) => {
									setError(
										"Camera access denied or unavailable",
									);
									console.error("Webcam error:", err);
								}}
							/>

							{/* Animated Scan Line - Full Height */}
							<div className="absolute left-0 right-0 top-0 w-full h-full flex justify-center pointer-events-none">
								<div className="scan-line w-3/4 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
							</div>

							{/* Corner Accents - Scanner Frame */}
							<div className="absolute inset-0 pointer-events-none">
								<div className="absolute top-4 left-4 w-16 h-16 border-3 border-primary rounded-lg"></div>
								<div className="absolute top-4 right-4 w-16 h-16 border-3 border-primary rounded-lg"></div>
								<div className="absolute bottom-4 left-4 w-16 h-16 border-3 border-primary rounded-lg"></div>
								<div className="absolute bottom-4 right-4 w-16 h-16 border-3 border-primary rounded-lg"></div>
							</div>

							{/* Close Button - Top Left */}
							<button
								onClick={closeCam}
								className="absolute top-4 left-4 z-20 w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all font-bold text-3xl shadow-lg"
								aria-label="Close camera"
							>
								×
							</button>

							{/* Capture Button - Center */}
							<button
								onClick={handleCapture}
								className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 z-10 w-24 h-24 rounded-full bg-primary hover:bg-primary-container text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
								aria-label="Capture photo"
								title="Tap to capture monument"
							>
								<span className="material-symbols-outlined text-5xl">
									camera
								</span>
							</button>

							{/* Instruction Text */}
							<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center pointer-events-none">
								<p className="text-2xl font-bold drop-shadow-lg">
									Position monument within frame
								</p>
								<p className="text-sm text-white/70 drop-shadow-lg mt-2">
									Tap the camera button to capture
								</p>
							</div>
						</div>
					</>
				) : (
					<>
						{/* Captured Image Preview */}
						<div className="relative flex-1 w-full h-full bg-black overflow-hidden flex flex-col">
							<img
								src={capturedImage}
								alt="Captured"
								className="flex-1 w-full h-full object-cover"
							/>

							{/* Close Button */}
							<button
								onClick={closeCam}
								className="absolute top-4 left-4 z-20 w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all font-bold text-3xl shadow-lg"
								aria-label="Close"
							>
								×
							</button>

							{/* Action Buttons - Bottom Overlay */}
							<div className="absolute bottom-12 left-0 right-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10">
								{!analysisResult && !isAnalyzing && (
									<>
										<div className="text-center text-white font-semibold mb-4 text-lg drop-shadow-lg">
											Photo Captured! Ready to analyze.
										</div>
										<div className="flex gap-4 justify-center">
											<button
												onClick={retakePhoto}
												className="px-8 py-3 bg-secondary text-white font-bold rounded-full hover:bg-secondary-container transition-all active:scale-95 shadow-lg"
												disabled={isAnalyzing}
											>
												Retake
											</button>
											<button
												onClick={handleAnalyze}
												className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-container transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
												disabled={isAnalyzing}
											>
												Analyze
												<span className="material-symbols-outlined text-sm">
													search
												</span>
											</button>
										</div>
									</>
								)}

								{/* Loading State Spinner overlay inside UI */}
								{isAnalyzing && (
									<div className="flex flex-col items-center justify-center">
										{/* CSS Spinner */}
										<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg"></div>
										<p className="text-white mt-4 font-semibold text-lg drop-shadow-lg animate-pulse">
											{loadingMessage}
										</p>
									</div>
								)}

								{/* Analysis Result Display Overlay */}
								{analysisResult && (
									<div className="bg-surface/90 backdrop-blur-md p-6 rounded-2xl mx-auto max-w-sm w-full text-center shadow-xl transform translate-y-0 opacity-100 transition-all">
										<div className="w-16 h-16 bg-primary/20 text-primary mx-auto rounded-full flex items-center justify-center mb-4">
											<span className="material-symbols-outlined text-3xl">
												check_circle
											</span>
										</div>
										<h3 className="text-gray-900 font-bold text-xl mb-1">
											{analysisResult.data.name}
										</h3>
										{/* <p className="text-gray-600 font-medium mb-4 text-sm">
											Confidence:{" "}
											{Math.round(
												analysisResult.data
													.confidence_score * 100,
											)}
											% Match
										</p> */}
										<div className="flex gap-3 justify-center">
											<button
												onClick={retakePhoto} // Or link to the monument page manually
												className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-full hover:bg-gray-300 transition-all text-sm"
											>
												Close
											</button>
											<button
												onClick={() => {
													const id = analysisResult.data.monument_id;
													closeCam();
													navigate(`/monument/${id}`);
												}}
												className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-primary-container transition-all text-sm shadow-md"
											>
												View Details
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</>
				)}

				{/* Error Display */}
				{error && (
					<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-3 bg-error text-white rounded-lg text-center font-semibold z-20 max-w-xs">
						{error}
					</div>
				)}

				{/* Hidden Canvas for processing */}
				<canvas ref={canvasRef} className="hidden" />
			</div>
		);
	}

	// Button when camera is closed
	return (
		<div className="flex flex-col items-center justify-center gap-6">
			<div className="relative flex items-center justify-center w-fit">
				{/* Outer Rotating Ring */}
				<div className="absolute w-40 h-40 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 rotate-ring"></div>

				{/* Middle Glow Ring */}
				<div className="absolute w-36 h-36 rounded-full border border-primary/30 glow-pulse"></div>

				{/* Wave Rings - Pulsing Outward */}
				<div className="absolute w-32 h-32 rounded-full border-2 border-primary/40 pulse-wave"></div>
				<div
					className="absolute w-32 h-32 rounded-full border-2 border-primary/40 pulse-wave"
					style={{ animationDelay: "0.5s" }}
				></div>
				<div
					className="absolute w-32 h-32 rounded-full border-2 border-primary/40 pulse-wave"
					style={{ animationDelay: "1s" }}
				></div>

				{/* Floating Particles */}
				{particles.map((particle) => {
					const rad = (particle.angle * Math.PI) / 180;
					const tx = Math.cos(rad) * particle.distance;
					const ty = Math.sin(rad) * particle.distance;
					return (
						<div
							key={particle.id}
							className="absolute w-2 h-2 bg-primary rounded-full float-particle"
							style={{
								"--tx": `${tx}px`,
								"--ty": `${ty}px`,
								animationDuration: `${particle.duration}s`,
								animationDelay: `${particle.delay}s`,
							}}
						/>
					);
				})}

				{/* Main Button with Gradient & Glow */}
				<button
					onClick={handleScanClick}
					className="relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 text-white font-bold transition-all active:scale-90 cursor-pointer group"
					style={{
						background: "linear-gradient(135deg, #823b18, #a0522d)",
						boxShadow:
							"0 8px 32px rgba(130, 59, 24, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
					}}
					aria-label="Scan monument"
				>
					{/* Shine Effect */}
					<div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

					{/* Icon & Text */}
					<div className="relative z-20 flex flex-col items-center justify-center">
						<span className="material-symbols-outlined text-4xl transition-transform group-active:scale-110">
							account_balance
						</span>
						<span className="text-xs uppercase tracking-wider font-bold">
							Scan Me
						</span>
					</div>

					{/* Outer Glow Background */}
					<div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-300"></div>
				</button>
			</div>

			{/* Error Display (when camera not open) */}
			{error && !isCameraOpen && (
				<div className="text-center text-error font-medium px-4 py-2 bg-error-container rounded-lg">
					{error}
				</div>
			)}
		</div>
	);
}
