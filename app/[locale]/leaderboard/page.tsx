import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/PageLoader";

const LeaderboardView = dynamic(
  () =>
    import("@/components/leaderboard/LeaderboardView").then(
      (mod) => mod.LeaderboardView,
    ),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
