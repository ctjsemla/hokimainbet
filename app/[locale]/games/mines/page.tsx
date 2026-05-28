import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/PageLoader";

const MinesGame = dynamic(
  () => import("@/components/games/MinesGame").then((mod) => mod.MinesGame),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function MinesPage() {
  return <MinesGame />;
}
