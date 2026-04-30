import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Response as SurveyResponse, Theme } from "@/lib/types";
import { VoicesTab } from "@/components/surveys/detail/VoicesTab";

const response: SurveyResponse = {
  id: "response-1",
  surveyId: "survey-1",
  respondentName: "Ada Lovelace",
  respondentRole: "Research lead",
  isAnonymous: false,
  quote: "The onboarding flow finally makes sense.",
  duration: "2:13",
  durationSeconds: 133,
  tags: ["onboarding", "clarity"],
  sentiment: "delighted",
  transcript: [],
  koelSummary: "Positive onboarding feedback.",
  processingStatus: "done",
  processingError: null,
  audioUrl: null,
  createdAt: "2026-04-01T00:00:00.000Z",
};

const themes: Theme[] = [
  {
    name: "Onboarding",
    count: 2,
    color: "#4f46e5",
  },
];

describe("VoicesTab", () => {
  it("renders response cards as accessible buttons", () => {
    const onOpenResponse = vi.fn();

    render(
      <VoicesTab
        responses={[response]}
        themes={themes}
        onOpenResponse={onOpenResponse}
      />,
    );

    const card = screen.getByRole("button", {
      name: "Open response details for Ada Lovelace",
    });

    expect(card.tagName).toBe("BUTTON");

    fireEvent.click(card);

    expect(onOpenResponse).toHaveBeenCalledWith(response);
  });
});
