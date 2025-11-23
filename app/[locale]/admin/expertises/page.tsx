"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

type ExpertiseTranslation = {
  locale: string;
  title: string;
  subtitle: string | null;
};

type Expertise = {
  id: string;
  slug: string;
  order: number;
  isActive: boolean;
  translations: ExpertiseTranslation[];
  coverImage: { url: string } | null;
  createdAt: string;
  updatedAt: string;
};

export default function ExpertisesPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchExpertises = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/expertises");
      if (res.ok) {
        const data = (await res.json()) as Expertise[];
        setExpertises(data);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching expertises:", error);
      toast.error("Erreur lors du chargement des expertises");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchExpertises();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/admin/expertises/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Expertise supprimée");
        void fetchExpertises();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting expertise:", error);
      toast.error("Erreur lors de la suppression");
    }
    setDeleteId(null);
  };

  const getTitle = (expertise: Expertise) => {
    return (
      expertise.translations.find((t) => t.locale === locale)?.title ??
      expertise.translations[0]?.title ??
      "Sans titre"
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Expertises</h1>
        </div>
        <div className="text-center text-white/70">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Expertises</h1>
          <p className="text-white/70">
            {expertises.length} expertise{expertises.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href={`/${locale}/admin/expertises/nouveau`}>
          <Button className="gap-2 bg-lime-300 text-black hover:bg-lime-400">
            <PlusIcon className="h-4 w-4" />
            Nouvelle expertise
          </Button>
        </Link>
      </div>

      {/* Table */}
      {expertises.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-black p-12 text-center">
          <FileTextIcon className="mx-auto h-12 w-12 text-white/30" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            Aucune expertise
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Commencez par créer votre première expertise.
          </p>
          <Link href={`/${locale}/admin/expertises/nouveau`}>
            <Button className="mt-4 gap-2 bg-lime-300 text-black hover:bg-lime-400">
              <PlusIcon className="h-4 w-4" />
              Nouvelle expertise
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/70">Titre</TableHead>
                <TableHead className="text-white/70">Slug</TableHead>
                <TableHead className="text-white/70">Ordre</TableHead>
                <TableHead className="text-white/70">Statut</TableHead>
                <TableHead className="text-right text-white/70">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expertises.map((expertise) => (
                <TableRow
                  key={expertise.id}
                  className="border-white/10 hover:bg-white/5"
                >
                  <TableCell className="font-medium text-white">
                    {getTitle(expertise)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-white/70">
                    {expertise.slug}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {expertise.order}
                  </TableCell>
                  <TableCell>
                    {expertise.isActive ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-lime-300/30 text-lime-300"
                      >
                        <EyeIcon className="h-3 w-3" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-white/30 text-white/50"
                      >
                        <EyeOffIcon className="h-3 w-3" />
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/${locale}/admin/expertises/${expertise.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-white hover:bg-white/10 hover:text-white"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Modifier
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(expertise.id);
                        }}
                        className="gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => {
          setDeleteId(null);
        }}
      >
        <AlertDialogContent className="border-white/10 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer cette expertise ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) void handleDelete(deleteId);
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
