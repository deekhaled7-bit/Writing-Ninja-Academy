"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sword, BookOpen, PlusCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-ninja-cream via-ninja-peach to-ninja-gold overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl text-ninja-peach">
          ⭐
        </div>
        <div className="absolute top-32 right-20 text-4xl text-ninja-crimson">
          🥷
        </div>
        <div className="absolute bottom-20 left-32 text-5xl text-ninja-gold">
          📚
        </div>
        <div className="absolute bottom-32 right-10 text-4xl text-ninja-coral">
          ✨
        </div>
        <div className="absolute top-1/2 left-1/4 text-3xl text-ninja-cream">
          🖋️
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
        <div className="text-center">
          {/* Main Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-oswald text-4xl sm:text-6xl lg:text-7xl text-ninja-black mb-6 leading-tight">
              Where Young
              <span className="text-ninja-crimson"> Authors </span>
              <br />
              Share Their
              <span className="text-ninja-coral"> Stories</span>
            </h1>

            <p className="text-xl sm:text-2xl text-ninja-gray opacity-90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join our ninja dojo of creative writers! Upload your stories,
              discover amazing tales from fellow ninjas, and level up your
              writing skills.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-ninja-crimson hover:bg-red-600 text-ninja-white px-8 py-4 text-lg font-semibold ninja-hover transform transition-all duration-200 group"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Upload Your Story
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-ninja-gold text-ninja-gold hover:bg-ninja-gold hover:text-ninja-black px-8 py-4 text-lg font-semibold ninja-hover transform transition-all duration-200 group"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Stories
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="ninja-scroll p-6 text-center ninja-hover">
              <div className="w-16 h-16 bg-ninja-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="h-8 w-8 text-ninja-white" />
              </div>
              <h3 className="font-oswald text-xl text-ninja-black mb-2">
                Share Your Stories
              </h3>
              <p className="text-ninja-gray text-sm">
                Upload PDFs or videos of your amazing stories and share them
                with the world.
              </p>
            </div>

            <div className="ninja-scroll p-6 text-center ninja-hover">
              <div className="w-16 h-16 bg-ninja-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-ninja-black" />
              </div>
              <h3 className="font-oswald text-xl text-ninja-black mb-2">
                Discover Adventures
              </h3>
              <p className="text-ninja-gray text-sm">
                Explore thousands of stories by age group and category to find
                your next favorite tale.
              </p>
            </div>

            <div className="ninja-scroll p-6 text-center ninja-hover">
              <div className="w-16 h-16 bg-ninja-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <Sword className="h-8 w-8 text-ninja-gold" />
              </div>
              <h3 className="font-oswald text-xl text-ninja-black mb-2">
                Level Up
              </h3>
              <p className="text-ninja-gray text-sm">
                Earn ninja gold, unlock achievements, and become a legendary
                writing ninja!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
