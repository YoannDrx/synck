import { NextRequest, NextResponse } from "next/server";

import { getAllExpertises } from "@/lib/expertiseUtils";
import type { Locale } from "@/lib/i18n-config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const locale = (searchParams.get("locale") === "en" ? "en" : "fr") as Locale;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 3;

    const expertises = getAllExpertises(locale);
    return NextResponse.json(limit > 0 ? expertises.slice(0, limit) : expertises);
  } catch (error) {
    console.error("Error fetching expertises:", error);
    return NextResponse.json({ error: "Failed to fetch expertises" }, { status: 500 });
  }
}
