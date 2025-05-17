"use client";

import { Button } from "@/components/ui/button";
import useError from "@/hooks/use-error";
import {
  useAccounts,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function PlaygroundPage() {
  const { handleError } = useError();
  const accounts = useAccounts();
  const account = accounts[0];
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

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

  async function splitCoins() {
    try {
      console.log("Splitting coins...");
      // Define constants
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
          onSuccess: (result) => console.log("Transaction result: ", result),
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
      console.log("Minting quiz...");
    } catch (error) {
      handleError(error, "Failed, please try again");
    }
  }

  return (
    <main className="container mx-auto px-4 lg:px-80 py-16">
      <p>Playground page...</p>
      <div className="flex flex-col items-start gap-4 mt-4">
        <Button onClick={getBalance}>Get Balance</Button>
        <Button onClick={splitCoins}>Split Coins</Button>
        <Button onClick={mintQuiz}>Mint Quiz</Button>
      </div>
    </main>
  );
}
