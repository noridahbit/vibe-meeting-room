"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

type DashboardNavProps = {
  items: NavItem[];
};

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "rounded-full px-4 py-3 text-sm font-semibold tracking-[0.08em]",
              isActive
                ? "cta-primary"
                : "surface-low text-[var(--foreground-soft)] hover:bg-[var(--surface-highest)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
