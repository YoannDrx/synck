import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Gestion centralisée des erreurs API
 * Convertit différents types d'erreurs en réponses HTTP appropriées
 */
export function handleApiError(error: unknown): NextResponse {
  // Erreur API personnalisée
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.status },
    );
  }

  // Erreur de validation Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation error",
        code: "VALIDATION_ERROR",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  // Erreur Prisma (duplicate unique constraint, etc.)
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as {
      code: string;
      meta?: Record<string, unknown>;
    };

    if (prismaError.code === "P2002") {
      return NextResponse.json(
        {
          error: "Une entrée avec ces données existe déjà",
          code: "DUPLICATE_ENTRY",
        },
        { status: 409 },
      );
    }

    if (prismaError.code === "P2025") {
      return NextResponse.json(
        {
          error: "Ressource non trouvée",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }
  }

  // Erreur inconnue - ne pas exposer les détails en production
  // eslint-disable-next-line no-console
  console.error("Unexpected API error:", error);

  return NextResponse.json(
    {
      error: "Une erreur interne est survenue",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 },
  );
}
