import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  compatibility: "strict", // strict mode, enable when using the OpenAI API
  baseURL: "https://training.nerdbord.io/api/v1/openai",
});
