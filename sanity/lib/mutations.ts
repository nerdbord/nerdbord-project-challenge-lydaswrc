import { Post } from "@/sanity.types";
import { client } from "./client";

export const createPost = async (payload: Post) => {
  const result = client.create(payload);
  return result;
};
