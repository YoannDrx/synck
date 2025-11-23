"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  DatabaseIcon,
  ImageIcon,
  MusicIcon,
  UsersIcon,
  FolderIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileJsonIcon,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import type { ExportType, ExportFormat, ExportStatus } from "@prisma/client";

type ExportHistoryItem = {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: ExportStatus;
  entityCount: number | null;
  fileSize: number | null;
  errorMessage: string | null;
  downloadUrl: string | null;
  createdAt: string;
  completedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function ExportHistoryPage() {
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth("/api/admin/exports/history");

        if (!res.ok) {
          throw new Error("Failed to fetch export history");
        }

        const data = (await res.json()) as ExportHistoryItem[];
        setHistory(data);
      } catch (error) {
        console.error("Error fetching export history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  const getTypeIcon = (type: ExportType) => {
    switch (type) {
      case "ASSETS":
        return ImageIcon;
      case "WORKS":
        return MusicIcon;
      case "COMPOSERS":
        return UsersIcon;
      case "CATEGORIES":
        return FolderIcon;
      case "LABELS":
        return TagIcon;
      case "ALL":
        return DatabaseIcon;
      default:
        return FileJsonIcon;
    }
  };

  const getTypeLabel = (type: ExportType) => {
    switch (type) {
      case "ASSETS":
        return "Assets";
      case "WORKS":
        return "Projets";
      case "COMPOSERS":
        return "Compositeurs";
      case "CATEGORIES":
        return "Catégories";
      case "LABELS":
        return "Labels";
      case "ALL":
        return "Toutes les données";
      default:
        return type;
    }
  };

  const getStatusColor = (status: ExportStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "PENDING":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  const getStatusIcon = (status: ExportStatus) => {
    switch (status) {
      case "COMPLETED":
        return CheckCircleIcon;
      case "FAILED":
        return XCircleIcon;
      case "PENDING":
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusLabel = (status: ExportStatus) => {
    switch (status) {
      case "COMPLETED":
        return "Réussi";
      case "FAILED":
        return "Échoué";
      case "PENDING":
        return "En cours";
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${String(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getDuration = (createdAt: string, completedAt: string | null) => {
    if (!completedAt) return "N/A";
    const start = new Date(createdAt).getTime();
    const end = new Date(completedAt).getTime();
    const duration = (end - start) / 1000; // en secondes
    if (duration < 1) return "< 1s";
    if (duration < 60) return `${duration.toFixed(1)}s`;
    return `${(duration / 60).toFixed(1)}min`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-white/50">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Historique des exports
        </h1>
        <p className="mt-2 text-white/50">
          Historique de tous les exports de données effectués
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Total exports</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {history.length}
                </p>
              </div>
              <DownloadIcon className="h-8 w-8 text-lime-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Réussis</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {history.filter((h) => h.status === "COMPLETED").length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Échoués</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {history.filter((h) => h.status === "FAILED").length}
                </p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Données exportées</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {history
                    .reduce((sum, h) => sum + (h.entityCount ?? 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <DatabaseIcon className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export History List */}
      {history.length === 0 ? (
        <Card className="border-white/10 bg-black">
          <CardContent className="p-12 text-center">
            <DownloadIcon className="mx-auto h-12 w-12 text-white/20" />
            <p className="mt-4 text-white/50">
              Aucun export effectué pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            const StatusIcon = getStatusIcon(item.status);

            return (
              <Card
                key={item.id}
                className="border-white/10 bg-black hover:border-lime-300/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <TypeIcon className="h-5 w-5 text-lime-300" />
                      <div>
                        <CardTitle className="text-white">
                          {getTypeLabel(item.type)}
                        </CardTitle>
                        <p className="mt-1 text-sm text-white/50">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(item.status)}
                    >
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {getStatusLabel(item.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-white/50">Format</p>
                      <p className="mt-1 font-medium text-white">
                        {item.format}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Entités</p>
                      <p className="mt-1 font-medium text-white">
                        {item.entityCount?.toLocaleString() ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Taille</p>
                      <p className="mt-1 font-medium text-white">
                        {formatFileSize(item.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Durée</p>
                      <p className="mt-1 font-medium text-white">
                        {getDuration(item.createdAt, item.completedAt)}
                      </p>
                    </div>
                  </div>

                  {item.user && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-xs text-white/50">
                        Exporté par:{" "}
                        <span className="font-medium text-white">
                          {item.user.name ?? item.user.email}
                        </span>
                      </p>
                    </div>
                  )}

                  {item.errorMessage && (
                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                      <p className="text-xs font-medium text-red-400">
                        Erreur:
                      </p>
                      <p className="mt-1 text-sm text-red-300">
                        {item.errorMessage}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
