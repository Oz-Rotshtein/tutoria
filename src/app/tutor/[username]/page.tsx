import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import { 
  Star, MapPin, Video, Home, BookOpen, 
  GraduationCap, Briefcase, CalendarDays, Clock, CheckCircle2 
} from "lucide-react";

export default async function TutorProfilePage({ params }: { params: Promise<{ username: string } >}) {
  const dict = await getDictionary();

  const resolvedParams = await params;
  // Fetch the tutor and all their relations
  const tutor = await prisma.tutor.findUnique({
    where: { username: resolvedParams.username },
    include: {
      user: true,
      subjects: true,
      experience: { orderBy: { startYear: 'desc' } },
      education: { orderBy: { startYear: 'desc' } },
      availability: true,
    }
  });

  if (!tutor) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">{dict.publicProfile.notFoundTitle}</h1>
        <p className="text-slate-500 font-medium">{dict.publicProfile.notFoundDesc}</p>
        <Link href="/tutors" className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
          {dict.nav.findTutors}
        </Link>
      </div>
    );
  }

  // Parse teaching methods safely
  const methods = tutor.teachingModes || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* 1. HERO BANNER */}
      <div className="bg-slate-900 pt-20 pb-32 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-start">
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-white rounded-full p-1.5 shadow-2xl">
            {tutor.user.image ? (
              <img src={tutor.user.image} alt={tutor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-4xl font-black">
                {tutor.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-white flex-1">
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
              {tutor.name}
              {tutor.education.some(e => e.documentUrl) && (
                <span title="Verified Education" className="flex"> 
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </span>
              )}
            </h1>
            <p className="text-xl text-indigo-200 font-medium mb-4">{tutor.tagLine || "Expert Tutor"}</p>
            
            {/* Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold border border-white/10">
                 <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                 <span>5.0 (New)</span>
               </div>
               <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold border border-white/10">
                 <BookOpen className="w-4 h-4 text-indigo-300" />
                 <span>{tutor.subjects.length} {dict.publicProfile.subjects}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{dict.publicProfile.aboutMe}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{tutor.bio || "No bio provided."}</p>
            </section>

            {tutor.teachingModes && (
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{dict.publicProfile.teachingStyle}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{tutor.teachingModes}</p>
              </section>
            )}

            {tutor.subjects.length > 0 && (
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> {dict.publicProfile.subjects}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map(sub => (
                    <span key={sub.id} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {tutor.experience.length > 0 && (
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" /> {dict.publicProfile.experience}
                </h2>
                <div className="space-y-6">
                  {tutor.experience.map(exp => (
                    <div key={exp.id} className="relative pl-6 rtl:pl-0 rtl:pr-6 border-l-2 rtl:border-l-0 rtl:border-r-2 border-slate-100">
                      <div className="absolute top-1.5 -left-[7px] rtl:-left-auto rtl:-right-[7px] w-3 h-3 rounded-full bg-indigo-600 border-2 border-white"></div>
                      <h3 className="font-bold text-slate-900 text-lg">{exp.title}</h3>
                      <p className="text-indigo-600 font-bold text-sm mb-1">{exp.company}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {exp.startYear} - {exp.endYear || dict.publicProfile.present}
                      </p>
                      {exp.description && <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tutor.education.length > 0 && (
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" /> {dict.publicProfile.education}
                </h2>
                <div className="space-y-6">
                  {tutor.education.map(edu => (
                    <div key={edu.id} className="relative pl-6 rtl:pl-0 rtl:pr-6 border-l-2 rtl:border-l-0 rtl:border-r-2 border-slate-100">
                      <div className="absolute top-1.5 -left-[7px] rtl:-left-auto rtl:-right-[7px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <h3 className="font-bold text-slate-900 text-lg">{edu.degree}</h3>
                      <p className="text-slate-600 font-bold text-sm mb-1">{edu.institution}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {edu.startYear} - {edu.endYear || dict.publicProfile.present}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 sticky top-24 overflow-hidden">
              
              {/* Pricing Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-black text-slate-900">${tutor.pricePerHour}</span>
                  <span className="text-slate-500 font-bold pb-1">{dict.publicProfile.pricePerHour}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {tutor.defaultDuration} {dict.publicProfile.sessionLength}
                </div>
              </div>

              {/* Teaching Locations */}
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  {dict.publicProfile.locations}
                </h3>
                <div className="space-y-3">
                  {methods.includes("ONLINE") && (
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Video className="w-5 h-5 text-indigo-600" /> {dict.publicProfile.online}
                    </div>
                  )}
                  {methods.includes("IN_PERSON_TUTOR") && (
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Home className="w-5 h-5 text-indigo-600" /> {dict.publicProfile.atTutor}
                    </div>
                  )}
                  {methods.includes("IN_PERSON_STUDENT") && (
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <MapPin className="w-5 h-5 text-indigo-600" /> {dict.publicProfile.atStudent}
                    </div>
                  )}
                  {methods.length === 0 && (
                    <p className="text-sm text-slate-500 italic">Not specified.</p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="p-8">
                <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-600/25">
                  <CalendarDays className="w-5 h-5" />
                  {dict.publicProfile.bookLesson}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}