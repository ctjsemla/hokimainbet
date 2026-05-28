import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface PromoCtaProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function PromoCta({ href, children, className }: PromoCtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(249,115,22,0.45)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
