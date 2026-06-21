"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [data, setData] = useState<{ users: any[], videos: any[] } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Basic protection (you could add real admin roles later)
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    fetch("http://127.0.0.1:8000/api/admin/data")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err));
  }, [router]);

  if (!data) return <div className="p-8 text-white">Loading database...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">🗄️ Database Dashboard</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Back to App</Link>
        </div>

        {/* Users Table */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-neutral-300">Registered Users ({data.users.length})</h2>
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-neutral-900 border-b border-neutral-700">
                <tr>
                  <th className="p-4 text-neutral-400 font-medium">ID</th>
                  <th className="p-4 text-neutral-400 font-medium">Email</th>
                  <th className="p-4 text-neutral-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-700/50">
                    <td className="p-4 text-neutral-400">#{user.id}</td>
                    <td className="p-4 font-medium">{user.email}</td>
                    <td className="p-4">
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                        {user.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-neutral-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Videos Table */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-neutral-300">Processed Videos ({data.videos.length})</h2>
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-neutral-900 border-b border-neutral-700">
                <tr>
                  <th className="p-4 text-neutral-400 font-medium">ID</th>
                  <th className="p-4 text-neutral-400 font-medium">Video Title</th>
                  <th className="p-4 text-neutral-400 font-medium">Channel</th>
                  <th className="p-4 text-neutral-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {data.videos.map((video) => (
                  <tr key={video.id} className="hover:bg-neutral-700/50">
                    <td className="p-4 text-neutral-400">#{video.id}</td>
                    <td className="p-4 font-medium max-w-[200px] truncate" title={video.title}>{video.title}</td>
                    <td className="p-4 text-neutral-300">{video.channel}</td>
                    <td className="p-4">
                      <Link href={`/video/${video.video_id}`} className="text-blue-400 hover:underline text-sm">
                        View Notes
                      </Link>
                    </td>
                  </tr>
                ))}
                {data.videos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-500">No videos processed yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
