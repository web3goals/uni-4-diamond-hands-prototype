import { AxiosError } from "axios";

export function errorToString(error: unknown): string {
  let message = JSON.stringify(error, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
  if (error instanceof Error) {
    message = error.message;
  }
  if (error instanceof AxiosError) {
    message = JSON.stringify({
      status: error.response?.status,
      data: error.response?.data,
    });
  }
  return message;
}

export function bytesToHexString(bytes: number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function stringToSubstrings(input: string, length: number): string[] {
  const result: string[] = [];
  let remaining = input;

  // Continue until the remaining string is empty
  while (remaining.length > 0) {
    if (remaining.length <= length) {
      // If the remaining string is less than or equal to the chunk size,
      // add it as the final (leftmost) chunk
      result.unshift(remaining);
      break;
    } else {
      // Take the last length characters and add them to the result
      const chunk = remaining.slice(remaining.length - length);
      result.unshift(chunk);
      // Update remaining string to exclude the chunk we just processed
      remaining = remaining.slice(0, remaining.length - length);
    }
  }

  return result;
}
