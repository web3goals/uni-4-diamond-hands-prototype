import { QuizMetadata } from "@/types/quiz-metadata";
import { QuizQuestion } from "@/types/quiz-question";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, CircleHelpIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";

export function QuizQuestionSections(props: {
  metadata: QuizMetadata;
  index: number;
  question: QuizQuestion;
  onAnswer: (answers: string) => void;
}) {
  const formSchema = z.object({
    answer: z
      .string()
      .refine((value) => props.question.options.includes(value), {
        message: "You need to select an answer.",
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    props.onAnswer(values.answer);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-center size-24 rounded-full bg-primary">
        <CircleHelpIcon className="size-12 text-primary-foreground" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mt-2">
        Question — {props.index + 1}
      </h1>
      <p className="text-muted-foreground mt-1">{props.metadata.description}</p>
      <Separator className="my-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{props.question.question}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {props.question.options.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="default">
            <ArrowRightIcon /> Continue
          </Button>
        </form>
      </Form>
    </main>
  );
}
