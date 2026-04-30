import AppSection from "@/components/sections/AppSection";
import HeroSection from "@/components/sections/HeroSection";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      {/* Hero Section with Background */}
      <HeroSection/>

      {/* App Section */}
      <AppSection />
    </main>
  );
}
