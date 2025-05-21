import { QuizQuestion } from "@/types/quiz-question";
import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { promptConfig } from "@/config/prompt";

function getGoogleLlm(model: string): ChatGoogleGenerativeAI {
  return new ChatGoogleGenerativeAI({
    model: model,
    apiKey: process.env.GOOGLE_API_KEY,
    maxRetries: 2,
  });
}

async function invokeLlm<T>(params: {
  model: string;
  prompt: string;
  responseSchema: z.ZodType<T>;
}): Promise<T> {
  const llm = getGoogleLlm(params.model);
  const structuredLlm = llm.withStructuredOutput(params.responseSchema);
  const response = await structuredLlm.invoke([
    new HumanMessage(params.prompt),
  ]);
  const responseParseResult = params.responseSchema.safeParse(response);
  if (!responseParseResult.success) {
    throw new Error(
      `Failed to parse response: ${responseParseResult.error.message}`
    );
  }
  return responseParseResult.data;
}

async function getLlmPrompt(
  templateString: string,
  data: object
): Promise<string> {
  const template = PromptTemplate.fromTemplate(templateString, {
    templateFormat: "mustache",
  });
  const valueInterface = await template.invoke({
    data: JSON.stringify(data, null, 2),
  });
  return valueInterface.value;
}

export async function generateLlmProjectQuizQuestions(
  projectData: string[]
): Promise<QuizQuestion[]> {
  const prompt = await getLlmPrompt(
    promptConfig.generateProjectQuizQuestionsTemplate,
    projectData
  );
  const questions = await invokeLlm({
    model: "gemini-2.5-flash-preview-04-17",
    prompt: prompt,
    responseSchema: z.array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.string(),
      })
    ),
  });

  return questions;
}
