import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, BookOpen, Clock, ArrowRight, UserCircle, MapPin, Laptop, Star, BadgeCheck } from "lucide-react";
import { TeachingMode } from "@prisma/client";

export const dynamic = 'force-dynamic';

// ✨ THE MATH: Haversine Formula to calculate distance between two coordinates in Kilometers
function calculateDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export default async function TutorsSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: TeachingMode | ""; location?: string }>;
}) {
  const { q, mode, location } = await searchParams;
  const searchQuery = q || "";
  const selectedMode = mode || "";
  const locationQuery = location || "";

  // 1. Build the base database query
  const whereClause: any = {};
  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { bio: { contains: searchQuery, mode: "insensitive" } },
      { subjects: { some: { name: { contains: searchQuery, mode: "insensitive" } } } }
    ];
  }
  if (selectedMode) {
    whereClause.teachingModes = { has: selectedMode };
  }

  // 2. Fetch all matching tutors from the database
  let tutors = await prisma.tutor.findMany({
    where: whereClause,
    include: {
      subjects: true,
      availability: true,
      user: true, 
      reviews: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // ✨ 3. THE LOCATION ENGINE: Filter by exact distance!
  let searchLat: number | null = null;
  let searchLon: number | null = null;

  if (locationQuery) {
    try {
      // Turn the student's text search (e.g. "Rishon LeZion") into coordinates
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`, {
        headers: { 'User-Agent': 'TutorlyApp/1.0' }
      });
      const data = await res.json();
      
      if (data && data.length > 0) {
        searchLat = parseFloat(data[0].lat);
        searchLon = parseFloat(data[0].lon);

        // Filter the database array using the math formula!
        tutors = tutors.filter(tutor => {
          // If the tutor hasn't set their location, we skip them for in-person searches
          if (!tutor.latitude || !tutor.longitude) return false;
          
          const distance = calculateDistanceInKm(searchLat!, searchLon!, tutor.latitude, tutor.longitude);
          
          // If the student wants the tutor to come to them, check the tutor's maxTravelDistance!
          if (selectedMode === "IN_PERSON_STUDENT") {
            return distance <= tutor.maxTravelDistance;
          }
          
          // Otherwise, just show tutors within a reasonable default radius (e.g., 20km)
          return distance <= 20; 
        });
      }
    } catch (error) {
      console.error("Geocoding search failed", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* 1. HERO & SEARCH SECTION */}
      <div className="bg-slate-900 text-white pt-20 pb-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Find your perfect tutor.</h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Master a new skill, prep for an exam, or just learn something fun. 
          We have expert tutors ready to help.
        </p>

        {/* UPGRADED SEARCH BAR */}
        <form className="max-w-5xl mx-auto relative group flex flex-col md:flex-row gap-3" action="/tutors" method="GET">
          
          {/* Keyword Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text" name="q" defaultValue={searchQuery}
              placeholder="Search subjects or names..."
              className="bg-white w-full pl-14 pr-4 py-5 rounded-2xl text-slate-900 text-lg font-medium border-none shadow-xl focus:ring-4 focus:ring-indigo-500/30 transition-all outline-none"          
            />
          </div>

          {/* Location Search */}
          <div className="relative flex-grow md:max-w-xs">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text" name="location" defaultValue={locationQuery}
              placeholder="City or zip code..."
              className="bg-white w-full pl-14 pr-4 py-5 rounded-2xl text-slate-900 text-lg font-medium border-none shadow-xl focus:ring-4 focus:ring-indigo-500/30 transition-all outline-none"          
            />
          </div>

          {/* Modality Dropdown */}
          <div className="relative shrink-0 md:w-56">
            <select 
              name="mode" defaultValue={selectedMode}
              className="bg-white w-full px-4 py-5 rounded-2xl text-slate-700 text-lg font-medium border-none shadow-xl focus:ring-4 focus:ring-indigo-500/30 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">Any Location</option>
              <option value="ONLINE">Online Only</option>
              <option value="IN_PERSON_TUTOR">At Tutor's Place</option>
              <option value="IN_PERSON_STUDENT">At My Place</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
          </div>

          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-5 rounded-2xl transition-colors shadow-xl shrink-0 text-lg"
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. RESULTS SECTION */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        
        {(searchQuery || selectedMode || locationQuery) && (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
            <div className="font-bold text-slate-700 flex flex-wrap items-center gap-2">
              Found <span className="text-indigo-600">{tutors.length}</span> results
              {selectedMode && <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs tracking-wide uppercase">{selectedMode.replace(/_/g, ' ')}</span>}
              {locationQuery && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-xs tracking-wide uppercase">Near {locationQuery}</span>}
            </div>
            <Link href="/tutors" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition shrink-0">
              Clear Filters
            </Link>
          </div>
        )}

        {/* 3. THE TUTOR GRID */}
        {tutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => {
              // Calculate distance to show on the card if a location was searched!
              console.log("Checking Tutor:", tutor.name, "Verified Status:", tutor.isVerified);
              const distanceObj = (searchLat && searchLon && tutor.latitude && tutor.longitude) 
                ? calculateDistanceInKm(searchLat, searchLon, tutor.latitude, tutor.longitude)
                : null;

                const totalReviews = tutor.reviews.length;
                const averageRating = totalReviews > 0 
                  ? (tutor.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
                  : null; 

              return (
              <div key={tutor.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-full overflow-hidden flex items-center justify-center text-indigo-600 shrink-0 border-2 border-indigo-100">
                      {tutor.user?.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={tutor.user.image} alt={tutor.name || "Tutor"} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      
                      {/* ✨ THE MAGIC HAPPENED HERE: The Blue Checkmark is now next to the name! */}
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        {tutor.name}
                        {tutor.isVerified && (
                          <div className="relative group/badge flex items-center">
                            <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-opacity">
                              Identity Verified
                            </span>
                          </div>
                        )}
                      </h3>
                      
                      {/* The Star Display */}
                      <div className="flex items-center gap-1 mt-0.5 mb-1">
                        <Star className={`w-4 h-4 ${averageRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        <span className="text-sm font-bold text-slate-700">
                          {averageRating ? `${averageRating} ` : "New"}
                        </span>
                        {totalReviews > 0 && (
                          <span className="text-xs text-slate-400 font-medium">({totalReviews})</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-emerald-600">${tutor.pricePerHour} / hr</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tutor.teachingModes.includes("ONLINE") && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
                      <Laptop className="w-3 h-3" /> Online
                    </span>
                  )}
                  {(tutor.teachingModes.includes("IN_PERSON_TUTOR") || tutor.teachingModes.includes("IN_PERSON_STUDENT")) && (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md">
                      <MapPin className="w-3 h-3" /> In-Person
                    </span>
                  )}
                  {distanceObj !== null && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center ml-1">
                      ({distanceObj.toFixed(1)} km away)
                    </span>
                  )}
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow border-t border-slate-100 pt-4">
                  {tutor.bio || "This tutor hasn't written a bio yet, but they are ready to teach!"}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    {tutor.defaultDuration} min
                  </div>
                  <Link 
                    href={`/tutor/${tutor.username}`}
                    className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    View Profile <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No tutors found nearby</h3>
            <p className="text-slate-500 mb-6">Try expanding your search or selecting "Online Only".</p>
            <Link href="/tutors" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition">
              Clear Filters
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}