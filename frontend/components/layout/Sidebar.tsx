"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AppBrand from "./AppBrand";
import Icon, { IconName } from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import NavItem from "@/components/ui/NavItem";
import Avatar from "@/components/ui/Avatar";

const navItems: { href: string; icon: IconName; label: string }[] = [
  { href: "/home",     icon: "home",     label: "Home" },
  { href: "/insights", icon: "chart",    label: "Insights" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside
      className="w-60 shrink-0 flex flex-col gap-1 px-3 py-5 border-r"
      style={{
        background: "var(--color-stone-100)",
        borderColor: "var(--color-border-soft)",
      }}
    >
      <AppBrand />
      <div className="h-3" />

      <Link href="/surveys/new" className="block mb-3.5">
        <Button variant="midnight" className="w-full justify-start gap-2.5 !px-3.5 !py-3">
          <Icon name="plus" size={18} />
          New survey
        </Button>
      </Link>

      {navItems.map((item) => {
        const active =
          item.href === "/home" ? pathname === "/home" : pathname.startsWith(item.href);
        return (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={active}
          />
        );
      })}

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 px-3 py-2.5 text-xs" style={{ color: "var(--color-fg2)" }}>
        <Avatar size={28} />
        <div className="leading-tight">
          <div className="font-semibold" style={{ color: "var(--color-midnight)" }}>
            {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim().toLowerCase() : "..."}
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-fg3)" }}>
            {user?.primaryEmailAddress?.emailAddress ?? ""}
          </div>
        </div>
      </div>
    </aside>
  );
}
