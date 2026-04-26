import RespondentSurveyClient from "@/components/respondent/RespondentSurveyClient";
import { getSurveyBySlug } from "@/lib/data";

export default async function RespondentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);

  if (!survey) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-fg3 text-sm font-body">
        survey not found.
      </div>
    );
  }

  return <RespondentSurveyClient survey={survey} />;
}
