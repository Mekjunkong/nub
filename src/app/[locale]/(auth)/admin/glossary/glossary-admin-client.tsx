"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GlossaryCategory } from "@/types/database";

interface GlossaryItem {
  id: string;
  slug: string;
  term_th: string;
  term_en: string;
  category: GlossaryCategory;
  updated_at: string;
}

interface GlossaryFormData {
  term_th: string;
  term_en: string;
  slug: string;
  definition_th: string;
  definition_en: string;
  category: GlossaryCategory;
  related_terms: string;
}

const emptyForm: GlossaryFormData = {
  term_th: "",
  term_en: "",
  slug: "",
  definition_th: "",
  definition_en: "",
  category: "general",
  related_terms: "",
};

const categories: GlossaryCategory[] = [
  "retirement",
  "investing",
  "tax",
  "insurance",
  "general",
];

const categoryBadgeVariant: Record<GlossaryCategory, "default" | "secondary" | "success" | "warning" | "danger"> = {
  retirement: "default",
  investing: "success",
  tax: "warning",
  insurance: "secondary",
  general: "default",
};

export function GlossaryAdminClient({
  terms: initialTerms,
  locale,
}: {
  terms: GlossaryItem[];
  locale: string;
}) {
  const router = useRouter();
  const [terms, setTerms] = useState(initialTerms);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GlossaryFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  async function openEdit(id: string) {
    setEditingId(id);
    const supabase = createClient();
    const { data } = await supabase
      .from("glossary_terms")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setForm({
        term_th: data.term_th || "",
        term_en: data.term_en || "",
        slug: data.slug || "",
        definition_th: data.definition_th || "",
        definition_en: data.definition_en || "",
        category: data.category || "general",
        related_terms: (data.related_terms ?? []).join(", "),
      });
    }
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const relatedArr = form.related_terms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      term_th: form.term_th,
      term_en: form.term_en,
      slug: form.slug,
      definition_th: form.definition_th,
      definition_en: form.definition_en,
      category: form.category,
      related_terms: relatedArr.length > 0 ? relatedArr : null,
    };

    if (editingId) {
      await supabase.from("glossary_terms").update(payload).eq("id", editingId);
    } else {
      await supabase.from("glossary_terms").insert(payload);
    }

    setSaving(false);
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this glossary term?")) return;
    const supabase = createClient();
    await supabase.from("glossary_terms").delete().eq("id", id);
    setTerms((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text font-heading">
              Glossary Terms
            </h1>
            <p className="text-sm text-text-muted">{terms.length} terms</p>
          </div>
          <Button onClick={openNew} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Term
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Term
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Updated
                </th>
                <th className="px-4 py-3 text-right text-text-muted font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term) => (
                <tr
                  key={term.id}
                  className="border-b border-border/50 hover:bg-surface-hover"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">
                      {locale === "th" ? term.term_th : term.term_en}
                    </p>
                    <p className="text-xs text-text-muted">/{term.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={categoryBadgeVariant[term.category]} className="capitalize">
                      {term.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(term.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(term.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(term.id)}
                        className="text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {terms.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-text-muted"
                  >
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No glossary terms yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Term" : "New Term"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Term (EN)"
                value={form.term_en}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({
                    ...f,
                    term_en: val,
                    slug: f.slug || slugify(val),
                  }));
                }}
              />
              <Input
                label="Term (TH)"
                value={form.term_th}
                onChange={(e) =>
                  setForm((f) => ({ ...f, term_th: e.target.value }))
                }
              />
            </div>
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value }))
              }
            />
            <div>
              <label className="text-sm font-medium text-text">
                Definition (EN)
              </label>
              <textarea
                value={form.definition_en}
                onChange={(e) =>
                  setForm((f) => ({ ...f, definition_en: e.target.value }))
                }
                className="mt-1 h-32 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="English definition..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text">
                Definition (TH)
              </label>
              <textarea
                value={form.definition_th}
                onChange={(e) =>
                  setForm((f) => ({ ...f, definition_th: e.target.value }))
                }
                className="mt-1 h-32 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Thai definition..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as GlossaryCategory,
                    }))
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Related Terms (comma-separated)"
                value={form.related_terms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, related_terms: e.target.value }))
                }
                placeholder="e.g. compound interest, inflation"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.term_en || !form.slug}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
