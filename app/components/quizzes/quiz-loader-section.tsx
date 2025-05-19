import { ipfsToHttp } from "@/lib/ipfs";
import { QuizMetadata } from "@/types/quiz-metadata";
import axios from "axios";
import { useEffect } from "react";
import { LoadingSection } from "../loading-section";
import useError from "@/hooks/use-error";
import { useSuiClient } from "@mysten/dapp-kit";

export function QuizLoaderSection(props: {
  id: string;
  onLoaded: (metadata: QuizMetadata) => void;
}) {
  const { handleError } = useError();
  const client = useSuiClient();

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
      props.onLoaded(data);
    } catch (error) {
      handleError(error, "Failed to load quiz, please try again");
    }
  }

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  return <LoadingSection />;
}
