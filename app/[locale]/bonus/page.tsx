import { ArenaPromoPageView } from "@/components/bonus/ArenaPromoPageView";
import { PlatformPickerSection } from "@/components/bonus/PlatformPickerSection";
import { getAllPosts } from "@/lib/blog";

export default function BonusPage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <PlatformPickerSection />
      <ArenaPromoPageView posts={posts} />
    </>
  );
}
