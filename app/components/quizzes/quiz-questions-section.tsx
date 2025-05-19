import { QuizQuestion } from "@/types/quiz-question";
import { useState } from "react";
import { QuizQuestionSections } from "./quiz-question-section";
import { QuizMetadata } from "@/types/quiz-metadata";

export function QuizQuestionsSections(props: {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
  onAnswer: (answers: string[]) => void;
}) {
  const [answers, setAnswers] = useState<string[]>([]);

  async function handleAnswer(answer: string) {
    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);

    if (updatedAnswers.length === props.questions.length) {
      props.onAnswer(updatedAnswers);
    }
  }

  return (
    <QuizQuestionSections
      metadata={props.metadata}
      index={answers.length}
      question={props.questions[answers.length]}
      onAnswer={handleAnswer}
    />
  );
}
