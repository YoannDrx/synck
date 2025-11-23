"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, PlusIcon, Trash2Icon, XIcon, TagIcon } from "lucide-react";
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

type Label = {
  id: string;
  nameFr: string;
  nameEn: string;
  website: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    works: number;
  };
};

export default function LabelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>("fr");
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Sorting state
  const [sortBy, setSortBy] = useState<string>("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Delete dialog state
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch locale from params
  useEffect(() => {
    void params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  // Fetch labels
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth("/api/admin/labels");

        if (!res.ok) {
          throw new Error("Failed to fetch labels");
        }

        const raw = await res.json();
        const mapped: Label[] = (raw as any[]).map((label) => ({
          id: label.id,
          nameFr:
            label.translations?.find((t: any) => t.locale === "fr")?.name ?? "",
          nameEn:
            label.translations?.find((t: any) => t.locale === "en")?.name ?? "",
          website: label.website ?? null,
          order: label.order ?? 0,
          isActive: Boolean(label.isActive),
          createdAt: label.createdAt,
          _count: label._count ?? { works: 0 },
        }));
        setLabels(mapped);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching labels:", error);
        toast.error("Erreur lors du chargement des labels");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLabels();
  }, []);

  // Filter labels
  const filteredLabels = labels.filter((label) => {
    // Search filter
    const name = (locale === "fr" ? label.nameFr : label.nameEn) || "";
    const matchesSearch = name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && label.isActive) ||
      (selectedStatus === "inactive" && !label.isActive);

    return matchesSearch && matchesStatus;
  });

  // Sort labels
  const sortedLabels = [...filteredLabels].sort((a, b) => {
    let aValue: string | number = "";
    let bValue: string | number = "";

    if (sortBy === "name") {
      aValue = locale === "fr" ? a.nameFr : a.nameEn;
      bValue = locale === "fr" ? b.nameFr : b.nameEn;
    } else if (sortBy === "status") {
      aValue = a.isActive ? 1 : 0;
      bValue = b.isActive ? 1 : 0;
    } else if (sortBy === "works") {
      aValue = a._count?.works ?? 0;
      bValue = b._count?.works ?? 0;
    } else if (sortBy === "order") {
      aValue = a.order;
      bValue = b.order;
    } else if (sortBy === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate labels
  const totalPages = Math.ceil(sortedLabels.length / itemsPerPage);
  const paginatedLabels = sortedLabels.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

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
    if (!labelToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetchWithAuth(`/api/admin/labels/${labelToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete label");
      }

      setLabels(labels.filter((l) => l.id !== labelToDelete.id));
      toast.success("Label supprimé avec succès");
      setLabelToDelete(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting label:", error);
      toast.error("Erreur lors de la suppression du label");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setCurrentPage(0);
  };

  const hasActiveFilters = searchQuery || selectedStatus !== "all";

  // Define columns
  const columns: Column<Label>[] = [
    {
      key: "name",
      label: "Nom",
      sortable: true,
      render: (label) => (
        <Link
          href={`/${locale}/admin/labels/${label.id}`}
          className="font-medium text-lime-300 hover:underline"
        >
          {locale === "fr" ? label.nameFr : label.nameEn}
        </Link>
      ),
    },
    {
      key: "website",
      label: "Site web",
      render: (label) =>
        label.website ? (
          <a
            href={label.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline"
          >
            {new URL(label.website).hostname}
          </a>
        ) : (
          <span className="text-white/30">-</span>
        ),
    },
    {
      key: "works",
      label: "Projets",
      sortable: true,
      render: (label) => (
        <Badge variant="outline" className="border-white/20 text-white/70">
          {label._count?.works ?? 0}
        </Badge>
      ),
    },
    {
      key: "order",
      label: "Ordre",
      sortable: true,
      render: (label) => (
        <span className="text-sm text-white/70">{label.order}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (label) => (
        <Badge
          variant={label.isActive ? "default" : "outline"}
          className={
            label.isActive
              ? "bg-lime-300 text-black"
              : "border-white/30 text-white/50"
          }
        >
          {label.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Date de création",
      sortable: true,
      render: (label) => (
        <span className="text-sm text-white/50">
          {new Date(label.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (label) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/${locale}/admin/labels/${label.id}`);
            }}
            className="h-8 w-8 p-0 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLabelToDelete(label);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Labels</h1>
          <p className="mt-2 text-white/50">
            Gérer les labels de production ({filteredLabels.length}{" "}
            {filteredLabels.length > 1 ? "labels" : "label"})
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton entity="labels" />
          <Link href={`/${locale}/admin/labels/nouveau`}>
            <Button className="gap-2 bg-lime-300 text-black hover:bg-lime-400">
              <PlusIcon className="h-4 w-4" />
              Nouveau label
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <TagIcon className="h-5 w-5 text-white/50" />
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
        data={paginatedLabels}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? "Aucun label ne correspond aux filtres sélectionnés"
            : "Aucun label pour le moment"
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(labelToDelete)}
        onOpenChange={(open) => {
          if (!open) setLabelToDelete(null);
        }}
      >
        <AlertDialogContent className="border-lime-300/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer le label "
              {labelToDelete
                ? locale === "fr"
                  ? labelToDelete.nameFr
                  : labelToDelete.nameEn
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
