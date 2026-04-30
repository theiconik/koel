import type { Response } from "@/lib/types";

interface ProcessingRetryBannerProps {
  response: Response;
  retrying: boolean;
  retryError: string | null;
  onRetry?: () => void;
}

export function ProcessingRetryBanner({ response, retrying, retryError, onRetry }: ProcessingRetryBannerProps) {
  if (!response.processingError) return null;

  return (
    <div
      className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm"
      style={{
        borderColor: "var(--color-danger-zone-border)",
        background: "var(--color-danger-zone-bg)",
        color: "var(--color-danger-zone)",
      }}
    >
      <span>{response.processingError}</span>
      {onRetry && (
        <button
          type="button"
          disabled={retrying}
          onClick={onRetry}
          className="shrink-0 rounded-md border px-3 py-1.5 font-semibold"
          style={{
            borderColor: "var(--color-danger-zone-border)",
            background: "var(--color-bg-raised)",
            color: "var(--color-danger-zone)",
            cursor: retrying ? "not-allowed" : "pointer",
          }}
        >
          {retrying ? "retrying..." : "retry"}
        </button>
      )}
      {retryError && (
        <span className="basis-full text-[13px]" role="alert">
          {retryError}
        </span>
      )}
    </div>
  );
}
