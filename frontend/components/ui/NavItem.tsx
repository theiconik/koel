"use client";
import Link from "next/link";
import Icon, { IconName } from "@/components/ui/Icon";

interface BaseProps {
  label: string;
  icon?: IconName;
  active: boolean;
  danger?: boolean;
}

type NavItemProps =
  | (BaseProps & { href: string; onClick?: never })
  | (BaseProps & { href?: never; onClick: () => void });

export default function NavItem({ label, icon, active, danger, href, onClick }: NavItemProps) {
  const style: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontWeight: active ? 600 : 500,
    color: danger ? "var(--color-danger)" : "var(--color-midnight)",
    background: active ? "var(--color-bg-subtle)" : "transparent",
  };
  const content = (
    <>
      {icon && (
        <span style={{ color: active ? "var(--color-midnight)" : "var(--color-fg3)" }}>
          <Icon name={icon} size={18} />
        </span>
      )}
      {label}
    </>
  );
  const className =
    "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm text-left transition-colors";

  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {content}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className={className}
      style={{ ...style, border: "none", cursor: "pointer" }}
    >
      {content}
    </button>
  );
}
