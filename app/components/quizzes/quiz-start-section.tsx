import { Button } from "@/components/ui/button";
import useError from "@/hooks/use-error";
import { QuizMetadata } from "@/types/quiz-metadata";
import { QuizQuestion } from "@/types/quiz-question";
import axios from "axios";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function QuizStartSection(props: {
  metadata: QuizMetadata;
  onStart: (questions: QuizQuestion[]) => void;
}) {
  const { handleError } = useError();
  const [isProsessing, setIsProsessing] = useState(false);

  async function handleStartQuiz() {
    try {
      console.log("Starting quiz...");
      setIsProsessing(true);

      // Check if user has already passed the quiz
      // TODO:

      // Check if user has enough project coins
      // TODO:

      // Generate questions for the quiz
      const { data } = await axios.post("/api/quiz", {
        projectLinks: props.metadata.projectLinks,
      });
      if (!data.success) {
        throw new Error(
          `Failed to generate quiz questions: ${JSON.stringify(data)}`
        );
      }
      console.log("Quiz questions:", data.data);

      props.onStart(data.data);
    } catch (error) {
      handleError(error, "Failed to submit the form, try again later");
      setIsProsessing(false);
    }
  }

  return (
    <main className="container mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-4 py-4">
      <div className="max-w-xl">
        <Image
          src="/images/cover.png"
          alt="Cover"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full rounded-xl"
        />
      </div>
      <div className="max-w-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
          {props.metadata.name}
        </h1>
        <p className="font-medium tracking-tight text-muted-foreground mt-2">
          {props.metadata.description}
        </p>
        <div className="flex flex-row gap-2 mt-4">
          <Button disabled={isProsessing} onClick={handleStartQuiz}>
            {isProsessing ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <ArrowRightIcon />
            )}
            Start quiz
          </Button>
        </div>
      </div>
    </main>
  );
}
