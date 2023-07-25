import { NextRequest, NextResponse } from "next/server";

// TODO: change to edge runtime https://github.com/vercel/next.js/issues/49661
//export const runtime = 'edge'

const basePath = `/${process.env.NEXT_PUBLIC_LOCALE}/shop`;

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug?.join("/");
  const url = `${process.env.MEDION_API_URL}${basePath}/${slug}`;

  const res = await fetch(url, {
    headers: { Host: `${process.env.MEDION_ENV}` },
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: new Headers({
      "content-type":
        res.headers.get("content-type") || "text/html; charset=UTF-8",
    }),
  });
}
