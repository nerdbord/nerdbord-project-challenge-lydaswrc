import { defineField, defineType } from "sanity";

export default defineType({
  name: "subscriber",
  title: "Subskrybent",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
  ],
});
