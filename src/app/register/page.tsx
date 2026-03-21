"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, GraduationCap, BookOpen, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" // Default to Student
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // If successful, send them straight to the login page!
      router.push("/api/auth/signin?registered=true");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-black text-3xl tracking-tight mb-4">
          <GraduationCap className="w-10 h-10" /> Tutorly
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
        <p className="mt-2 text-slate-500">Join our community of learners and experts.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* ROLE SELECTOR */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "STUDENT" })}
                  className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                    form.role === "STUDENT" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200"
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Learn
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "TUTOR" })}
                  className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                    form.role === "TUTOR" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Teach
                </button>
              </div>
            </div>

            {/* INPUT FIELDS */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
                placeholder="Jordan Miller"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
                placeholder="jordan@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password" required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit" disabled={isPending}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex justify-center items-center shadow-lg shadow-indigo-600/20"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link href="/api/auth/signin" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}