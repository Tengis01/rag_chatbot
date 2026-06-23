import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WorkspacePreview } from "@/components/landing/WorkspacePreview";
import { Capabilities } from "@/components/landing/Capabilities";
import { MobileShowcase } from "@/components/landing/MobileShowcase";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Fixed navbar — sits above all content */}
      <Navbar />

      {/*
        Hero already starts at pt-40 to clear the fixed navbar.
        Do NOT add extra top padding here — it would double the offset.
      */}
      <Hero />

      <WorkspacePreview />
      <Capabilities />
      <MobileShowcase />
      <FinalCta />
      <Footer />
    </div>
  );
}
