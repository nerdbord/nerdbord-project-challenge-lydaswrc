import Link from "next/link";
import { Suspense } from "react";

import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateComponent from "./date";
import MoreStories from "./more-stories";
import Onboarding from "./onboarding";
import PortableText from "./portable-text";

import { type HeroQueryResult, type SettingsQueryResult } from "@/sanity.types";
import * as demo from "@/sanity/lib/demo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { heroQuery, settingsQuery } from "@/sanity/lib/queries";
import { getNotifications, uploadBlogPost } from "./actions";

import { Intro } from "./Intro";
import { Container, Section, Article } from "@/components/craft";

// function Intro(props: { title: string | null | undefined; description: any }) {
//   const title = props.title || demo.title;
//   const description = props.description?.length
//     ? props.description
//     : demo.description;
//   return (
//     <section className="mt-16 mb-16 flex flex-col items-center lg:mb-12 lg:flex-row lg:justify-between">
//       <h1 className="text-balance text-6xl font-bold leading-tight tracking-tighter lg:pr-8 lg:text-8xl">
//         {title || demo.title}
//       </h1>
//       <h2 className="text-pretty mt-5 text-center text-lg lg:pl-8 lg:text-left">
//         <PortableText
//           className="prose-lg"
//           value={description?.length ? description : demo.description}
//         />
//       </h2>
//     </section>
//   );
// }

function HeroPost({
  title,
  slug,
  excerpt,
  coverImage,
  date,
  author,
}: Pick<
  Exclude<HeroQueryResult, null>,
  "title" | "coverImage" | "date" | "excerpt" | "author" | "slug"
>) {
  return (
    <Section>
      <Link className="group mb-8 block md:mb-16" href={`/posts/${slug}`}>
        <CoverImage image={coverImage} priority />
      </Link>
      <div className="md:grid md:gap-x-16 lg:gap-x-8">
        <div>
          <h3 className="text-pretty mb-4 text-4xl leading-tight lg:text-6xl">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 text-lg md:mb-0">
            <DateComponent dateString={date} />
          </div>
        </div>
        <div>
          {excerpt && (
            <p className="text-pretty mb-4 text-lg leading-relaxed">
              {excerpt}
            </p>
          )}
          {author && <Avatar name={author.name} picture={author.picture} />}
        </div>
      </div>
    </Section>
  );
}

export default async function Page() {
  const [settings, heroPost] = await Promise.all([
    sanityFetch<SettingsQueryResult>({
      query: settingsQuery,
    }),
    sanityFetch<HeroQueryResult>({ query: heroQuery }),
  ]);

  return (
    <Container>
      <div className="container px-5">
        <Intro title={settings?.title} description={settings?.description} />
        {/* <Intro title={settings?.title} description={settings?.description} /> */}
        {/* <form
        action={async () => {
          "use server";
          getNotifications(
            "You generate three notifications for a messages app."
          );
        }}
      >
        <button
          className="bg-black text-white p-4 m-4 hover:bg-slate-800"
          type="submit"
        >
          get notifications
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          uploadBlogPost();
        }}
      >
        <button
          className="bg-black text-white p-4 m-4 hover:bg-slate-800"
          type="submit"
        >
          add post
        </button>
      </form> */}

        {heroPost ? (
          <HeroPost
            title={heroPost.title}
            slug={heroPost.slug}
            coverImage={heroPost.coverImage}
            excerpt={heroPost.excerpt}
            date={heroPost.date}
            author={heroPost.author}
          />
        ) : (
          <Onboarding />
        )}
        {heroPost?._id && (
          <Article>
            <h2 className="not-prose mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
              More Stories
            </h2>
            <Suspense>
              <MoreStories skip={heroPost._id} limit={10} />
            </Suspense>
          </Article>
        )}
      </div>
    </Container>
  );
}
