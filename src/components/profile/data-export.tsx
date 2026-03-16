"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DataExport() {
  const [downloading, setDownloading] = useState(false);

  async function handleExport(format: "csv" | "json") {
    setDownloading(true);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nub-data-export.${format === "json" ? "json" : "csv"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error:", e);
    }
    setDownloading(false);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Data Export</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-text-muted mb-4">Download all your data including saved plans, chat history, and bookings.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")} loading={downloading}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("json")} loading={downloading}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
