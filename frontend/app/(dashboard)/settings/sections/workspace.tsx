"use client";
import Button from "@/components/ui/Button";
import {
  SectionHeader,
  SettingRow,
  Field,
  SettingsSelect,
} from "@/components/ui/SettingsPrimitives";

export function WorkspaceSettings() {
  return (
    <div>
      <SectionHeader title="workspace" sub="settings for roshi research." />
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Workspace name">
          <Field value="Roshi Research" />
        </SettingRow>
        <SettingRow label="Slug" hint="used in survey links: koel.to/{slug}/…">
          <Field value="roshi" />
        </SettingRow>
        <SettingRow label="Default language" hint="applies to new surveys.">
          <SettingsSelect defaultValue="en">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </SettingsSelect>
        </SettingRow>
        <SettingRow label="Branding" hint="add your logo to respondent pages.">
          <Button variant="outline">Upload workspace logo</Button>
        </SettingRow>
      </div>
    </div>
  );
}
