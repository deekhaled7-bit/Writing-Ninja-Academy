"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, PenTool, Share2, Trophy } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Read & Listen",
    description:
      "Explore a library full of books written by kids just like you. Choose to read online or listen to the audiobook version. After each book, take a fun comprehension quiz to earn points and see how much you understood.",
    color: "ninja-peach",
  },
  {
    icon: PenTool,
    title: "Write Your Own Story",
    description:
      "Create your own story and ask your teacher or parent to upload it as a PDF or video. Our Ninja Masters (admins) will review and approve your story before publishing it in the library.",
    color: "ninja-peach",
  },
  {
    icon: Share2,
    title: "Share & Celebrate",
    description:
      "Once published, your story becomes part of the Ninja Library. Other students can read, like, and comment on your work.",
    color: "ninja-peach",
  },
  {
    icon: Trophy,
    title: "Earn Points & Badges",
    description:
      "Collect points by reading, listening, completing quizzes, and sharing stories. Unlock badges and climb the Ninja Leaderboard!",
    color: "ninja-peach",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="howItWorks" className="py-20 bg-ninja-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-oswald text-4xl sm:text-5xl text-ninja-black mb-4">
            For Students
          </h2>
          <p className="text-xl text-ninja-gray max-w-3xl mx-auto mb-8">
            We help you sharpen your skills and train like Writing Ninjas today!
            Every book you read makes your Ninja powers stronger. Write your own
            story scroll and share it with the Ninja clan, then complete the
            quiz to earn points and level up your Ninja rank. Remember, a true
            Writing Ninja reads, writes, and inspires others.
          </p>
          <h3 className="font-oswald w-full text-center text-2xl sm:text-3xl text-ninja-crimson mb-8">
            How Students Can Use The Writing Ninja
          </h3>
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
                className="text-center group bg-ninja-cream border-ninja-light-gray p-2 rounded-2xl border-2"
              >
                <div className="relative mb-6">
                  {/* Step Number */}
                  {/* <div className="absolute -top-4 -left-4 w-8 h-8 bg-ninja-black rounded-full flex items-center justify-center text-ninja-white font-bold text-sm z-10">
                    {index + 1}
                  </div> */}

                  {/* Icon Container */}
                  <div
                    className={`w-20 h-20 bg-${step.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-5 w-5 text-ninja-black" />
                  </div>

                  {/* Connection Line (except last item) */}
                  {/* {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-20 w-full h-0.5 bg-ninja-gray bg-opacity-30 -z-10"></div>
                  )} */}
                </div>

                <h3 className="font-oswald text-xl text-ninja-crimson transition-colors">
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
