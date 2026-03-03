import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading";
import { Activity, Database } from "lucide-react";

interface HealthResponse {
  status: string;
  service: string;
}

export function HealthStatus() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<HealthResponse>("/health"),
    refetchInterval: 10_000,
  });

  const ready = useQuery({
    queryKey: ["health", "ready"],
    queryFn: () => api.get<HealthResponse>("/health/ready"),
    refetchInterval: 10_000,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Service Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {health.isLoading ? (
            <LoadingSpinner />
          ) : health.error ? (
            <Badge variant="destructive">Unreachable</Badge>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={health.data?.status === "ok" ? "secondary" : "destructive"}
                  className={
                    health.data?.status === "ok"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : ""
                  }
                >
                  {health.data?.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {health.data?.service}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Database Ready</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {ready.isLoading ? (
            <LoadingSpinner />
          ) : ready.error ? (
            <Badge variant="destructive">Not Ready</Badge>
          ) : (
            <Badge
              variant="secondary"
              className={
                ready.data?.status === "ok"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : ""
              }
            >
              {ready.data?.status}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
