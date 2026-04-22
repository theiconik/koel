"use client";
import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import NavItem from "@/components/ui/NavItem";
import { ProfileSettings } from "./sections/profile";
import { VoiceSettings } from "./sections/voice";
import { NotificationSettings } from "./sections/notifications";
import { BillingSettings } from "./sections/billing";
import { IntegrationsSettings } from "./sections/integrations";
import { DangerSettings } from "./sections/danger";

const SECTIONS = [
  { k: "profile",       l: "Profile" },
  { k: "voice",         l: "Voice & transcription" },
  { k: "notifications", l: "Notifications" },
  { k: "billing",       l: "Billing" },
  { k: "integrations",  l: "Integrations" },
  { k: "danger",        l: "Danger zone" },
] as const;
type Section = (typeof SECTIONS)[number]["k"];

const CONTENT: Record<Section, React.ReactNode> = {
  profile:       <ProfileSettings />,
  voice:         <VoiceSettings />,
  notifications: <NotificationSettings />,
  billing:       <BillingSettings />,
  integrations:  <IntegrationsSettings />,
  danger:        <DangerSettings />,
};

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");

  return (
    <>
      <TopBar title="settings" crumbs="HOME · SETTINGS" />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr" }}>
        <nav style={{
          padding: "28px 20px",
          borderRight: "1px solid var(--color-border-soft)",
          display: "flex", flexDirection: "column", gap: 2,
          position: "sticky", top: 89, alignSelf: "flex-start",
        }}>
          {SECTIONS.map((s) => (
            <NavItem
              key={s.k}
              label={s.l}
              active={active === s.k}
              danger={s.k === "danger"}
              onClick={() => setActive(s.k)}
            />
          ))}
        </nav>
        <div style={{ padding: "32px 48px", maxWidth: 900 }}>
          {CONTENT[active]}
        </div>
      </div>
    </>
  );
}
