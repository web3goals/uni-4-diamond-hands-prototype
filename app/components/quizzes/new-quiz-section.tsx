import { useState } from "react";
import { NewQuizCreatedSection } from "./new-quiz-created-section";
import { NewQuizCreationSection } from "./new-quiz-creation-section";

export function NewQuizSection() {
  const [quizId, setQuizId] = useState<string | undefined>(undefined);

  if (quizId) {
    return <NewQuizCreatedSection quizId={quizId} />;
  }

  return <NewQuizCreationSection onCreated={(quizId) => setQuizId(quizId)} />;
}
