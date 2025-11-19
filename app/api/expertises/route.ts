/* eslint-disable no-console */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { getAllExpertises } from "@/lib/prismaExpertiseUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const locale = (searchParams.get("locale") === "en" ? "en" : "fr");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 3;

    const expertises = await getAllExpertises(locale);
    return NextResponse.json(limit > 0 ? expertises.slice(0, limit) : expertises);
  } catch (error) {
    console.error("Error fetching expertises:", error);
    return NextResponse.json({ error: "Failed to fetch expertises" }, { status: 500 });
  }
}
