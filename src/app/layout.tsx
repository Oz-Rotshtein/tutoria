import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ✨ 1. Import your new Navbar
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tutorly - Find Your Perfect Tutor",
  description: "Book expert tutors for any subject.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`}>
        {/* ✨ 2. Drop the Navbar right here at the top of the body! */}
        <Navbar />
        
        {/* The rest of your pages will render inside this main tag */}
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}