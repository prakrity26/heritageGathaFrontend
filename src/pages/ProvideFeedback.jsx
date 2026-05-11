import { useState, useEffect, useMemo } from "react";
import monumentService from "../services/monument.service";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const FEEDBACK_TAGS = [
	"Information is accurate",
	"Audio narration is clear",
	"Stunning historical imagery",
	"Easy to navigate",
	"Needs more detail",
	"Wrong monument identified",
	"GPS was inaccurate",
];

export default function ProvideFeedback() {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const selectedLanguage = useSelector((state) => state.language.language);
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

	const [monument, setMonument] = useState(null);
	const [recentReviews, setRecentReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const [rating, setRating] = useState(5);
	const [hoverRating, setHoverRating] = useState(0);
	const [selectedTags, setSelectedTags] = useState(["Information is accurate"]);
	const [narrative, setNarrative] = useState("");

	useEffect(() => {
		const loadData = async () => {
			try {
				const [monRes, revRes] = await Promise.all([
					monumentService.getMonumentById(id),
					monumentService.getMonumentReviews ? monumentService.getMonumentReviews(id) : Promise.resolve({ success: false })
				]);
				
				if (monRes.success) {
					setMonument(monRes.data);
				}
				
				if (revRes.success && revRes.data?.length > 0) {
					setRecentReviews(revRes.data.slice(0, 2));
				} else {
					setRecentReviews([
						{ id: "f1", author: "Heritage Guide", rating: 5, comment: "Be the first to share your journey with this artifact!" }
					]);
				}
			} catch (error) {
				console.error("Failed to load feedback context", error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [id, selectedLanguage]);

	const localizedName = useMemo(() => {
		if (!monument) return "";
		if (selectedLanguage === 'hi') return monument.name_hi || monument.name;
		if (selectedLanguage === 'ne') return monument.name_ne || monument.name;
		return monument.name;
	}, [monument, selectedLanguage]);

	const primaryImage = useMemo(() => {
		if (!monument?.images?.length) return null;
		return monument.images.find(img => img.is_primary)?.url || monument.images[0].url;
	}, [monument]);

	const handleSubmit = async () => {
		if (rating === 0) return alert("Please select a rating");
		
		setSubmitting(true);
		try {
			const res = await monumentService.submitFeedback(id, {
				rating,
				tags: selectedTags,
				narrative,
				comment: narrative
			});
			
			if (res.success) {
				navigate(`/monument/${id}`, { state: { feedbackSubmitted: true } });
			} else {
				alert(res.message || "Failed to submit feedback");
			}
		} catch (error) {
			console.error(error);
			alert("An error occurred during submission");
		} finally {
			setSubmitting(false);
		}
	};

	const toggleTag = (tag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	if (!isLoggedIn) {
		return (
			<div className="w-full min-h-screen flex flex-col pt-24 items-center bg-surface px-6 relative overflow-hidden">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
				
				<div className="max-w-md w-full text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
					<div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
						<span className="material-symbols-outlined text-5xl text-primary">lock</span>
					</div>
					<div className="space-y-2">
						<h2 className="font-serif text-4xl font-black text-on-surface leading-tight">
							Chronicle Restricted
						</h2>
						<p className="text-on-surface-variant font-body">
							To preserve the sanctity of our records, you must be authenticated to contribute feedback for <span className="text-primary font-black italic">{monument?.name || "this artifact"}</span>.
						</p>
					</div>
					<div className="flex flex-col gap-4 pt-4">
						<button
							onClick={() => navigate("/login", { state: { returnUrl: location.pathname } })}
							className="w-full bg-primary text-white py-4 rounded-[2rem] font-black hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
						>
							Log In or Sign Up
						</button>
						<button
							onClick={() => navigate(-1)}
							className="w-full text-primary py-4 font-black hover:bg-primary/5 rounded-[2rem] transition-all"
						>
							Go Back
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="w-full min-h-screen flex items-center justify-center bg-surface">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					<p className="font-serif text-primary font-bold animate-pulse">Syncing with Archives...</p>
				</div>
			</div>
		);
	}

	if (!monument) return <div className="p-12 text-center">Monument not found.</div>;

	return (
		<div className="relative w-full min-h-screen bg-surface overflow-x-hidden">
			{/* Dynamic Hero Background */}
			<div className="fixed inset-0 z-0 pointer-events-none">
				{primaryImage ? (
					<>
						<img 
							src={primaryImage} 
							alt="Background" 
							className="w-full h-full object-cover scale-110 blur-[100px] opacity-20 transition-all duration-1000"
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/80 to-surface"></div>
					</>
				) : (
					<div className="w-full h-full bg-surface-container-low"></div>
				)}
			</div>

			{/* Floating Header */}
			<header className="sticky top-0 z-50 backdrop-blur-md bg-surface/80 border-b border-surface-container px-6 py-4 flex items-center gap-4">
				<button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
					<span className="material-symbols-outlined text-primary">arrow_back</span>
				</button>
				<div>
					<h1 className="text-xl font-serif font-black text-primary leading-none">Heritage Gatha</h1>
					<p className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">Feedback Portal</p>
				</div>
			</header>

			<main className="relative z-10 max-w-2xl mx-auto px-6 pt-8 pb-32 space-y-12 animate-in fade-in duration-1000">
				{/* Intro Section */}
				<section className="text-center space-y-4">
					<div className="inline-flex items-center gap-2 px-4 py-1 bg-secondary-container/30 rounded-full border border-secondary-container/50">
						<span className="material-symbols-outlined text-sm text-secondary filled">verified</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">Contributor Mode</span>
					</div>
					<h2 className="text-4xl font-serif font-black text-on-surface leading-none italic">
						Preserving the Chronicles of <span className="text-primary not-italic">{localizedName}</span>
					</h2>
					<p className="text-on-surface-variant font-body max-w-sm mx-auto">
						Your perspective refines the neural tapestry of our history. Share your journey with us.
					</p>
				</section>

				{/* Immersive Feedback Card */}
				<div className="bg-surface/40 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl space-y-10">
					{/* Tactile Rating */}
					<div className="space-y-6 text-center">
						<p className="font-label text-xs font-black uppercase tracking-[0.2em] text-primary/60">Overall Experience</p>
						<div className="flex justify-center gap-1">
							{[1, 2, 3, 4, 5].map((i) => (
								<button
									key={i}
									onMouseEnter={() => setHoverRating(i)}
									onMouseLeave={() => setHoverRating(0)}
									onClick={() => setRating(i)}
									className="group relative p-1 transition-all active:scale-75"
								>
									<span
										className={`material-symbols-outlined text-5xl transition-all duration-300 ${
											i <= (hoverRating || rating) 
												? "filled text-secondary scale-110 drop-shadow-[0_0_12px_rgba(var(--secondary-rgb),0.6)]" 
												: "text-outline opacity-20"
										}`}
									>
										star
									</span>
									{i === (hoverRating || rating) && (
										<div className="absolute inset-0 bg-secondary/10 blur-xl rounded-full animate-pulse" />
									)}
								</button>
							))}
						</div>
						<p className="text-secondary font-black text-lg font-serif min-h-[1.75rem] transition-all duration-300">
							{rating === 5 ? "Exceptional" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
						</p>
					</div>

					<div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

					{/* Chips Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<span className="material-symbols-outlined text-primary text-sm">label</span>
							<p className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant">Defining Attributes</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{FEEDBACK_TAGS.map((tag) => (
								<button
									key={tag}
									onClick={() => toggleTag(tag)}
									className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 ${
										selectedTags.includes(tag)
											? tag === "Wrong monument identified"
												? "bg-error/10 border-error text-error shadow-[0_0_15px_rgba(var(--error-rgb),0.2)]"
												: "bg-primary border-primary text-white shadow-lg shadow-primary/30"
											: "bg-white/5 border-white/10 text-on-surface-variant hover:border-white/30"
									}`}
								>
									{tag}
								</button>
							))}
						</div>
					</div>

					{/* Narrative Input */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<span className="material-symbols-outlined text-primary text-sm">edit_note</span>
							<p className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant">Detailed Chronicle</p>
						</div>
						<textarea
							value={narrative}
							onChange={(e) => setNarrative(e.target.value)}
							placeholder="Compose your narrative here... What specific details moved you?"
							className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-on-surface placeholder-on-surface-variant/30 focus:border-primary/50 focus:bg-white/10 focus:outline-none resize-none h-40 transition-all font-body text-sm leading-relaxed"
						/>
					</div>

					{/* Submit Action */}
					<div className="pt-4 space-y-6">
						<button 
							onClick={handleSubmit}
							disabled={submitting}
							className="relative w-full group overflow-hidden bg-primary text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/40 transition-all disabled:opacity-50 active:scale-95"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
							{submitting ? (
								<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							) : (
								<>
									<span className="font-serif italic text-lg">Transmit Contribution</span>
									<span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
								</>
							)}
						</button>
						<button
							onClick={() => navigate(-1)}
							className="w-full text-on-surface-variant font-bold text-xs uppercase tracking-widest text-center hover:text-primary transition-colors py-2"
						>
							Discard Draft
						</button>
					</div>
				</div>

				{/* Social Proof Section */}
				<section className="space-y-6">
					<div className="flex items-center justify-between">
						<h4 className="font-serif text-xl font-black text-on-surface">Community Echoes</h4>
						<span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Feed</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{recentReviews.map((rev) => (
							<div key={rev.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-3">
								<div className="flex justify-between items-center">
									<p className="font-bold text-xs text-primary">{rev.author}</p>
									<div className="flex gap-0.5">
										{[...Array(5)].map((_, i) => (
											<span key={i} className={`material-symbols-outlined text-[10px] ${i < rev.rating ? "filled text-secondary" : "text-outline opacity-20"}`}>star</span>
										))}
									</div>
								</div>
								<p className="text-xs text-on-surface-variant font-body italic">"{rev.comment}"</p>
							</div>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
