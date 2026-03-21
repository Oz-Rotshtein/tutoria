import Link from "next/link";
import { 
  Search, 
  CalendarDays, 
  TrendingUp, 
  Star, 
  ShieldCheck, 
  Video,
  ArrowRight,
  MapPin,
  Laptop
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="font-sans">
      
      {/* 1. DYNAMIC HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 blur-3xl rounded-full mix-blend-multiply opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm mb-8 border border-indigo-100">
            <Star className="w-4 h-4 fill-indigo-600" />
            <span>The #1 Platform for Expert Tutoring</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
            Master any subject. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Anytime, anywhere.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with world-class tutors, schedule flexible online or in-person lessons, and achieve your learning goals faster with our all-in-one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/tutors" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 text-lg"
            >
              <Search className="w-5 h-5" />
              Find a Tutor
            </Link>
            <Link 
              // ✨ UPDATED: Now points to our custom Registration page!
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-full hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center text-lg"
            >
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">How Tutorly Works</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Three simple steps to start your learning journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-slate-200 -z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border-2 border-slate-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:border-indigo-200 transition-all">
                <Search className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Find your expert</h3>
              {/* ✨ UPDATED: Mentioning location matching */}
              <p className="text-slate-500 leading-relaxed">Search our global network of verified tutors, or use our smart local search to find an expert right in your neighborhood.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border-2 border-slate-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:border-indigo-200 transition-all">
                <CalendarDays className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Book a time</h3>
              <p className="text-slate-500 leading-relaxed">Choose a time slot that works for you. Our smart calendar prevents double-booking and handles the time zones.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border-2 border-slate-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:border-indigo-200 transition-all">
                <Video className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Meet and learn</h3>
              {/* ✨ UPDATED: Mentioning online vs in-person */}
              <p className="text-slate-500 leading-relaxed">Hop on a secure online video call, or meet up in-person at your chosen location. The choice is yours!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Everything you need to <br className="hidden md:block"/>
                <span className="text-indigo-600">succeed.</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-indigo-50 p-3 rounded-2xl h-fit text-indigo-600"><ShieldCheck className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Verified Educators</h4>
                    <p className="text-slate-500">Every tutor goes through a strict verification process to ensure top-tier educational quality.</p>
                  </div>
                </div>

                {/* ✨ NEW FEATURE ADVERTISEMENT: Flexible Modalities */}
                <div className="flex gap-4">
                  <div className="mt-1 bg-indigo-50 p-3 rounded-2xl h-fit text-indigo-600"><MapPin className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Flexible Learning Options</h4>
                    <p className="text-slate-500">Take lessons online from anywhere in the world, or schedule local in-person sessions at your home or the tutor's location.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1 bg-indigo-50 p-3 rounded-2xl h-fit text-indigo-600"><TrendingUp className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Track Your Progress</h4>
                    <p className="text-slate-500">Your dedicated student dashboard keeps all your past and upcoming lessons perfectly organized.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative UI Mockup */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative z-10 mb-4 transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">JM</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Jordan Miller</p>
                      <p className="text-xs text-slate-500">Advanced Calculus</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Laptop className="w-3 h-3"/> ONLINE</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <CalendarDays className="w-4 h-4 text-indigo-500" /> Today at 4:00 PM
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative z-10 transform rotate-2 hover:rotate-0 transition-transform ml-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">AS</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Alex Smith</p>
                      <p className="text-xs text-slate-500">React Next.js</p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3"/> IN-PERSON</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <CalendarDays className="w-4 h-4 text-indigo-500" /> Tomorrow at 10:00 AM
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="bg-slate-900 py-24 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to reach your potential?</h2>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">Join hundreds of students already learning on Tutorly.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            // ✨ UPDATED: Added a secondary signup CTA at the bottom!
            href="/register" 
            className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-all text-lg shadow-lg hover:shadow-indigo-500/25"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}