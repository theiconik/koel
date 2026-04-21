"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AppBrand from "./AppBrand";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

const navItems = [
  { href: "/",         icon: "home"     as const, label: "Home" },
  { href: "/insights", icon: "chart"    as const, label: "Insights" },
  { href: "/settings", icon: "settings" as const, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside
      className="w-60 shrink-0 flex flex-col gap-1 px-3 py-5 border-r"
      style={{
        background: "var(--color-stone-100)",
        borderColor: "rgba(26,26,46,0.08)",
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
        const active = item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href}>
            <button
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm text-left transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: active ? 600 : 500,
                color: "var(--color-midnight)",
                background: active ? "rgba(26,26,46,0.06)" : "transparent",
              }}
            >
              <span style={{ color: active ? "var(--color-midnight)" : "var(--color-fg3)" }}>
                <Icon name={item.icon} size={18} />
              </span>
              {item.label}
            </button>
          </Link>
        );
      })}

      <div className="flex-1" />

      {/* User avatar */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 text-xs" style={{ color: "var(--color-fg2)" }}>
        <div
          className="w-7 h-7 rounded-full shrink-0 overflow-hidden"
          style={{ background: "var(--color-stone-300)" }}
        >
          {user?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
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
