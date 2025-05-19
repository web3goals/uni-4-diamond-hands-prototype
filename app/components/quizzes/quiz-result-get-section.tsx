import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { QuizQuestion } from "@/types/quiz-question";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { ArrowRightIcon, DrumIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export function QuizResultGetSection(props: {
  id: string;
  questions: QuizQuestion[];
  answers: string[];
  onSuccess: (txBlock: string) => void;
  onFail: () => void;
}) {
  const { handleError } = useError();
  const account = useCurrentAccount();
  const [isProsessing, setIsProsessing] = useState(false);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  async function handleGetResult() {
    try {
      console.log("Getting result...");
      setIsProsessing(true);

      if (!account) {
        toast.error("Please connect your wallet");
        setIsProsessing(false);
        return;
      }

      // Check if answers are correct
      const success = props.questions.every(
        (question, index) => question.answer === props.answers[index]
      );

      // If the quiz is passed, call the contract to pass the quiz
      if (success) {
        const transaction = new Transaction();
        transaction.moveCall({
          target: chainConfig.quizPassFunctionTarget,
          arguments: [
            transaction.object(props.id),
            transaction.pure.address(account.address),
          ],
          typeArguments: [chainConfig.uniCoinType],
        });
        transaction.setGasBudget(5_000_000);
        signAndExecuteTransaction(
          { transaction },
          {
            onSuccess: (result) => props.onSuccess(result.digest),
            onError: (error) =>
              handleError(error, "Failed to submit the form, try again later"),
          }
        );
      }
      // If the quiz is failed, call the onFail function
      else {
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
