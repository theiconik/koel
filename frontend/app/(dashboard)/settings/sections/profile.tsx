"use client";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import {
  SectionHeader,
  SettingRow,
  Field,
} from "@/components/ui/SettingsPrimitives";

export function ProfileSettings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const handleLogout = () => {
    setSigningOut(true);
    void signOut({ redirectUrl: "/sign-in" }).catch(() => setSigningOut(false));
  };

  return (
    <div>
      <SectionHeader title="profile" sub="how you show up in koel." />
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Avatar">
          <Avatar size={56} />
        </SettingRow>
        <SettingRow label="Full name">
          <Field value={fullName} readOnly placeholder="—" />
        </SettingRow>
        <SettingRow label="Email" hint="used for sign-in and weekly digests.">
          <Field value={email} type="email" readOnly placeholder="—" />
        </SettingRow>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" onClick={handleLogout} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
