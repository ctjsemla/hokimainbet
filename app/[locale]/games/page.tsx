import { redirect } from "next/navigation";

interface GamesIndexPageProps {
  params: { locale: string };
}

export default function GamesIndexPage({ params: { locale } }: GamesIndexPageProps) {
  redirect(`/${locale}/games/crash`);
}
