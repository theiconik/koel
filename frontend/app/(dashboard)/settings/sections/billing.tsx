"use client";
import Button from "@/components/ui/Button";
import {
  SectionHeader,
  SettingRow,
  Field,
} from "@/components/ui/SettingsPrimitives";

export function BillingSettings() {
  return (
    <div>
      <SectionHeader title="billing" sub="you're on flock — renews 14 apr 2026." />
      <div style={{
        marginTop: 20,
        background: "var(--color-bg-inverse)",
        color: "var(--color-fg-inverse)",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-mango)", fontWeight: 600 }}>CURRENT PLAN</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 32, marginTop: 8, fontWeight: 600 }}>flock</div>
          <div style={{ fontSize: 13, color: "var(--color-fg-inverse-muted)", marginTop: 4 }}>$79 / month · 500 voices included</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 28, color: "var(--color-mango)", fontWeight: 500 }}>317 / 500</div>
          <div style={{ fontSize: 12, color: "var(--color-fg-inverse-subtle)", marginTop: 2 }}>voices this month</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Payment method" hint="we'll email before any overage charges.">
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", border: "1px solid var(--color-border-medium)", borderRadius: 10, background: "var(--color-bg-raised)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
              <div style={{
                width: 36, height: 24, background: "var(--color-midnight)", borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "var(--color-fg-inverse)", fontWeight: 700, letterSpacing: 1,
              }}>VISA</div>
              <span>•••• 4242</span>
              <span style={{ color: "var(--color-stone-500)" }}>· exp 08/28</span>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </SettingRow>
        <SettingRow label="Billing email">
          <Field value="finance@roshi.co" type="email" />
        </SettingRow>
        <SettingRow label="Invoices" hint="download past invoices as PDF.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Mar 2026 · $79.00", "Feb 2026 · $79.00", "Jan 2026 · $79.00"].map(x => (
              <div key={x} style={{
                display: "flex", justifyContent: "space-between", padding: "10px 14px",
                border: "1px solid var(--color-border-soft)", borderRadius: 10,
                fontSize: 13, color: "var(--color-midnight)", background: "var(--color-bg-raised)",
              }}>
                <span>{x}</span>
                <span style={{ color: "var(--color-success-link)", cursor: "pointer", fontWeight: 600 }}>Download</span>
              </div>
            ))}
          </div>
        </SettingRow>
      </div>
    </div>
  );
}
