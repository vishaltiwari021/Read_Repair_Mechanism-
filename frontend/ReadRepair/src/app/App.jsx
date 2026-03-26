import Navbar from "../shared/components/layout/Navbar.jsx";
import Footer from "../shared/components/layout/Footer.jsx";
import HeroSection from "../features/landing/sections/HeroSection.jsx";
import HighlightsSection from "../features/landing/sections/HighlightsSection.jsx";
import WorkspaceSection from "../features/dashboard/sections/WorkspaceSection.jsx";
import ArchitectureSection from "../features/landing/sections/ArchitectureSection.jsx";
import "../styles/app.css";

function App() {
  return (
    <div className="bg-base-100 text-base-content min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Navbar />

      <main className="flex flex-col gap-16 mt-8">
        <HeroSection />
        <HighlightsSection />
        <div className="divider opacity-30"></div>
        <WorkspaceSection />
        <div className="divider opacity-30"></div>
        <ArchitectureSection />
      </main>

      <Footer />
      </div>
    </div>
  );
}

export default App;
