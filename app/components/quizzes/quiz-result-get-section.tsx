import useError from "@/hooks/use-error";
import { QuizQuestion } from "@/types/quiz-question";
import { ArrowRightIcon, DrumIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function QuizResultGetSection(props: {
  questions: QuizQuestion[];
  answers: string[];
  onSuccess: (txBlock: string) => void;
  onFail: () => void;
}) {
  const { handleError } = useError();
  const [isProsessing, setIsProsessing] = useState(false);

  async function handleGetResult() {
    try {
      console.log("Getting result...");
      setIsProsessing(true);

      // Check if answers are correct
      const success = props.questions.every(
        (question, index) => question.answer === props.answers[index]
      );
      console.log("Quiz result:", success ? "Success" : "Fail");

      if (success) {
        // Send pass request to module
        // TODO:
        const txBlock = "6crLYNsJTDW6b5gNKT8kjCV7RC62L3zqPHn7kdKFUyJk";

        props.onSuccess(txBlock);
      } else {
        props.onFail();
      }
    } catch (error) {
      handleError(error, "Failed to submit the form, try again later");
      setIsProsessing(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-center size-24 rounded-full bg-primary">
        <DrumIcon className="size-12 text-primary-foreground" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
        Final
      </h1>
      <p className="text-muted-foreground mt-1">
        That was the last question, are you ready to get results?
      </p>
      <Separator className="my-8" />
      <Button
        variant="default"
        onClick={handleGetResult}
        disabled={isProsessing}
      >
        {isProsessing ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <ArrowRightIcon />
        )}
        Get result
      </Button>
    </main>
  );
}
