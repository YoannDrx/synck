import { NextResponse } from "next/server";
import { getArtistsFromPrisma } from "@/lib/prismaProjetsUtils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") ?? "fr";
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : null;

    const artists = await getArtistsFromPrisma(locale as "fr" | "en");

    // Si un limit est spécifié, retourner seulement les N premiers
    if (limit && limit > 0) {
      return NextResponse.json(artists.slice(0, limit));
    }

    // Sinon retourner tous les artistes
    return NextResponse.json(artists);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 },
    );
  }
}
