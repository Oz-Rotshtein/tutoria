import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Navbar() {
  // ✨ Securely fetch the logged-in user's session directly from the server!
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-black text-indigo-600 tracking-tight hover:opacity-80 transition">
            Tutorly.
          </Link>

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {session && session.user ? (
              // ✅ IF LOGGED IN: Show Profile & Sign Out
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img 
                    src={session.user.image || ""} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                  <span className="text-sm font-bold text-slate-700 hidden sm:block">
                    {session.user.name}
                  </span>
                </div>
                {/* NextAuth provides a built-in signout route! */}
                <Link 
                  href="/api/auth/signout" 
                  className="text-sm font-bold text-slate-500 hover:text-slate-900 transition"
                >
                  Log out
                </Link>
              </div>
            ) : (
              // ❌ IF NOT LOGGED IN: Show Sign In
              <Link 
                href="/api/auth/signin" 
                className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}