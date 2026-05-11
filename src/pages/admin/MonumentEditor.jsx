import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import adminService from "../../services/admin.service";
import { toast } from "react-hot-toast";

export default function MonumentEditor() {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const isNew = !id;

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("DRAFT");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [era, setEra] = useState("");
	const [images, setImages] = useState([]);
	const [pendingImages, setPendingImages] = useState([]); // Selected but not yet uploaded
	const [loading, setLoading] = useState(!isNew);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	
	// Dynamic Insights State
	const [insights, setInsights] = useState({
		totalScans: 0,
		totalReviews: 0,
		avgRating: 0,
		positiveRatio: 0
	});

	useEffect(() => {
		const loadMonument = async () => {
			if (isNew) {
				setTitle("");
				setDescription("");
				setLatitude("");
				setLongitude("");
				setEra("");
				setStatus("DRAFT");
			} else {
				const res = await adminService.getMonumentById(id);
				if (res.success && res.data) {
					const m = res.data;
					setTitle(m.name || "");
					setLatitude(m.latitude || "");
					setLongitude(m.longitude || "");
					setEra(m.era || "");
					setStatus(m.status || "DRAFT");
					setDescription(m.description || "");
					setImages(m.images || []);
					
					// Calculate Insights
					const revs = m.reviews || [];
					const avg = revs.length ? revs.reduce((acc, r) => acc + r.rating, 0) / revs.length : 0;
					const pos = revs.length ? (revs.filter(r => r.sentiment === 'POSITIVE').length / revs.length) * 100 : 0;
					
					setInsights({
						totalScans: m._count?.scans || m.total_scans || 0,
						totalReviews: m._count?.reviews || revs.length || 0,
						avgRating: avg.toFixed(1),
						positiveRatio: Math.round(pos)
					});
				} else {
					setError(res.message || "Failed to load monument");
				}
				setLoading(false);
			}
		};
		loadMonument();
	}, [id, isNew]);

	const handleSave = async (publishStatus = status) => {
		setError("");
		setSaving(true);
		
		const payload = {
			name: title,
			description,
			latitude: parseFloat(latitude),
			longitude: parseFloat(longitude),
			era: era || null,
			status: publishStatus,
		};

		if (!title || !description || isNaN(payload.latitude) || isNaN(payload.longitude)) {
			toast.error("Please fill all required fields");
			setSaving(false);
			return;
		}

		try {
			let res;
			if (isNew) {
				res = await adminService.createMonument(payload);
			} else {
				res = await adminService.updateMonument(id, payload);
			}

			if (res.success) {
				const monumentId = isNew ? res.data.id : id;
				
				// Handle pending image uploads if any
				if (pendingImages.length > 0) {
					toast.loading(`Securing ${pendingImages.length} assets...`);
					const uploadRes = await adminService.uploadMonumentImage(monumentId, pendingImages.map(p => p.file));
					if (!uploadRes.success) {
						toast.error("Monument saved, but asset synchronization encountered errors.");
					}
				}

				toast.success(`Monument ${isNew ? "created" : "updated"} successfully`);
				navigate("/admin/monuments");
			} else {
				setError(res.message || "Failed to save monument");
			}
		} catch (err) {
			setError(err.message || "Unexpected error occurred");
		} finally {
			setSaving(false);
		}
	};

	const copyId = () => {
		if (id) {
			navigator.clipboard.writeText(id);
			toast.success("ID copied to clipboard");
		}
	};

	const handleImageUpload = async (e) => {
		const files = Array.from(e.target.files);
		if (!files.length) return;

		if (isNew) {
			// Queue files with local previews
			const newPending = files.map(file => ({
				id: Math.random().toString(36).substr(2, 9),
				file,
				url: URL.createObjectURL(file),
				isPending: true
			}));
			setPendingImages(prev => [...prev, ...newPending]);
			toast.success(`${files.length} assets queued for synchronization`);
			return;
		}

		// Direct upload for existing monuments
		const loadingToast = toast.loading(`Uploading ${files.length} assets to Media Conservatory...`);
		try {
			const res = await adminService.uploadMonumentImage(id, files);
			if (res.success) {
				// Backend returns array of created media objects
				const newMedia = Array.isArray(res.data) ? res.data : [res.data];
				setImages((prev) => [...prev, ...newMedia]);
				toast.success("Assets secured in conservatory", { id: loadingToast });
			} else {
				toast.error(res.message || "Upload failed", { id: loadingToast });
			}
		} catch (err) {
			toast.error("Network error during upload", { id: loadingToast });
		}
	};

	const handleDeleteImage = async (imageId) => {
		const confirm = window.confirm("Exorcise this image from the conservatory?");
		if (!confirm) return;

		try {
			const res = await adminService.deleteMonumentImage(imageId);
			if (res.success) {
				setImages((prev) => prev.filter((img) => img.id !== imageId));
				toast.success("Asset removed");
			} else {
				toast.error(res.message || "Removal failed");
			}
		} catch (err) {
			toast.error("Network error during removal");
		}
	};

	return (
		<main className="p-8 lg:p-12 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-surface-container pb-8">
				<div className="max-w-3xl">
					<div className="flex items-center gap-3 mb-2">
						<h1 className="font-serif text-4xl font-black text-on-background tracking-tight">
							{isNew ? "New Heritage Asset" : "Refine Narrative"}
						</h1>
						{!isNew && (
							<button 
								onClick={copyId}
								className="p-1 hover:bg-surface-container rounded text-on-surface-variant flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors"
								title="Copy ID"
							>
								<span className="material-symbols-outlined text-sm">content_copy</span>
								ID: {id.split('-')[0]}...
							</button>
						)}
					</div>
					<p className="text-on-surface-variant font-bold text-lg">
						{isNew
							? "Register a new site to the Heritage Gatha database"
							: `Orchestrating historical metadata for ${title}`}
					</p>
				</div>
				<div className="flex gap-4">
					<button 
						onClick={() => navigate("/admin/monuments")}
						className="px-6 py-3 bg-surface-container text-on-surface rounded-xl font-black uppercase tracking-widest text-sm hover:bg-surface-container-high transition-all"
					>
						Discard
					</button>
					<button 
						onClick={() => handleSave(status)}
						disabled={saving || loading}
						className="px-8 py-3 bg-primary text-on-primary rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
					>
						<span className="material-symbols-outlined text-sm">publish</span>
						{saving ? "Saving..." : isNew ? "Create Asset" : "Commit Changes"}
					</button>
				</div>
			</div>

			{error && (
				<div className="mb-8 p-4 bg-error-container text-on-error-container text-sm font-black rounded-xl border-l-8 border-error uppercase tracking-wider flex items-center gap-3">
					<span className="material-symbols-outlined">warning</span>
					{error}
				</div>
			)}

			{loading ? (
				<div className="py-20 text-center text-on-surface-variant animate-pulse font-black uppercase tracking-[0.2em]">Synchronizing Heritage Data...</div>
			) : (
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
				{/* Main Narrative & Media */}
				<div className="lg:col-span-3 space-y-12">
					{/* Narrative Editor */}
					<section className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm">
						<div className="flex items-center gap-3 mb-8">
							<span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
							<h2 className="font-serif text-2xl font-black text-on-surface">Historical Narrative</h2>
						</div>

						<div className="space-y-6">
							<div className="group">
								<label className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant mb-3 block group-focus-within:text-primary transition-colors">
									Monument Nomenclature
								</label>
								<input
									type="text"
									value={title}
									placeholder="e.g. Krishna Mandir"
									onChange={(e) => setTitle(e.target.value)}
									className="w-full px-5 py-4 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none text-on-surface font-serif text-xl font-bold transition-all placeholder:opacity-50"
								/>
							</div>

							<div>
								<div className="flex justify-between items-center mb-3">
									<label className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant">
										Architectural & History Manuscript
									</label>
									<label className="cursor-pointer flex items-center gap-2 text-xs font-black text-primary hover:underline uppercase tracking-widest">
										<span className="material-symbols-outlined text-xs">upload_file</span>
										Import Manuscript (.txt)
										<input
											type="file"
											accept=".txt"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files[0];
												if (file) {
													const reader = new FileReader();
													reader.onload = (ev) => setDescription(ev.target.result);
													reader.readAsText(file);
												}
											}}
										/>
									</label>
								</div>
								<textarea
									value={description}
									placeholder="Provide a deep historical context for the neural narration engine..."
									onChange={(e) => setDescription(e.target.value)}
									className="w-full px-5 py-4 bg-surface-container-low rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none text-on-surface font-body text-base h-64 resize-none leading-relaxed transition-all"
								/>
								<div className="flex justify-between items-center mt-3 text-xs font-black text-on-surface-variant uppercase tracking-widest">
									<span>Neural Synthesis Ready</span>
									<span>{description.length} Characters recorded</span>
								</div>
							</div>
						</div>
					</section>

					{/* Media Conservatory */}
					<section className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-3">
								<span className="material-symbols-outlined text-primary text-3xl">photo_library</span>
								<h2 className="font-serif text-2xl font-black text-on-surface">Media Conservatory</h2>
							</div>
							<div>
								<input
									type="file"
									id="asset-upload"
									className="hidden"
									accept="image/*"
									multiple
									onChange={handleImageUpload}
								/>
								<label 
									htmlFor="asset-upload"
									className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2 cursor-pointer"
								>
									<span className="material-symbols-outlined text-sm">add_photo_alternate</span>
									Upload Assets
								</label>
							</div>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{/* Persisted Images */}
							{images.map((img) => (
								<div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-surface-container shadow-sm">
									<img 
										src={img.url} 
										alt="Monument Asset" 
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
									/>
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
										<button 
											onClick={() => handleDeleteImage(img.id)}
											className="p-2 bg-error text-white rounded-lg hover:bg-error-container hover:text-on-error-container transition-all"
											title="Delete Asset"
										>
											<span className="material-symbols-outlined text-sm">delete</span>
										</button>
									</div>
								</div>
							))}

							{/* Pending Images */}
							{pendingImages.map((img) => (
								<div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-dashed border-primary/30 shadow-sm opacity-70">
									<img 
										src={img.url} 
										alt="Pending Asset" 
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center gap-2">
										<span className="bg-primary text-on-primary text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full">Enshrining...</span>
										<button 
											onClick={() => setPendingImages(prev => prev.filter(p => p.id !== img.id))}
											className="p-1.5 bg-error text-white rounded-lg hover:bg-error-container transition-all"
										>
											<span className="material-symbols-outlined text-xs">close</span>
										</button>
									</div>
								</div>
							))}
							
							<label 
								htmlFor="asset-upload"
								className="aspect-square bg-surface-container-low rounded-2xl border-2 border-dashed border-surface-container flex items-center justify-center group cursor-pointer hover:border-primary/30 transition-all"
							>
								<span className="material-symbols-outlined text-on-surface-variant text-3xl group-hover:scale-110 transition-transform">add</span>
							</label>
						</div>
					</section>
				</div>

				{/* Side Orchestration Panel */}
				<div className="space-y-8">
					{/* Status Section */}
					<section className="bg-surface-container-low p-6 rounded-3xl border border-surface-container">
						<h3 className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4">Availability Status</h3>
						<div className="grid grid-cols-3 gap-2">
							{["DRAFT", "LIVE", "ARCHIVED"].map((s) => (
								<button
									key={s}
									onClick={() => setStatus(s)}
									className={`py-2 rounded-xl text-xs font-black transition-all ${
										status === s 
											? "bg-primary text-on-primary shadow-lg shadow-primary/30" 
											: "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
									}`}
								>
									{s}
								</button>
							))}
						</div>
					</section>

					{/* Geolocation metadata */}
					<section className="bg-surface-container-low p-6 rounded-3xl border border-surface-container">
						<h3 className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant mb-6">Discovery Metadata</h3>
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Latitude</label>
									<input
										type="number"
										step="any"
										value={latitude}
										onChange={(e) => setLatitude(e.target.value)}
										className="w-full bg-surface-container-high p-3 rounded-xl border border-transparent focus:border-primary outline-none text-sm font-bold transition-all"
									/>
								</div>
								<div>
									<label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Longitude</label>
									<input
										type="number"
										step="any"
										value={longitude}
										onChange={(e) => setLongitude(e.target.value)}
										className="w-full bg-surface-container-high p-3 rounded-xl border border-transparent focus:border-primary outline-none text-sm font-bold transition-all"
									/>
								</div>
							</div>
							<div>
								<label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Historical Period (Era)</label>
								<input
									type="text"
									value={era}
									placeholder="e.g. 17th Century Malla"
									onChange={(e) => setEra(e.target.value)}
									className="w-full bg-surface-container-high p-3 rounded-xl border border-transparent focus:border-primary outline-none text-sm font-bold transition-all"
								/>
							</div>
						</div>
					</section>

					{/* Dynamic Insights Panel */}
					<section className="bg-surface-container-low p-6 rounded-3xl border border-surface-container overflow-hidden relative">
						<div className="relative z-10">
							<h3 className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant mb-6 flex items-center gap-2">
								<span className="material-symbols-outlined text-xs">analytics</span>
								Live Insights
							</h3>
							
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-xs font-bold text-on-surface-variant">Global Discoveries</span>
									<span className="text-xl font-serif font-black text-on-surface">{insights.totalScans}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-xs font-bold text-on-surface-variant">Avg. Feedback</span>
									<span className="flex items-center gap-1 text-xl font-serif font-black text-on-surface">
										{insights.avgRating}
										<span className="material-symbols-outlined text-amber-500 text-sm">star</span>
									</span>
								</div>
								<div className="pt-4 border-t border-surface-container-high">
									<div className="flex justify-between items-center mb-2">
										<span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Sentiment Aura</span>
										<span className="text-xs font-black text-primary uppercase tracking-widest">{insights.positiveRatio}% Positive</span>
									</div>
									<div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
										<div className="h-full bg-primary transition-all duration-1000" style={{ width: `${insights.positiveRatio}%` }}></div>
									</div>
								</div>
							</div>

							<Link 
								to="/admin/feedback" 
								className="block w-full mt-6 py-3 bg-surface-container-high rounded-xl text-center text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
							>
								View Global Feed →
							</Link>
						</div>
					</section>

					{/* Synthesis Hub Link */}
					{!isNew && (
						<Link 
							to="/admin/audio-gen"
							className="block w-full p-6 bg-gradient-to-br from-primary to-primary-container rounded-3xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all group"
						>
							<div className="flex items-center justify-between mb-2">
								<span className="material-symbols-outlined text-on-primary text-3xl">graphic_eq</span>
								<span className="material-symbols-outlined text-on-primary opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
							</div>
							<h3 className="text-on-primary font-serif font-black text-xl mb-1">Synthesis Hub</h3>
							<p className="text-on-primary/70 text-xs font-bold uppercase tracking-widest">Generate neural guides for this asset</p>
						</Link>
					)}
				</div>
			</div>
			)}
		</main>
	);
}
