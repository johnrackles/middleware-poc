import { NextRequest, NextResponse } from "next/server";

type StoryblokLinksResponse = {
  links: { [key: string]: { slug: string } };
};

export async function middleware(req: NextRequest) {
  try {
    // this regex only matches pages and not images, api routes our pages we know we can serve from nextjs
    const regex = new RegExp(
      /^\/((?!api|_next\/static|_next\/image|favicon\.ico|.*\.svg|hybris|next-cart|search|styleguide).*)/
    );
    // nextUrl removes the basePath from the pathname
    const { pathname } = req.nextUrl;

    // if the regex matches the pathname (meaning it is a page)
    // we only fetch from storyblok if we expect it to be present there
    if (regex.test(pathname)) {
      // we check if the slug is in the storyblok links
      const response = await fetch(
        `https://api.storyblok.com/v2/cdn/links/?token=${process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN}&version=draft`
      );
      if (response.ok) {
        const data = (await response.json()) as StoryblokLinksResponse;

        const slugs = Object.keys(data.links).map((linkKey) =>
          // links in storyblok look like en/combo-module, so we remove the locale as it isn't present in the pathname
          data.links[linkKey].slug.replace(
            `${process.env.NEXT_PUBLIC_LOCALE}/`,
            ""
          )
        );
        // if the pathname is not /, we remove the first slash at it isn't present in storyblok slugs
        if (pathname.length > 1 && !slugs.includes(pathname.replace("/", ""))) {
          // send the request to our api route with a rewrite, so it looks like /de/shop/cart for example
          return NextResponse.rewrite(
            `${
              process.env.VERCEL_ENV !== "development"
                ? `https://${process.env.MEDION_ENV}`
                : "http://localhost:3000"
            }/de/shop/hybris${pathname}`
          );
        }
        // else just do nothing
        return NextResponse.next();
      }
      // arriving here means the fetch failed
      throw new Error("Storyblok links fetch failed");
    }
  } catch (error) {
    console.error("middleware error: ", error);
    return NextResponse.next();
  }
}
