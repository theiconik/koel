import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "midnight" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-mango text-midnight hover:bg-mango-hover active:bg-mango-press active:scale-[0.98]",
  midnight:
    "bg-midnight text-fg-inverse hover:bg-midnight/90 active:scale-[0.98]",
  outline:
    "bg-transparent border border-midnight/20 text-midnight hover:bg-stone-100",
  ghost:
    "bg-transparent text-midnight hover:bg-stone-100",
};

export default function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 font-body font-semibold text-sm
        px-[18px] py-[10px] rounded-md leading-none
        transition-all duration-[180ms] cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
        ${styles[variant]}
        ${className}
      `}
      style={{ fontFamily: "var(--font-body)" }}
      {...props}
    >
      {children}
    </button>
  );
}
