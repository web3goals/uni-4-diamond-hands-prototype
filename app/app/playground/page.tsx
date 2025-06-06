"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useError from "@/hooks/use-error";
import {
  useAccounts,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { GamepadIcon } from "lucide-react";

export default function PlaygroundPage() {
  const { handleError } = useError();
  const accounts = useAccounts();
  const account = accounts[0];
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      }),
  });

  async function getBalance() {
    try {
      console.log("Getting balance...");
      // Define constants
      const uniCoinType =
        "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI";
      // Get balance
      const balance = await client.getBalance({
        owner: account.address,
        coinType: uniCoinType,
      });
      console.log("Balance: ", balance);
    } catch (error) {
      handleError(error, "Failed, please try again");
    }
  }

  async function getQuizzes() {
    try {
      console.log("Getting quizzes...");
      // Define constants
      const quizObjectStructType =
        "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::quiz::Quiz<0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI>";
      // Get quizzes
      const quizzes = [];
      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: quizObjectStructType,
        },
      });
      for (const object of objects.data) {
        if (object.data?.objectId) {
          const quiz = await client.getObject({
            id: object.data?.objectId,
            options: { showContent: true },
          });
          quizzes.push(quiz);
        }
      }
      console.log("Quizzes: ", quizzes);
    } catch (error) {
      handleError(error, "Failed, please try again");
    }
  }

  async function splitCoins() {
    try {
      console.log("Splitting coins...");
      // Define constants
      const uniCoinObjectType =
        "0x2::coin::Coin<0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI>";
      const uniCoinObjectId =
        "0x1d02ab5132f092f82a422d77c30f225d23358633497b17ab1040e97ffa917938";
      // Prepare transaction
      const tx = new Transaction();
      const [coin] = tx.splitCoins(uniCoinObjectId, [100_000]);
      tx.transferObjects([coin], account.address);
      tx.setGasBudget(5_000_000);
      // Execute transaction
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Transaction result: ", result);
            const createdCoins = result.objectChanges?.filter(
              (change) =>
                change.type === "created" &&
                change.objectType === uniCoinObjectType
            );
            console.log("Created coins: ", createdCoins);
          },
          onError: (error) => handleError(error, "Failed, please try again"),
        }
      );
    } catch (error) {
      handleError(error, "Failed, please try again");
    }
  }

  async function mintQuiz() {
    try {
      console.log("Minting quiz...");
      // Define constants
      const uniCoinObjectId =
        "0xe5041c232c830d6ae227656b3fde61160dadad201442be56f7288c3031ae8ec8";
      // Prepare the transaction
      const tx = new Transaction();
      tx.moveCall({
        target:
          "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::quiz::mint_to_sender",
        arguments: [
          tx.pure.string("Quiz 2"),
          tx.pure.string("Quiz 2 Description"),
          tx.pure.string("ipfs://quiz_2"),
          tx.object(uniCoinObjectId),
          tx.pure.u64(10_000),
        ],
        typeArguments: [
          "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI",
        ],
      });
      tx.setGasBudget(5_000_000);
      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => console.log("Transaction result: ", result),
          onError: (error) => handleError(error, "Failed, please try again"),
        }
      );
    } catch (error) {
      handleError(error, "Failed, please try again");
    }
  }

  async function passQuiz() {
    try {
      console.log("Passing quiz...");
      // Define constants
      const quizObjectId =
        "0xc1f642f38c3bda8265fa6e74c649640821cf838d9e3f7831dd1867b773263595";
      const userAddress =
        "0x90bbf7799fe30efda0e7c1a9f7bdc05a8e8ecfac69f4d4445f34ef26269e7baa";
      // Prepare the transaction
      const tx = new Transaction();
      tx.moveCall({
        target:
          "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::quiz::pass",
        arguments: [tx.object(quizObjectId), tx.pure.address(userAddress)],
        typeArguments: [
          "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI",
        ],
      });
      tx.setGasBudget(5_000_000);
      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => console.log("Transaction result: ", result),
          onError: (error) => handleError(error, "Failed, please try again"),
        }
      );
    } catch (error) {
      handleError(error, "Failed, please try again");
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-center size-24 rounded-full bg-primary">
        <GamepadIcon className="size-12 text-primary-foreground" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
        Playground
      </h1>
      <Separator className="my-8" />
      <div className="flex flex-col items-start gap-4 mt-4">
        <Button variant="secondary" onClick={getBalance}>
          Get Balance
        </Button>
        <Button variant="secondary" onClick={splitCoins}>
          Split Coins
        </Button>
        <Button variant="secondary" onClick={mintQuiz}>
          Mint Quiz
        </Button>
        <Button variant="secondary" onClick={passQuiz}>
          Pass Quiz
        </Button>
        <Button variant="secondary" onClick={getQuizzes}>
          Get Quizzes
        </Button>
      </div>
    </main>
  );
}
