"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function WelcomeSection() {
  return (
    <section className="py-16 px-4 bg-ninja-white text-black min-h-[80vh] flex  text-center items-center justify-center">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          className="space-y-6 bg-ninja-gold p-8 md:p-16  rounded-2xl"
        >
          <div className="flex flex-col-reverse w-full md:flex-row gap-4 items-center justify-center">
            <div className="md:w-1/2 lg:w-3/5">
              <h1 className="text-2xl md:text-4xl">
                Welcome to The Writing Ninjas Academy
              </h1>
              <p className="text-lg md:text-2xl  leading-relaxed  ">
                a unique reading space made by kids, for kids! Here, students
                under 16 can explore stories written by their peers, enjoy
                audiobooks, and strengthen their comprehension skills through
                interactive quizzes after every book. Teachers can use the
                platform to support classroom reading, while young authors can
                see how others interact with their creations. Our mission is
                simple: to spark a lifelong love of reading and writing.
              </p>
            </div>
            <div className="relative w-64 h-64 md:w-80 md:h-80 aspect-square rounded-full border-4 border-ninja-coral bg-ninja-white overflow-hidden">
              <Image
                fill
                src="/dee/13.png"
                alt="welcome"
                className="w-full h-full object-cover rounded-full  scale-120 object-top"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
