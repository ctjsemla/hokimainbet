import { Suspense } from "react";
import { SlotsPageView } from "@/components/slots/SlotsPageView";
import { PageLoader } from "@/components/ui/PageLoader";

export default function SlotsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SlotsPageView />
    </Suspense>
  );
}
