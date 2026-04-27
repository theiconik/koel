"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/ui/StatCard";
import SurveyCard from "@/components/ui/SurveyCard";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useSurveys } from "@/hooks/useSurveys";
import { useStats } from "@/hooks/useStats";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { surveys, loading: surveysLoading, error: surveysError, reload: reloadSurveys } = useSurveys();
  const { stats, error: statsError, reload: reloadStats } = useStats();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "good morning";
    if (h < 17) return "good afternoon";
    return "good evening";
  })();

  const firstName = user?.firstName?.toLowerCase() ?? "there";

  return (
    <>
      <TopBar
        title={`${greeting}, ${firstName}.`}
        crumbs="HOME"
        cta={
          <Button variant="primary" onClick={() => router.push("/surveys/new")}>
            <Icon name="plus" size={16} />
            New survey
          </Button>
        }
      />

      <div className="px-9 py-8 flex flex-col gap-7">
        {(surveysError || statsError) && (
          <div className="flex items-center justify-between rounded-[10px] border px-4 py-3 text-sm" style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
            <span>{surveysError?.message ?? statsError?.message}</span>
            <Button
              variant="outline"
              onClick={() => {
                reloadSurveys();
                reloadStats();
              }}
            >
              Try again
            </Button>
          </div>
        )}
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Active surveys" value={stats.activeSurveys} note="+1 this week" />
            <StatCard label="Voices this week" value={stats.voicesThisWeek} note={stats.voicesNote} />
            <StatCard label="Hours of audio" value={stats.hoursOfAudio} note="transcribed · auto-tagged" />
            <StatCard label="Completion" value={stats.completionRate} note="above benchmark" />
          </div>
        )}

        {/* Survey grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div
              className="font-semibold text-[18px]"
              style={{ fontFamily: "var(--font-body)", color: "var(--color-midnight)" }}
            >
              your surveys
            </div>
            <button
              onClick={() => router.push("/surveys")}
              className="flex items-center gap-1 text-sm"
              style={{ background: "transparent", border: "none", color: "var(--color-fg2)", cursor: "pointer" }}
            >
              view all <Icon name="chevronRight" size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {surveysLoading ? (
              <div className="py-10 text-sm" style={{ color: "var(--color-fg3)" }}>
                loading surveys...
              </div>
            ) : surveys.map((s) => (
              <SurveyCard
                key={s.id}
                survey={s}
                onClick={() => router.push(`/surveys/${s.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
