// Third-party library imports
import Balancer from "react-wrap-balancer";

// Local component imports
import { Container, Section } from "@/components/craft";
import { Button } from "@/components/ui/button";
import * as demo from "@/sanity/lib/demo";
import PortableText from "./portable-text";
import { uploadAIBlogPost } from "./actions";

export const Intro = (props: {
  title: string | null | undefined;
  description: any;
}) => {
  const title = props.title || demo.title;
  const description = props.description?.length
    ? props.description
    : demo.description;
  return (
    <Section>
      {/* <Container className="flex flex-col"> */}
      <h1 className="!mb-0">{title || demo.title}</h1>
      <h3 className="mt-2 text-muted-foreground">
        <Balancer>
          <PortableText
            className="prose-lg"
            value={description?.length ? description : demo.description}
          />
        </Balancer>
      </h3>
      <div className="!mt-8 flex items-center gap-2">
        <form
          action={async () => {
            "use server";
            uploadAIBlogPost();
          }}
        >
          <Button
            variant={"default"}
            //   className="bg-black text-white p-4 m-4 hover:bg-slate-800"
            type="submit"
          >
            Generate random post!
          </Button>
        </form>
      </div>
      {/* </Container> */}
    </Section>
  );
};
