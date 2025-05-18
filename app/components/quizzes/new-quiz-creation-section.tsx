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
import { Textarea } from "@/components/ui/textarea";
import { chainConfig } from "@/config/chain";
import useError from "@/hooks/use-error";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function NewQuizCreationSection(props: {
  onCreated: (quizId: string) => void;
}) {
  const { handleError } = useError();
  const client = useSuiClient();
  const account = useCurrentAccount();

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

  const [isProsessing, setIsProsessing] = useState(false);

  const formSchema = z.object({
    projectTitle: z.string().min(1),
    projectLinks: z.string().min(1),
    projectCoin: z.string().min(1),
    minProjectCoins: z.number(),
    passReward: z.number(),
    holdReward: z.number(),
    budget: z.number(),
  });

  // TODO: Clear default values for production
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTitle: "NAVI Protocol",
      projectLinks:
        "https://naviprotocol.io/\nhttps://naviprotocol.gitbook.io/navi-protocol-docs/dao-and-token/2025-roadmap\nhttps://medium.com/@navi.protocol/navi-protocol-q1-2025-recap-cde6a2c0b374",
      projectCoin:
        "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI",
      minProjectCoins: 1 * 1000000,
      passReward: 0.01 * 1000000,
      holdReward: 0.02 * 1000000,
      budget: 0.1 * 1000000,
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

      // Get the first UNI coin object
      console.log("Getting UNI coin objects...");
      const uniCoinObjects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: chainConfig.uniCoinObjectType,
        },
        options: {
          showContent: true,
        },
      });
      const firstUniCoinObjectId = uniCoinObjects.data[0].data?.objectId;
      if (!firstUniCoinObjectId) {
        toast.error("First UNI coin object not found");
        setIsProsessing(false);
        return;
      }
      console.log("First UNI coin object ID: ", firstUniCoinObjectId);

      // Split the first UNI coin object
      console.log("Splitting UNI coins...");
      const transaction = new Transaction();
      const [coin] = transaction.splitCoins(firstUniCoinObjectId, [
        values.budget,
      ]);
      transaction.transferObjects([coin], account.address);
      transaction.setGasBudget(5_000_000);
      signAndExecuteTransaction(
        { transaction },
        {
          onSuccess: (result) => {
            const createdUniCoins = result.objectChanges?.filter(
              (change) =>
                change.type === "created" &&
                change.objectType === chainConfig.uniCoinObjectType
            );
            if (createdUniCoins?.[0].type === "created") {
              mintQuiz(createdUniCoins[0].objectId, values);
            } else {
              handleError(
                new Error("Not found created UNI coins"),
                "Failed to submit the form, try again later"
              );
              setIsProsessing(false);
            }
          },
          onError: (error) => {
            handleError(error, "Failed to submit the form, try again later");
            setIsProsessing(false);
          },
        }
      );
    } catch (error) {
      handleError(error, "Failed to submit the form, try again later");
      setIsProsessing(false);
    }
  }

  async function mintQuiz(
    uniCoinsObjectId: string,
    values: z.infer<typeof formSchema>
  ) {
    try {
      console.log("Minting quiz...");
      setIsProsessing(true);

      // Upload data to IPFS
      // TODO: Implement
      console.log("Uploading data to IPFS...");
      const name = `${values.projectTitle} Quiz`;
      const description = `Pass the quiz about ${values.projectTitle} and get ${
        values.passReward / 1_000_000
      } UNI coins if all answers are correct`;
      const ipfsUrl = "ipfs://42";
      console.log("IPFS URL: ", ipfsUrl);

      // Mint quiz
      console.log("Minting quiz...");
      const transaction = new Transaction();
      transaction.moveCall({
        target: chainConfig.quizMintFunctionTarget,
        arguments: [
          transaction.pure.string(name),
          transaction.pure.string(description),
          transaction.pure.string(ipfsUrl),
          transaction.object(uniCoinsObjectId),
          transaction.pure.u64(values.passReward),
        ],
        typeArguments: [chainConfig.uniCoinType],
      });
      transaction.setGasBudget(5_000_000);
      signAndExecuteTransaction(
        { transaction },
        {
          onSuccess: (result) => {
            const createdQuizzes = result.objectChanges?.filter(
              (change) =>
                change.type === "created" &&
                change.objectType === chainConfig.quizObjectType
            );
            if (createdQuizzes?.[0].type === "created") {
              props.onCreated(createdQuizzes[0].objectId);
            } else {
              handleError(
                new Error("Not found created quiz"),
                "Failed to submit the form, try again later"
              );
              setIsProsessing(false);
            }
          },
          onError: (error) => {
            handleError(error, "Failed to submit the form, try again later");
            setIsProsessing(false);
          },
        }
      );
    } catch (error) {
      handleError(error, "Failed to submit the form, try again later");
      setIsProsessing(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-center size-24 rounded-full bg-primary">
        <PlusIcon className="size-12 text-primary-foreground" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
        New quiz
      </h1>
      <p className="text-muted-foreground mt-1">
        Provide data for the quiz you want to create
      </p>
      <Separator className="my-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="projectTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="NAVI Protocol"
                    disabled={isProsessing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectLinks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project links *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="https://naviprotocol.io/"
                    disabled={isProsessing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectCoin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project coin *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::navx::NAVX"
                    disabled={isProsessing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minProjectCoins"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Minimum number of project coins to pass the quiz *
                </FormLabel>
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
          <FormField
            control={form.control}
            name="passReward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Number of UNI coins for passing the quiz *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="100000"
                    disabled={isProsessing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="holdReward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Number of UNI coins for holding the project coins for 30 days
                  after passing the quiz *
                </FormLabel>
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
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Number of UNI coins allocated for the quiz *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="10000000"
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
            Create
          </Button>
        </form>
      </Form>
    </main>
  );
}
