import { useQuery } from "@tanstack/react-query";
import { aiAnalyticsApi } from "@/api/endpoints/ai-analytics";
import { queryKeys } from "@/lib/query-keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export function AnalyticsPanel({ matterId }: { matterId: string }) {
  return (
    <Tabs defaultValue="cost">
      <TabsList className="w-full">
        <TabsTrigger value="cost" className="flex-1">Cost</TabsTrigger>
        <TabsTrigger value="quality" className="flex-1">Quality</TabsTrigger>
        <TabsTrigger value="throughput" className="flex-1">Throughput</TabsTrigger>
      </TabsList>

      <TabsContent value="cost">
        <CostChart matterId={matterId} />
      </TabsContent>
      <TabsContent value="quality">
        <QualityChart matterId={matterId} />
      </TabsContent>
      <TabsContent value="throughput">
        <ThroughputChart matterId={matterId} />
      </TabsContent>
    </Tabs>
  );
}

function CostChart({ matterId }: { matterId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.aiAnalytics.cost(matterId),
    queryFn: () => aiAnalyticsApi.cost(matterId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data?.stage_breakdown?.length)
    return <p className="text-sm text-muted-foreground p-4">No cost data available</p>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">AI Cost by Stage</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>${data.total_cost_usd.toFixed(2)} total</span>
            <Badge
              variant="outline"
              className={
                data.alert_100
                  ? "text-destructive border-destructive"
                  : data.alert_80
                    ? "text-amber-600 border-amber-300"
                    : "text-muted-foreground"
              }
            >
              {data.utilization_percent}% of budget
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.stage_breakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="total_cost_usd" fill="var(--color-chart-1)" name="Cost (USD)" />
            <Bar dataKey="run_count" fill="var(--color-chart-2)" name="Runs" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function QualityChart({ matterId }: { matterId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.aiAnalytics.quality(matterId),
    queryFn: () => aiAnalyticsApi.quality(matterId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data?.points?.length)
    return <p className="text-sm text-muted-foreground p-4">No quality data available</p>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Quality Trends</CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.total_runs} runs over {data.days} days
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="average_score_percent"
              stroke="var(--color-chart-1)"
              name="Avg Score %"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="critical_failure_rate_percent"
              stroke="var(--color-destructive)"
              name="Critical Failure %"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ThroughputChart({ matterId }: { matterId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.aiAnalytics.throughput(matterId),
    queryFn: () => aiAnalyticsApi.throughput(matterId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data?.stage_breakdown?.length)
    return <p className="text-sm text-muted-foreground p-4">No throughput data available</p>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Throughput by Stage</CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.total_runs} runs &middot; avg {data.avg_runtime_seconds.toFixed(1)}s
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.stage_breakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="succeeded_runs" fill="var(--color-chart-2)" name="Succeeded" stackId="a" />
            <Bar dataKey="failed_runs" fill="var(--color-destructive)" name="Failed" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
