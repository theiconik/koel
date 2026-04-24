"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Crumbs from "@/components/layout/Crumbs";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Toast from "@/components/ui/Toast";
import ShareModal from "@/components/ui/ShareModal";
import { useSurvey } from "@/hooks/useSurvey";

const STEPS = [
  { n: "01", title: "share the link", desc: "email, slack, dm — wherever your people are." },
  { n: "02", title: "respondents speak", desc: "they tap the mic. koel listens and follows up." },
  { n: "03", title: "responses roll in", desc: "each voice arrives transcribed and themed." },
];

export default function PublishedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { survey, loading } = useSurvey(id);
  const [showToast, setShowToast] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: "var(--color-fg3)" }}>
        loading…
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: "var(--color-fg3)" }}>
        survey not found.
      </div>
    );
  }

  function copyLink() {
    navigator.clipboard?.writeText(survey!.shareUrl);
    setShowToast(true);
  }

  return (
    <>
      <TopBar
        title=""
        crumbs={<Crumbs items={[{ href: "/home", label: "HOME" }, { href: `/surveys/${id}`, label: survey.title.toUpperCase() }, "PUBLISHED"]} />}
      />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className="w-full max-w-[640px]"
          style={{ animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-[0.06em] uppercase"
            style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}
          >
            <Icon name="check" size={13} stroke={2.5} />
            published &amp; listening
          </div>

          {/* Headline */}
          <h1
            className="text-[44px] leading-[1.1] tracking-[-0.015em] mt-5 mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
          >
            your survey is live.{" "}
            <span style={{ color: "var(--color-fg3)" }}>
              send it to the people whose voice you want.
            </span>
          </h1>

          <p className="text-[15px] leading-relaxed mb-7" style={{ color: "var(--color-fg2)" }}>
            koel opens the conversation, asks follow-ups, and transcribes everything. you&apos;ll
            see responses appear as they come in.
          </p>

          {/* Link row */}
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-2xl border"
            style={{
              background: "var(--color-bg-raised)",
              borderColor: "var(--color-border-medium)",
              boxShadow: "0 2px 10px rgba(26,26,46,0.05)",
            }}
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-3 min-w-0">
              <span style={{ color: "var(--color-fg3)", flexShrink: 0 }}>
                <Icon name="link" size={16} />
              </span>
              <span
                className="text-[13px] truncate"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-midnight)" }}
              >
                {survey.shareUrl}
              </span>
            </div>
            <Button variant="outline" onClick={copyLink}>
              <Icon name="copy" size={14} /> Copy link
            </Button>
            <Button variant="midnight" onClick={() => setShowShare(true)}>
              Share
            </Button>
          </div>

          {/* Next steps */}
          <div className="grid grid-cols-3 gap-2.5 mt-7">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-xl p-4"
                style={{ background: "rgba(26,26,46,0.03)", border: "1px solid var(--color-border-soft)" }}
              >
                <div
                  className="text-[18px] leading-none mb-1.5"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-mango)" }}
                >
                  {step.n}
                </div>
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
                >
                  {step.title}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--color-fg3)" }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          {/* CTA to survey detail */}
          <div className="mt-8 flex justify-center">
            <Button variant="ghost" onClick={() => router.push(`/surveys/${id}`)}>
              view survey responses →
            </Button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast text="link copied to clipboard" onDismiss={() => setShowToast(false)} />
      )}
      {showShare && (
        <ShareModal url={survey.shareUrl} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
