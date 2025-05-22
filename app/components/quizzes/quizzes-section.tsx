import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { bytesToHexString, stringToSubstrings } from "@/lib/converters";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
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
  const [quizIds, setQuizIds] = useState<string[] | undefined>();

  async function loadQuizIds() {
    try {
      console.log("Loading quiz IDs...");
      if (!account) {
        console.log("No account found");
        return;
      }

      // Prepare the transaction to call get_user_quizzes
      const tx = new Transaction();
      tx.moveCall({
        target: chainConfig.quizGetUserQuizzesFunctionTarget,
        arguments: [
          tx.object(chainConfig.quizTrackedObject),
          tx.pure.address(account.address),
        ],
      });

      // Execute the transaction as a dev inspect to get the return value without changing state
      const devInspectResult = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: account.address,
      });

      // Parse the dev inpect result
      const devInspectResultValues =
        devInspectResult.results?.[0]?.returnValues;
      const devInspectResultHexString = bytesToHexString(
        devInspectResultValues?.[0]?.[0] as number[]
      );
      const devInspectResultHexSubstrings = stringToSubstrings(
        devInspectResultHexString,
        64
      );

      // Extract the quiz IDs from the dev inspect result
      const quizIds = devInspectResultHexSubstrings
        .slice(1)
        .map((substring) => `0x${substring}`);
      setQuizIds(quizIds);
    } catch (error) {
      handleError(error, "Failed to load quizzes, try again later");
    }
  }

  useEffect(() => {
    loadQuizIds();
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
