"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangleIcon,
  ImageIcon,
  MusicIcon,
  UsersIcon,
  FolderIcon,
  TagIcon,
  ArrowRightIcon,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import Link from "next/link";

type DuplicatesSummary = {
  assets: {
    totalDuplicates: number;
    totalUnused: number;
  };
  works: {
    totalDuplicates: number;
  };
  composers: {
    totalDuplicates: number;
  };
  categories: {
    totalDuplicates: number;
  };
  labels: {
    totalDuplicates: number;
  };
};

export function DuplicatesWidget({ locale }: { locale: string }) {
  const [data, setData] = useState<DuplicatesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDuplicates = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth("/api/admin/monitoring/duplicates");

        if (!res.ok) {
          throw new Error("Failed to fetch duplicates");
        }

        const result = (await res.json()) as DuplicatesSummary;
        setData(result);
      } catch (error) {
        console.error("Error fetching duplicates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDuplicates();
  }, []);

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangleIcon className="h-5 w-5 text-orange-400" />
            Monitoring des doublons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/50">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const totalIssues =
    data.assets.totalDuplicates +
    data.assets.totalUnused +
    data.works.totalDuplicates +
    data.composers.totalDuplicates +
    data.categories.totalDuplicates +
    data.labels.totalDuplicates;

  const items = [
    {
      label: "Assets",
      count: data.assets.totalDuplicates + data.assets.totalUnused,
      icon: ImageIcon,
      color: "text-blue-400",
    },
    {
      label: "Projets",
      count: data.works.totalDuplicates,
      icon: MusicIcon,
      color: "text-lime-300",
    },
    {
      label: "Compositeurs",
      count: data.composers.totalDuplicates,
      icon: UsersIcon,
      color: "text-purple-400",
    },
    {
      label: "Catégories",
      count: data.categories.totalDuplicates,
      icon: FolderIcon,
      color: "text-pink-400",
    },
    {
      label: "Labels",
      count: data.labels.totalDuplicates,
      icon: TagIcon,
      color: "text-yellow-400",
    },
  ];

  if (totalIssues === 0) {
    return (
      <Card className="border-lime-300/20 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangleIcon className="h-5 w-5 text-lime-300" />
            Monitoring des doublons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-lime-300">
            ✓ Aucun problème détecté dans la base de données
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/20 bg-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangleIcon className="h-5 w-5 text-orange-400" />
            Monitoring des doublons
          </div>
          <Badge
            variant="destructive"
            className="bg-orange-500/20 text-orange-400"
          >
            {totalIssues} problème{totalIssues > 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary List */}
        <div className="space-y-2">
          {items
            .filter((item) => item.count > 0)
            .map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-sm text-white">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    {item.count}
                  </Badge>
                </div>
              );
            })}
        </div>

        {/* Action Button */}
        <Link href={`/${locale}/admin/monitoring/duplicates`}>
          <Button
            variant="outline"
            className="w-full gap-2 border-lime-300/30 text-lime-300 hover:bg-lime-300/10"
          >
            Voir tous les doublons
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
