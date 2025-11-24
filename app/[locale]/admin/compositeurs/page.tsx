"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import {
  DataTable,
  type Column,
} from "@/components/admin/data-table/data-table";
import { SearchBar } from "@/components/admin/data-table/search-bar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { ExportButton } from "@/components/admin/export-button";

type ComposerApi = {
  id: string;
  slug: string;
  translations: { locale: string; name?: string | null; bio?: string | null }[];
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
  image?: { path?: string | null; blurDataUrl?: string | null } | null;
  _count?: { contributions?: number };
};

const assetPathToUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("public/")) return `/${path.substring("public/".length)}`;
  if (path.startsWith("/")) return path;
  return `/${path}`;
};

type Composer = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  bioFr: string | null;
  bioEn: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
  imageBlur: string | null;
  _count?: {
    contributions: number;
  };
};

export default function ComposeursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>("fr");
  const [composers, setComposers] = useState<Composer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Sorting state
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Infinite scroll
  const INITIAL_BATCH = 20;
  const BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Delete dialog state
  const [composerToDelete, setComposerToDelete] = useState<Composer | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch locale from params
  useEffect(() => {
    void params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  // Fetch composers
  useEffect(() => {
    const fetchComposers = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth("/api/admin/composers");

        if (!res.ok) {
          throw new Error("Failed to fetch composers");
        }

        const raw = (await res.json()) as unknown;
        if (!Array.isArray(raw)) {
          throw new Error("Invalid composers payload");
        }

        const mapped: Composer[] = (raw as ComposerApi[]).map((composer) => {
          const translations = composer.translations ?? [];
          const nameFr =
            translations.find((t) => t.locale === "fr")?.name ?? "";
          const nameEn =
            translations.find((t) => t.locale === "en")?.name ?? "";
          const bioFr =
            translations.find((t) => t.locale === "fr")?.bio ?? null;
          const bioEn =
            translations.find((t) => t.locale === "en")?.bio ?? null;

          return {
            id: composer.id,
            slug: composer.slug,
            nameFr,
            nameEn,
            bioFr,
            bioEn,
            isActive: Boolean(composer.isActive),
            createdAt: composer.createdAt,
            updatedAt: composer.updatedAt,
            imageUrl: assetPathToUrl(composer.image?.path),
            imageBlur: composer.image?.blurDataUrl ?? null,
            _count: { contributions: composer._count?.contributions ?? 0 },
          };
        });
        setComposers(mapped);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching composers:", error);
        toast.error("Erreur lors du chargement des compositeurs");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchComposers();
  }, []);

  // Filter composers
  const filteredComposers = composers.filter((composer) => {
    // Search filter
    const name = (locale === "fr" ? composer.nameFr : composer.nameEn) || "";
    const matchesSearch = name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && composer.isActive) ||
      (selectedStatus === "inactive" && !composer.isActive);

    return matchesSearch && matchesStatus;
  });

  // Sort composers
  const sortedComposers = [...filteredComposers].sort((a, b) => {
    let aValue: string | number = "";
    let bValue: string | number = "";

    if (sortBy === "name") {
      aValue = locale === "fr" ? a.nameFr : a.nameEn;
      bValue = locale === "fr" ? b.nameFr : b.nameEn;
    } else if (sortBy === "status") {
      aValue = a.isActive ? 1 : 0;
      bValue = b.isActive ? 1 : 0;
    } else if (sortBy === "contributions") {
      aValue = a._count?.contributions ?? 0;
      bValue = b._count?.contributions ?? 0;
    } else if (sortBy === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const visibleComposers = sortedComposers.slice(0, visibleCount);

  // Reset visible count on filters/sort change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [searchQuery, selectedStatus, sortBy, sortOrder, composers.length]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          visibleCount < sortedComposers.length &&
          !isLoading
        ) {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_SIZE, sortedComposers.length),
          );
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(loadMoreRef.current);
    return () => {
      observer.disconnect();
    };
  }, [visibleCount, sortedComposers.length, isLoading]);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!composerToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetchWithAuth(
        `/api/admin/composers/${composerToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete composer");
      }

      setComposers(composers.filter((c) => c.id !== composerToDelete.id));
      toast.success("Compositeur supprimé avec succès");
      setComposerToDelete(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting composer:", error);
      toast.error("Erreur lors de la suppression du compositeur");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setVisibleCount(INITIAL_BATCH);
  };

  const hasActiveFilters = searchQuery || selectedStatus !== "all";

  // Truncate text helper
  const truncate = (text: string | null, maxLength = 80): string => {
    if (!text) return "-";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Define columns
  const columns: Column<Composer>[] = [
    {
      key: "photo",
      label: "Photo",
      render: (composer) =>
        composer.imageUrl ? (
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-white/5">
            {/* Using plain img to avoid remotePatterns constraints */}
            <img
              src={composer.imageUrl}
              alt={composer.nameFr || composer.nameEn}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-white/10 text-[10px] uppercase text-white/40">
            Aucun
          </div>
        ),
    },
    {
      key: "name",
      label: "Nom",
      sortable: true,
      render: (composer) => (
        <Link
          href={`/${locale}/admin/compositeurs/${composer.id}`}
          className="font-medium text-lime-300 hover:underline"
        >
          {locale === "fr" ? composer.nameFr : composer.nameEn}
        </Link>
      ),
    },
    {
      key: "bio",
      label: "Biographie",
      render: (composer) => (
        <span className="text-sm text-white/50">
          {truncate(locale === "fr" ? composer.bioFr : composer.bioEn, 100)}
        </span>
      ),
    },
    {
      key: "contributions",
      label: "Projets",
      sortable: true,
      render: (composer) => (
        <Badge variant="outline" className="border-white/20 text-white/70">
          {composer._count?.contributions ?? 0}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (composer) => (
        <Badge
          variant={composer.isActive ? "default" : "outline"}
          className={
            composer.isActive
              ? "bg-lime-300 text-black"
              : "border-white/30 text-white/50"
          }
        >
          {composer.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Date de création",
      sortable: true,
      render: (composer) => (
        <span className="text-sm text-white/50">
          {new Date(composer.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (composer) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/${locale}/admin/compositeurs/${composer.id}`);
            }}
            className="h-8 w-8 p-0 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setComposerToDelete(composer);
            }}
            className="h-8 w-8 p-0 text-red-400/50 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Compositeurs</h1>
          <p className="mt-2 text-white/50">
            Gérer vos compositeurs et artistes ({filteredComposers.length}{" "}
            {filteredComposers.length > 1 ? "compositeurs" : "compositeur"})
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <ExportButton entity="composers" />
          <Link
            href={`/${locale}/admin/compositeurs/nouveau`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full justify-center gap-2 bg-lime-300 text-black hover:bg-lime-400 sm:w-auto">
              <PlusIcon className="h-4 w-4" />
              Nouveau compositeur
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase text-white/70">
            Filtres
          </h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 gap-1 text-xs text-white/50 hover:text-white"
            >
              <XIcon className="h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom..."
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedStatus("all");
              }}
              className={
                selectedStatus === "all"
                  ? "bg-lime-300 text-black hover:bg-lime-400"
                  : "border-white/20 text-white hover:bg-white/5"
              }
            >
              Tous
            </Button>
            <Button
              variant={selectedStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedStatus("active");
              }}
              className={
                selectedStatus === "active"
                  ? "bg-lime-300 text-black hover:bg-lime-400"
                  : "border-white/20 text-white hover:bg-white/5"
              }
            >
              Actifs
            </Button>
            <Button
              variant={selectedStatus === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedStatus("inactive");
              }}
              className={
                selectedStatus === "inactive"
                  ? "bg-lime-300 text-black hover:bg-lime-400"
                  : "border-white/20 text-white hover:bg-white/5"
              }
            >
              Inactifs
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={visibleComposers}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? "Aucun compositeur ne correspond aux filtres sélectionnés"
            : "Aucun compositeur pour le moment"
        }
      />

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className="h-8">
        {visibleCount < sortedComposers.length && !isLoading && (
          <p className="text-center text-xs text-white/40">
            Chargement automatique...
          </p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(composerToDelete)}
        onOpenChange={(open) => {
          if (!open) setComposerToDelete(null);
        }}
      >
        <AlertDialogContent className="border-lime-300/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer le compositeur "
              {composerToDelete
                ? locale === "fr"
                  ? composerToDelete.nameFr
                  : composerToDelete.nameEn
                : ""}
              " ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/20 text-white hover:bg-white/5"
              disabled={isDeleting}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
