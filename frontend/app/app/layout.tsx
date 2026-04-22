import Sidebar from "@/components/layout/Sidebar";
import { SurveysProvider } from "@/lib/contexts/SurveysContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SurveysProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-cream)" }}>
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto min-w-0">{children}</main>
      </div>
    </SurveysProvider>
  );
}

