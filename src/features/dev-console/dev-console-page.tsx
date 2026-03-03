import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MattersTable } from "./matters-table";
import { TokenManager } from "./token-manager";
import { HealthStatus } from "./health-status";

export function DevConsolePage() {
  const [tab, setTab] = useState("matters");

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Developer Console</h1>
        <p className="text-sm text-muted-foreground">
          Manage matters, tokens, and system health
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="matters">Matters</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>
        <TabsContent value="matters">
          <MattersTable />
        </TabsContent>
        <TabsContent value="tokens">
          <TokenManager />
        </TabsContent>
        <TabsContent value="health">
          <HealthStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
