import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/PageLoader";

const KenoGame = dynamic(
  () => import("@/components/games/KenoGame").then((mod) => mod.KenoGame),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function KenoPage() {
  return <KenoGame />;
}
