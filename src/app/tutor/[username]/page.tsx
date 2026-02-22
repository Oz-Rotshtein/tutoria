import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { 
  Star, MapPin, GraduationCap, Clock, 
  ShieldCheck, MessageSquare, Calendar, 
  BookOpen, Award, Globe, ChevronDown 
} from 'lucide-react';

import { Availability } from "@prisma/client";
import TutorCalendar from "@/components/TutorCalendar";

// Forces Next.js to fetch from the DB on every single refresh
export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface Subject {
  id: string;
  name: string;
}

interface Tutor {
  id: string;
  name: string;
  bio: string;
  pricePerHour: number;
  profileImage: string | null;
  subjects: Subject[];
  _count?: { lessons: number; }
  availability : Availability[];
  lessonDuration: number;
}

export default async function TutorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const tutorNameFromURL = username.split('-').join(' ').trim();

  const tutor = await db.tutor.findFirst({
    where: {
      name: { contains: tutorNameFromURL.trim(), mode: 'insensitive' }
    },
    include: {
      subjects: true,
      _count: { select: { lessons: true } },
      availability: true
    }
  }) as Tutor | null;

  if (!tutor) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Tutorly Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
            <span className="font-bold text-xl tracking-tight text-indigo-600">Tutorly</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <span className="hover:text-indigo-600 cursor-pointer">Find Tutors</span>
            <span className="hover:text-indigo-600 cursor-pointer">How it works</span>
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition shadow-sm">Sign In</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Hero Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative">
                  <div className="w-32 h-32 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-4xl font-bold ring-4 ring-indigo-50 overflow-hidden">
                    {tutor.profileImage ? (
                      <img src={tutor.profileImage} alt={tutor.name} className="w-full h-full object-cover" />
                    ) : (
                      tutor.name.charAt(0)
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold capitalize">{tutor.name}</h1>
                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                  </div>
                  <p className="text-slate-600 text-lg mb-4 italic">Verified Tutorly Partner</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span>4.9 (124 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{tutor._count?.lessons || 0} hours taught</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Globe className="w-4 h-4" />
                      <span>Online / Remote</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Information */}
              <div className="mt-8 border-t border-slate-50 pt-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                    About Me
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                    {tutor.bio || "Welcome to my profile! I haven't added my bio yet..."}
                  </p>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-500" />
                      Subjects I Teach
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map(subject => (
                        <span key={subject.id} className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-medium">
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTEGRATED CALENDAR HERE */}
            <TutorCalendar availability={tutor.availability} duration={tutor.lessonDuration} />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-slate-900 sticky top-24">
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold">${tutor.pricePerHour}</span>
                <span className="text-slate-500 text-sm font-medium mb-1">/ hour</span>
              </div>

              {/* Subject Select */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Choose Subject</label>
                <div className="relative">
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer">
                    {tutor.subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-md transform hover:-translate-y-0.5">
                  Book a Session
                </button>
                <button className="w-full bg-white text-slate-700 border border-slate-200 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Message {tutor.name.split(" ")[0]}
                </button>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                   <Calendar className="w-5 h-5 text-amber-600" />
                   <p className="text-[11px] leading-tight text-amber-800 font-medium">
                     Tutor responds quickly. Booking window is open for the next 14 days.
                   </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}