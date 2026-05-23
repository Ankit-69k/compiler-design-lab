import { MainLayout } from "@/components/layout/MainLayout";
import { QuizMode } from "@/components/quiz/QuizMode";

export default function QuizPage() {
  return (
    <MainLayout title="Quiz Mode">
      <QuizMode />
    </MainLayout>
  );
}
