"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Level = {
  name: string;
  threshold: number;
  image: string;
};

const LEVELS: Level[] = [
  { name: "Beginner", threshold: 0, image: "/readingAvatars/1.png" },
  { name: "Explorer", threshold: 50, image: "/readingAvatars/2.png" },
  { name: "Adventurer", threshold: 100, image: "/readingAvatars/3.png" },
  { name: "Dreamer", threshold: 150, image: "/readingAvatars/4.png" },
  { name: "Emerging", threshold: 200, image: "/readingAvatars/5.png" },
  { name: "Enthusiast", threshold: 250, image: "/readingAvatars/6.png" },
  { name: "Trailblazer", threshold: 300, image: "/readingAvatars/7.png" },
  { name: "Pioneer", threshold: 350, image: "/readingAvatars/8.png" },
  { name: "Innovator", threshold: 400, image: "/readingAvatars/9.png" },
  { name: "Navigator", threshold: 450, image: "/readingAvatars/10.png" },
  { name: "Champion", threshold: 500, image: "/readingAvatars/11.png" },
  { name: "Hero", threshold: 550, image: "/readingAvatars/12.png" },
  { name: "Legend", threshold: 600, image: "/readingAvatars/13.png" },
  { name: "Imagineer", threshold: 650, image: "/readingAvatars/14.png" },
  { name: "Maestro", threshold: 700, image: "/readingAvatars/15.png" },
  { name: "Ambassador", threshold: 750, image: "/readingAvatars/16.png" },
  { name: "Visionary", threshold: 800, image: "/readingAvatars/17.png" },
  { name: "Advocate", threshold: 850, image: "/readingAvatars/18.png" },
  { name: "Luminary", threshold: 900, image: "/readingAvatars/19.png" },
  { name: "Mastermind", threshold: 950, image: "/readingAvatars/20.png" },
];

export default function LevelsPage() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    let active = true;
    async function run() {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return;
      const { user } = await res.json();
      if (active) setPoints(Number(user?.ninjaGold || 0));
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  const next = LEVELS.find((l) => l.threshold > points) || null;
  const remaining = next ? next.threshold - points : 0;

  return (
    <div className="min-h-screen bg-ninja-light-gray">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-oswald text-3xl text-ninja-black mb-4">
          Character Levels
        </h1>
        <p className="text-ninja-gray mb-6">
          {next
            ? `${remaining} Ninja Gold to reach ${next.name}.`
            : `Maximum level achieved.`}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {LEVELS.map((lvl) => {
            const unlocked = points >= lvl.threshold;
            const nextHigher = LEVELS.find((x) => x.threshold > points);
            const current =
              unlocked &&
              (!nextHigher || nextHigher.threshold === lvl.threshold);
            return (
              <div
                key={lvl.name}
                className={`rounded-lg p-4 border ${
                  unlocked
                    ? "border-ninja-peach bg-ninja-cream"
                    : "border-ninja-gray bg-white"
                }`}
              >
                <div className="flex flex-col items-center">
                  <Image
                    src={lvl.image}
                    alt={lvl.name}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                  <div className="mt-2 text-center">
                    <div className="font-semibold text-ninja-black">
                      {lvl.name}
                    </div>
                    <div className="text-xs text-ninja-gray">
                      Requires {lvl.threshold} Ninja Gold
                    </div>
                    {current && (
                      <Badge variant="destructive" className="mt-2">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Link href="/student" className="text-ninja-crimson underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
