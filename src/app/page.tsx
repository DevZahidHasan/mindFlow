"use client";

import Hero from "@/features/marketing/components/hero/hero";
import StorySection from "@/features/marketing/components/feature-story/story-section";
import Philosophy from "@/features/marketing/components/philosophy/philosophy";
import Footer from "@/features/marketing/components/footer/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-start px-6 md:px-12 max-w-[1400px] mx-auto font-sans relative">
      {/* Mount Cursor Enhancement for Testing/Storytelling */}
      <main className="flex-1 flex flex-col gap-12 w-full">
        <Hero />
        <StorySection />
        <Philosophy />
      </main>

      <Footer />
    </div>
  );
}
