import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // This line is the magic that brings the styling back!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tutorly - Manage your Tutoring Business",
  description: "The all-in-one platform for private tutors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Everything inside 'children' will be your Dashboard, Settings, etc. */}
        {children}
      </body>
    </html>
  );
}