export type SlotProvider = "Pragmatic Play" | "Hacksaw Gaming";

export type SlotFilter = "all" | SlotProvider;

export interface SlotGame {
  id: string;
  name: string;
  provider: SlotProvider;
  rtp: number;
  maxWin: string;
  volatility: 1 | 2 | 3;
  featured?: boolean;
  localBadge?: string;
  iframeUrl: string;
}
