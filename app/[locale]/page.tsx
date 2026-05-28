import { HomeBlogSection } from "@/components/home/HomeBlogSection";
import { HomeCtaBanner } from "@/components/home/HomeCtaBanner";
import { HomeGamesGrid } from "@/components/home/HomeGamesGrid";
import { HomeSlotsSection } from "@/components/home/HomeSlotsSection";
import { HomeHero } from "@/components/home/HomeHero";
import { FeaturedSlider } from "@/components/ui/FeaturedSlider";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeStatsTicker } from "@/components/home/HomeStatsTicker";
import { getAllPosts } from "@/lib/blog";

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  const latestPosts = getAllPosts(locale).slice(0, 3);

  return (
    <>
      <HomeHero />
      <FeaturedSlider />
      <HomeStatsTicker />
      <HomeGamesGrid />
      <HomeSlotsSection />
      <HomeHowItWorks />
      <HomeBlogSection posts={latestPosts} locale={locale} />
      <HomeCtaBanner />
    </>
  );
}
