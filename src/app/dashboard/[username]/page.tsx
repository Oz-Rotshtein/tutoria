import { db } from "@/lib/db";
import { 
  CalendarDays, Users, Clock, CheckCircle, 
  GraduationCap, Briefcase, Settings, Plus 
} from "lucide-react";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";
import BookingActions from "@/components/BookingActions"; 
import AvailabilityManager from "@/components/AvailabilityManager";

// ✨ Swapped this to prevent the Next.js infinite refresh bug!
export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
   const {username} = await params;
  const tutor = await db.tutor.findUnique({
    where: { username: username },
    include: {
      education: { orderBy: { startYear: 'desc' } },
      experience: { orderBy: { startYear: 'desc' } },
      subjects: true,
      availability: true, // ✨ Added this so the DB actually fetches the timeslots!
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
          
          {/* Editable Settings Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
              <Settings className="w-5 h-5 text-indigo-600" />
              General Information
            </h2>
            <SettingsForm initialData={tutor} />
          </div>

          {/* ✨ NEW: Availability Manager */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
              <Clock className="w-5 h-5 text-indigo-600" />
              Manage Schedule
            </h2>
            <AvailabilityManager tutorId={tutor.id} availability={tutor.availability} />
          </div>

          {/* Past Experience */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Teaching Experience
              </h2>
              <button className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition">
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
            
            {tutor.experience.length > 0 ? (
              <div className="space-y-4">
                {tutor.experience.map((exp) => (
                  <div key={exp.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{exp.title}</p>
                        <p className="text-indigo-600 text-sm font-bold">{exp.company}</p>
                      </div>
                      <span className="text-slate-500 text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-200">
                        {exp.startYear} - {exp.endYear || 'Present'}
                      </span>
                    </div>
                    {exp.description && <p className="text-slate-600 text-sm mt-3 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No experience added yet.</p>
            )}
          </div>

          {/* Education History */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Education
              </h2>
              <button className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition">
                <Plus className="w-4 h-4" /> Add Degree
              </button>
            </div>
            
            {tutor.education.length > 0 ? (
              <div className="space-y-4">
                {tutor.education.map((edu) => (
                  <div key={edu.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{edu.degree}</p>
                      <p className="text-slate-500 text-sm font-medium">{edu.institution}</p>
                    </div>
                    <span className="text-slate-500 text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-200">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No education history added yet.</p>
            )}
          </div>

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