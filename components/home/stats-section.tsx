'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Eye, Heart } from 'lucide-react';

interface Stats {
  totalStories: number;
  totalUsers: number;
  totalReads: number;
  totalLikes: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    totalStories: 0,
    totalUsers: 0,
    totalReads: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    // In a real app, you'd fetch this from an API
    // For now, we'll use some demo stats
    setStats({
      totalStories: 1247,
      totalUsers: 892,
      totalReads: 15643,
      totalLikes: 3421,
    });
  }, []);

  const statItems = [
    {
      icon: BookOpen,
      value: stats.totalStories,
      label: 'Stories Shared',
      color: 'ninja-crimson',
    },
    {
      icon: Users,
      value: stats.totalUsers,
      label: 'Young Authors',
      color: 'ninja-gold',
    },
    {
      icon: Eye,
      value: stats.totalReads,
      label: 'Stories Read',
      color: 'ninja-crimson',
    },
    {
      icon: Heart,
      value: stats.totalLikes,
      label: 'Stories Liked',
      color: 'ninja-gold',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-ninja-black via-ninja-gray to-ninja-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-ninja text-4xl sm:text-5xl text-ninja-white mb-4">
            Our Growing Community
          </h2>
          <p className="text-xl text-ninja-white opacity-80 max-w-3xl mx-auto">
            Join thousands of young writers who are already sharing their amazing stories!
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`w-16 h-16 bg-${item.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-ninja-black" />
                </div>
                
                <div className="text-3xl sm:text-4xl font-ninja text-ninja-white mb-2">
                  {item.value.toLocaleString()}
                </div>
                
                <div className="text-ninja-white opacity-80 font-medium">
                  {item.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}