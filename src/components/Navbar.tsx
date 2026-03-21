import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GraduationCap, LogIn, LayoutDashboard, LogOut, Search } from "lucide-react";

export default async function Navbar() {
  // Grab the secure session directly on the server!
  const session = await getServerSession(authOptions);

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* 1. BRAND LOGO */}
        <Link href="/" className="flex items-center gap-2 text-indigo-600 font-black text-xl tracking-tight group">
          <GraduationCap className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
          Tutorly
        </Link>

        {/* 2. NAVIGATION LINKS */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* Always show the Search button */}
          <Link href="/tutors" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
            <Search className="w-4 h-4" /> 
            <span className="hidden md:inline">Find Tutors</span>
          </Link>

          {/* Conditional Rendering based on Authentication */}
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> 
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              
              <Link href="/api/auth/signout" className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-100">
                <LogOut className="w-4 h-4" /> 
                <span className="hidden md:inline">Sign Out</span>
              </Link>
            </>
          ) : (
            <Link href="/api/auth/signin" className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm">
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          )}
          
        </div>
      </div>
    </nav>
  );
}