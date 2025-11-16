import { NextRequest, NextResponse } from "next/server";

import { getSortedPostsData } from "@/lib/blogUtils";
import type { Locale } from "@/lib/i18n-config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const locale = (searchParams.get("locale") === "en" ? "en" : "fr") as Locale;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 3;

    const posts = await getSortedPostsData(locale);
    return NextResponse.json(limit > 0 ? posts.slice(0, limit) : posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}
