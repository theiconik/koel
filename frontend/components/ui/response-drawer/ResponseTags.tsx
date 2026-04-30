import Icon from "../Icon";

interface ResponseTagsProps {
  tags: string[];
}

export function ResponseTags({ tags }: ResponseTagsProps) {
  return (
    <section className="mt-5 flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-semibold leading-none"
          style={{ background: "var(--color-stone-100)", color: "var(--color-fg2)" }}
        >
          <Icon name="tag" size={14} />
          {tag}
        </span>
      ))}
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Tag editing is not available yet"
        className="inline-flex items-center rounded-full px-3 py-2 text-[15px] leading-none"
        style={{
          border: "1px dashed var(--color-border-strong)",
          background: "transparent",
          color: "var(--color-fg3)",
          cursor: "not-allowed",
          opacity: 0.55,
        }}
      >
        + add tag
      </button>
    </section>
  );
}
