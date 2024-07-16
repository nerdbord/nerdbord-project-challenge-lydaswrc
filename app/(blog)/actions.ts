"use server";

import { draftMode } from "next/headers";
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@/openai.config";
import {
  AuthorsQueryResult,
  Post,
  UserIsSubscribedResult,
} from "@/sanity.types";
import { createPost, createSubscriber } from "@/sanity/lib/mutations";
import { sanityFetch } from "@/sanity/lib/fetch";
import { authorsQuery, userIsSubscribed } from "@/sanity/lib/queries";

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

export const uploadBlogPost = async () => {
  const createdAt = new Date().toISOString();
  const authors = await sanityFetch<AuthorsQueryResult>({
    query: authorsQuery,
  });

  const payload: Post = {
    _id: "GPTpost.",
    _createdAt: createdAt,
    _updatedAt: createdAt,
    _rev: "",
    _type: "post",
    title: "Sample Post Title",
    slug: {
      _type: "slug",
      current: "sample-post-title",
    },
    content: [
      {
        _key: "hh",
        _type: "block",
        children: [
          {
            _type: "span",
            text: "This is the content of the sample post.",
            _key: "sdf",
          },
        ],
      },
    ],
    excerpt: "This is a short excerpt of the post.",
    coverImage: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: "image-cc4dd1d3a6284bb0e2905bc667eaa67517a5a080-5121x3838-jpg", // This should be the reference to the uploaded image asset
      },
      alt: "An example cover image",
    },
    date: createdAt,
    author: {
      _type: "reference",
      _ref: authors[0]._id, // This should be the reference to the author document
    },
  };
  const result = await createPost(payload);
  console.log(result);
  return result;
};

export const subscribe = async (email: string) => {
  const isSubscribed = await sanityFetch<UserIsSubscribedResult>({
    query: userIsSubscribed,
    params: { email },
  });

  console.log(isSubscribed);

  if (isSubscribed) {
    return { success: false, message: "This email already is subscribed." };
  }
  try {
    await createSubscriber(email);
    return { success: true, message: "You are subscribed successfully!" };
  } catch (error) {
    console.error("Error while creating subscriber", error);
    return {
      success: false,
      message: "Failed to subscribe. Please try again.",
    };
  }
};
