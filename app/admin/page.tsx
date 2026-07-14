"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { Loader2, Trash2, UploadCloud, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// Define the project type
type Project = {
  id: string;
  title: string;
  category: string;
  video_url: string;
  thumbnail_url: string;
};

const CATEGORIES = [
  'COLOUR GRADING',
  'OTHER PROJECTS',
  'BIRTHDAY PRE-SHOOT EDIT COLLECTION',
  'HIGLIGHTS EDIT COLLECTION',
  'WEDDING GROOM EDIT COLLECTION',
  'WEDDING BIRID EDIT COLLECTION',
  'AI AND OTHER SAVE THE DATE EDIT COLLECTION',
  'AI MEMORABLE VIDEO COLLECTION',
  'MODEL SHOT EDIT COLLECTION',
  'OUTHAR EDIT WORKS COLLECTION'
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [videoSource, setVideoSource] = useState<"url" | "file">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = async () => {
    setIsFetching(true);
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projError) {
      console.error("Error fetching projects:", projError);
    } else {
      setProjects(projData || []);
    }

    const { data: revData, error: revError } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (revError) {
      console.error("Error fetching reviews:", revError);
    } else {
      setReviews(revData || []);
    }

    setIsFetching(false);
  };

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) fetchProjects();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) fetchProjects();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory(CATEGORIES[0]);
    setVideoSource("url");
    setVideoUrl("");
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !thumbnailFile) {
      alert("Please fill in all fields and select a thumbnail image.");
      return;
    }
    if (videoSource === "url" && !videoUrl) {
      alert("Please enter a video URL.");
      return;
    }
    if (videoSource === "file" && !videoFile) {
      alert("Please select a video file.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-thumbnails')
        .upload(filePath, thumbnailFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('portfolio-thumbnails')
        .getPublicUrl(filePath);

      // 1.5 Upload video file if selected
      let finalVideoUrl = videoUrl;
      if (videoSource === "file" && videoFile) {
        const vidExt = videoFile.name.split('.').pop();
        const vidName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${vidExt}`;
        const vidPath = `videos/${vidName}`;

        const { error: vidUploadError } = await supabase.storage
          .from('portfolio-thumbnails')
          .upload(vidPath, videoFile);

        if (vidUploadError) throw vidUploadError;

        const { data: { publicUrl: vUrl } } = supabase.storage
          .from('portfolio-thumbnails')
          .getPublicUrl(vidPath);
          
        finalVideoUrl = vUrl;
      }

      // 2. Insert into projects table
      const { error: dbError } = await supabase
        .from('projects')
        .insert({
          title,
          category,
          video_url: finalVideoUrl,
          thumbnail_url: thumbUrl
        });

      if (dbError) throw dbError;

      // 3. Reset form and refresh list
      resetForm();
      fetchProjects();
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, thumbnailUrl: string, videoUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const filesToRemove = [];
      const thumbParts = thumbnailUrl.split('/portfolio-thumbnails/');
      if (thumbParts.length > 1) {
        filesToRemove.push(thumbParts[1]);
      }
      const vidParts = videoUrl.split('/portfolio-thumbnails/');
      if (vidParts.length > 1) {
        filesToRemove.push(vidParts[1]);
      }

      if (filesToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('portfolio-thumbnails')
          .remove(filesToRemove);
        if (storageError) console.error("Error deleting from storage:", storageError);
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 3. Update UI
      setProjects(projects.filter(p => p.id !== id));
    } catch (error: unknown) {
      console.error("Delete failed:", error);
      alert(`Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleReviewApproval = async (id: string, currentStatus: boolean) => {
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_approved: !currentStatus })
      .eq('id', id)
      .select();

    if (error) {
      alert("Error updating review: " + error.message);
    } else if (!data || data.length === 0) {
      alert("Error: Database blocked the update. This means your database is missing the 'UPDATE' security policy! Please run the SQL fix.");
    } else {
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error deleting review: " + error.message);
    } else {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  // Auth Gate UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
        <div className="glass-card w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/60 text-sm mt-2">Sign in to manage portfolio</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm">
                {authError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-white/90 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard UI
  return (
    <div className="min-h-screen bg-[#09090b] p-6 lg:p-12 relative">
      {/* Uploading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-white">Uploading media assets...</h2>
          <p className="text-white/70 mt-2 text-lg">Please do not close this window.</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Portfolio Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* A. Project Upload Form Component */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Add New Project</h2>
            <form onSubmit={handleUpload} className="glass-card p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Video Source</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="videoSource" 
                      value="url" 
                      checked={videoSource === "url"} 
                      onChange={() => setVideoSource("url")} 
                      className="accent-white"
                    />
                    <span className="text-sm text-white/80">YouTube/Vimeo URL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="videoSource" 
                      value="file" 
                      checked={videoSource === "file"} 
                      onChange={() => setVideoSource("file")} 
                      className="accent-white"
                    />
                    <span className="text-sm text-white/80">Upload Video File</span>
                  </label>
                </div>
                
                {videoSource === "url" ? (
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    required={videoSource === "url"}
                  />
                ) : (
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                      accept="video/*"
                      className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                      required={videoSource === "file" && !videoFile}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Thumbnail Image</label>
                <div
                  className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors cursor-pointer relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="relative aspect-video w-full rounded-md overflow-hidden">
                      <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 py-4">
                      <UploadCloud className="w-10 h-10 text-white/50" />
                      <p className="text-sm text-white/60">Click or drag and drop to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    required={!thumbnailFile}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-white text-black font-semibold py-3 rounded-md hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                Upload Project
              </button>
            </form>
          </div>

          {/* B. Portfolio Management List Component */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Manage Projects</h2>

            {isFetching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 border border-white/5 rounded-xl bg-white/5">
                <p className="text-white/50">No projects found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="relative w-24 h-16 rounded-md overflow-hidden bg-white/10 shrink-0">
                      {project.thumbnail_url ? (
                        <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{project.title}</h3>
                      <p className="text-sm text-white/50">{project.category}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(project.id, project.thumbnail_url, project.video_url)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* C. Reviews Management List Component */}
        <div className="space-y-6 pt-12 border-t border-white/10">
          <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Manage Reviews</h2>
          
          {isFetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 border border-white/5 rounded-xl bg-white/5">
              <p className="text-white/50">No reviews found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map(review => (
                <div key={review.id} className={`glass-card p-6 border ${review.is_approved ? 'border-green-500/30' : 'border-yellow-500/50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-lg">{review.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${review.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {review.is_approved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-4">&quot;{review.text}&quot;</p>
                  
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => handleReviewApproval(review.id, review.is_approved)}
                      className={`flex-1 py-2 rounded-md font-semibold text-sm transition-colors ${review.is_approved ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                    >
                      {review.is_approved ? 'Hide' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
