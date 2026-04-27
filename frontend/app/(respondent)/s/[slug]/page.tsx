import RespondentSurveyClient from "@/components/respondent/RespondentSurveyClient";
import { getSurveyBySlug } from "@/lib/data";

export default async function RespondentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let survey;
  let error: Error | null = null;
  try {
    survey = await getSurveyBySlug(slug);
  } catch (e) {
    error = e instanceof Error ? e : new Error("Could not load survey.");
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col gap-3 items-center justify-center text-fg3 text-sm font-body">
        <div>{error.message}</div>
        <a className="underline text-midnight" href={`/s/${slug}`}>
          try again
        </a>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-fg3 text-sm font-body">
        survey not found.
      </div>
    );
  }

  return <RespondentSurveyClient survey={survey} slug={slug} />;
}
