"use server";

import { draftMode } from "next/headers";
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@/openai.config";
import {
  AuthorsQueryResult,
  PostTitlesQueryResult,
  UserIsSubscribedResult,
} from "@/sanity.types";
import { createPost, createSubscriber } from "@/sanity/lib/mutations";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  authorsQuery,
  postTitlesQuery,
  userIsSubscribed,
} from "@/sanity/lib/queries";

export async function disableDraftMode() {
  "use server";
  await Promise.allSettled([
    draftMode().disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}

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

export async function generateAIPost(input: string) {
  const existingPostTitles = await sanityFetch<PostTitlesQueryResult>({
    query: postTitlesQuery,
  });

  const { object } = await generateObject({
    temperature: 0.8,
    // presencePenalty: 2,
    model: openai("gpt-4o", {}),
    system: `You are an AI designed to assist in generating well-structured and detailed blog posts. 
      Your responses should be clear, engaging, and adhere to the user's specific formatting and content requirements. 
      Ensure that all generated content aligns with the provided structure and balances informativeness with entertainment to appeal to a broad audience. 
      User is going to provide you an array of existing post titles, based on them, you should response with a post different from the already provided to you
      Ensure that generated content is entirely different then already existing content.
      You absolutely can not generate post which is similar to the titles provided by user!!! Generate entirely different blog post from titles provided by user.
      List of forbidden titles: ${existingPostTitles.map((post, index) => `${index + 1}. ${post.title}`).join(", ")}
      `,
    prompt: input,
    schema: z.object({
      _type: z
        .literal("post")
        .describe("Fixed type 'post' for this child element"),
      title: z.string().describe("Title of the blog post."),
      slug: z.object({
        _type: z.literal("slug"),
        current: z
          .string()
          .describe("Create a slug for this blog post from its title."),
      }),
      content: z
        .array(
          z
            .object({
              children: z
                .array(
                  z
                    .object({
                      marks: z
                        .array(z.string())
                        .optional()
                        .describe(
                          "Array of mark types applied to the text, such as bold or italic"
                        ),
                      text: z
                        .string()
                        .optional()
                        .describe("The actual text content within the span"),
                      _type: z
                        .literal("span")
                        .describe("Fixed type 'span' for this child element"),
                      _key: z
                        .string()
                        .describe("Unique key for this span element"),
                    })
                    .describe(
                      "Span object containing text and optional formatting marks"
                    )
                )
                .optional()
                .describe("Array of span elements contained within the block"),

              style: z
                .enum([
                  "normal",
                  "h1",
                  "h2",
                  "h3",
                  "h4",
                  "h5",
                  "h6",
                  "blockquote",
                ])
                .optional()
                .describe(
                  "Text style for the block, e.g., heading or normal text"
                ),
              listItem: z
                .enum(["bullet", "number"])
                .optional()
                .describe("Type of list item if the block is part of a list"),
              markDefs: z
                .array(
                  z
                    .object({
                      href: z
                        .string()
                        .url()
                        .optional()
                        .describe("URL to which the mark (e.g., link) points"),
                      _type: z
                        .literal("link")
                        .describe("Fixed type 'link' for this mark definition"),
                      _key: z
                        .string()
                        .describe("Unique key for this mark definition"),
                    })
                    .describe("Mark definition object, such as a link")
                )
                .optional()
                .describe("Array of mark definitions used within the block"),
              level: z
                .number()
                .optional()
                .describe("Heading level, if applicable"),
              _type: z
                .literal("block")
                .describe("Fixed type 'block' for this element"),
              _key: z.string().describe("Unique key for this block element"),
            })
            .describe(
              "Block object containing text, styles, list items, and marks"
            )
        )
        .describe("Array of blocks making up the content of the post"),
      excerpt: z
        .string()
        .describe(
          "Create a short excerpt based on this post content that doesn't repeat what's already in the title. Consider the UI has limited horizontal space and try to avoid too many line breaks and make it as short, terse and brief as possible. At best a single sentence, at most two sentences."
        ),
    }),
  });

  console.log(object);

  return object;
}

export const uploadAIBlogPost = async () => {
  const createdAt = new Date().toISOString();
  const authors = await sanityFetch<AuthorsQueryResult>({
    query: authorsQuery,
  });

  const existingPostTitles = await sanityFetch<PostTitlesQueryResult>({
    query: postTitlesQuery,
  });

  const AIPost = await generateAIPost(
    `
     Generate a blog post with the following structure
    (Omit articles from this array: ${existingPostTitles.map((post, index) => `${index + 1}. ${post.title}`).join(", ")}:
        1. Title: A string representing the title of the blog post.
        2. Slug: An object containing:
          - _type: A fixed string "slug".
          - current: A string that represents the slug created from the title.
        3. Content: An array of blocks, where each block has:
          - children: An optional array of span objects, each containing:
          - marks: An optional array of mark types applied to the text, such as bold or italic.
          - text: The actual text content within the span.
          - _type: A fixed string "span".
          - _key: A unique key for this span element.
          - style: An optional text style for the block, which can be one of the following: normal, h1, h2, h3, h4, h5, h6, blockquote.
          - listItem: An optional type of list item if the block is part of a list, which can be either "bullet" or "number".
          - markDefs: An optional array of mark definitions used within the block, where each mark definition has:
          - href: An optional URL to which the mark (e.g., link) points.
          - _type: A fixed string "link".
          - _key: A unique key for this mark definition.
          - level: An optional heading level.
          - _type: A fixed string "block".
          - _key: A unique key for this block element.
        4. Excerpt: A short excerpt based on the post content that doesn't repeat what's already in the title. The excerpt should be as short, terse, and brief as possible, ideally a single sentence, at most two sentences.

    Those are current posts: ${existingPostTitles.map((post, index) => `${index + 1}. ${post.title}`).join(", ")}
    The post must be a different then currents posts, the length of the post should be of one to two A4 pages.
            The content should be structured, informative, and tailored to the subject matter implied by the title, whether it be travel, software engineering, fashion, politics, or any other theme. 
            The text will be displayed below the title and doesn't need to repeat it in the text. 
            The generated text should include the following elements: 
              1. Introduction: A brief paragraph that captures the essence of the blog post, hooks the reader with intriguing insights, and outlines the purpose of the post.
              2. Main Body:
                - For thematic consistency, divide the body into several sections with subheadings that explore different facets of the topic.
                - Include engaging and informative content such as personal anecdotes (for travel or fashion blogs), technical explanations or tutorials (for software engineering blogs), satirical or humorous observations (for shitposting), or well-argued positions (for political blogs).
                - Observations (for shitposting), or well-argued positions (for political blogs).
                - Where applicable, incorporate bullet points or numbered lists to break down complex information, steps in a process, or key highlights.
              3. Conclusion: Summarize the main points discussed in the post, offer final thoughts or calls to action, and invite readers to engage with the content through comments or social media sharing.
              4. Engagement Prompts: Conclude with questions or prompts that encourage readers to share their experiences, opinions, or questions related to the blog post's topic, but keep in mind there is no Comments field below the blog post.
            Ensure the generated content maintains a balance between being informative and entertaining, to capture the interest of a wide audience. The sample content should serve as a solid foundation that can be further customized or expanded upon by the blog author to finalize the post.
            Don\'t prefix each section with "Introduction", "Main Body", "Conclusion" or "Engagement Prompts"
              `
  );

  // todo: generate image based on AIpost.title and AiPost.excerpt,
  //       download it to server, upload to sanity,
  //       get its reference and put it in createPost instead of hardcoded one

  const result = await createPost({
    ...AIPost,
    date: createdAt,
    author: {
      _type: "reference",
      _ref: authors[0]._id,
    },
    coverImage: {
      _type: "image",
      asset: {
        _type: "reference",
        // value of ref should be reference of the generated and uploaded photo
        _ref: "image-cc4dd1d3a6284bb0e2905bc667eaa67517a5a080-5121x3838-jpg", // This should be the reference to the uploaded image asset
      },
      alt: "An example cover image",
    },
  });
  console.log(result);
  return result;
};
