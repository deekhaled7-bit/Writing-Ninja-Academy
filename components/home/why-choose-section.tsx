"use client";

import { motion } from "framer-motion";
import { Users, Lightbulb, BookOpen, Shield } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: Users,
    title: "Built for students ages 6–16",
    color: "ninja-peach",
  },
  {
    icon: Lightbulb,
    title: "Encourages creativity, reading, and comprehension",
    color: "ninja-peach",
  },
  {
    icon: BookOpen,
    title: "Combines reading + listening + learning in one space",
    color: "ninja-peach",
  },
  {
    icon: Shield,
    title: "Designed with safety, fun, and simplicity in mind",
    color: "ninja-peach",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-20 bg-ninja-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <h2 className="font-oswald text-4xl sm:text-5xl text-ninja-black mb-4">
            Why Choose The Writing Ninjas Academy?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Right side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6 order-2 lg:order-1"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4 group"
                >
                  <div
                    className={`w-16 h-16 bg-${feature.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    <Icon className="h-8 w-8 text-ninja-black" />
                  </div>
                  <h3 className="font-oswald text-xl text-ninja-crimson">
                    {feature.title}
                  </h3>
                </motion.div>
              );
            })}

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <h3 className="font-oswald text-2xl text-ninja-black mb-4">
                Start your journey today!
              </h3>
              <p className="text-ninja-gray text-lg mb-6">
                Whether you want to read stories, listen to audiobooks, or share
                your own writing with the world, The Writing Ninjas Academy is
                here to make reading fun.
              </p>
              <button className="bg-ninja-crimson hover:bg-ninja-crimson/90 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300 transform hover:scale-105">
                Get Started Now
              </button>
            </motion.div>
          </motion.div>

          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative order-1 lg:order-1"
          >
            <div className="relative w-full h-96 md:h-[750px]  ">
              <Image
                src="/dee/20.png"
                alt="Why Choose The Writing Ninjas Academy"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
