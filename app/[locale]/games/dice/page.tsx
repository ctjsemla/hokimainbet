import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/PageLoader";

const DiceGame = dynamic(
  () => import("@/components/games/DiceGame").then((mod) => mod.DiceGame),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function DicePage() {
  return <DiceGame />;
}
