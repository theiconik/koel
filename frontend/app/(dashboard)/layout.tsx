import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-cream)" }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
