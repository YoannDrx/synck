"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeftIcon, HistoryIcon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

type WorkVersion = {
  id: string;
  workId: string;
  snapshot: unknown;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export default function VersionHistoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>("fr");
  const [workId, setWorkId] = useState<string>("");
  const [versions, setVersions] = useState<WorkVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [versionToRestore, setVersionToRestore] = useState<WorkVersion | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch params
  useEffect(() => {
    void params.then((p) => {
      setLocale(p.locale);
      setWorkId(p.id);
    });
  }, [params]);

  // Fetch versions
  useEffect(() => {
    if (!workId) return;

    const fetchVersions = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth(
          `/api/admin/projects/${workId}/versions`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch versions");
        }

        const data = (await res.json()) as { versions: WorkVersion[] };
        setVersions(data.versions);
      } catch (error) {
        console.error("Error fetching versions:", error);
        toast.error("Erreur lors du chargement de l'historique");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVersions();
  }, [workId]);

  // Handle restore
  const handleRestore = async () => {
    if (!versionToRestore) return;

    try {
      setIsRestoring(true);
      const res = await fetchWithAuth(
        `/api/admin/projects/${workId}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId: versionToRestore.id }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to restore version");
      }

      toast.success("Version restaurée avec succès");
      setVersionToRestore(null);
      router.push(`/${locale}/admin/projets/${workId}`);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast.error("Erreur lors de la restauration");
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push(`/${locale}/admin/projets/${workId}`);
              }}
              className="text-white/50 hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-white">
              Historique des versions
            </h1>
          </div>
          <p className="mt-2 text-white/50">
            {versions.length} {versions.length > 1 ? "versions" : "version"}{" "}
            enregistrée{versions.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-white/50">Chargement...</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-white/10 bg-black">
          <div className="text-center">
            <HistoryIcon className="mx-auto h-12 w-12 text-white/20" />
            <p className="mt-4 text-white/50">Aucune version disponible</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => {
            const snapshot = version.snapshot as {
              slug?: string;
              status?: string;
              year?: number;
            };

            return (
              <div
                key={version.id}
                className="group relative rounded-lg border border-white/10 bg-black p-6 transition-all hover:border-lime-300/30 hover:bg-white/5"
              >
                {/* Timeline connector */}
                {index !== versions.length - 1 && (
                  <div className="absolute left-12 top-full h-4 w-0.5 bg-white/10" />
                )}

                <div className="flex items-start gap-6">
                  {/* Timeline dot */}
                  <div className="flex h-24 flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-lime-300/50 bg-black">
                      <div className="h-3 w-3 rounded-full bg-lime-300" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Version info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">
                            Version du {formatDate(version.createdAt)}
                          </h3>
                          {index === 0 && (
                            <Badge className="bg-lime-300/20 text-lime-300">
                              Actuelle
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-white/50">
                          Par {version.user.name ?? version.user.email}
                        </p>
                      </div>
                      {index !== 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setVersionToRestore(version);
                          }}
                          className="gap-2 bg-lime-300/10 text-lime-300 hover:bg-lime-300/20"
                        >
                          <RotateCcwIcon className="h-4 w-4" />
                          Restaurer
                        </Button>
                      )}
                    </div>

                    {/* Snapshot preview */}
                    <div className="rounded border border-white/10 bg-white/5 p-4">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {snapshot.slug && (
                          <div>
                            <p className="text-xs text-white/50">Slug</p>
                            <p className="font-mono text-sm text-white">
                              {snapshot.slug}
                            </p>
                          </div>
                        )}
                        {snapshot.status && (
                          <div>
                            <p className="text-xs text-white/50">Statut</p>
                            <p className="text-sm text-white">
                              {snapshot.status}
                            </p>
                          </div>
                        )}
                        {snapshot.year && (
                          <div>
                            <p className="text-xs text-white/50">Année</p>
                            <p className="text-sm text-white">
                              {snapshot.year}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={Boolean(versionToRestore)}
        onOpenChange={(open) => {
          if (!open) setVersionToRestore(null);
        }}
      >
        <AlertDialogContent className="border-lime-300/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Restaurer cette version ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Cette action remplacera l'état actuel du projet par la version
              sélectionnée. Une nouvelle version sera automatiquement créée
              avant la restauration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/20 text-white hover:bg-white/5"
              disabled={isRestoring}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleRestore();
              }}
              disabled={isRestoring}
              className="bg-lime-300 text-black hover:bg-lime-400"
            >
              {isRestoring ? "Restauration..." : "Restaurer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
