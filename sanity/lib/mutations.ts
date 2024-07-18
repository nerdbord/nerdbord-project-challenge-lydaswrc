import { client } from "./client";

export const createPost = async (payload: any) => {
  const result = client.create(payload);
  return result;
};

export const createSubscriber = async (email: string) => {
  const result = client.create({ _type: "subscriber", email });
  return result;
};
