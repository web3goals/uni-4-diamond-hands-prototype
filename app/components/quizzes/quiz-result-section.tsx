import { QuizQuestion } from "@/types/quiz-question";
import { useState } from "react";
import { QuizResultFailSection } from "./quiz-result-fail-section";
import { QuizResultGetSection } from "./quiz-result-get-section";
import { QuizResultSuccessSection } from "./quiz-result-success-section";
import { QuizMetadata } from "@/types/quiz-metadata";

export function QuizResultSection(props: {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
  answers: string[];
  onRestart: () => void;
}) {
  const [successTxBlock, setSuccessTxBlock] = useState<string | undefined>();
  const [fail, setFail] = useState(false);

  if (successTxBlock) {
    return (
      <QuizResultSuccessSection
        metadata={props.metadata}
        txBlock={successTxBlock}
      />
    );
  }

  if (fail) {
    return <QuizResultFailSection onRestart={props.onRestart} />;
  }

  return (
    <QuizResultGetSection
      questions={props.questions}
      answers={props.answers}
      onSuccess={(tx) => setSuccessTxBlock(tx)}
      onFail={() => setFail(true)}
    />
  );
}
