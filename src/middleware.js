import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  if (process.env.DISABLE_INDEXING === "true") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}
