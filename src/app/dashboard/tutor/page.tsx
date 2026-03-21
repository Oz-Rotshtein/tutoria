import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { 
  CalendarDays, Users, Clock, CheckCircle, 
  Settings 
} from "lucide-react";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";
import BookingActions from "@/components/BookingActions"; 
import AvailabilityManager from "@/components/AvailabilityManager";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SubjectManager from "@/components/SubjectManager";
import ProfileImageManager from "@/components/ProfileImageManager";
import EducationManager from "@/components/EducationManager";
import ExperienceManager from "@/components/ExperienceManager";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // ✨ SECURITY LAYER 1 & 2: Get session and verify they are a logged-in Tutor
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 font-medium">You must be signed in to view this page.</p>
        <Link href="/api/auth/signin" className="mt-4 text-indigo-600 font-bold hover:underline">Sign In</Link>
      </div>
    );
  }

  if (session.user.role !== "TUTOR") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Tutors Only</h2>
        <p className="text-slate-500 font-medium">Students do not have access to the tutor dashboard.</p>
      </div>
    );
  }

  // Fetch the dashboard data
  const tutor = await prisma.tutor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true, // ✨ We MUST include the parent User to verify ownership!
      education: { orderBy: { startYear: 'desc' } },
      experience: { orderBy: { startYear: 'desc' } },
      subjects: true,
      availability: true, 
      bookings: {
        include: { student: true }, 
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tutor) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Tutor Not Found</h2>
      <p className="text-slate-500">Please paste a valid Tutor ID from your seed script into the <code>MOCK_TUTOR_ID</code> variable.</p>
    </div>
  );

  // ✨ SECURITY LAYER 3: Ownership Lock! 
  if (tutor.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <div className="bg-red-50 border-2 border-red-200 p-8 rounded-3xl text-center max-w-md">
          <h2 className="text-2xl font-black text-red-600 mb-2">Security Violation</h2>
          <p className="text-red-800 font-medium">You are not authorized to view another tutor's private dashboard.</p>
        </div>
      </div>
    );
  }

  // Calculate stats based on this specific tutor's history
  const totalBookings = tutor.bookings.length;
  const uniqueStudents = new Set(tutor.bookings.map(b => b.studentId)).size;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tutor Dashboard</h1>
          <p className="text-slate-500 text-lg mt-1">Manage your profile and students as {tutor.name}.</p>
        </div>
        <Link 
          href={`/tutor/${tutor.username}`}
          className="bg-white border-2 border-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all text-center"
        >
          View Public Profile
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Bookings" value={totalBookings} icon={<CalendarDays />} color="text-indigo-600" />
        <StatCard title="Unique Students" value={uniqueStudents} icon={<Users />} color="text-purple-600" />
        <StatCard title="Hourly Rate" value={`$${tutor.pricePerHour}`} icon={<Clock />} color="text-emerald-600" />
        <StatCard title="Session Length" value={`${tutor.defaultDuration}m`} icon={<CheckCircle />} color="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Management */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Editable Settings Form & Profile Image */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
              <Settings className="w-5 h-5 text-indigo-600" />
              General Information
            </h2>
            <ProfileImageManager currentImageUrl={tutor.user.image} />
            <div className="mt-8 border-t border-slate-100 pt-8">
              <SettingsForm initialData={tutor} />
            </div>
          </div>

          {/* Subject Manager */}
          <SubjectManager currentSubjects={tutor.subjects} />

          {/* Availability Manager */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
              <Clock className="w-5 h-5 text-indigo-600" />
              Manage Schedule
            </h2>
            <AvailabilityManager tutorId={tutor.id} availability={tutor.availability} />
          </div>

          {/* ✨ LIVE COMPONENTS: Past Experience & Education History */}
          <ExperienceManager currentExperience={tutor.experience} />
          <EducationManager currentEducation={tutor.education} />

        </div>

        {/* RIGHT COLUMN: Upcoming Schedule */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              Incoming Requests
            </h2>
            <div className="space-y-4">
              {tutor.bookings.map((booking) => (
                <div key={booking.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-slate-900 text-lg">{booking.student.name}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                      booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-4 bg-slate-50 p-2 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {booking.day} | {booking.timeSlot}
                  </div>
                  
                  {booking.status === 'PENDING' ? (
                    <BookingActions bookingId={booking.id} />
                  ) : (
                    <button className="w-full mt-4 text-sm font-bold py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition">
                      View Details
                    </button>
                  )}
                </div>
              ))}
              {tutor.bookings.length === 0 && (
                <p className="text-center text-slate-400 py-10 italic font-medium">No pending requests.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Strictly Typed Helper Component
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