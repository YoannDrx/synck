"use client";

import { Trash2, Archive, CheckCircle, XCircle } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type BulkAction = "delete" | "publish" | "archive" | "activate" | "deactivate";

type BulkActionsToolbarProps = {
  selectedIds: string[];
  onSuccess?: () => void;
  onClear?: () => void;
};

export function BulkActionsToolbar({
  selectedIds,
  onSuccess,
  onClear,
}: BulkActionsToolbarProps) {
  if (selectedIds.length === 0) return null;

  const handleBulkAction = async (action: BulkAction) => {
    try {
      const response = await fetch("/api/admin/projects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Bulk action failed");

      const result = (await response.json()) as {
        success: boolean;
        count: number;
        action: string;
      };

      const labels = {
        delete: "supprimés",
        publish: "publiés",
        archive: "archivés",
        activate: "activés",
        deactivate: "désactivés",
      };

      toast.success(
        `${String(result.count)} projets ${labels[action as keyof typeof labels]}`,
      );
      onSuccess?.();
      onClear?.();
    } catch {
      toast.error("Erreur lors de l'opération");
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-lime-300/30 bg-black/90 px-6 py-3 shadow-lg backdrop-blur">
      <span className="text-sm font-medium text-white">
        {selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
      </span>

      <div className="h-6 w-px bg-white/20" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          void handleBulkAction("activate");
        }}
        className="gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        Activer
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          void handleBulkAction("deactivate");
        }}
        className="gap-2"
      >
        <XCircle className="h-4 w-4" />
        Désactiver
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          void handleBulkAction("archive");
        }}
        className="gap-2"
      >
        <Archive className="h-4 w-4" />
        Archiver
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-2 text-red-400">
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer {selectedIds.length} projet
              {selectedIds.length > 1 ? "s" : ""} ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleBulkAction("delete");
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-6 w-px bg-white/20" />

      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        className="text-white/50"
      >
        Annuler
      </Button>
    </div>
  );
}
