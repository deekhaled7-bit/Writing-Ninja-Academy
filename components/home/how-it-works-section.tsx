'use client';

import { motion } from 'framer-motion';
import { PlusCircle, BookOpen, Heart, Trophy } from 'lucide-react';

const steps = [
  {
    icon: PlusCircle,
    title: 'Create & Upload',
    description: 'Write your amazing story and upload it as a PDF or video to share with the ninja community.',
    color: 'ninja-crimson',
  },
  {
    icon: BookOpen,
    title: 'Explore & Discover',
    description: 'Browse stories by age group and category to find the perfect adventure for you.',
    color: 'ninja-gold',
  },
  {
    icon: Heart,
    title: 'Read & Connect',
    description: 'Read stories, leave comments, and connect with fellow young authors from around the world.',
    color: 'ninja-crimson',
  },
  {
    icon: Trophy,
    title: 'Level Up',
    description: 'Earn ninja gold, unlock achievements, and become a legendary member of our writing dojo!',
    color: 'ninja-gold',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-ninja-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-ninja text-4xl sm:text-5xl text-ninja-black mb-4">
            How It Works
          </h2>
          <p className="text-xl text-ninja-gray max-w-3xl mx-auto">
            Join our ninja dojo in 4 simple steps and start your writing adventure!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-ninja-black rounded-full flex items-center justify-center text-ninja-white font-bold text-sm z-10">
                    {index + 1}
                  </div>
                  
                  {/* Icon Container */}
                  <div className={`w-20 h-20 bg-${step.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-10 w-10 text-ninja-white" />
                  </div>
                  
                  {/* Connection Line (except last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-20 w-full h-0.5 bg-ninja-gray bg-opacity-30 -z-10"></div>
                  )}
                </div>

                <h3 className="font-ninja text-xl text-ninja-black mb-3 group-hover:text-ninja-crimson transition-colors">
                  {step.title}
                </h3>
                <p className="text-ninja-gray leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}