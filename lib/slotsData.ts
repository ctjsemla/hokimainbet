import type { SlotGame } from "@/types/slots.types";

export const slots: SlotGame[] = [
  {
    id: "gates-of-gatot-kaca",
    name: "Gates of Gatot Kaca",
    provider: "Pragmatic Play",
    rtp: 96.5,
    maxWin: "x5,000",
    volatility: 3,
    featured: true,
    localBadge: "🇮🇩 UNGGULAN",
    iframeUrl: "https://gates-of-gatot-kaca.slot.day/?playfree=1",
  },
  {
    id: "gates-of-olympus",
    name: "Gates of Olympus",
    provider: "Pragmatic Play",
    rtp: 96.5,
    maxWin: "x15,000",
    volatility: 3,
    iframeUrl: "https://slot.day/pragmatic-play/gates-of-olympus/?playfree=1",
  },
  {
    id: "sweet-bonanza",
    name: "Sweet Bonanza",
    provider: "Pragmatic Play",
    rtp: 96.51,
    maxWin: "x21,100",
    volatility: 3,
    iframeUrl: "https://slot.day/pragmatic-play/sweet-bonanza/?playfree=1",
  },
  {
    id: "starlight-princess",
    name: "Starlight Princess",
    provider: "Pragmatic Play",
    rtp: 96.5,
    maxWin: "x5,000",
    volatility: 3,
    iframeUrl: "https://slot.day/pragmatic-play/starlight-princess/?playfree=1",
  },
  {
    id: "big-bass-bonanza",
    name: "Big Bass Bonanza",
    provider: "Pragmatic Play",
    rtp: 96.71,
    maxWin: "x2,100",
    volatility: 2,
    iframeUrl: "https://slot.day/pragmatic-play/big-bass-bonanza/?playfree=1",
  },
  {
    id: "the-dog-house",
    name: "The Dog House",
    provider: "Pragmatic Play",
    rtp: 96.51,
    maxWin: "x6,750",
    volatility: 3,
    iframeUrl: "https://slot.day/pragmatic-play/the-dog-house/?playfree=1",
  },
  {
    id: "sugar-rush",
    name: "Sugar Rush",
    provider: "Pragmatic Play",
    rtp: 96.5,
    maxWin: "x5,000",
    volatility: 3,
    iframeUrl: "https://slot.day/pragmatic-play/sugar-rush/?playfree=1",
  },
  {
    id: "wanted-dead-or-a-wild",
    name: "Wanted Dead or a Wild",
    provider: "Hacksaw Gaming",
    rtp: 96.38,
    maxWin: "x12,500",
    volatility: 3,
    iframeUrl: "https://slot.day/hacksaw-gaming/wanted-dead-or-a-wild/?playfree=1",
  },
  {
    id: "chaos-crew",
    name: "Chaos Crew",
    provider: "Hacksaw Gaming",
    rtp: 96.3,
    maxWin: "x10,000",
    volatility: 3,
    iframeUrl: "https://slot.day/hacksaw-gaming/chaos-crew/?playfree=1",
  },
  {
    id: "book-of-time",
    name: "Book of Time",
    provider: "Hacksaw Gaming",
    rtp: 96.13,
    maxWin: "x10,000",
    volatility: 3,
    iframeUrl: "https://slot.day/hacksaw-gaming/book-of-time/?playfree=1",
  },
  {
    id: "eye-of-medusa",
    name: "Eye of Medusa",
    provider: "Hacksaw Gaming",
    rtp: 96.2,
    maxWin: "x15,000",
    volatility: 3,
    iframeUrl: "https://slot.day/hacksaw-gaming/eye-of-medusa/?playfree=1",
  },
  {
    id: "rip-city",
    name: "RIP City",
    provider: "Hacksaw Gaming",
    rtp: 96.3,
    maxWin: "x12,500",
    volatility: 3,
    iframeUrl: "https://slot.day/hacksaw-gaming/rip-city/?playfree=1",
  },
  {
    id: "le-bandit",
    name: "Le Bandit",
    provider: "Hacksaw Gaming",
    rtp: 96.3,
    maxWin: "x10,000",
    volatility: 3,
    iframeUrl: "https://slot.day/hacksaw-gaming/le-bandit/?playfree=1",
  },
  {
    id: "cash-quest",
    name: "Cash Quest",
    provider: "Hacksaw Gaming",
    rtp: 94.36,
    maxWin: "x7,500",
    volatility: 2,
    iframeUrl: "https://slot.day/hacksaw-gaming/cash-quest/?playfree=1",
  },
  {
    id: "beat-the-bobbies",
    name: "Beat the Bobbies",
    provider: "Hacksaw Gaming",
    rtp: 95,
    maxWin: "x10,000",
    volatility: 3,
    iframeUrl: "https://slot.day/hacksaw-gaming/beat-the-bobbies/?playfree=1",
  },
];

export const HOME_FEATURED_SLOT_IDS = [
  "gates-of-gatot-kaca",
  "gates-of-olympus",
  "wanted-dead-or-a-wild",
  "sweet-bonanza",
] as const;

export function getSlotById(id: string): SlotGame | undefined {
  return slots.find((slot) => slot.id === id);
}

export function getHomeFeaturedSlots(): SlotGame[] {
  return HOME_FEATURED_SLOT_IDS.map((id) => getSlotById(id)).filter(
    (slot): slot is SlotGame => slot !== undefined,
  );
}
