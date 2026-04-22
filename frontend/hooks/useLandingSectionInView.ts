import { useRef } from "react";
import { useInView } from "framer-motion";
import { LANDING_IN_VIEW } from "@/components/marketing/landing-constants";

/**
 * Intersection state for the main scroll-reveal regions on the marketing page.
 */
export function useLandingSectionInView() {
  const sampleRef = useRef(null);
  const productRef = useRef(null);
  const testimonialRef = useRef(null);
  const pricingRef = useRef(null);
  const footerRef = useRef(null);

  const sampleInView = useInView(sampleRef, LANDING_IN_VIEW);
  const productInView = useInView(productRef, LANDING_IN_VIEW);
  const testimonialInView = useInView(testimonialRef, LANDING_IN_VIEW);
  const pricingInView = useInView(pricingRef, LANDING_IN_VIEW);
  const footerInView = useInView(footerRef, LANDING_IN_VIEW);

  return {
    sampleRef,
    sampleInView,
    productRef,
    productInView,
    testimonialRef,
    testimonialInView,
    pricingRef,
    pricingInView,
    footerRef,
    footerInView,
  };
}
