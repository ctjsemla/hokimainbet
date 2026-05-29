import {
  BeatTheBobbiesCover,
  BookOfTimeCover,
  CashQuestCover,
  ChaosCrewCover,
  EyeOfMedusaCover,
  LeBanditCover,
  RipCityCover,
  WantedDeadOrAWildCover,
} from "@/components/slots/covers/hacksawCovers";
import {
  BigBassBonanzaCover,
  GatesOfGatotKacaCover,
  GatesOfOlympusCover,
  StarlightPrincessCover,
  SugarRushCover,
  SweetBonanzaCover,
  TheDogHouseCover,
} from "@/components/slots/covers/pragmaticCovers";

interface SlotCoverArtProps {
  slug: string;
}

export const CUSTOM_COVER_SLUGS = [
  "gates-of-gatot-kaca",
  "gates-of-olympus",
  "sweet-bonanza",
  "starlight-princess",
  "big-bass-bonanza",
  "the-dog-house",
  "sugar-rush",
  "wanted-dead-or-a-wild",
  "chaos-crew",
  "book-of-time",
  "eye-of-medusa",
  "rip-city",
  "le-bandit",
  "cash-quest",
  "beat-the-bobbies",
] as const;

export function hasCustomCover(slug: string): boolean {
  return (CUSTOM_COVER_SLUGS as readonly string[]).includes(slug);
}

const coverMap: Record<string, () => JSX.Element> = {
  "gates-of-gatot-kaca": GatesOfGatotKacaCover,
  "gates-of-olympus": GatesOfOlympusCover,
  "sweet-bonanza": SweetBonanzaCover,
  "starlight-princess": StarlightPrincessCover,
  "big-bass-bonanza": BigBassBonanzaCover,
  "the-dog-house": TheDogHouseCover,
  "sugar-rush": SugarRushCover,
  "wanted-dead-or-a-wild": WantedDeadOrAWildCover,
  "chaos-crew": ChaosCrewCover,
  "book-of-time": BookOfTimeCover,
  "eye-of-medusa": EyeOfMedusaCover,
  "rip-city": RipCityCover,
  "le-bandit": LeBanditCover,
  "cash-quest": CashQuestCover,
  "beat-the-bobbies": BeatTheBobbiesCover,
};

export function SlotCoverArt({ slug }: SlotCoverArtProps) {
  const Cover = coverMap[slug];
  if (!Cover) {
    return null;
  }
  return <Cover />;
}
