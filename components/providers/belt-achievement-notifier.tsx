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

type Belt = {
  name: string;
  threshold: number;
  message: string;
};

const BELTS: Belt[] = [
  {
    name: "White Belt",
    threshold: 1,
    message: "You’ve started your writing path!",
  },
  {
    name: "Yellow Belt",
    threshold: 2,
    message: "Your ideas are growing brighter.",
  },
  {
    name: "Orange Belt",
    threshold: 4,
    message: "Your writing is becoming stronger and more colorful.",
  },
  {
    name: "Green Belt",
    threshold: 5,
    message: "Your writing is blooming like a garden.",
  },
  {
    name: "Blue Belt",
    threshold: 7,
    message: "Your stories reach new heights.",
  },
  {
    name: "Brown Belt",
    threshold: 10,
    message: "Your writing shows wisdom and strength.",
  },
  {
    name: "Black Belt",
    threshold: 15,
    message: "You are a true Writing Ninja Master!",
  },
];

function getBeltByCount(count: number): { index: number; belt: Belt | null } {
  let idx = -1;
  for (let i = 0; i < BELTS.length; i++) {
    if (count >= BELTS[i].threshold) idx = i;
  }
  return { index: idx, belt: idx >= 0 ? BELTS[idx] : null };
}

export default function BeltAchievementNotifier() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [belt, setBelt] = useState<Belt | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!session?.user) return;
      const res = await fetch("/api/user/profile", { method: "GET" });
      if (!res.ok) return;
      const { user } = await res.json();
      const c = Number(user?.storiesUploaded || 0);
      setCount(c);
      const currentLevel = Number(user?.ninjaLevel || 1);
      const { index, belt } = getBeltByCount(c);
      if (!belt) return;
      const targetLevel = index + 1;
      if (active && targetLevel > currentLevel) {
        setBelt(belt);
        setOpen(true);
        await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ninjaLevel: targetLevel }),
        });
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [session]);

  if (!belt) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Congratulations Your Writing belt is upgraded! ${belt.name}`}</DialogTitle>
          <DialogDescription>{belt.message}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center my-4">
          <Image
            src={`${(() => {
              const c = count;
              if (c >= 15) return "/belts/Black.png";
              if (c >= 10) return "/belts/Brown.png";
              if (c >= 7) return "/belts/Blue.png";
              if (c >= 5) return "/belts/Green.png";
              if (c >= 4) return "/belts/Orange.png";
              if (c >= 2) return "/belts/Yellow.png";
              return "/belts/White.png";
            })()}`}
            alt="Belt"
            width={208}
            height={208}
            className=""
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
