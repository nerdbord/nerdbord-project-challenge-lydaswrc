"use server";

import { draftMode } from "next/headers";
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@/openai.config";

export async function disableDraftMode() {
  "use server";
  await Promise.allSettled([
    draftMode().disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}

export async function getNotifications(input: string) {
  const { object: notifications } = await generateObject({
    model: openai("gpt-4o"),
    system: "You generate three notifications for a messages app.",
    prompt: input,
    schema: z.object({
      notifications: z.array(
        z.object({
          name: z.string().describe("Name of a fictional person."),
          message: z.string().describe("Do not use emojis or links."),
          minutesAgo: z.number(),
        })
      ),
    }),
  });

  console.log(notifications);

  return { notifications };
}
