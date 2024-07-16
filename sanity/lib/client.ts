import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, studioUrl } from "@/sanity/lib/api";
import { token } from "./token";

export const client = createClient({
  token: token,
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    studioUrl,
    logger: console,
    filter: (props) => {
      if (props.sourcePath.at(-1) === "title") {
        return true;
      }

      return props.filterDefault(props);
    },
  },
});
