import { useState } from "react";
import { NewQuizCreatedSection } from "./new-quiz-created-section";
import { NewQuizCreationSection } from "./new-quiz-creation-section";

export function NewQuizSection() {
  const [quiz, setQuiz] = useState<unknown | undefined>(undefined);

  if (quiz) {
    return <NewQuizCreatedSection quiz={quiz} />;
  }

  return <NewQuizCreationSection onCreated={(quiz) => setQuiz(quiz)} />;
}
