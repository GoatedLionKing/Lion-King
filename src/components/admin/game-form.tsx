import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { coverSrc } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { uploadWithProgress } from "@/lib/upload-client";
import type { Game, Lookups } from "@/lib/types";

export type GameFormValue = {
  title: string;
  slug: string;
  description: string;
  cover: string | null;
  platform_id: string;
  project_type_id: string;
  status_id: string;
  version: string;
  developer: string;
  original_release: string;
  localization_release: string;
  featured: boolean;
  published: boolean;
};

export function gameToForm(game?: Game | null, lookups?: Lookups | null): GameFormValue {
  return {
    title: game?.title ?? "",
    slug: game?.slug ?? "",
    description: game?.description ?? "",
    cover: game?.cover ?? null,
    platform_id: game?.platform_id ?? lookups?.platforms[0]?.id ?? "psp",
    project_type_id: game?.project_type_id ?? lookups?.projectTypes[0]?.id ?? "arabic-localization",
    status_id: game?.status_id ?? lookups?.statuses[0]?.id ?? "in-progress",
    version: game?.version ?? "",
    developer: game?.developer ?? "",
    original_release: game?.original_release?.slice(0, 10) ?? "",
    localization_release: game?.localization_release?.slice(0, 10) ?? "",
    featured: game?.featured ?? false,
    published: game?.published ?? false,
  };
}

export function GameForm({
  lookups,
  value,
  onChange,
  onSubmit,
  submitLabel,
  pending,
}: {
  lookups: Lookups;
  value: GameFormValue;
  onChange: (next: GameFormValue) => void;
  onSubmit: () => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const selectClass =
    "h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-gold/50";

  async function onCover(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadWithProgress(
        file,
        { kind: "cover", filename: file.name, mimeType: file.type || "application/octet-stream" },
        () => undefined,
      );
      onChange({ ...value, cover: result.storageKey });
      toast.success("تم رفع الغلاف");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الغلاف");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="block space-y-1.5">
        <Label>{"العنوان"}</Label>
        <Input
          required
          value={value.title}
          onChange={(e) => {
            const title = e.target.value;
            onChange({
              ...value,
              title,
              slug: value.slug && value.slug !== slugify(value.title) ? value.slug : slugify(title),
            });
          }}
        />
      </label>
      <label className="block space-y-1.5">
        <Label>{"الرابط المختصر"}</Label>
        <Input value={value.slug} onChange={(e) => onChange({ ...value, slug: e.target.value })} />
      </label>
      <label className="block space-y-1.5">
        <Label>{"الوصف"}</Label>
        <Textarea value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-36 w-24 overflow-hidden rounded-md border border-border bg-surface-2">
          {value.cover ? <img src={coverSrc(value.cover)} alt="" className="size-full object-cover" /> : null}
        </div>
        <label className="block flex-1 space-y-1.5">
          <Label>{"الغلاف"}</Label>
          <Input type="file" accept="image/*" onChange={(e) => void onCover(e.target.files?.[0])} />
          {uploading ? <p className="text-xs text-muted">{"جارٍ رفع الغلاف…"}</p> : null}
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <Label>{"المنصة"}</Label>
          <select
            className={selectClass}
            value={value.platform_id}
            onChange={(e) => onChange({ ...value, platform_id: e.target.value })}
          >
            {lookups.platforms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <Label>{"نوع المشروع"}</Label>
          <select
            className={selectClass}
            value={value.project_type_id}
            onChange={(e) => onChange({ ...value, project_type_id: e.target.value })}
          >
            {lookups.projectTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <Label>{"الحالة"}</Label>
          <select
            className={selectClass}
            value={value.status_id}
            onChange={(e) => onChange({ ...value, status_id: e.target.value })}
          >
            {lookups.statuses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <Label>{"اسم الإصدار"}</Label>
          <Input value={value.version} onChange={(e) => onChange({ ...value, version: e.target.value })} />
        </label>
        <label className="block space-y-1.5">
          <Label>{"المطور"}</Label>
          <Input value={value.developer} onChange={(e) => onChange({ ...value, developer: e.target.value })} />
        </label>
        <label className="block space-y-1.5">
          <Label>{"الإصدار الأصلي"}</Label>
          <Input
            type="date"
            value={value.original_release}
            onChange={(e) => onChange({ ...value, original_release: e.target.value })}
          />
        </label>
        <label className="block space-y-1.5">
          <Label>{"إصدار التعريب"}</Label>
          <Input
            type="date"
            value={value.localization_release}
            onChange={(e) => onChange({ ...value, localization_release: e.target.value })}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-5 text-sm text-muted">
        <label className="inline-flex h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={value.featured}
            onChange={(e) => onChange({ ...value, featured: e.target.checked })}
          />
          {"مميز"}
        </label>
        <label className="inline-flex h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={value.published}
            onChange={(e) => onChange({ ...value, published: e.target.checked })}
          />
          {"منشور"}
        </label>
      </div>
      <Button type="submit" disabled={pending || uploading}>
        {submitLabel}
      </Button>
    </form>
  );
}
