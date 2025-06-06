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
import { demoConfig } from "@/config/demo";
import useError from "@/hooks/use-error";
import { QuizMetadata } from "@/types/quiz-metadata";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import axios from "axios";
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
    minProjectCoins: z.coerce.number(),
    passReward: z.coerce.number(),
    holdReward: z.coerce.number(),
    budget: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTitle: demoConfig.projectTitle,
      projectLinks: demoConfig.projectLinks,
      projectCoin: demoConfig.projectCoin,
      minProjectCoins: demoConfig.minProjectCoins,
      passReward: demoConfig.passReward,
      holdReward: demoConfig.holdReward,
      budget: demoConfig.budget,
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

      // Get suitable UNI coin object for splitting
      console.log("Getting suitable UNI coin object for splitting...");
      const uniCoinObjects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: chainConfig.uniCoinObjectType,
        },
        options: {
          showContent: true,
        },
      });
      let suitableUniCoinObject;
      // Find coin with balance equal or greater than budget
      for (const uniCoinObject of uniCoinObjects.data) {
        if (
          uniCoinObject.data?.content &&
          uniCoinObject.data.content.dataType === "moveObject" &&
          "fields" in uniCoinObject.data.content &&
          "balance" in uniCoinObject.data.content.fields
        ) {
          const balanceStr = String(uniCoinObject.data.content.fields.balance);
          const balance = BigInt(balanceStr);
          if (balance >= BigInt(values.budget)) {
            suitableUniCoinObject = uniCoinObject.data.objectId;
            break;
          }
        }
      }
      if (!suitableUniCoinObject) {
        toast.error("Suitable UNI coin object not found");
        setIsProsessing(false);
        return;
      }
      console.log("Suitable UNI coin object ID: ", suitableUniCoinObject);

      // Split the first UNI coin object
      console.log("Splitting UNI coins...");
      const transaction = new Transaction();
      const [coin] = transaction.splitCoins(suitableUniCoinObject, [
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

      // Upload metadata to IPFS
      console.log("Uploading data to IPFS...");
      const metadata: QuizMetadata = {
        name: `${values.projectTitle} Quiz`,
        description: `Pass the quiz about ${values.projectTitle} and get ${
          values.passReward / 1_000_000
        } UNI coins if all answers are correct`,
        created: Date.now(),
        projectTitle: values.projectTitle,
        projectLinks: values.projectLinks.split("\n"),
        projectCoin: values.projectCoin,
        minProjectCoins: values.minProjectCoins,
        passReward: values.passReward,
        holdReward: values.holdReward,
        budget: values.budget,
      };
      const { data } = await axios.post("/api/ipfs", {
        data: JSON.stringify(metadata),
      });
      const metadataUrl = data.data;
      console.log("Metadata URL: ", metadataUrl);

      // Mint quiz
      console.log("Minting quiz...");
      const transaction = new Transaction();
      transaction.moveCall({
        target: chainConfig.quizMintFunctionTarget,
        arguments: [
          transaction.pure.string(metadata.name),
          transaction.pure.string(metadata.description),
          transaction.pure.string(metadataUrl),
          transaction.object(uniCoinsObjectId),
          transaction.pure.u64(values.passReward),
          transaction.object(chainConfig.quizTrackedObject),
        ],
        typeArguments: [chainConfig.uniCoinType],
      });
      transaction.setGasBudget(10_000_000);
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
                    placeholder={demoConfig.projectTitle}
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
                    placeholder={demoConfig.projectLinks}
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
