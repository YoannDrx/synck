"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  AlertCircleIcon,
  Trash2Icon,
  ExternalLinkIcon,
  XIcon,
  CheckSquareIcon,
  SquareIcon,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { ExportButton } from "@/components/admin/export-button";

type Asset = {
  id: string;
  path: string;
  width: number | null;
  height: number | null;
  size: number | null;
  blurDataUrl: string | null;
  createdAt: string;
  _count?: {
    workImages: number;
    workCover: number;
    categoryImages: number;
    labelImages: number;
    composerImages: number;
    expertiseImages: number;
    expertiseCover: number;
  };
};

export default function MediasPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrphansOnly, setShowOrphansOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [orphansCount, setOrphansCount] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialogs
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [assetToView, setAssetToView] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const fetchAssets = useCallback(
    async (pageToLoad = 0) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: itemsPerPage.toString(),
          sortBy,
          sortOrder,
        });

        if (searchQuery) params.set("search", searchQuery);
        if (showOrphansOnly) params.set("orphansOnly", "true");

        const res = await fetchWithAuth(
          `/api/admin/assets?${params.toString()}`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch assets");
        }

        const { data, pagination } = (await res.json()) as {
          data: Asset[];
          pagination: {
            page: number;
            total: number;
            totalPages: number;
            orphans: number;
          };
        };

        setAssets(data);
        setCurrentPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalCount(pagination.total);
        setOrphansCount(pagination.orphans);
        setSelectedIds(new Set());
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching assets:", error);
        toast.error("Erreur lors du chargement des médias");
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage, sortBy, sortOrder, searchQuery, showOrphansOnly],
  );

  useEffect(() => {
    setCurrentPage(0);
    void fetchAssets(0);
  }, [fetchAssets]);

  // Calculate total usage
  const getTotalUsage = (asset: Asset): number => {
    if (!asset._count) return 0;
    return (
      asset._count.workImages +
      asset._count.workCover +
      asset._count.categoryImages +
      asset._count.labelImages +
      asset._count.composerImages +
      asset._count.expertiseImages +
      asset._count.expertiseCover
    );
  };

  // Check if orphan
  const isOrphan = (asset: Asset): boolean => getTotalUsage(asset) === 0;

  const paginatedAssets = assets;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(0);
  };

  // Bulk selection handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedAssets.map((a) => a.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetchWithAuth(`/api/admin/assets/${assetToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete asset");
      }

      setSelectedIds(new Set());
      await fetchAssets(currentPage);
      toast.success("Média supprimé avec succès");
      setAssetToDelete(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting asset:", error);
      toast.error("Erreur lors de la suppression du média");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      setIsBulkDeleting(true);
      const res = await fetchWithAuth("/api/admin/assets/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        throw new Error("Failed to bulk delete assets");
      }

      await fetchAssets(currentPage);
      toast.success(
        `${String(selectedIds.size)} média(s) supprimé(s) avec succès`,
      );
      clearSelection();
      setShowBulkDeleteDialog(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error bulk deleting assets:", error);
      toast.error("Erreur lors de la suppression en masse");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const columns: Column<Asset>[] = [
    {
      key: "select",
      label: "",
      render: (asset) => (
        <button
          onClick={() => {
            toggleSelection(asset.id);
          }}
          className="flex items-center justify-center text-white/70 hover:text-white"
        >
          {selectedIds.has(asset.id) ? (
            <CheckSquareIcon className="h-5 w-5 text-lime-300" />
          ) : (
            <SquareIcon className="h-5 w-5" />
          )}
        </button>
      ),
    },
    {
      key: "preview",
      label: "Aperçu",
      render: (asset) => (
        <button
          onClick={() => {
            setAssetToView(asset);
          }}
          className="group relative h-16 w-24 overflow-hidden rounded border border-white/20 hover:border-lime-300"
        >
          <Image
            src={asset.path}
            alt="Preview"
            fill
            className="object-cover transition-transform group-hover:scale-110"
            placeholder={asset.blurDataUrl ? "blur" : "empty"}
            blurDataURL={asset.blurDataUrl ?? undefined}
          />
        </button>
      ),
    },
    {
      key: "name",
      label: "Nom",
      render: (asset) => (
        <div className="max-w-xs">
          <p className="truncate text-sm font-medium text-white">
            {asset.path.split("/").pop()}
          </p>
          <p className="truncate text-xs text-white/50">{asset.path}</p>
        </div>
      ),
    },
    {
      key: "dimensions",
      label: "Dimensions",
      render: (asset) => (
        <span className="text-sm text-white/70">
          {asset.width && asset.height
            ? `${String(asset.width)}×${String(asset.height)}`
            : "N/A"}
        </span>
      ),
    },
    {
      key: "size",
      label: "Taille",
      sortable: true,
      render: (asset) => (
        <span className="text-sm text-white/70">
          {formatFileSize(asset.size)}
        </span>
      ),
    },
    {
      key: "usage",
      label: "Utilisations",
      sortable: false,
      render: (asset) => {
        const usage = getTotalUsage(asset);
        return (
          <div className="flex items-center gap-2">
            {usage === 0 ? (
              <Badge
                variant="outline"
                className="border-orange-400/30 text-orange-400"
              >
                <AlertCircleIcon className="mr-1 h-3 w-3" />
                Orphelin
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-white/20 text-white/70"
              >
                {usage}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (asset) => (
        <span className="text-sm text-white/50">
          {new Date(asset.createdAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (asset) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.open(asset.path, "_blank");
            }}
            className="h-8 w-8 p-0 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAssetToDelete(asset);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Médias</h1>
          <p className="mt-2 text-white/50">
            Gérer les fichiers et images ({totalCount} médias)
          </p>
        </div>
        <ExportButton
          entity="assets"
          filters={{
            ...(showOrphansOnly && { orphansOnly: "true" }),
          }}
        />
      </div>

      {/* Orphans Warning */}
      {orphansCount > 0 && (
        <div className="rounded-lg border border-orange-400/20 bg-orange-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="h-5 w-5 text-orange-400" />
            <div className="flex-1">
              <p className="font-medium text-orange-300">
                {orphansCount} média{orphansCount > 1 ? "s" : ""} orphelin
                {orphansCount > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-sm text-orange-400/70">
                Ces fichiers ne sont utilisés par aucun contenu et peuvent être
                supprimés
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowOrphansOnly(!showOrphansOnly);
              }}
              className={
                showOrphansOnly
                  ? "border-orange-400 bg-orange-400/20 text-orange-400"
                  : "border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
              }
            >
              {showOrphansOnly ? "Tout afficher" : "Voir uniquement"}
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="rounded-lg border border-lime-300/20 bg-lime-300/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
              >
                {selectedIds.size === paginatedAssets.length &&
                paginatedAssets.length > 0 ? (
                  <CheckSquareIcon className="h-5 w-5 text-lime-300" />
                ) : (
                  <SquareIcon className="h-5 w-5" />
                )}
                <span>Tout sélectionner ({paginatedAssets.length})</span>
              </button>
              <div className="h-4 w-px bg-white/20" />
              <p className="text-sm font-medium text-white">
                {String(selectedIds.size)} média
                {selectedIds.size > 1 ? "s" : ""} sélectionné
                {selectedIds.size > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                <XIcon className="h-4 w-4" />
                Annuler
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowBulkDeleteDialog(true);
                }}
                className="gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2Icon className="h-4 w-4" />
                Supprimer ({String(selectedIds.size)})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-white/50" />
          <h2 className="text-sm font-semibold uppercase text-white/70">
            Recherche
          </h2>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
              }}
              className="h-7 gap-1 text-xs text-white/50 hover:text-white"
            >
              <XIcon className="h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par nom de fichier..."
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedAssets}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: (page) => {
            setCurrentPage(page);
            void fetchAssets(page);
          },
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          showOrphansOnly
            ? "Aucun média orphelin"
            : searchQuery
              ? "Aucun média ne correspond à votre recherche"
              : "Aucun média pour le moment"
        }
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={Boolean(assetToDelete)}
        onOpenChange={(open) => {
          if (!open) setAssetToDelete(null);
        }}
      >
        <AlertDialogContent className="border-lime-300/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {assetToDelete && getTotalUsage(assetToDelete) > 0 ? (
                <span className="text-orange-400">
                  ⚠️ Ce média est utilisé par {getTotalUsage(assetToDelete)}{" "}
                  élément(s). Le supprimer peut casser l'affichage du site.
                </span>
              ) : (
                "Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible."
              )}
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

      {/* View Dialog */}
      <Dialog
        open={Boolean(assetToView)}
        onOpenChange={(open) => {
          if (!open) setAssetToView(null);
        }}
      >
        <DialogContent className="max-w-4xl border-lime-300/20 bg-black">
          <DialogHeader>
            <DialogTitle className="text-white">Aperçu du média</DialogTitle>
          </DialogHeader>
          {assetToView && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/20">
                <Image
                  src={assetToView.path}
                  alt="Preview"
                  fill
                  className="object-contain"
                  placeholder={assetToView.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={assetToView.blurDataUrl ?? undefined}
                />
              </div>
              <div className="grid gap-4 text-sm">
                <div>
                  <span className="text-white/50">Chemin:</span>
                  <p className="font-mono text-white">{assetToView.path}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-white/50">Dimensions:</span>
                    <p className="text-white">
                      {assetToView.width && assetToView.height
                        ? `${String(assetToView.width)} × ${String(assetToView.height)}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/50">Taille:</span>
                    <p className="text-white">
                      {formatFileSize(assetToView.size)}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-white/50">Utilisations:</span>
                  <div className="mt-2 space-y-1">
                    {assetToView._count && (
                      <>
                        {assetToView._count.workCover > 0 && (
                          <p className="text-white">
                            • Couvertures de projets:{" "}
                            {assetToView._count.workCover}
                          </p>
                        )}
                        {assetToView._count.workImages > 0 && (
                          <p className="text-white">
                            • Images de projets: {assetToView._count.workImages}
                          </p>
                        )}
                        {assetToView._count.composerImages > 0 && (
                          <p className="text-white">
                            • Images de compositeurs:{" "}
                            {assetToView._count.composerImages}
                          </p>
                        )}
                        {getTotalUsage(assetToView) === 0 && (
                          <p className="text-orange-400">
                            • Aucune utilisation (orphelin)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent className="border-lime-300/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la suppression en masse
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer {String(selectedIds.size)}{" "}
              média
              {selectedIds.size > 1 ? "s" : ""} ? Cette action est irréversible.
              {Array.from(selectedIds).some((id) => {
                const asset = assets.find((a) => a.id === id);
                return asset && getTotalUsage(asset) > 0;
              }) && (
                <span className="mt-2 block text-orange-400">
                  ⚠️ Certains médias sont utilisés et leur suppression peut
                  casser l'affichage du site.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/20 text-white hover:bg-white/5"
              disabled={isBulkDeleting}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleBulkDelete();
              }}
              disabled={isBulkDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isBulkDeleting ? "Suppression..." : "Supprimer tout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
