"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type Level = {
  name: string;
  threshold: number; // points required to reach this level
};

// Levels 1–20 and their point thresholds
const LEVELS: Level[] = [
  { name: "Beginner", threshold: 0 }, // Level 1
  { name: "Explorer", threshold: 50 },
  { name: "Adventurer", threshold: 100 },
  { name: "Dreamer", threshold: 150 },
  { name: "Emerging", threshold: 200 },
  { name: "Enthusiast", threshold: 250 },
  { name: "Trailblazer", threshold: 300 },
  { name: "Pioneer", threshold: 350 },
  { name: "Innovator", threshold: 400 },
  { name: "Navigator", threshold: 450 },
  { name: "Champion", threshold: 500 },
  { name: "Hero", threshold: 550 },
  { name: "Legend", threshold: 600 },
  { name: "Imagineer", threshold: 650 },
  { name: "Maestro", threshold: 700 },
  { name: "Ambassador", threshold: 750 },
  { name: "Visionary", threshold: 800 },
  { name: "Advocate", threshold: 850 },
  { name: "Luminary", threshold: 900 },
  { name: "Mastermind", threshold: 950 }, // Level 20
];

function getLevelByPoints(points: number): { index: number; level: Level | null } {
  let idx = -1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].threshold) idx = i;
  }
  return { index: idx, level: idx >= 0 ? LEVELS[idx] : null };
}

function getNextThreshold(currentPoints: number): number | null {
  for (let i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i].threshold > currentPoints) return LEVELS[i].threshold;
  }
  return null; // at or beyond max level
}

export default function LevelAchievementNotifier() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [levelName, setLevelName] = useState<string>("");
  const [levelNumber, setLevelNumber] = useState<number>(1);
  const [points, setPoints] = useState<number>(0);
  const [nextNeeded, setNextNeeded] = useState<number>(0);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    async function run() {
      if (!session?.user || inFlight || !active) return;
      inFlight = true;
      try {
        const res = await fetch("/api/user/profile", { method: "GET" });
        if (!res.ok) return;
        const { user } = await res.json();
        const gold = Number(user?.ninjaGold || 0);
        const currentLevel = Number(user?.ninjaCharacterLevel || 1);
        setPoints(gold);

        const { index, level } = getLevelByPoints(gold);
        if (!level || index < 0) return;
        const targetLevel = index + 1; // convert 0-based to 1-based

        const nextThreshold = getNextThreshold(gold);
        const needed = nextThreshold ? Math.max(nextThreshold - gold, 0) : 0;
        setNextNeeded(needed);

        // Keep nextLevelBonusPoints in sync (even if no level-up)
        const payloadBase: Record<string, any> = {};
        if (user?.nextLevelBonusPoints !== needed) {
          payloadBase.nextLevelBonusPoints = needed;
        }

        if (active && targetLevel > currentLevel) {
          setLevelName(level.name);
          setLevelNumber(targetLevel);
          setOpen(true);
          await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ninjaCharacterLevel: targetLevel,
              ...payloadBase,
            }),
          });
        } else if (Object.keys(payloadBase).length > 0) {
          // Only update bonus points if it changed
          await fetch("/api/user/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadBase),
          });
        }
      } finally {
        inFlight = false;
      }
    }
    // Initial run and periodic polling to react to ninjaGold changes
    run();
    const interval = setInterval(run, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [session]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Level Up! You're now Level ${levelNumber} – ${levelName}`}</DialogTitle>
          <DialogDescription>
            {nextNeeded > 0
              ? `Earn ${nextNeeded} more points to reach the next level.`
              : `You've reached the highest level. Keep shining!`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center my-4">
          <Image
            src={`/readingAvatars/${levelNumber}.png`}
            alt={`Level ${levelNumber} Avatar`}
            width={208}
            height={208}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}