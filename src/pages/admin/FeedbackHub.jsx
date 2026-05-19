import { useState, useEffect } from "react";
import adminService from "../../services/admin.service";

export default function FeedbackHub() {
	const [monuments, setMonuments] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(null);
	const [isDeleting, setIsDeleting] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await adminService.getFeedbackHub();
			if (res.success) {
				setMonuments(res.data.monuments || []);
				setReviews(res.data.reviews || []);
				if (res.data.monuments?.length > 0 && !activeTab) {
					setActiveTab(res.data.monuments[0].id);
				}
			}
		} catch (error) {
			console.error("Failed to fetch feedback data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteReview = async (reviewId) => {
		if (!window.confirm("Are you sure you want to permanently delete this review? This action cannot be undone.")) {
			return;
		}

		setIsDeleting(reviewId);
		try {
			const res = await adminService.deleteReview(reviewId);
			if (res.success) {
				setReviews(reviews.filter(r => r.id !== reviewId));
			} else {
				alert("Failed to delete review: " + res.message);
			}
		} catch (error) {
			console.error("Delete review error:", error);
			alert("An error occurred while deleting the review.");
		} finally {
			setIsDeleting(null);
		}
	};

	const activeReviews = reviews.filter(r => r.monumentId === activeTab);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
					<p className="text-on-surface-variant font-bold animate-pulse">Syncing Community Narratives...</p>
				</div>
			</div>
		);
	}

	return (
		<main className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
			{/* Precise Header */}
			<div className="space-y-2">
				<h1 className="font-serif text-5xl font-black text-on-background tracking-tighter">
					Feedback <span className="text-primary">Hub</span>
				</h1>
				<p className="text-on-surface-variant font-medium text-lg">
					Moderating community chronicles and sentiment archives.
				</p>
			</div>

			{/* Monument Navigation Tabs */}
			<div className="space-y-4">
				<p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 font-black">Archive Repository</p>
				<div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
					{monuments.map((m) => (
						<button
							key={m.id}
							onClick={() => setActiveTab(m.id)}
							className={`px-6 py-3 rounded-full text-xs font-black transition-all whitespace-nowrap border-2 ${
								activeTab === m.id
									? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
									: "bg-surface-container-low text-on-surface-variant border-transparent hover:border-outline-variant"
							}`}
						>
							{m.name}
						</button>
					))}
				</div>
			</div>

			{/* Content Moderation Stream */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="font-serif text-2xl font-bold text-on-surface">
						{monuments.find(m => m.id === activeTab)?.name || "Select Monument"}
						<span className="ml-3 text-sm font-sans font-medium text-on-surface-variant">
							({activeReviews.length} Reviews)
						</span>
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-4">
					{activeReviews.length === 0 ? (
						<div className="py-20 text-center bg-surface-container-lowest rounded-[2rem] border-2 border-dashed border-outline-variant">
							<span className="material-symbols-outlined text-4xl text-outline-variant mb-4">inbox</span>
							<p className="text-on-surface-variant font-bold">No narratives found for this monument.</p>
						</div>
					) : (
						activeReviews.map((review) => (
							<div
								key={review.id}
								className="group bg-surface/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:bg-surface/60 transition-all duration-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
							>
								<div className="space-y-4 flex-1">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
											<span className="text-primary font-black text-sm">{(review.author || "U")[0]}</span>
										</div>
										<div>
											<p className="font-bold text-on-surface">{review.author || "Unknown Historian"}</p>
											<p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black">
												{review.date ? new Date(review.date).toLocaleDateString('en-US', { 
													month: 'short', 
													day: 'numeric', 
													year: 'numeric' 
												}) : "Date Unknown"}
											</p>
										</div>
									</div>

									<div className="flex gap-1">
										{[...Array(5)].map((_, idx) => (
											<span
												key={idx}
												className={`material-symbols-outlined text-sm ${
													idx < review.rating ? "text-primary filled" : "text-outline-variant"
												}`}
											>
												star
											</span>
										))}
									</div>

									<p className="text-on-surface-variant font-medium leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
										"{review.comment}"
									</p>
								</div>

								<button
									onClick={() => handleDeleteReview(review.id)}
									disabled={isDeleting === review.id}
									className="group/btn relative px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all duration-300 flex items-center gap-2 overflow-hidden"
								>
									{isDeleting === review.id ? (
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									) : (
										<>
											<span className="material-symbols-outlined text-sm group-hover/btn:rotate-12 transition-transform">delete</span>
											<span className="text-xs font-black uppercase tracking-widest">Delete Narrative</span>
										</>
									)}
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</main>
	);
}
