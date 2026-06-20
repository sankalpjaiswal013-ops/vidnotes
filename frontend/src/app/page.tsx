"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Simple auth check
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setError("");
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to process video");
      }

      const data = await res.json();
      router.push(`/video/${data.video_id}`);
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg">
              V
            </div>
            <span className="text-xl font-bold tracking-tight">VidNotes</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 pb-2">
              Learn without watching.
            </h1>
            <p className="text-xl text-neutral-400 max-w-xl mx-auto">
              Paste a YouTube link and instantly get complete written notes, flashcards, and a quiz.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-lg text-sm text-left max-w-lg mx-auto">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-neutral-800 rounded-xl p-2 border border-neutral-700 shadow-2xl">
              <div className="pl-4 text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube link here..."
                className="w-full bg-transparent border-none text-lg px-4 py-3 focus:outline-none focus:ring-0 text-white placeholder-neutral-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing AI...
                  </>
                ) : "Generate Notes"}
              </button>
            </div>
          </form>
          
          <div className="text-sm text-neutral-500">
            Supports normal videos, Shorts, and lecture recordings.
          </div>
        </div>
      </main>
    </div>
  );
}
