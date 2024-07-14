"use server";

import { draftMode } from "next/headers";
import { client } from "../../sanity/lib/client";

export async function disableDraftMode() {
  "use server";
  await Promise.allSettled([
    draftMode().disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}
export const subscribe = async (email: string) => {
  const isSubscribed = await client.fetch(
    `*[_type == "subscriber" && email == $email][0]`,
    { email }
  );

  if (isSubscribed) {
    return { success: false, message: "This email already is subscribed." };
  }
  try {
    await client.create({ _type: "subscriber", email });
    return { success: true, message: "You are subscribed successfully!" };
  } catch (error) {
    console.error("Error while creating subscriber", error);
    return {
      success: false,
      message: "Failed to subscribe. Please try again.",
    };
  }
};
