"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { BlogCategory } from "@/types/database";

interface BlogItem {
  id: string;
  slug: string;
  title_th: string;
  title_en: string;
  category: BlogCategory;
  published: boolean;
  published_at: string | null;
  updated_at: string;
}

interface BlogFormData {
  title_th: string;
  title_en: string;
  slug: string;
  content_th: string;
  content_en: string;
  category: BlogCategory;
  published: boolean;
  seo_description_th: string;
  seo_description_en: string;
}

const emptyForm: BlogFormData = {
  title_th: "",
  title_en: "",
  slug: "",
  content_th: "",
  content_en: "",
  category: "retirement",
  published: false,
  seo_description_th: "",
  seo_description_en: "",
};

const categories: BlogCategory[] = [
  "retirement",
  "investing",
  "tax",
  "lifestyle",
  "course",
];

export function BlogAdminClient({
  posts: initialPosts,
  locale,
}: {
  posts: BlogItem[];
  locale: string;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>(emptyForm);
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
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setForm({
        title_th: data.title_th || "",
        title_en: data.title_en || "",
        slug: data.slug || "",
        content_th: data.content_th || "",
        content_en: data.content_en || "",
        category: data.category || "retirement",
        published: data.published || false,
        seo_description_th: data.seo_description_th || "",
        seo_description_en: data.seo_description_en || "",
      });
    }
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      ...form,
      published_at: form.published ? new Date().toISOString() : null,
    };

    if (editingId) {
      await supabase.from("blog_posts").update(payload).eq("id", editingId);
    } else {
      await supabase.from("blog_posts").insert(payload);
    }

    setSaving(false);
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    const supabase = createClient();
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="page-header-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text font-heading">
              Blog Posts
            </h1>
            <p className="text-sm text-text-muted">{posts.length} posts</p>
          </div>
          <Button onClick={openNew} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-text-muted font-medium">
                  Status
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
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-border/50 hover:bg-surface-hover"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">
                      {locale === "th" ? post.title_th : post.title_en}
                    </p>
                    <p className="text-xs text-text-muted">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="capitalize">
                      {post.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={post.published ? "success" : "default"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(post.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-text-muted"
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No blog posts yet
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
            <DialogTitle>{editingId ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Title (EN)"
                value={form.title_en}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title_en: val,
                    slug: f.slug || slugify(val),
                  }));
                }}
              />
              <Input
                label="Title (TH)"
                value={form.title_th}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title_th: e.target.value }))
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
                Content (EN)
              </label>
              <textarea
                value={form.content_en}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content_en: e.target.value }))
                }
                className="mt-1 h-32 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Markdown content..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text">
                Content (TH)
              </label>
              <textarea
                value={form.content_th}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content_th: e.target.value }))
                }
                className="mt-1 h-32 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Markdown content (TH)..."
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
                      category: e.target.value as BlogCategory,
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
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, published: v }))
                  }
                />
                <span className="text-sm text-text">Published</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="SEO Description (EN)"
                value={form.seo_description_en}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    seo_description_en: e.target.value,
                  }))
                }
              />
              <Input
                label="SEO Description (TH)"
                value={form.seo_description_th}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    seo_description_th: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.title_en || !form.slug}
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
