import React from "react";
import Image from "next/image";

const HeroSection2 = () => {
  return (
    <section className="relative min-h-[calc(100vh-64px)] bg-gradient-to-br from-ninja-black  via-ninja-crimson to-ninja-black overflow-hidden">
      {/* Ninja Equipment Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 transform rotate-12">
          <div className="w-16 h-16 bg-gray-400 rounded-full shadow-lg"></div>
        </div>
        <div className="absolute top-40 right-20 transform -rotate-45">
          <div className="w-8 h-24 bg-gray-500 rounded-lg shadow-lg"></div>
        </div>
        <div className="absolute bottom-32 left-20 transform rotate-45">
          <div className="w-12 h-3 bg-gray-400 rounded-full shadow-lg"></div>
        </div>
        <div className="absolute top-60 left-1/4 transform rotate-90">
          <div className="w-6 h-20 bg-gray-500 rounded-lg shadow-lg"></div>
        </div>
        <div className="absolute bottom-40 right-1/4 transform -rotate-12">
          <div className="w-10 h-10 bg-gray-400 rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-10  h-[calc(100vh-64px)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12  items-center w-full">
          {/* Left Side - Quote */}
          <div className="text-center  space-y-8 order-2 lg:order-1">
            <div className="space-y-6 justify-center text-center items-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-white text-center leading-wide mx-auto">
                <span className="text-white">Sharpen Your Skills,</span>
                <br />
                {/* <span className="text-white">Your Skills,</span> */}
                <br />
                <span className="text-white">Master Your Words.</span>
                <br />
                {/* <br />
                <span className="text-white">Your Words.</span> */}
              </h1>

              {/* <p className="text-xl text-center text-white max-w-lg mx-auto lg:mx-0">
                Unleash your inner ninja and transform your storytelling
                abilities with precision and power.
              </p> */}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center ">
              <button className="px-8 py-4 bg-ninja-black border-2 border-ninja-gold text-ninja-gold  font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-red-700 hover:to-orange-700">
                {/* <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-red-700 hover:to-orange-700"> */}
                Start Your Journey
              </button>
              <button className="px-8 py-4 border-2 border-ninja-gold text-ninja-gold font-semibold rounded-lg  bg-ninja-black transition-all duration-300 transform hover:scale-105 ">
                {/* <button className="px-8 py-4 border-2 border-yellow-400 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-300"> */}
                Learn More
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="flex justify-center lg:justify-center order-1 lg:order-2">
            <div className="relative">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-3xl opacity-30 scale-110"></div>

              {/* Image container */}
              {/* <div className="relative bg-gradient-to-br from-ninja-black via-ninja-gray to-ninja-black p-8 rounded-full shadow-2xl border border-red-500/30"> */}
              <div className="w-80 lg:w-96  lg:h-96 h-80 relative">
                <Image
                  src="/logo/logoRed.png"
                  alt="Ninja Logo"
                  fill
                  className="object-contain filter drop-shadow-2xl"
                  priority
                />
              </div>
              {/* </div> */}

              {/* Floating particles */}
              <div className="absolute -top-4 -right-4 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -right-8 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
};

export default HeroSection2;
