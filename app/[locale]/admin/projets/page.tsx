"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  FilterIcon,
  XIcon,
} from "lucide-react";
import {
  DataTable,
  type Column,
} from "@/components/admin/data-table/data-table";
import { SearchBar } from "@/components/admin/data-table/search-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type Work = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  coverImageUrl: string | null;
  coverImageBlur: string | null;
  category: {
    id: string;
    nameFr: string;
    nameEn: string;
    color: string;
  } | null;
  label: { id: string; nameFr: string; nameEn: string } | null;
};

type Category = {
  id: string;
  nameFr: string;
  nameEn: string;
};

type Label = {
  id: string;
  nameFr: string;
  nameEn: string;
};

export default function ProjetsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>("fr");
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLabel, setSelectedLabel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Sorting state
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Infinite scroll state
  const INITIAL_BATCH = 20;
  const BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Delete dialog state
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch locale from params
  useEffect(() => {
    void params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [worksRes, categoriesRes, labelsRes] = await Promise.all([
          fetchWithAuth("/api/admin/projects"),
          fetchWithAuth("/api/admin/categories"),
          fetchWithAuth("/api/admin/labels"),
        ]);

        if (!worksRes.ok || !categoriesRes.ok || !labelsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [worksRaw, categoriesRaw, labelsRaw] = await Promise.all([
          worksRes.json(),
          categoriesRes.json(),
          labelsRes.json(),
        ]);

        // Normalize works from admin API shape
        const worksData: Work[] = (worksRaw as any[]).map((work) => ({
          id: work.id,
          slug: work.slug,
          titleFr:
            work.translations?.find((t: any) => t.locale === "fr")?.title ?? "",
          titleEn:
            work.translations?.find((t: any) => t.locale === "en")?.title ?? "",
          status:
            ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(
              (work.status ?? "").toUpperCase(),
            )
              ? (work.status as Work["status"])
              : work.isActive
                ? "PUBLISHED"
                : "DRAFT",
          createdAt: work.createdAt,
          updatedAt: work.updatedAt,
          coverImageUrl: work.coverImage?.path ?? null,
          coverImageBlur: work.coverImage?.blurDataUrl ?? null,
          category: work.category
            ? {
                id: work.category.id,
                nameFr:
                  work.category.translations?.find(
                    (t: any) => t.locale === "fr",
                  )?.name ?? "",
                nameEn:
                  work.category.translations?.find(
                    (t: any) => t.locale === "en",
                  )?.name ?? "",
                color: work.category.color ?? "#ffffff",
              }
            : null,
          label: work.label
            ? {
                id: work.label.id,
                nameFr:
                  work.label.translations?.find(
                    (t: any) => t.locale === "fr",
                  )?.name ?? "",
                nameEn:
                  work.label.translations?.find(
                    (t: any) => t.locale === "en",
                  )?.name ?? "",
              }
            : null,
        }));

        const categoriesData: Category[] = (categoriesRaw as any[]).map(
          (category) => ({
            id: category.id,
            nameFr:
              category.translations?.find((t: any) => t.locale === "fr")
                ?.name ?? "",
            nameEn:
              category.translations?.find((t: any) => t.locale === "en")
                ?.name ?? "",
            color: category.color ?? "#ffffff",
          }),
        );

        const labelsData: Label[] = (labelsRaw as any[]).map((label) => ({
          id: label.id,
          nameFr:
            label.translations?.find((t: any) => t.locale === "fr")?.name ?? "",
          nameEn:
            label.translations?.find((t: any) => t.locale === "en")?.name ?? "",
        }));

        setWorks(worksData);
        setCategories(categoriesData);
        setLabels(labelsData);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  // Filter and sort works
  const filteredWorks = works.filter((work) => {
    // Search filter
    const title = locale === "fr" ? work.titleFr : work.titleEn;
    const matchesSearch = title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === "all" || work.category?.id === selectedCategory;

    // Label filter
    const matchesLabel =
      selectedLabel === "all" || work.label?.id === selectedLabel;

    // Status filter
    const matchesStatus =
      selectedStatus === "all" || work.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesLabel && matchesStatus;
  });

  // Sort works
  const sortedWorks = [...filteredWorks].sort((a, b) => {
    let aValue: string | number = "";
    let bValue: string | number = "";

    if (sortBy === "title") {
      aValue = locale === "fr" ? a.titleFr : a.titleEn;
      bValue = locale === "fr" ? b.titleFr : b.titleEn;
    } else if (sortBy === "category") {
      aValue = a.category
        ? locale === "fr"
          ? a.category.nameFr
          : a.category.nameEn
        : "";
      bValue = b.category
        ? locale === "fr"
          ? b.category.nameFr
          : b.category.nameEn
        : "";
    } else if (sortBy === "status") {
      aValue = a.status;
      bValue = b.status;
    } else if (sortBy === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate works
  const visibleWorks = sortedWorks.slice(0, visibleCount);

  // Reset visible count on filters/sort change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [
    searchQuery,
    selectedCategory,
    selectedLabel,
    selectedStatus,
    sortBy,
    sortOrder,
    works.length,
  ]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          visibleCount < sortedWorks.length &&
          !isLoading
        ) {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_SIZE, sortedWorks.length),
          );
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreRef.current);
    return () => {
      observer.disconnect();
    };
  }, [visibleCount, sortedWorks.length, isLoading]);

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
    if (!workToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetchWithAuth(
        `/api/admin/projects/${workToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete work");
      }

      setWorks(works.filter((w) => w.id !== workToDelete.id));
      toast.success("Projet supprimé avec succès");
      setWorkToDelete(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting work:", error);
      toast.error("Erreur lors de la suppression du projet");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLabel("all");
    setSelectedStatus("all");
    setVisibleCount(INITIAL_BATCH);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedLabel !== "all" ||
    selectedStatus !== "all";

  // Define columns
  const columns: Column<Work>[] = [
    {
      key: "cover",
      label: "Visuel",
      render: (work) =>
        work.coverImageUrl ? (
          <div className="relative h-14 w-24 overflow-hidden rounded bg-white/5">
            <Image
              src={work.coverImageUrl}
              alt={work.titleFr || work.titleEn}
              fill
              sizes="96px"
              className="object-cover"
              placeholder={work.coverImageBlur ? "blur" : "empty"}
              blurDataURL={work.coverImageBlur ?? undefined}
            />
          </div>
        ) : (
          <div className="flex h-14 w-24 items-center justify-center rounded border border-dashed border-white/10 text-xs text-white/40">
            Aucun
          </div>
        ),
    },
    {
      key: "title",
      label: "Titre",
      sortable: true,
      render: (work) => (
        <Link
          href={`/${locale}/admin/projets/${work.id}`}
          className="font-medium text-lime-300 hover:underline"
        >
          {locale === "fr" ? work.titleFr : work.titleEn}
        </Link>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      sortable: true,
      render: (work) =>
        work.category ? (
          <Badge
            variant="outline"
            className="border-white/20"
            style={{ borderColor: work.category.color }}
          >
            {locale === "fr" ? work.category.nameFr : work.category.nameEn}
          </Badge>
        ) : (
          <span className="text-white/30">-</span>
        ),
    },
    {
      key: "label",
      label: "Label",
      render: (work) =>
        work.label ? (
          <span className="text-white/70">
            {locale === "fr" ? work.label.nameFr : work.label.nameEn}
          </span>
        ) : (
          <span className="text-white/30">-</span>
        ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (work) => (
        <Badge
          variant={
            work.status === "PUBLISHED"
              ? "default"
              : work.status === "DRAFT"
                ? "outline"
                : "secondary"
          }
          className={
            work.status === "PUBLISHED"
              ? "bg-lime-300 text-black"
              : work.status === "DRAFT"
                ? "border-white/30 text-white/50"
                : "border-white/20 bg-white/10 text-white/70"
          }
        >
          {work.status === "PUBLISHED"
            ? "Publié"
            : work.status === "ARCHIVED"
              ? "Archivé"
              : "Brouillon"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Date de création",
      sortable: true,
      render: (work) => (
        <span className="text-sm text-white/50">
          {new Date(work.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (work) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/${locale}/admin/projets/${work.id}`);
            }}
            className="h-8 w-8 p-0 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setWorkToDelete(work);
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
          <h1 className="text-3xl font-bold text-white">Projets</h1>
          <p className="mt-2 text-white/50">
            Gérer vos œuvres musicales ({filteredWorks.length}{" "}
            {filteredWorks.length > 1 ? "projets" : "projet"})
          </p>
        </div>
        <Link href={`/${locale}/admin/projets/nouveau`} className="w-full sm:w-auto">
          <Button className="w-full justify-center gap-2 bg-lime-300 text-black hover:bg-lime-400 sm:w-auto">
            <PlusIcon className="h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FilterIcon className="h-5 w-5 text-white/50" />
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par titre..."
            />
          </div>

          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border-white/20 bg-black text-white">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {locale === "fr" ? category.nameFr : category.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Label filter */}
          <Select value={selectedLabel} onValueChange={setSelectedLabel}>
            <SelectTrigger className="border-white/20 bg-black text-white">
              <SelectValue placeholder="Tous les labels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les labels</SelectItem>
              {labels.map((label) => (
                <SelectItem key={label.id} value={label.id}>
                  {locale === "fr" ? label.nameFr : label.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            variant={selectedStatus === "PUBLISHED" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedStatus("PUBLISHED");
            }}
            className={
              selectedStatus === "PUBLISHED"
                ? "bg-lime-300 text-black hover:bg-lime-400"
                : "border-white/20 text-white hover:bg-white/5"
            }
          >
            Publiés
          </Button>
          <Button
            variant={selectedStatus === "DRAFT" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedStatus("DRAFT");
            }}
            className={
              selectedStatus === "DRAFT"
                ? "bg-lime-300 text-black hover:bg-lime-400"
                : "border-white/20 text-white hover:bg-white/5"
            }
          >
            Brouillons
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={visibleWorks}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? "Aucun projet ne correspond aux filtres sélectionnés"
            : "Aucun projet pour le moment"
        }
      />

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className="h-8">
        {visibleCount < sortedWorks.length && !isLoading && (
          <p className="text-center text-xs text-white/40">
            Chargement automatique...
          </p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(workToDelete)}
        onOpenChange={(open) => {
          if (!open) setWorkToDelete(null);
        }}
      >
        <AlertDialogContent className="border-lime-300/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer le projet "
              {workToDelete
                ? locale === "fr"
                  ? workToDelete.titleFr
                  : workToDelete.titleEn
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
