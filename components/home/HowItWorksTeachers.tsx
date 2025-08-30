"use client";
import React from "react";
import { motion } from "framer-motion";
import { Upload, Users, BookOpen, Target, Heart, Gamepad2 } from "lucide-react";

const educatorFeatures = [
  {
    icon: Upload,
    title: "Encourage Student Authors",
    points: [
      "Teachers can upload their students' work directly to the platform.",
      "Our admin team will carefully review and approve all submissions before publishing, ensuring safety and quality.",
      "This process gives students the thrill of seeing their work published and motivates them to write more.",
    ],
    color: "ninja-peach",
  },
  {
    icon: Users,
    title: "Support Peer Learning",
    points: [
      "Let students learn from each other by exploring writing styles, ideas, and creativity from their peers.",
      "Use student-created texts as discussion starters in class.",
    ],
    color: "ninja-peach",
  },
  {
    icon: BookOpen,
    title: "Access a Growing Student Library",
    points: [
      "Read stories and listen to audiobooks created by students from different age groups.",
      "Use them as mentor texts to inspire your own students' writing.",
    ],
    color: "ninja-gold",
  },
  {
    icon: Target,
    title: "Build Reading Comprehension Skills",
    points: [
      "Every book comes with a ready-to-use comprehension exercise.",
      "Assign these to students to practice critical reading skills.",
      "Review scores and see how students are progressing.",
    ],
    color: "ninja-peach",
  },
  {
    icon: Heart,
    title: "Motivate Students Through Celebration",
    points: [
      "Once published, students can see how readers interact with their work through likes, comments, and feedback.",
      "This builds confidence, pride, and a sense of achievement.",
    ],
    color: "ninja-peach",
  },
  {
    icon: Gamepad2,
    title: "Use Gamification to Engage Learners",
    points: [
      "Encourage students to read more with built-in rewards: points, badges, and leaderboards.",
      "Spark healthy competition and goal-setting in reading.",
    ],
    color: "ninja-gold",
  },
];
const HowItWorksTeachers = () => {
  return (
    <section id="howItWorksTeacher" className="py-20 bg-ninja-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-ninja text-4xl sm:text-5xl text-ninja-black mb-4">
            For Educators
          </h2>
          <p className="text-xl text-ninja-gray max-w-4xl mx-auto mb-8">
            At The Writing Ninja, we know teachers play a vital role in shaping
            confident readers and writers. That&apos;s why we&apos;ve designed
            features to make the platform a helpful teaching companion in and
            beyond the classroom.
          </p>
          <h3 className="font-ninja text-2xl sm:text-3xl text-ninja-crimson mb-8">
            How Educators Can Use The Writing Ninja
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {educatorFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-ninja-cream border-ninja-light-gray p-6 rounded-2xl border-2 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  {/* Icon Container */}
                  <div
                    className={`w-16 h-16 bg-${feature.color} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-ninja-black" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-ninja text-lg text-ninja-crimson mb-3">
                      {feature.title}
                    </h3>
                    <ul className="space-y-2">
                      {feature.points.map((point, pointIndex) => (
                        <li
                          key={pointIndex}
                          className="text-ninja-gray text-sm leading-relaxed flex items-start"
                        >
                          <span className="text-ninja-coral mr-2 mt-1 flex-shrink-0">
                            •
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksTeachers;
