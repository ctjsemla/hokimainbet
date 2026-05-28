import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/PageLoader";

const PlinkoGame = dynamic(
  () => import("@/components/games/PlinkoGame").then((mod) => mod.PlinkoGame),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function PlinkoPage() {
  return <PlinkoGame />;
}
