import { ipfsToHttp } from "@/lib/ipfs";
import { QuizMetadata } from "@/types/quiz-metadata";
import axios from "axios";
import { useEffect } from "react";
import { LoadingSection } from "../loading-section";
import useError from "@/hooks/use-error";
import { useSuiClient } from "@mysten/dapp-kit";

export function QuizLoaderSection(props: {
  id: string;
  onLoaded: (passedUsers: string[], metadata: QuizMetadata) => void;
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
      let quizPassedUsers: string[] = [];
      let quizObjectUrl: string | undefined;
      if (quizObject.data?.content?.dataType === "moveObject") {
        const fields = quizObject.data.content.fields;
        // Extract passed users from the passed_users field
        if (typeof fields === "object" && "passed_users" in fields) {
          const passedUsersMap = fields.passed_users as {
            fields?: {
              contents?: Array<{
                fields?: {
                  key?: string;
                  value?: boolean;
                };
                type?: string;
              }>;
            };
            type?: string;
          };
          if (passedUsersMap?.fields?.contents) {
            quizPassedUsers = passedUsersMap.fields.contents
              .filter((entry) => entry?.fields?.value === true)
              .map((entry) => entry?.fields?.key || "")
              .filter((address) => address !== "");
          }
        }
        // Extract quiz object URL from the url field
        quizObjectUrl =
          typeof fields === "object" && "url" in fields
            ? (fields.url as string)
            : undefined;
      }
      if (!quizPassedUsers || !quizObjectUrl) {
        throw new Error("Quiz data not found");
      }

      console.log("Loading quiz metadata...");
      const { data } = await axios.get(ipfsToHttp(quizObjectUrl));
      props.onLoaded(quizPassedUsers, data);
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
