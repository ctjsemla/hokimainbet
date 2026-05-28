import type { SlotGame } from "@/types/slots.types";
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
  slotId: SlotGame["id"];
}

const coverMap: Record<SlotGame["id"], () => JSX.Element> = {
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

export function SlotCoverArt({ slotId }: SlotCoverArtProps) {
  const Cover = coverMap[slotId];
  if (!Cover) {
    return <div className="h-full w-full bg-navy-950" />;
  }
  return <Cover />;
}
