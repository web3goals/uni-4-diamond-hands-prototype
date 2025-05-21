import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { errorToString } from "@/lib/converters";
import { generateLlmProjectQuizQuestions } from "@/lib/llm";
import { scrapeLinks } from "@/lib/scrapper";
import { NextRequest } from "next/server";
import { z } from "zod";

const requestBodySchema = z.object({
  projectLinks: z.array(z.string().min(1)),
});

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/quiz");

    // Get and parse request data
    const body = await request.json();
    const bodyParseResult = requestBodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse(
        {
          message: `Request body invalid: ${JSON.stringify(bodyParseResult)}`,
        },
        400
      );
    }

    // Scrape data from the provided links
    const projectData = await scrapeLinks(bodyParseResult.data.projectLinks);

    // Generate questions using LLM
    const questions = await generateLlmProjectQuizQuestions(projectData);

    // Return questions
    return createSuccessApiResponse(questions);
  } catch (error) {
    console.error(
      `Failed to process ${request.method} request for "${
        new URL(request.url).pathname
      }":`,
      errorToString(error)
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500
    );
  }
}
