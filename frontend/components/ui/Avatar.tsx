"use client";
import { useUser } from "@clerk/nextjs";

interface AvatarProps {
  size?: number;
}

export default function Avatar({ size = 28 }: AvatarProps) {
  const { user } = useUser();
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toLowerCase() || "—";
  const fontSize = Math.max(11, Math.round(size * 0.4));
  return (
    <div
      className="rounded-full shrink-0 overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "var(--color-stone-300)",
        fontFamily: "var(--font-display)",
        fontSize,
        color: "var(--color-midnight)",
      }}
    >
      {user?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
