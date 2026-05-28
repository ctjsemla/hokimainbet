import { ArenaPromoPageView } from "@/components/bonus/ArenaPromoPageView";
import { PlatformPickerSection } from "@/components/bonus/PlatformPickerSection";
import { getAllPosts } from "@/lib/blog";

interface BonusPageProps {
  params: { locale: string };
}

export default function BonusPage({ params: { locale } }: BonusPageProps) {
  const posts = getAllPosts(locale).slice(0, 3);

  return (
    <>
      <PlatformPickerSection />
      <ArenaPromoPageView posts={posts} />
    </>
  );
}
