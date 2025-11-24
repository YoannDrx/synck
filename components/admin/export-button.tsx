"use client";

import { useState } from "react";
import { Download, FileText, Table, FileJson, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportData, type ExportFormat } from "@/lib/export";
import { toast } from "sonner";

type ExportButtonProps = {
  entity:
    | "projects"
    | "composers"
    | "assets"
    | "categories"
    | "labels"
    | "expertises";
  filters?: Record<string, string>;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

export function ExportButton({
  entity,
  filters = {},
  label = "Exporter",
  variant = "outline",
  size = "default",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);

    try {
      // Construire l'URL avec les filtres
      const params = new URLSearchParams({
        format,
        ...filters,
      });

      // Appeler l'API d'export
      const response = await fetch(`/api/admin/export/${entity}?${params}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      const result = (await response.json()) as {
        data: Record<string, unknown>[];
        count: number;
        format: string;
      };

      if (!result.data || result.data.length === 0) {
        toast.warning("Aucune donnée à exporter");
        return;
      }

      // Générer et télécharger le fichier
      const entityLabel = {
        projects: "projets",
        composers: "compositeurs",
        assets: "medias",
        categories: "categories",
        labels: "labels",
        expertises: "expertises",
      }[entity];

      exportData(result.data, format, entityLabel);

      toast.success(
        `${String(result.count)} ${entityLabel} exporté${result.count > 1 ? "s" : ""} (${format.toUpperCase()})`,
      );
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {size !== "icon" && (isExporting ? "Export..." : label)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border-lime-300/20 bg-black"
      >
        <DropdownMenuLabel className="text-white">
          Format d'export
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={() => {
            void handleExport("csv");
          }}
          disabled={isExporting}
          className="gap-2 text-white hover:bg-lime-300/10 hover:text-lime-300"
        >
          <FileText className="h-4 w-4" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void handleExport("xlsx");
          }}
          disabled={isExporting}
          className="gap-2 text-white hover:bg-lime-300/10 hover:text-lime-300"
        >
          <Table className="h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void handleExport("json");
          }}
          disabled={isExporting}
          className="gap-2 text-white hover:bg-lime-300/10 hover:text-lime-300"
        >
          <FileJson className="h-4 w-4" />
          JSON (.json)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void handleExport("txt");
          }}
          disabled={isExporting}
          className="gap-2 text-white hover:bg-lime-300/10 hover:text-lime-300"
        >
          <File className="h-4 w-4" />
          Texte (.txt)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
