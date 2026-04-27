"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Crumbs from "@/components/layout/Crumbs";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import SurveyCard from "@/components/ui/SurveyCard";
import { useSurveys } from "@/hooks/useSurveys";
import type { SurveyStatus } from "@/lib/types";

type Filter = "all" | SurveyStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",    label: "All" },
  { key: "live",   label: "Live" },
  { key: "draft",  label: "Draft" },
  { key: "closed", label: "Closed" },
];

export default function AllSurveysPage() {
  const router = useRouter();
  const { surveys, loading, error, reload } = useSurveys();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all:    surveys.length,
    live:   surveys.filter((s) => s.status === "live").length,
    draft:  surveys.filter((s) => s.status === "draft").length,
    closed: surveys.filter((s) => s.status === "closed").length,
  };

  const visible = surveys.filter((s) => {
    const matchesFilter = filter === "all" || s.status === filter;
    const matchesQuery =
      query === "" ||
      (s.title + " " + s.description).toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <>
      <TopBar
        title="all surveys"
        crumbs={<Crumbs items={[{ href: "/home", label: "HOME" }, "ALL SURVEYS"]} />}
        cta={
          <>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-fg3)" }}
              >
                <Icon name="search" size={15} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search surveys…"
                className="pl-9 pr-3.5 py-2.5 text-sm rounded-[10px] border outline-none transition-all w-64"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-midnight)",
                  borderColor: "var(--color-border-strong)",
                  background: "var(--color-bg-raised)",
                }}
              />
            </div>
            <Button variant="primary" onClick={() => router.push("/surveys/new")}>
              <Icon name="plus" size={16} /> New survey
            </Button>
          </>
        }
      />

      <div className="px-9 py-8">
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-[10px] border px-4 py-3 text-sm" style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
            <span>{error.message}</span>
            <Button variant="outline" onClick={reload}>Try again</Button>
          </div>
        )}
        {loading && (
          <LoadingAnimation label="Loading surveys" className="py-12" />
        )}
        {/* Filter chips */}
        {!loading && <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3.5 py-2 rounded-full text-[13px] font-medium border transition-all"
              style={{
                background: filter === f.key ? "var(--color-midnight)" : "transparent",
                borderColor: filter === f.key ? "var(--color-midnight)" : "var(--color-border-heavy)",
                color: filter === f.key ? "var(--color-fg-inverse)" : "var(--color-midnight)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {f.label} · {counts[f.key]}
            </button>
          ))}
        </div>}

        {/* Survey grid */}
        {!loading && visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {visible.map((s) => (
              <SurveyCard
                key={s.id}
                survey={s}
                onClick={() => router.push(`/surveys/${s.id}`)}
              />
            ))}
          </div>
        ) : !loading && (
          <div className="py-16 text-center text-sm" style={{ color: "var(--color-fg3)" }}>
            {query
              ? `nothing matches "${query}" — try a different word.`
              : "no surveys yet."}
          </div>
        )}
      </div>
    </>
  );
}
