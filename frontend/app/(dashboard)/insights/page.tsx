"use client";

import { useAuth } from "@clerk/nextjs";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { InsightsChatLayout } from "@/components/insights/InsightsChatLayout";
import { useInsightsChat } from "@/components/insights/useInsightsChat";
import { useSurveys } from "@/hooks/useSurveys";

export default function InsightsPage() {
  const { surveys } = useSurveys();
  const { getToken } = useAuth();
  const chat = useInsightsChat(surveys, getToken);

  return (
    <>
      <TopBar
        title="insights"
        crumbs="HOME · INSIGHTS"
        cta={
          <Button
            variant="outline"
            disabled
            aria-disabled="true"
            title="Thread export is not available yet"
          >
            <Icon name="copy" size={14} /> Export thread
          </Button>
        }
      />
      <InsightsChatLayout
        surveys={surveys}
        selectedId={chat.selectedId}
        selected={chat.selected}
        messages={chat.messages}
        input={chat.input}
        sending={chat.sending}
        onSelect={chat.handleSelect}
        onInputChange={chat.setInput}
        onSend={chat.handleSend}
      />
    </>
  );
}
