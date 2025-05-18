import { Button } from "@/components/ui/button";
import useError from "@/hooks/use-error";
import { ipfsToHttp } from "@/lib/ipfs";
import { QuizMetadata } from "@/types/quiz-metadata";
import { useSuiClient } from "@mysten/dapp-kit";
import axios from "axios";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoadingSection } from "../loading-section";

export function QuizSection(props: { id: string }) {
  const { handleError } = useError();
  const client = useSuiClient();
  const [metadata, setMetadata] = useState<QuizMetadata | undefined>();

  async function loadQuiz() {
    try {
      console.log("Loading quiz object...");
      const quizObject = await client.getObject({
        id: props.id,
        options: {
          showContent: true,
        },
      });
      let quizObjectUrl;
      if (quizObject.data?.content?.dataType === "moveObject") {
        const fields = quizObject.data.content.fields;
        quizObjectUrl =
          typeof fields === "object" && "url" in fields
            ? (fields.url as string)
            : undefined;
      }
      if (!quizObjectUrl) {
        throw new Error("Quiz object URL not found");
      }

      console.log("Loading quiz metadata...");
      const { data } = await axios.get(ipfsToHttp(quizObjectUrl));
      setMetadata(data);
    } catch (error) {
      handleError(error, "Failed to load quiz, please try again");
    }
  }

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  // *Generate 3 quiz questions
  // *Check if user has already answered the quiz
  // *Check if user has enough project coins

  if (!metadata) {
    return <LoadingSection />;
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
          {metadata.name}
        </h1>
        <p className="font-medium tracking-tight text-muted-foreground mt-2">
          {metadata.description}
        </p>
        <div className="flex flex-row gap-2 mt-4">
          <Button>
            <ArrowRightIcon /> Start quiz
          </Button>
        </div>
      </div>
    </main>
  );
}
