import { useQuery } from "@tanstack/react-query";
import { aiAnalyticsApi } from "@/api/endpoints/ai-analytics";
import { queryKeys } from "@/lib/query-keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (!data?.entries?.length)
    return <p className="text-sm text-muted-foreground p-4">No cost data available</p>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">AI Cost by Model</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.entries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model_id" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="total_cost_usd" fill="var(--color-chart-1)" name="Cost (USD)" />
            <Bar dataKey="total_runs" fill="var(--color-chart-2)" name="Runs" />
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
  if (!data?.trends?.length)
    return <p className="text-sm text-muted-foreground p-4">No quality data available</p>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Quality Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avg_accuracy"
              stroke="var(--color-chart-1)"
              name="Accuracy"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="avg_f1_score"
              stroke="var(--color-chart-2)"
              name="F1 Score"
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
  if (!data?.entries?.length)
    return <p className="text-sm text-muted-foreground p-4">No throughput data available</p>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Throughput by Task Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.entries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="task_type" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="succeeded" fill="var(--color-chart-2)" name="Succeeded" stackId="a" />
            <Bar dataKey="failed" fill="var(--color-destructive)" name="Failed" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
