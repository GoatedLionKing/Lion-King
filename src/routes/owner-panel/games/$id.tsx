import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FileUploader } from "@/components/admin/file-uploader";
import { GameForm, gameToForm, type GameFormValue } from "@/components/admin/game-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBytes, formatDate } from "@/lib/format";
import {
  addExternalFile,
  createVersion,
  deleteFile,
  deleteGame,
  deleteVersion,
  getAdminGame,
  setFileVisible,
  updateFileMeta,
  updateGame,
  updateVersion,
} from "@/lib/server/admin";
import { getLookups } from "@/lib/server/catalog";
import type { Game, GameFile, Lookups, Version } from "@/lib/types";

export const Route = createFileRoute("/owner-panel/games/$id")({
  component: AdminGamePage,
});

function AdminGamePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [files, setFiles] = useState<GameFile[]>([]);
  const [form, setForm] = useState<GameFormValue>(gameToForm());
  const [pending, setPending] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [editingFile, setEditingFile] = useState<GameFile | null>(null);

  const reload = useCallback(async () => {
    const data = await getAdminGame({ data: { id } });
    if (!data) {
      toast.error("اللعبة غير موجودة");
      await navigate({ to: "/owner-panel/games" });
      return;
    }
    setGame(data.game);
    setVersions(data.versions as Version[]);
    setFiles(data.files);
    setForm(gameToForm(data.game, lookups));
  }, [id, lookups, navigate]);

  useEffect(() => {
    getLookups().then(setLookups);
  }, []);

  useEffect(() => {
    if (lookups) void reload();
  }, [lookups, reload]);

  if (!lookups || !game) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold uppercase">{"المكتبة"}</p>
          <h1 className="mt-2 font-display text-3xl text-fg">{game.title}</h1>
          <p className="mt-1 text-sm text-muted">/{game.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {game.published ? (
            <Button asChild variant="secondary">
              <Link to="/games/$slug" params={{ slug: game.slug }}>
                View public page
              </Link>
            </Button>
          ) : null}
          <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm(`Delete “${game.title}” and all of its files?`)) return;
              await deleteGame({ data: { id: game.id } });
              toast.success("تم حذف اللعبة");
              await navigate({ to: "/owner-panel/games" });
            }}
          >
            Delete game
          </Button>
        </div>
      </div>

      <section className="max-w-2xl rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl text-fg">{"معلومات اللعبة"}</h2>
        <div className="mt-5">
          <GameForm
            lookups={lookups}
            value={form}
            onChange={setForm}
            pending={pending}
            submitLabel={"حفظ اللعبة"}
            onSubmit={async () => {
              setPending(true);
              try {
                await updateGame({
                  data: {
                    id: game.id,
                    ...form,
                    version: form.version || null,
                    developer: form.developer || null,
                    original_release: form.original_release || null,
                    localization_release: form.localization_release || null,
                  },
                });
                toast.success("تم الحفظ");
                await reload();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "فشل الحفظ");
              } finally {
                setPending(false);
              }
            }}
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-fg">{"الإصدارات"}</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingVersion(null);
              setVersionOpen(true);
            }}
          >
            Add version
          </Button>
        </div>
        <ul className="space-y-2">
          {versions.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              No versions yet. Add one before uploading files.
            </li>
          ) : (
            versions.map((version) => (
              <li key={version.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg">{version.name}</p>
                  <p className="text-sm text-muted">
                    {version.version_number}
                    {version.release_date ? ` · ${formatDate(version.release_date)}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingVersion(version);
                      setVersionOpen(true);
                    }}
                  >
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(`Delete version “${version.name}” and its files?`)) return;
                      await deleteVersion({ data: { id: version.id } });
                      toast.success("تم حذف الإصدار");
                      await reload();
                    }}
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {versions.length > 0 ? (
        <FileUploader gameId={game.id} versions={versions} onUploaded={() => void reload()} />
      ) : null}

      <section>
        <h2 className="mb-4 font-display text-xl text-fg">{"الملفات"}</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-subtle uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">{"اسم الملف"}</th>
                <th className="px-4 py-3 font-medium">{"الإصدار"}</th>
                <th className="px-4 py-3 font-medium">{"الحجم"}</th>
                <th className="px-4 py-3 font-medium">{"التنزيلات"}</th>
                <th className="px-4 py-3 font-medium">{"الحالة"}</th>
                <th className="px-4 py-3 font-medium">{"تاريخ الرفع"}</th>
                <th className="px-4 py-3 font-medium">{"الإجراءات"}</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No files uploaded yet.
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-fg">{file.name}</td>
                    <td className="px-4 py-3 text-muted">{file.version_name}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{formatBytes(file.file_size)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{file.download_count}</td>
                    <td className="px-4 py-3 text-muted">{file.visible ? "ظاهر" : "مخفي"}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(file.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" className="inline-flex h-11 items-center px-2 text-gold" onClick={() => setEditingFile(file)}>
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-11 items-center px-2 text-gold"
                          onClick={async () => {
                            await setFileVisible({ data: { id: file.id, visible: !file.visible } });
                            await reload();
                          }}
                        >
                          {file.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-11 items-center px-2 text-danger"
                          onClick={async () => {
                            if (!confirm(`Delete “${file.name}”?`)) return;
                            await deleteFile({ data: { id: file.id } });
                            toast.success("تم حذف الملف");
                            await reload();
                          }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={versionOpen} onOpenChange={setVersionOpen}>
        <DialogContent title={editingVersion ? "تعديل الإصدار" : "إضافة إصدار"}>
          <VersionForm
            initial={editingVersion}
            onCancel={() => setVersionOpen(false)}
            onSave={async (payload) => {
              if (editingVersion) {
                await updateVersion({ data: { id: editingVersion.id, ...payload } });
                toast.success("تم تحديث الإصدار");
              } else {
                await createVersion({ data: { game_id: game.id, ...payload } });
                toast.success("تم إنشاء الإصدار");
              }
              setVersionOpen(false);
              await reload();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingFile)} onOpenChange={(open) => !open && setEditingFile(null)}>
        <DialogContent title={"تعديل الملف"}>
          {editingFile ? (
            <FileMetaForm
              file={editingFile}
              versions={versions}
              onCancel={() => setEditingFile(null)}
              onSave={async (payload) => {
                await updateFileMeta({ data: { id: editingFile.id, ...payload } });
                toast.success("تم تحديث الملف");
                setEditingFile(null);
                await reload();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VersionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Version | null;
  onSave: (payload: { name: string; version_number: string; description?: string; release_date?: string | null }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [versionNumber, setVersionNumber] = useState(initial?.version_number ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [releaseDate, setReleaseDate] = useState(initial?.release_date?.slice(0, 10) ?? "");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          name,
          version_number: versionNumber,
          description,
          release_date: releaseDate || null,
        });
      }}
    >
      <label className="block space-y-1.5">
        <Label>{"الاسم"}</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Version 1.0" />
      </label>
      <label className="block space-y-1.5">
        <Label>{"رقم الإصدار"}</Label>
        <Input required value={versionNumber} onChange={(e) => setVersionNumber(e.target.value)} placeholder="1.0" />
      </label>
      <label className="block space-y-1.5">
        <Label>{"الوصف"}</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" />
      </label>
      <label className="block space-y-1.5">
        <Label>{"تاريخ الإصدار"}</Label>
        <Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{"حفظ"}</Button>
      </div>
    </form>
  );
}

function FileMetaForm({
  file,
  versions,
  onSave,
  onCancel,
}: {
  file: GameFile;
  versions: Version[];
  onSave: (payload: { name: string; description?: string; version_id: string; visible: boolean; external_url: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(file.name);
  const [description, setDescription] = useState(file.description);
  const [versionId, setVersionId] = useState(file.version_id);
  const [visible, setVisible] = useState(file.visible);
  const [externalUrl, setExternalUrl] = useState(file.external_url ?? "");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({ name, description, version_id: versionId, visible, external_url: externalUrl });
      }}
    >
      <label className="block space-y-1.5">
        <Label>{"الاسم"}</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block space-y-1.5">
        <Label>{"الوصف"}</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" />
      </label>
      <label className="block space-y-1.5">
        <Label>رابط MediaFire</Label>
        <Input required type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} dir="ltr" />
      </label>
      <label className="block space-y-1.5">
        <Label>{"الإصدار"}</Label>
        <select
          className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
        >
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex h-11 items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        Visible
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{"حفظ"}</Button>
      </div>
    </form>
  );
}
