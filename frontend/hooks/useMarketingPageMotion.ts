import { useMemo } from "react";
import type { Variants } from "framer-motion";
import { smoothEase, tapSpring } from "@/components/marketing/landing-constants";

/**
 * Framer Motion variants and shared props for the marketing landing page.
 * Centralized so the page component focuses on layout and copy.
 */
export function useMarketingPageMotion(prefersReduced: boolean) {
  const navContainerVariants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0.15 : 0.72,
        ease: smoothEase,
        staggerChildren: prefersReduced ? 0 : 0.12,
        delayChildren: prefersReduced ? 0 : 0.1,
      },
    },
  };

  const navItemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : -6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0.12 : 0.58,
        ease: smoothEase,
      },
    },
  };

  const heroStaggerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.17,
        delayChildren: prefersReduced ? 0 : 0.14,
      },
    },
  };

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReduced
        ? { duration: 0.2, ease: "easeOut" }
        : { type: "spring", stiffness: 165, damping: 34, mass: 1.05 },
    },
  };

  const heroCardVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: prefersReduced ? 1 : 0.97,
      x: prefersReduced ? 0 : 14,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: prefersReduced
        ? { duration: 0.25, delay: 0.08, ease: "easeOut" }
        : { type: "spring", stiffness: 185, damping: 36, mass: 1.05, delay: 0.38 },
    },
  };

  const gridContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReduced ? 0 : 0.14 },
    },
  };

  const gridItemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReduced
        ? { duration: 0.22, ease: "easeOut" }
        : { type: "spring", stiffness: 170, damping: 32, mass: 1.05 },
    },
  };

  const revealHidden = { opacity: 0, y: prefersReduced ? 0 : 24 };
  const revealVisible = { opacity: 1, y: 0 };
  const revealTransition = {
    duration: prefersReduced ? 0.22 : 0.92,
    ease: smoothEase,
  };

  const buttonHoverTap = useMemo(
    () => (prefersReduced ? {} : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: tapSpring }),
    [prefersReduced],
  );

  return {
    navContainerVariants,
    navItemVariants,
    heroStaggerVariants,
    heroItemVariants,
    heroCardVariants,
    gridContainerVariants,
    gridItemVariants,
    revealHidden,
    revealVisible,
    revealTransition,
    buttonHoverTap,
    tapSpring,
  };
}
