import { useState, useEffect } from "react";
import adminService from "../../services/admin.service";
import { toast } from "react-hot-toast";

export default function AudioGeneration() {
	const [activeTab, setActiveTab] = useState("all");
	const [jobs, setJobs] = useState([]);
	const [monuments, setMonuments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);

	// Form State
	const [selectedMonument, setSelectedMonument] = useState("");
	const [selectedLangs, setSelectedLangs] = useState(["en"]);
	const [customText, setCustomText] = useState("");

	const fetchJobs = async () => {
		try {
			const res = await adminService.getAudioJobs();
			if (res.success) {
				setJobs(res.data || []);
			}
		} catch (error) {
			console.error("Failed to fetch audio jobs", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchMonuments = async () => {
		try {
			const res = await adminService.getMonuments(1, 100);
			if (res.success) {
				setMonuments(res.data || []);
			}
		} catch (error) {
			console.error("Failed to fetch monuments", error);
		}
	};

	useEffect(() => {
		fetchJobs();
		fetchMonuments();
		const interval = setInterval(fetchJobs, 5000); // Poll every 5s for better feedback
		return () => clearInterval(interval);
	}, []);

	const handleGenerate = async (e) => {
		e.preventDefault();
		if (!selectedMonument || !selectedLangs.length) {
			toast.error("Please select a monument and at least one language");
			return;
		}

		setIsGenerating(true);
		try {
			// Find monument text if custom text is empty
			let text = customText;
			if (!text) {
				const m = monuments.find(mon => mon.id === selectedMonument);
				text = m?.description || "";
			}

			const res = await adminService.generateAudio({
				monument_id: selectedMonument,
				text,
				languages: selectedLangs
			});

			if (res.success) {
				toast.success("Synthesis triggered successfully");
				fetchJobs();
			} else {
				toast.error(res.message || "Failed to trigger synthesis");
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this audio asset?")) return;
		try {
			const res = await adminService.deleteAudioJob(id);
			if (res.success) {
				toast.success("Asset deleted");
				fetchJobs();
			}
		} catch (error) {
			toast.error("Failed to delete asset");
		}
	};

	const filteredJobs = jobs.filter(
		(job) =>
			activeTab === "all" ||
			(activeTab === "processing" && job.status === "PROCESSING") ||
			(activeTab === "completed" && job.status === "GENERATED") ||
			(activeTab === "failed" && job.status === "FAILED")
	);

	return (
		<main className="p-8 lg:p-12 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
				<div>
					<h1 className="font-serif text-5xl font-black text-on-background tracking-tight mb-2">
						Audio Synthesis Hub
					</h1>
					<p className="text-on-surface-variant font-bold text-lg">
						Manage neural narrations and multilingual pipelines
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Generation Trigger Panel */}
				<div className="lg:col-span-1">
					<div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container sticky top-8">
						<h2 className="text-xl font-serif font-bold mb-6 text-on-surface">New Synthesis</h2>
						<form onSubmit={handleGenerate} className="space-y-4">
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
									Monument
								</label>
								<select 
									className="w-full bg-surface-container-high p-3 rounded-lg border border-surface-container outline-none focus:ring-2 focus:ring-primary text-sm"
									value={selectedMonument}
									onChange={(e) => setSelectedMonument(e.target.value)}
								>
									<option value="">Select Monument...</option>
									{monuments.map(m => (
										<option key={m.id} value={m.id}>{m.name}</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
									Languages
								</label>
								<div className="flex flex-wrap gap-2">
									{["en", "hi", "ne"].map(lang => (
										<button
											type="button"
											key={lang}
											onClick={() => {
												setSelectedLangs(prev => 
													prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
												);
											}}
											className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
												selectedLangs.includes(lang)
													? "bg-primary text-on-primary shadow-md"
													: "bg-surface-container-high text-on-surface-variant"
											}`}
										>
											{lang.toUpperCase()}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
									Custom Script (Optional)
								</label>
								<textarea 
									placeholder="Leave empty to use monument description..."
									className="w-full bg-surface-container-high p-3 rounded-lg border border-surface-container outline-none focus:ring-2 focus:ring-primary text-sm h-24 resize-none"
									value={customText}
									onChange={(e) => setCustomText(e.target.value)}
								/>
							</div>

							<button
								type="submit"
								disabled={isGenerating}
								className="w-full bg-primary text-on-primary font-black py-4 rounded-xl shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
							>
								{isGenerating ? "Synthesizing..." : "Trigger Neural Voice"}
							</button>
						</form>
					</div>
				</div>

				{/* Monitoring Hub */}
				<div className="lg:col-span-3">
					{/* Tabs */}
					<div className="flex gap-4 border-b border-surface-container mb-8">
						{["all", "processing", "completed", "failed"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`pb-3 px-2 font-bold text-sm uppercase tracking-widest transition-colors ${
									activeTab === tab
										? "text-primary border-b-2 border-primary"
										: "text-on-surface-variant hover:text-on-surface"
								}`}
							>
								{tab}
							</button>
						))}
					</div>

					{/* Job Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{filteredJobs.map((job) => (
							<div
								key={job.id}
								className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-xl transition-all group"
							>
								<div>
									<div className="flex justify-between items-start mb-4">
										<span className="font-mono text-[10px] text-on-surface-variant bg-surface-container p-1 rounded">
											{job.id.split('-')[0]}
										</span>
										<div className="flex gap-2 items-center">
											<span
												className={`text-[10px] px-2 py-1 rounded-full font-black tracking-tighter ${
													job.status === "PROCESSING"
														? "bg-primary/20 text-primary animate-pulse"
														: job.status === "GENERATED"
															? "bg-green-500/10 text-green-600"
															: "bg-error/10 text-error"
												}`}
											>
												{job.status}
											</span>
											<button 
												onClick={() => handleDelete(job.id)}
												className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:bg-error/10 p-1 rounded"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									</div>
									<h3 className="font-serif font-bold text-xl text-on-surface mb-1">
										{job.monument}
									</h3>
									<p className="text-xs font-bold text-on-surface-variant flex items-center gap-2">
										LANG: <span className="text-primary">{job.targetLanguage.toUpperCase()}</span>
									</p>
								</div>

								<div className="mt-6">
									<div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-2">
										<div
											className={`h-full rounded-full transition-all duration-1000 ${job.status === "FAILED" ? "bg-error" : "bg-primary"}`}
											style={{ width: `${job.progress}%` }}
										></div>
									</div>
									<div className="flex justify-between items-center text-[10px] text-on-surface-variant font-bold">
										<span>{new Date(job.time).toLocaleTimeString()}</span>
										<span>{job.progress}%</span>
									</div>
								</div>
							</div>
						))}

						{filteredJobs.length === 0 && (
							<div className="col-span-full py-20 text-center bg-surface-container-lowest rounded-3xl border-2 border-dashed border-surface-container text-on-surface-variant font-bold italic">
								{loading ? "Synchronizing with XTTS Engine..." : "No neural assets found in this category."}
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
