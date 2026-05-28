import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/PageLoader";

const CrashGame = dynamic(
  () =>
    import("@/components/games/CrashGame").then((mod) => mod.CrashGame),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function CrashPage() {
  return <CrashGame />;
}
