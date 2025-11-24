import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { CVDocumentCreative } from "@/components/cv/pdf-document-creative";
import React from "react";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("lang") ?? "fr";

  try {
    const cv = await prisma.cV.findFirst({
      include: {
        photoAsset: true,
        sections: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            translations: true,
            items: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: {
                translations: true,
              },
            },
          },
        },
        skills: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            translations: true,
          },
        },
        socialLinks: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!cv) {
      return new NextResponse("CV not found", { status: 404 });
    }

    const accent =
      cv.accentColor ||
      ((cv as unknown as { theme?: { primary?: string } }).theme?.primary ?? undefined);

    const transformedCV = {
      ...cv,
      accentColor: accent,
      photo: cv.photoAsset?.path ?? null,
      theme: (cv as { theme?: unknown }).theme ?? null,
      sections: cv.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          startDate: item.startDate?.toISOString() ?? null,
          endDate: item.endDate?.toISOString() ?? null,
        })),
      })),
      skills: cv.skills ?? [],
      socialLinks: cv.socialLinks ?? [],
    };

    const stream = await renderToStream(
      <CVDocumentCreative data={transformedCV} locale={locale} />,
    );

    // Convert Node stream to Web stream if necessary, but NextResponse usually handles it.
    // @react-pdf/renderer renderToStream returns a NodeJS.ReadableStream.
    // We might need to convert it to a Web ReadableStream or use `new Response(stream)`.

    // Helper to convert Node stream to Web stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        stream.on("end", () => {
          controller.close();
        });
        stream.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Caroline_Senyk_CV_${locale.toUpperCase()}.pdf"`,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
