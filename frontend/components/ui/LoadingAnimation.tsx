"use client";

import Lottie from "lottie-react";
import loadingAnimation from "@/public/loading-animation.json";

type LottieJsonValue =
  | null
  | boolean
  | number
  | string
  | LottieJsonValue[]
  | { [key: string]: LottieJsonValue };

type LoadingAnimationProps = {
  label?: string;
  size?: number;
  className?: string;
};

const palette = {
  midnight: [26 / 255, 26 / 255, 46 / 255, 1],
  mango: [232 / 255, 176 / 255, 75 / 255, 1],
};

function isColorArray(value: LottieJsonValue): value is number[] {
  return Array.isArray(value) && value.length >= 3 && value.length <= 4 && value.every((entry) => typeof entry === "number");
}

function themeColor(color: number[]) {
  const [red, green, blue, alpha = 1] = color;
  const themed = red > 0.9 && green > 0.8 && blue < 0.85 ? palette.mango : palette.midnight;

  return [themed[0], themed[1], themed[2], alpha];
}

function themeLottieColors(value: LottieJsonValue, insideColorProperty = false): LottieJsonValue {
  if (isColorArray(value)) {
    return insideColorProperty ? themeColor(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => themeLottieColors(entry, insideColorProperty));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        themeLottieColors(entry, insideColorProperty || key === "c"),
      ]),
    );
  }

  return value;
}

const themedAnimationData = themeLottieColors(loadingAnimation as unknown as LottieJsonValue);

export default function LoadingAnimation({
  label = "Loading",
  size = 96,
  className = "",
}: LoadingAnimationProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center ${className}`}
      style={{ color: "var(--color-fg3)" }}
    >
      <Lottie
        animationData={themedAnimationData}
        autoplay
        loop
        aria-hidden="true"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
