// src/app/page.tsx
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { LandingContent } from "@/components/landing/LandingContent";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <LandingContent />
      </main>
      <Footer />
    </div>
  );
}