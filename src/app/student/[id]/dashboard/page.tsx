import { db } from "@/lib/db";
import { 
  CalendarDays, Clock, CheckCircle, 
  GraduationCap 
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage({
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // ✨ 1. Grab the ID directly from the URL!
  const { id } = await params;

  // ✨ 2. Fetch the student using the URL parameter
  const student = await db.student.findUnique({
    where: { id: id },
    include: {
      bookings: {
        include: {
          tutor: {
            include: { subjects: true }
          }, 
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!student) {
    console.log("❌ No student found for ID:", id);
    return notFound();
  }

  const pendingBookings = student.bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = student.bookings.filter(b => b.status === 'CONFIRMED');

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <header className="max-w-5xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-slate-900">My Learning Dashboard</h1>
        <p className="text-slate-500 text-lg mt-1">Welcome back, {student.name}!</p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Confirmed Upcoming Lessons */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Confirmed Lessons
          </h2>
          
          {confirmedBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">You have no upcoming lessons.</p>
              <Link href="/" className="text-indigo-600 font-bold text-sm hover:underline mt-2 inline-block">
                Find a Tutor
              </Link>
            </div>
          ) : (
            confirmedBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Lesson with {booking.tutor.name}</p>
                    <Link href={`/tutor/${booking.tutor.username}`} className="text-indigo-600 text-sm font-bold hover:underline">
                      View Profile
                    </Link>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    Confirmed
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 ml-2">
                  <div className="bg-white p-3 rounded-xl text-emerald-600 shadow-sm">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{booking.day}</p>
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {booking.timeSlot}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Pending Requests */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Requests
          </h2>

          {pendingBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No pending requests right now.</p>
            </div>
          ) : (
            pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Request sent to {booking.tutor.name}</p>
                    <p className="text-slate-500 text-sm mt-1">Waiting for tutor to accept...</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {booking.day} | {booking.timeSlot}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}