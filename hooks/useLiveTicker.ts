"use client";

import { useEffect, useRef, useState } from "react";

export function useLiveTicker(
  tick: () => string,
  intervalMs = 1500,
  initial?: string,
): string {
  const [value, setValue] = useState(initial ?? tick());
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    const id = setInterval(() => setValue(tickRef.current()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return value;
}
