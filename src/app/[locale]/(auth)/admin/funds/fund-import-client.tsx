"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { FundCategory } from "@/types/database";

interface FundItem {
  id: string;
  ticker: string;
  name_th: string;
  name_en: string;
  category: FundCategory;
  expected_return: number;
  standard_deviation: number;
  updated_at: string;
}

interface ParsedRow {
  ticker: string;
  name_th: string;
  name_en: string;
  category: FundCategory;
  expected_return: number;
  standard_deviation: number;
  nav_date?: string;
  nav_value?: number;
}

interface FundImportClientProps {
  funds: FundItem[];
  locale: string;
}

const VALID_CATEGORIES: FundCategory[] = ["equity", "bond", "gold", "mixed", "money_market"];

function parseCSV(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { rows: [], errors: ["CSV must have a header row and at least one data row"] };

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const requiredCols = ["ticker", "name_en", "category", "expected_return", "standard_deviation"];
  const missing = requiredCols.filter((c) => !header.includes(c));
  if (missing.length > 0) return { rows: [], errors: [`Missing columns: ${missing.join(", ")}`] };

  const rows: ParsedRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < header.length) {
      errors.push(`Row ${i + 1}: not enough columns`);
      continue;
    }

    const get = (name: string) => cols[header.indexOf(name)] || "";
    const category = get("category") as FundCategory;

    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(`Row ${i + 1}: invalid category "${get("category")}"`);
      continue;
    }

    const expectedReturn = parseFloat(get("expected_return"));
    const standardDeviation = parseFloat(get("standard_deviation"));

    if (isNaN(expectedReturn) || isNaN(standardDeviation)) {
      errors.push(`Row ${i + 1}: invalid number for return or SD`);
      continue;
    }

    const row: ParsedRow = {
      ticker: get("ticker"),
      name_th: get("name_th") || get("name_en"),
      name_en: get("name_en"),
      category,
      expected_return: expectedReturn,
      standard_deviation: standardDeviation,
    };

    if (header.includes("nav_date") && header.includes("nav_value")) {
      const navDate = get("nav_date");
      const navValue = parseFloat(get("nav_value"));
      if (navDate && !isNaN(navValue)) {
        row.nav_date = navDate;
        row.nav_value = navValue;
      }
    }

    rows.push(row);
  }

  return { rows, errors };
}

export function FundImportClient({ funds: initialFunds, locale }: FundImportClientProps) {
  const router = useRouter();
  const [funds] = useState(initialFunds);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows, errors } = parseCSV(text);
      setParsedRows(rows);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      handleFile(file);
    }
  }, [handleFile]);

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setImporting(true);
    let success = 0;
    let errors = 0;

    const supabase = createClient();

    for (const row of parsedRows) {
      const { nav_date, nav_value, ...fundData } = row;

      const { data: existing } = await supabase
        .from("funds")
        .select("id, nav_history")
        .eq("ticker", row.ticker)
        .single();

      if (existing) {
        const updates: Record<string, unknown> = { ...fundData };

        if (nav_date && nav_value != null) {
          const history = (existing.nav_history as Record<string, number>) || {};
          history[nav_date] = nav_value;
          updates.nav_history = history;
        }

        const { error } = await supabase
          .from("funds")
          .update(updates)
          .eq("id", existing.id);

        if (error) errors++;
        else success++;
      } else {
        const insert: Record<string, unknown> = { ...fundData };
        if (nav_date && nav_value != null) {
          insert.nav_history = { [nav_date]: nav_value };
        }

        const { error } = await supabase
          .from("funds")
          .insert(insert);

        if (error) errors++;
        else success++;
      }
    }

    setImporting(false);
    setImportResult({ success, errors });
    setParsedRows([]);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <h1 className="text-2xl font-bold text-text font-heading">Fund Data Management</h1>
        <p className="text-sm text-text-muted">{funds.length} funds in database</p>
      </div>

      {/* CSV Upload */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Import Fund Data (CSV)</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <Upload className="h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-muted">Drag and drop a CSV file, or</p>
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-hover transition-colors">
                Choose File
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          </div>
          <div className="rounded-lg bg-surface-hover p-3">
            <p className="text-xs font-medium text-text mb-1">CSV Format:</p>
            <code className="text-xs text-text-muted font-mono">
              ticker,name_th,name_en,category,expected_return,standard_deviation,nav_date,nav_value
            </code>
            <p className="text-xs text-text-muted mt-1">
              Categories: equity, bond, gold, mixed, money_market. NAV columns are optional.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">{parseErrors.length} parse error(s)</p>
                {parseErrors.map((err, i) => <p key={i} className="text-xs text-text-muted">{err}</p>)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{parsedRows.length} rows ready to import</CardTitle>
              <Button onClick={handleImport} disabled={importing} className="gap-1.5">
                {importing ? "Importing..." : <><FileSpreadsheet className="h-4 w-4" /> Import</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-text-muted">Ticker</th>
                    <th className="px-3 py-2 text-left text-text-muted">Name</th>
                    <th className="px-3 py-2 text-left text-text-muted">Category</th>
                    <th className="px-3 py-2 text-right text-text-muted">Return</th>
                    <th className="px-3 py-2 text-right text-text-muted">SD</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-3 py-1.5 font-mono font-medium">{row.ticker}</td>
                      <td className="px-3 py-1.5">{row.name_en}</td>
                      <td className="px-3 py-1.5"><Badge variant="secondary" className="capitalize text-[10px]">{row.category}</Badge></td>
                      <td className="px-3 py-1.5 text-right font-mono">{(row.expected_return * 100).toFixed(1)}%</td>
                      <td className="px-3 py-1.5 text-right font-mono">{(row.standard_deviation * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 20 && (
                <p className="px-3 py-2 text-xs text-text-muted">... and {parsedRows.length - 20} more rows</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card variant="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm text-text">
              Imported {importResult.success} funds successfully.
              {importResult.errors > 0 && ` ${importResult.errors} failed.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Existing Funds Table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Existing Funds ({funds.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-text-muted font-medium">Ticker</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium">Category</th>
                  <th className="px-4 py-3 text-right text-text-muted font-medium">Return</th>
                  <th className="px-4 py-3 text-right text-text-muted font-medium">SD</th>
                  <th className="px-4 py-3 text-right text-text-muted font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund) => (
                  <tr key={fund.id} className="border-b border-border/50 hover:bg-surface-hover">
                    <td className="px-4 py-2.5 font-mono font-medium">{fund.ticker}</td>
                    <td className="px-4 py-2.5">{locale === "th" ? fund.name_th : fund.name_en}</td>
                    <td className="px-4 py-2.5"><Badge variant="secondary" className="capitalize">{fund.category}</Badge></td>
                    <td className="px-4 py-2.5 text-right font-mono">{(fund.expected_return * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-right font-mono">{(fund.standard_deviation * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-right text-text-muted">{new Date(fund.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {funds.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-muted">No funds yet. Import a CSV to get started.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
