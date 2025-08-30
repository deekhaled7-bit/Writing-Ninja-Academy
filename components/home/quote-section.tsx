"use client";

import { motion } from "framer-motion";

export default function QuoteSection() {
  return (
    <section className="relative py-20   bg-ninja-coral">
      {/* <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-900 to-transparent"></div> */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <blockquote className="text-2xl sm:text-4xl lg:text-5xl font-ninja text-ninja-white  leading-relaxed">
            <span className="block">Sharpen Your Skills,</span>
            <span className="block mt-2">Master Your Words.</span>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}