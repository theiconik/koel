"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";

const SECTIONS = [
  "profile",
  "workspace",
  "voice",
  "notifications",
  "billing",
  "integrations",
  "danger",
] as const;
type Section = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<Section, string> = {
  profile: "Profile",
  workspace: "Workspace",
  voice: "Voice",
  notifications: "Notifications",
  billing: "Billing",
  integrations: "Integrations",
  danger: "Danger zone",
};

function PlaceholderSection({ name }: { name: string }) {
  return (
    <div
      className="rounded-2xl p-7 border"
      style={{ background: "var(--color-bg-raised)", borderColor: "var(--color-border)" }}
    >
      <div
        className="font-semibold text-[18px] mb-1"
        style={{ fontFamily: "var(--font-body)", color: "var(--color-midnight)" }}
      >
        {name}
      </div>
      <div className="text-sm" style={{ color: "var(--color-fg3)" }}>
        settings for {name.toLowerCase()} — coming soon.
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const [active, setActive] = useState<Section>("profile");

  return (
    <>
      <TopBar title="settings" crumbs="HOME · SETTINGS" />

      <div className="px-9 py-8 flex gap-8">
        {/* Sub-nav */}
        <nav className="w-44 shrink-0 flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: active === s ? 600 : 500,
                color: active === s ? "var(--color-midnight)" : "var(--color-fg3)",
                background: active === s ? "rgba(26,26,46,0.06)" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {SECTION_LABELS[s]}
            </button>
          ))}
        </nav>

        {/* Section content */}
        <div className="flex-1 max-w-[640px]">
          {active === "profile" && (
            <div
              className="rounded-2xl p-7 border"
              style={{ background: "var(--color-bg-raised)", borderColor: "var(--color-border)" }}
            >
              <div
                className="font-semibold text-[18px] mb-5"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-midnight)" }}
              >
                Profile
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden"
                  style={{ background: "var(--color-stone-300)" }}
                >
                  {user?.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: "var(--color-midnight)" }}
                  >
                    {[user?.firstName, user?.lastName].filter(Boolean).join(" ").toLowerCase() || "—"}
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-fg3)" }}>
                    {user?.primaryEmailAddress?.emailAddress ?? "—"}
                  </div>
                </div>
              </div>

              {/* Fields — display only, Clerk manages editing */}
              {([
                ["First name", user?.firstName ?? ""],
                ["Last name", user?.lastName ?? ""],
                ["Email", user?.primaryEmailAddress?.emailAddress ?? ""],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="mb-4">
                  <div
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
                  >
                    {label}
                  </div>
                  <div
                    className="w-full px-3.5 py-2.5 rounded-[10px] border text-sm"
                    style={{
                      borderColor: "rgba(26,26,46,0.12)",
                      color: "var(--color-midnight)",
                      background: "var(--color-stone-50)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {value || <span style={{ color: "var(--color-fg4)" }}>—</span>}
                  </div>
                </div>
              ))}

              <div className="mt-2">
                <div className="text-sm" style={{ color: "var(--color-fg3)" }}>
                  to update your name or email, use the Clerk account portal.
                </div>
              </div>
            </div>
          )}

          {active === "danger" && (
            <div
              className="rounded-2xl p-7 border"
              style={{
                background: "var(--color-bg-raised)",
                borderColor: "var(--color-danger)",
                borderWidth: 1,
              }}
            >
              <div
                className="font-semibold text-[18px] mb-2"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-danger)" }}
              >
                Danger zone
              </div>
              <div className="text-sm mb-5" style={{ color: "var(--color-fg3)" }}>
                actions here cannot be undone.
              </div>
              <Button variant="outline" className="border-danger text-danger" disabled>
                Delete account
              </Button>
            </div>
          )}

          {active !== "profile" && active !== "danger" && (
            <PlaceholderSection name={SECTION_LABELS[active]} />
          )}
        </div>
      </div>
    </>
  );
}
