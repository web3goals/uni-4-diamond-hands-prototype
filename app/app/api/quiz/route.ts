import { demoConfig } from "@/config/demo";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { errorToString } from "@/lib/converters";
import axios from "axios";
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
    const projectData: string[] = [];
    for (const link of bodyParseResult.data.projectLinks) {
      const scrapeLink =
        `https://api.scraperapi.com/` +
        `?api_key=${process.env.SCRAPERAPI_API_KEY}` +
        `&url=${encodeURIComponent(link)}` +
        `&output_format=markdown`;
      const { data } = await axios.get(scrapeLink);
      projectData.push(data);
    }

    // Generate questions using LLM
    // TODO:
    const questions = demoConfig.questions;

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
