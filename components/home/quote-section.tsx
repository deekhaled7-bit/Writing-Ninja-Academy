"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function QuoteSection() {
  return (
    <section className="relative p-8 md:p-16   bg-ninja-white">
      {/* <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-900 to-transparent"></div> */}

      <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-ninja-coral rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Quote */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center lg:text-left md:order-1 order-2"
          >
            <blockquote className="text-2xl sm:text-4xl lg:text-5xl text-center font-ninja text-ninja-white leading-relaxed">
              <span className="block">Sharpen Your Skills,</span>
              <span className="block mt-2">Master Your Words.</span>
            </blockquote>

            <div className="mt-8 w-full flex justify-center text-center lg:text-left">
              <button className="bg-ninja-peach text-ninja-black font-semibold px-6 py-3 rounded-2xl hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
                Start Now
              </button>
            </div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative flex justify-center w-full md:order-2 order-1"
          >
            <div className="animate-float relative w-64 h-64 md:w-80 md:h-80 aspect-square rounded-full border-8 border-ninja-peach bg-ninja-white overflow-hidden">
              <Image
                fill
                src="/dee/16.png"
                alt="welcome"
                className="w-full h-full object-cover rounded-full  scale-120 object-top"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
