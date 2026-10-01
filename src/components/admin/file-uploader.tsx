import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Version } from "@/lib/types";
import { addExternalFile } from "@/lib/server/admin";

export function FileUploader({
  gameId,
  versions,
  onUploaded,
}: {
  gameId: string;
  versions: Version[];
  onUploaded: () => void;
}) {
  const [name, setName] = useState("");
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [versionId, setVersionId] = useState(versions[0]?.id ?? "");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [sizeMb, setSizeMb] = useState("");
  const [visible, setVisible] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!versionId) {
      setError("أنشئ إصدارًا أولًا.");
      return;
    }
    if (!downloadUrl.trim()) {
      setError("أدخل رابط MediaFire.");
      return;
    }
    if (!filename.trim()) {
      setError("أدخل اسم الملف.");
      return;
    }
    const mb = Number(sizeMb);
    if (!Number.isFinite(mb) || mb < 0) {
      setError("أدخل حجم الملف بالميغابايت.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await addExternalFile({
        data: {
          game_id: gameId,
          version_id: versionId,
          name: name.trim() || filename.trim(),
          description: description.trim(),
          original_filename: filename.trim(),
          external_url: downloadUrl.trim(),
          file_size: Math.round(mb * 1024 * 1024),
          mime_type: "application/octet-stream",
          visible,
        },
      });
      toast.success("تمت إضافة رابط التحميل");
      setName("");
      setFilename("");
      setDescription("");
      setDownloadUrl("");
      setSizeMb("");
      setPending(false);
      onUploaded();
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : "فشل إضافة رابط التحميل");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-dashed border-border bg-surface p-5">
      <h3 className="font-display text-lg text-fg">{"إضافة ملف خارجي"}</h3>
      <p className="mt-1 text-sm text-muted">{"ملفات الترجمة لا تُرفع إلى الموقع. خزّنها على MediaFire وأضف رابط التحميل هنا."}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <Label>{"الاسم"}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Arabic Patch" />
        </label>
        <label className="block space-y-1.5">
          <Label>{"الإصدار"}</Label>
          <select
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
            value={versionId}
            onChange={(e) => setVersionId(e.target.value)}
          >
            {versions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5">
          <Label>{"اسم الملف"}</Label>
          <Input required value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="GOW_Arabic_Patch_v1.0.zip" />
        </label>
        <label className="block space-y-1.5">
          <Label>{"الحجم (MB)"}</Label>
          <Input required type="number" min="0" step="0.01" value={sizeMb} onChange={(e) => setSizeMb(e.target.value)} placeholder="250" />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <Label>{"رابط MediaFire"}</Label>
          <Input required type="url" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://www.mediafire.com/file/..." dir="ltr" />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <Label>{"الوصف"}</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" />
        </label>
        <label className="flex h-11 items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          {"ظاهر للزوار"}
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <div className="mt-4">
        <Button type="submit" disabled={pending}>{pending ? "جارٍ الحفظ…" : "إضافة رابط التحميل"}</Button>
      </div>
    </form>
  );
}
