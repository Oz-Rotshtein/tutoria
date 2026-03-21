import { prisma } from "@/lib/prisma"; 
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookOpen, Clock, DollarSign, User } from "lucide-react";
import BookingSection from "@/components/BookingSection"; 
import ProfileTabs from "@/components/profileTabs";

export const revalidate = 0;

export default async function TutorProfilePage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const {username} = await params;

  const tutor = await prisma.tutor.findUnique({
    where: { username: username },
    include: {
      subjects: true,
      education: { orderBy: { startYear: 'desc' } },
      experience: { orderBy: { startYear: 'desc' } },
      availability: true, 
      user: true, // ✨ Fetches the NextAuth user data (where the image lives!)
      bookings: {
           select: { day: true, timeSlot: true, status: true }                                                                                                                                         
      }
    },
  });

  if (!tutor) return notFound();

  console.log("✅ Bookings found in DB:", tutor.bookings.length);

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Top Header Mock-up */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          {/* ✨ UPGRADED AVATAR SECTION */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0 border-4 border-white shadow-lg overflow-hidden relative">
            {tutor.user?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={tutor.user.image} alt={tutor.name} className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <User className="w-16 h-16" />
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black text-slate-900 mb-2">{tutor.name}</h1>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              {tutor.subjects.map(subject => (
                <span key={subject.id} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {subject.name}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-600 font-medium">
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span className="text-xl text-slate-900 font-bold">${tutor.pricePerHour}</span> / hr
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                {tutor.defaultDuration} min sessions
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: The Interactive Tabs */}
          <div className="lg:col-span-2">
            <ProfileTabs 
              bio={tutor.bio} 
              education={tutor.education} 
              experience={tutor.experience} 
            />
          </div>

          {/* Right Column: The Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingSection 
                tutorId={tutor.id} 
                pricePerHour={tutor.pricePerHour} 
                availability={tutor.availability} 
                duration={tutor.defaultDuration}
                bookings={tutor.bookings}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}