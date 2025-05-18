import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { errorToString } from "@/lib/converters";
import { NextRequest } from "next/server";
import { PinataSDK } from "pinata";
import { z } from "zod";

const requestBodySchema = z.object({
  data: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
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

    // Upload request data to IPFS
    const pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
      pinataGateway: "https://yellow-mute-echidna-168.mypinata.cloud/ipfs/",
    });
    const upload = await pinata.upload.public.json(
      JSON.parse(bodyParseResult.data.data)
    );

    // Return IPFS URL
    return createSuccessApiResponse(`ipfs://${upload.cid}`);
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
