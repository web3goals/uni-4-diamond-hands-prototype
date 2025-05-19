"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { ArrowRightIcon, DropletsIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function UniFaucetPage() {
  const { handleError } = useError();
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isProsessing, setIsProsessing] = useState(false);

  const formSchema = z.object({
    amount: z.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1_000_000,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting form...");
      setIsProsessing(true);

      if (!account) {
        toast.error("Please connect your wallet");
        setIsProsessing(false);
        return;
      }

      const transaction = new Transaction();
      transaction.moveCall({
        target: chainConfig.uniCoinMintFunctionTarget,
        arguments: [
          transaction.object(
            "0x7edc3ccd78c6c45e18d276cb933339c9a3b2e1a55a8af03c96c3aac8df92948c"
          ),
          transaction.pure.u64(values.amount),
        ],
      });
      transaction.setGasBudget(5_000_000);

      signAndExecuteTransaction(
        { transaction },
        {
          onSuccess: (result) => {
            toast.message("Done", {
              description: "Check transaction",
              action: {
                label: "Transaction",
                onClick: () =>
                  window.open(
                    `https://testnet.suivision.xyz/txblock/${result.digest}`,
                    "_blank"
                  ),
              },
            });
          },
          onError: (error) => {
            handleError(error, "Failed to submit the form, try again later");
            setIsProsessing(false);
          },
        }
      );
    } catch (error) {
      handleError(error, "Failed to submit the form, try again later");
    } finally {
      setIsProsessing(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-center size-24 rounded-full bg-primary">
        <DropletsIcon className="size-12 text-primary-foreground" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
        UNI Faucet
      </h1>
      <Separator className="my-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1000000"
                    disabled={isProsessing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="default" disabled={isProsessing}>
            {isProsessing ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <ArrowRightIcon />
            )}
            Mint
          </Button>
        </form>
      </Form>
    </main>
  );
}
