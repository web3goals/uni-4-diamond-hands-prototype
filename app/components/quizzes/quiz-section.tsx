import { QuizMetadata } from "@/types/quiz-metadata";
import { useState } from "react";
import { QuizLoaderSection } from "./quiz-loader-section";
import { QuizStartSection } from "./quiz-start-section";
import { QuizQuestionsSections } from "./quiz-questions-section";
import { QuizResultSection } from "./quiz-result-section";
import { QuizQuestion } from "@/types/quiz-question";

export function QuizSection(props: { id: string }) {
  const [metadata, setMetadata] = useState<QuizMetadata | undefined>();
  const [questions, setQuestions] = useState<QuizQuestion[] | undefined>();
  const [answers, setAnswers] = useState<string[] | undefined>();

  if (metadata && questions && answers) {
    return (
      <QuizResultSection
        id={props.id}
        metadata={metadata}
        questions={questions}
        answers={answers}
        onRestart={() => {
          setQuestions(undefined);
          setAnswers(undefined);
        }}
      />
    );
  }

  if (metadata && questions) {
    return (
      <QuizQuestionsSections
        metadata={metadata}
        questions={questions}
        onAnswer={(answers) => setAnswers(answers)}
      />
    );
  }

  if (metadata) {
    return (
      <QuizStartSection
        metadata={metadata}
        onStart={(questions) => setQuestions(questions)}
      />
    );
  }

  return (
    <QuizLoaderSection
      id={props.id}
      onLoaded={(metadata) => setMetadata(metadata)}
    />
  );
}
