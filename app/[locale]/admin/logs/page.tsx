"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FilterIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

type AuditLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch data function
  const fetchData = async (page = 0) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedAction !== "all" && { action: selectedAction }),
        ...(selectedEntityType !== "all" && { entityType: selectedEntityType }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const res = await fetchWithAuth(`/api/admin/logs?${queryParams}`);

      if (!res.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = (await res.json()) as {
        logs: AuditLog[];
        pagination: Pagination;
      };

      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Erreur lors du chargement des logs");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    void fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction, selectedEntityType, startDate, endDate]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedAction("all");
    setSelectedEntityType("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedAction !== "all" ||
    selectedEntityType !== "all" ||
    startDate ||
    endDate;

  // Filter logs by search query (client-side)
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.user.email.toLowerCase().includes(query) ||
      log.user.name?.toLowerCase().includes(query) ||
      log.entityType?.toLowerCase().includes(query) ||
      log.entityId?.toLowerCase().includes(query)
    );
  });

  // Get action badge color
  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-500/20 text-green-300 border-green-500/30",
      UPDATE: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      DELETE: "bg-red-500/20 text-red-300 border-red-500/30",
      LOGIN: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      LOGOUT: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      EXPORT: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      IMPORT: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    };
    return colors[action] ?? "bg-white/10 text-white/70 border-white/20";
  };

  // Define columns
  const columns: Column<AuditLog>[] = [
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (log) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">
            {new Date(log.createdAt).toLocaleDateString("fr-FR")}
          </p>
          <p className="text-xs text-white/50">
            {new Date(log.createdAt).toLocaleTimeString("fr-FR")}
          </p>
        </div>
      ),
    },
    {
      key: "user",
      label: "Utilisateur",
      render: (log) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">
            {log.user.name ?? "Inconnu"}
          </p>
          <p className="text-xs text-white/50">{log.user.email}</p>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (log) => (
        <Badge variant="outline" className={getActionBadge(log.action)}>
          {log.action}
        </Badge>
      ),
    },
    {
      key: "entity",
      label: "Entité",
      render: (log) => (
        <div className="space-y-1">
          {log.entityType ? (
            <>
              <p className="text-sm font-medium text-white/70">
                {log.entityType}
              </p>
              {log.entityId && (
                <p className="font-mono text-xs text-white/50">
                  {log.entityId.substring(0, 8)}...
                </p>
              )}
            </>
          ) : (
            <span className="text-white/30">-</span>
          )}
        </div>
      ),
    },
    {
      key: "metadata",
      label: "Détails",
      render: (log) => {
        if (!log.metadata) return <span className="text-white/30">-</span>;
        const metadataStr = JSON.stringify(log.metadata);
        return (
          <p className="max-w-xs truncate font-mono text-xs text-white/50">
            {metadataStr}
          </p>
        );
      },
    },
    {
      key: "ipAddress",
      label: "IP",
      render: (log) => (
        <span className="font-mono text-xs text-white/50">
          {log.ipAddress ?? "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="mt-2 text-white/50">
            Historique complet des actions ({filteredLogs.length}{" "}
            {filteredLogs.length > 1 ? "logs" : "log"})
          </p>
        </div>
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
              placeholder="Rechercher par utilisateur, action, entité..."
            />
          </div>

          {/* Action filter */}
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="border-white/20 bg-black text-white">
              <SelectValue placeholder="Toutes les actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="LOGIN">LOGIN</SelectItem>
              <SelectItem value="LOGOUT">LOGOUT</SelectItem>
              <SelectItem value="EXPORT">EXPORT</SelectItem>
              <SelectItem value="IMPORT">IMPORT</SelectItem>
            </SelectContent>
          </Select>

          {/* Entity Type filter */}
          <Select
            value={selectedEntityType}
            onValueChange={setSelectedEntityType}
          >
            <SelectTrigger className="border-white/20 bg-black text-white">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Composer">Composer</SelectItem>
              <SelectItem value="Category">Category</SelectItem>
              <SelectItem value="Label">Label</SelectItem>
              <SelectItem value="Expertise">Expertise</SelectItem>
              <SelectItem value="Asset">Asset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date range filters */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-white/70">
              Date de début
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-white/70">
              Date de fin
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
              }}
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: (page) => {
            void fetchData(page);
          },
        }}
        isLoading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? "Aucun log ne correspond aux filtres sélectionnés"
            : "Aucun log pour le moment"
        }
      />
    </div>
  );
}
