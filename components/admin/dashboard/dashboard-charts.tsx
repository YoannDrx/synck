"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartIcon, TrendingUpIcon, PieChartIcon } from "lucide-react";
import { TimelineChart } from "@/components/admin/charts/timeline-chart";
import { StatusChart } from "@/components/admin/charts/status-chart";
import { CategoryChart } from "@/components/admin/charts/category-chart";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

type AnalyticsData = {
  timeline: {
    month: string;
    works: number;
    published: number;
    draft: number;
    composers: number;
  }[];
  statusDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  categoryDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
};

export function DashboardCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/analytics");
        if (res.ok) {
          const analytics = (await res.json()) as AnalyticsData;
          setData(analytics);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-lime-300/20 bg-black">
            <CardHeader>
              <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
            </CardHeader>
            <CardContent>
              <div className="h-64 animate-pulse rounded bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Timeline Chart - Full Width */}
      <Card className="border-lime-300/20 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUpIcon className="h-5 w-5 text-lime-300" />
            Évolution sur 6 mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart data={data.timeline} />
        </CardContent>
      </Card>

      {/* Status & Category Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-lime-300/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <PieChartIcon className="h-5 w-5 text-lime-300" />
              Distribution par statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart data={data.statusDistribution} />
          </CardContent>
        </Card>

        <Card className="border-lime-300/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChartIcon className="h-5 w-5 text-lime-300" />
              Top catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={data.categoryDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
