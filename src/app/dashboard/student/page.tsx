import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { 
  CalendarDays, Clock, CheckCircle, 
  BookOpen, Users, Star, ArrowRight, Video, Search 
} from "lucide-react";
import ReviewForm from "@/components/ReviewForm";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
        <Link href="/api/auth/signin" className="mt-4 text-indigo-600 font-bold hover:underline">Sign In</Link>
      </div>
    );
  }

  // Fetch the student and all their bookings
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      bookings: {
        include: { 
          tutor: true,
          review: true 
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!student) return <div>Student profile not found.</div>;

  // ✨ CALCULATE PREMIUM DASHBOARD STATS
  const totalCompleted = student.bookings.filter(b => b.status === "COMPLETED").length;
  const upcomingLessons = student.bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING").length;
  const uniqueTutors = new Set(student.bookings.map(b => b.tutorId)).size;
  const reviewsGiven = student.bookings.filter(b => b.review !== null).length;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans pb-24">
      
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500 text-lg mt-1">Welcome back, {student.name}. Here is your learning overview.</p>
        </div>
        <Link 
          href="/tutors"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-600/25"
        >
          <Search className="w-4 h-4" /> Book a Lesson
        </Link>
      </header>

      {/* ✨ NEW: STATS GRID (Matches Tutor Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Completed Lessons" value={totalCompleted} icon={<CheckCircle />} color="text-emerald-600" />
        <StatCard title="Upcoming Lessons" value={upcomingLessons} icon={<CalendarDays />} color="text-indigo-600" />
        <StatCard title="Different Tutors" value={uniqueTutors} icon={<Users />} color="text-purple-600" />
        <StatCard title="Reviews Given" value={reviewsGiven} icon={<Star />} color="text-amber-500" />
      </div>

      {/* ✨ NEW: 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: The Lessons Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 mb-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Your Learning History
          </h2>

          {student.bookings.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No lessons yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't booked any lessons. Start exploring our expert tutors to begin learning!</p>
              <Link href="/tutors" className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-600/25">
                Explore Tutors
              </Link>
            </div>
          ) : (
            student.bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 hover:border-indigo-100 transition-colors group">
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <Link href={`/tutor/${booking.tutor.username}`} className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2 mb-2">
                      Lesson with {booking.tutor.name} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600">
                      <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg"><CalendarDays className="w-4 h-4 text-slate-400" /> {booking.day}</span>
                      <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg"><Clock className="w-4 h-4 text-slate-400" /> {booking.timeSlot}</span>
                    </div>
                  </div>
                  
                  {/* Polished Status Badge */}
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shrink-0 border ${
                    booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    booking.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    booking.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* THE REVIEW LOGIC (Intact!) */}
                {booking.status === "CONFIRMED" && !booking.review && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="bg-indigo-50/50 rounded-2xl p-2">
                      <ReviewForm 
                        bookingId={booking.id} 
                        tutorId={booking.tutorId} 
                        tutorName={booking.tutor.name || "your tutor"} 
                      />
                    </div>
                  </div>
                )}

                {booking.review && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50/50 p-4 rounded-2xl">
                    <CheckCircle className="w-5 h-5" />
                    You rated this lesson {booking.review.rating}/5 stars.
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Quick Actions Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            
            {/* Quick Action Card */}
            <div className="bg-slate-900 rounded-3xl p-8 text-center text-white shadow-xl shadow-slate-900/10">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Need a refresher?</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Book a follow-up session with your favorite tutors to keep the momentum going.</p>
              <Link href="/tutors" className="block w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 transition-colors">
                Browse Tutors
              </Link>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-500 mb-4">Having trouble connecting with a tutor or adjusting your schedule?</p>
              <button className="text-indigo-600 text-sm font-bold hover:underline">Contact Support &rarr;</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ✨ Strictly Typed Helper Component (Matches Tutor Dashboard!)
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5 transition-transform hover:-translate-y-1">
      <div className={`p-4 rounded-2xl bg-slate-50 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}