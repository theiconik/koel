import Link from "next/link";

type Crumb = { href: string; label: string } | string;

export default function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <span>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && " · "}
          {typeof item === "string" ? (
            item
          ) : (
            <Link href={item.href} className="hover:underline" style={{ color: "inherit" }}>
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}
