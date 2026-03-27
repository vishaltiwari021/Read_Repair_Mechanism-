import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white min-h-screen flex items-center">
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Smart Read Repair Mechanism
          </h1>

          <p className="mt-4 text-lg text-gray-200">
            Efficiently manage, track, and repair reading workflows with our
            intelligent dashboard system. Improve performance and reduce errors.
          </p>

          <div className="mt-6 flex gap-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
              Get Started
            </button>

            <button className="border border-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Image / Illustration */}
        <div className="flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4149/4149670.png"
            alt="Hero Illustration"
            className="w-80 md:w-96"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;