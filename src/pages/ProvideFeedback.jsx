import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================

// API: GET /api/v1/monuments/:id/feedback-meta
// Description: Fetches the basic monument information needed for the feedback context Header/Card.
// Security: Publicly accessible
const mockMonumentContext = {
	id: "konark-sun-temple",
	name: "Konark Sun Temple",
	location: "Odisha, India",
	imageUrl: null, // e.g., "https://example.com/images/konark.jpg"
};

// API: GET /api/v1/feedback/tags
// Description: Fetches the allowed/available tags for feedback configuration.
// Security: Publicly accessible
const mockFeedbackTags = [
	"Information is correct",
	"Audio is clear",
	"Stunning imagery",
	"Wrong monument identified",
];

// API: POST /api/v1/monuments/:id/feedback
// Description: Payload expected by the backend when the user submits their feedback.
// Security: Requires authentication (JWT in Authorization header)
/*
Expected Request Body:
{
	userId: "string (from auth)",
	monumentId: "string",
	rating: number (1-5),
	tags: ["string"],
	narrative: "string"
}
*/

export default function ProvideFeedback() {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

	// In the future, this data will be loaded from APIs
	const monument = mockMonumentContext;
	const availableTags = mockFeedbackTags;

	const [rating, setRating] = useState(4);
	const [selectedTags, setSelectedTags] = useState([
		"Information is correct",
	]);
	const [narrative, setNarrative] = useState("");

	const toggleTag = (tag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	// Auth Guard Render
	if (!isLoggedIn) {
		return (
			<div className="w-full min-h-screen flex flex-col pt-24 items-center bg-surface px-6">
				<div className="max-w-md w-full text-center space-y-6">
					<span className="material-symbols-outlined text-6xl text-primary opacity-80">
						lock
					</span>
					<h2 className="font-serif text-3xl font-bold text-on-surface">
						Login Required
					</h2>
					<p className="text-on-surface-variant font-body">
						You must be logged in to leave reviews and feedback for{" "}
						<span className="font-bold">{monument.name}</span>.
					</p>
					<div className="flex flex-col gap-4 pt-4">
						<button
							onClick={() =>
								navigate("/login", {
									state: { returnUrl: location.pathname },
								})
							}
							className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all font-body shadow-lg"
						>
							Log In or Sign Up
						</button>
						<button
							onClick={() => navigate(-1)}
							className="w-full text-primary py-3 font-bold hover:bg-surface-container rounded-xl transition-all font-body"
						>
							Go Back
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen pb-24">
			{/* Header */}
			<header className="sticky top-16 z-40 bg-surface border-b border-surface-container px-6 py-4">
				<div className="flex items-center gap-4 max-w-md">
					<button
						onClick={() => navigate(-1)}
						className="p-2 hover:bg-surface-container rounded-full"
					>
						<span className="material-symbols-outlined text-primary">
							arrow_back
						</span>
					</button>
					<h1 className="text-2xl font-serif font-black text-primary">
						Heritage Gatha
					</h1>
				</div>
			</header>

			<main className="max-w-md mx-auto px-6 pt-8 space-y-8">
				{/* Title Section */}
				<section className="space-y-2">
					<span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
						Community Contribution
					</span>
					<h2 className="font-serif text-3xl font-bold text-on-surface leading-tight">
						Rate this Experience
					</h2>
					<p className="text-on-surface-variant text-sm font-body">
						Your feedback helps fellow archivists and improves our
						heritage identification engine.
					</p>
				</section>

				{/* Artifact Visual Reference */}
				<div className="relative w-full aspect-[16/9] bg-surface-container-high rounded-xl overflow-hidden group shadow-lg">
					{monument.imageUrl ? (
						<img
							src={monument.imageUrl}
							alt={monument.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full bg-surface-container flex items-center justify-center">
							<span className="material-symbols-outlined text-on-surface-variant text-6xl">
								image
							</span>
						</div>
					)}
					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-on-background/80 to-transparent p-4">
						<h3 className="font-serif text-white text-lg font-bold">
							{monument.name}
						</h3>
						<p className="font-label text-white/80 text-[10px] uppercase tracking-wider">
							{monument.location}
						</p>
					</div>
				</div>

				{/* Rating Section */}
				<section className="space-y-6">
					<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg text-center space-y-4">
						<p className="font-label text-xs font-bold uppercase text-on-surface-variant">
							Overall Quality
						</p>
						<div className="flex justify-center gap-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<button
									key={i}
									onClick={() => setRating(i)}
									className="transition-all"
								>
									<span
										className={`material-symbols-outlined text-4xl ${i <= rating ? "filled text-secondary" : "text-outline"}`}
									>
										star
									</span>
								</button>
							))}
						</div>
						<p className="text-secondary font-bold text-sm font-body">
							{rating}.0 out of 5.0
						</p>
					</div>

					{/* Multi-Choice Tags */}
					<div className="space-y-4">
						<p className="font-label text-xs font-bold uppercase text-on-surface-variant">
							What stood out?
						</p>
						<div className="flex flex-wrap gap-2">
							{availableTags.map((tag) => (
								<button
									key={tag}
									onClick={() => toggleTag(tag)}
									className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
										selectedTags.includes(tag)
											? tag ===
												"Wrong monument identified"
												? "bg-error-container text-on-error-container"
												: "bg-secondary-container text-on-secondary-container"
											: "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
									}`}
								>
									{tag}
								</button>
							))}
						</div>
					</div>

					{/* Detailed Feedback */}
					<div className="space-y-4">
						<label className="font-label text-xs font-bold uppercase text-on-surface-variant block">
							Detailed Narrative
						</label>
						<textarea
							value={narrative}
							onChange={(e) => setNarrative(e.target.value)}
							placeholder="Describe your visit or point out specifics..."
							className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none resize-none h-32 transition-colors font-body"
						/>
					</div>

					{/* Submit Button */}
					<button className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all artifact-shadow font-body">
						Submit Feedback
						<span className="material-symbols-outlined">
							arrow_forward
						</span>
					</button>

					{/* Skip Option */}
					<button
						onClick={() => navigate(-1)}
						className="w-full text-primary py-3 font-bold text-center font-body hover:underline"
					>
						Skip for now
					</button>
				</section>
			</main>
		</div>
	);
}
