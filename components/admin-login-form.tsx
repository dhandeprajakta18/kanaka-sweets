"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f0] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[#a67c36] uppercase tracking-[0.35em] text-xs mb-4">
            Kanaka Sweets & Bakery
          </p>

          <h1 className="text-3xl md:text-4xl font-serif text-[#6b1725]">
            Admin Portal
          </h1>

          <p className="text-gray-500 mt-3 text-sm">
            Sign in to manage your store
          </p>
        </div>

        <div className="bg-white border border-[#eadfce] rounded-2xl shadow-sm p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-[#e5d8c7] bg-[#fffdf9] px-4 py-3 text-gray-800 outline-none focus:border-[#8a2635] focus:ring-2 focus:ring-[#8a2635]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-[#e5d8c7] bg-[#fffdf9] px-4 py-3 text-gray-800 outline-none focus:border-[#8a2635] focus:ring-2 focus:ring-[#8a2635]/10"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#6b1725] hover:bg-[#801f30] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Protected administration access
        </p>
      </div>
    </div>
  );
}