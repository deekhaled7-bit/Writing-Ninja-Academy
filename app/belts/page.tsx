"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Belt = {
  name: string;
  threshold: number;
  message: string;
  image: string;
};

const BELTS: Belt[] = [
  {
    name: "White Belt",
    threshold: 1,
    message: "You’ve started your writing path!",
    image: "/belts/White.png",
  },
  {
    name: "Yellow Belt",
    threshold: 2,
    message: "Your ideas are growing brighter.",
    image: "/belts/Yellow.png",
  },
  {
    name: "Orange Belt",
    threshold: 4,
    message: "Your writing is becoming stronger and more colorful.",
    image: "/belts/Orange.png",
  },
  {
    name: "Green Belt",
    threshold: 5,
    message: "Your writing is blooming like a garden.",
    image: "/belts/Green.png",
  },
  {
    name: "Blue Belt",
    threshold: 7,
    message: "Your stories reach new heights.",
    image: "/belts/Blue.png",
  },
  {
    name: "Brown Belt",
    threshold: 10,
    message: "Your writing shows wisdom and strength.",
    image: "/belts/Brown.png",
  },
  {
    name: "Black Belt",
    threshold: 15,
    message: "You are a true Writing Ninja Master!",
    image: "/belts/Black.png",
  },
];

export default function BeltsPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function run() {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return;
      const { user } = await res.json();
      if (active) setCount(Number(user?.storiesUploaded || 0));
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  const next = BELTS.find((b) => b.threshold > count) || null;
  const remaining = next ? next.threshold - count : 0;

  return (
    <div className="min-h-screen bg-ninja-light-gray">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-oswald text-3xl text-ninja-black mb-4">
          Writing Belts
        </h1>
        <p className="text-ninja-gray mb-6">
          {next
            ? `${remaining} stories to reach ${next.name}.`
            : `Maximum belt achieved.`}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {BELTS.map((b) => {
            const unlocked = count >= b.threshold;
            const current =
              unlocked &&
              (!BELTS.find((x) => x.threshold > count) ||
                (BELTS.find((x) => x.threshold > count)?.threshold || 0) ===
                  b.threshold);
            return (
              <div
                key={b.name}
                className={`rounded-lg p-4 border ${
                  current ? "border-ninja-crimson" : "border-gray-200"
                } bg-white`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={b.image}
                    alt={b.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-ninja-black flex items-center gap-2">
                      {b.name}
                      {current && (
                        <Badge className="bg-ninja-crimson text-white">
                          Current
                        </Badge>
                      )}
                      {unlocked && !current && (
                        <Badge variant="outline">Unlocked</Badge>
                      )}
                      {!unlocked && <Badge variant="outline">Locked</Badge>}
                    </div>
                    <div className="text-xs text-ninja-gray">
                      Requires {b.threshold}{" "}
                      {b.threshold === 1 ? "story" : "stories"}
                    </div>
                  </div>
                </div>
                {/* <div className="text-ninja-gray text-sm">{b.message}</div> */}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-sm text-ninja-gray">
          <Link href="/student" className="text-ninja-crimson underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
