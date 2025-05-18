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
import useError from "@/hooks/use-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function NewQuizCreationSection(props: {
  onCreated: (quizId: string) => void;
}) {
  const { handleError } = useError();
  const [isProsessing, setIsProsessing] = useState(false);

  const formSchema = z.object({
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
      projectLinks:
        "https://naviprotocol.io/\nhttps://naviprotocol.gitbook.io/navi-protocol-docs/dao-and-token/2025-roadmap\nhttps://medium.com/@navi.protocol/navi-protocol-q1-2025-recap-cde6a2c0b374",
      projectCoin:
        "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54::uni::UNI",
      minProjectCoins: 1000000,
      passReward: 100000,
      holdReward: 1000000,
      budget: 10000000,
    },
  });

  // TODO: Implement
  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsProsessing(true);

      props.onCreated(
        "0x7e72569f6d877c7e20b7c1eb913bca098c28370941c51ff384128da2d6fd06ea"
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
