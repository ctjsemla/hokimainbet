"use client";

import { useEffect, useState } from "react";
import { maskUsername } from "@/lib/maskUsername";

function randomWinMessage(): string {
  const user = maskUsername();
  const templates = [
    `${user} menang ${(1.5 + Math.random() * 12).toFixed(1)}x di Crash`,
    `${user} cash out ${(2 + Math.random() * 6).toFixed(1)}x`,
    `${user} mines ${Math.floor(3 + Math.random() * 5)} petak — ${(2 + Math.random() * 3).toFixed(1)}x`,
    `${user} Plinko ${Math.round(5 + Math.random() * 80)}x`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function AuthWinsTicker() {
  const [message, setMessage] = useState(() => randomWinMessage());

  useEffect(() => {
    const id = setInterval(() => setMessage(randomWinMessage()), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="auth-wins-ticker inline-block max-w-full overflow-hidden rounded-md bg-navy-800/50 px-4 py-2.5">
      <p
        key={message}
        className="auth-wins-ticker-item truncate font-sans text-sm text-[#cbd5e1]"
      >
        {message}
      </p>
    </div>
  );
}
