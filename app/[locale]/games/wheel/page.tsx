import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/PageLoader";

const WheelGame = dynamic(
  () => import("@/components/games/WheelGame").then((mod) => mod.WheelGame),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function WheelPage() {
  return <WheelGame />;
}
