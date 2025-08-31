"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Emma Chen",
    age: 12,
    story: "The Magic Paintbrush",
    quote:
      "I love sharing my stories here! Other kids read them and leave such nice comments. It makes me want to write even more!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    age: 10,
    story: "Space Adventure",
    quote:
      "The Writing Ninja helped me become a better writer. I've read so many cool stories and learned new ideas for my own!",
    rating: 5,
  },
  {
    name: "Sophia Rodriguez",
    age: 14,
    story: "The Time Travelers",
    quote:
      "This platform is amazing! I've made friends with other writers and we help each other improve our stories.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-tr from-ninja-gray via-ninja-black to-ninja-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-oswald text-4xl sm:text-5xl text-ninja-light-gray mb-4">
            What Young Authors Say
          </h2>
          <p className="text-xl text-ninja-light-gray max-w-3xl mx-auto">
            Hear from our amazing community of young writers about their
            experience!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="ninja-scroll p-8 bg-ninja-light-gray relative group ninja-hover"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-ninja-gold opacity-20" />

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-ninja-peach fill-current"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-ninja-gray mb-6 italic leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author Info */}
              <div className="border-t border-ninja-gray border-opacity-20 pt-4">
                <div className="font-semibold text-ninja-black">
                  {testimonial.name}, age {testimonial.age}
                </div>
                <div className="text-sm text-ninja-gray">
                  Author of &quot;{testimonial.story}&quot;
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
