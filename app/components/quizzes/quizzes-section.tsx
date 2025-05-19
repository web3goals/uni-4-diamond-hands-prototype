import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { AlignJustifyIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import EntityList from "../entity-list";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { QuizCard } from "./quiz-card";

export function QuizzesSection() {
  const { handleError } = useError();
  const client = useSuiClient();
  const account = useCurrentAccount();
  const [quizIds, setQuizIds] = useState<string[]>([]);

  useEffect(() => {
    if (account) {
      client
        .getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: chainConfig.quizObjectType,
          },
        })
        .then((data) =>
          setQuizIds(
            data.data
              .map((item) => item.data?.objectId)
              .filter((item) => item !== undefined)
          )
        )
        .catch((error) =>
          handleError(error, "Failed to load quizzes, try again later")
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-center size-24 rounded-full bg-primary">
        <AlignJustifyIcon className="size-12 text-primary-foreground" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
        Quizzes
      </h1>
      <p className="text-muted-foreground mt-1">
        You created to turn your project&apos;s coin holders into diamond-handed
        supporters
      </p>
      <Separator className="my-8" />
      <Link href="/quizzes/new">
        <Button className="mb-8">
          <PlusIcon /> Create quiz
        </Button>
      </Link>
      <EntityList<string>
        entities={quizIds}
        renderEntityCard={(id, index) => <QuizCard key={index} id={id} />}
        noEntitiesText="No created quizzes yet..."
      />
    </main>
  );
}
