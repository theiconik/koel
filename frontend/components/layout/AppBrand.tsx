import Image from "next/image";

export default function AppBrand() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <Image src="/koel-logo.svg" alt="" width={26} height={26} className="shrink-0" />
      <span
        className="text-midnight leading-none tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-display)", fontSize: 26 }}
      >
        koel
      </span>
    </div>
  );
}
