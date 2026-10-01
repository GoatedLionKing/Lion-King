import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteLookup, getStorageInfo, updateSettings, upsertLookup } from "@/lib/server/admin";
import { getLookups, getSiteSettings } from "@/lib/server/catalog";
import type { Lookups, SiteSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [driver, setDriver] = useState<"local" | "blob">("local");
  const [pending, setPending] = useState(false);

  async function reload() {
    const [s, l, info] = await Promise.all([getSiteSettings(), getLookups(), getStorageInfo()]);
    setSettings(s);
    setLookups(l);
    setDriver(info.driver);
  }

  useEffect(() => {
    reload().catch((err: unknown) => toast.error(err instanceof Error ? err.message : "فشل تحميل الإعدادات"));
  }, []);

  if (!settings || !lookups) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{"الموقع"}</p>
        <h1 className="mt-2 font-display text-3xl text-fg">{"الإعدادات"}</h1>
      </div>

      <form
        className="space-y-3 rounded-xl border border-border bg-surface p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          try {
            await updateSettings({
              data: {
                site_name: settings.site_name,
                site_description: settings.site_description,
                tagline: settings.tagline,
                hero_title: settings.hero_title,
                hero_subtitle: settings.hero_subtitle,
                hero_description: settings.hero_description,
                seo_title: settings.seo_title,
                seo_description: settings.seo_description,
                featured_heading: settings.featured_heading,
                latest_heading: settings.latest_heading,
                max_upload_bytes: Number(settings.max_upload_bytes),
                allowed_file_types: settings.allowed_file_types,
              },
            });
            toast.success("تم حفظ الإعدادات");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "فشل الحفظ");
          } finally {
            setPending(false);
          }
        }}
      >
        <Field label={"اسم الموقع"}>
          <Input value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
        </Field>
        <Field label={"الشعار"}>
          <Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
        </Field>
        <Field label={"وصف الموقع"}>
          <Textarea
            value={settings.site_description}
            onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
          />
        </Field>
        <Field label={"العنوان الرئيسي"}>
          <Input value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} />
        </Field>
        <Field label={"العنوان الفرعي"}>
          <Input
            value={settings.hero_subtitle}
            onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
          />
        </Field>
        <Field label={"وصف الصفحة الرئيسية"}>
          <Textarea
            value={settings.hero_description}
            onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
          />
        </Field>
        <Field label={"عنوان SEO الافتراضي"}>
          <Input value={settings.seo_title} onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })} />
        </Field>
        <Field label={"وصف SEO الافتراضي"}>
          <Textarea
            value={settings.seo_description}
            onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
          />
        </Field>
        <Field label={"عنوان المشاريع المميزة"}>
          <Input
            value={settings.featured_heading}
            onChange={(e) => setSettings({ ...settings, featured_heading: e.target.value })}
          />
        </Field>
        <Field label={"عنوان أحدث الإصدارات"}>
          <Input
            value={settings.latest_heading}
            onChange={(e) => setSettings({ ...settings, latest_heading: e.target.value })}
          />
        </Field>
        <Field label="Maximum cover upload size (bytes)">
          <Input
            type="number"
            min={1024}
            max={16106127360}
            value={settings.max_upload_bytes}
            onChange={(e) => setSettings({ ...settings, max_upload_bytes: Math.min(16106127360, Number(e.target.value)) })}
          />
          <p className="text-xs text-subtle">{"ملفات الألعاب مستضافة خارجيًا على MediaFire. إعداد الحجم أعلاه مخصص لرفع الأغلفة."}</p>
        </Field>
        <Field label={"أنواع الملفات المسموح بها"}>
          <Input
            value={settings.allowed_file_types}
            onChange={(e) => setSettings({ ...settings, allowed_file_types: e.target.value })}
          />
        </Field>
        <Button type="submit" disabled={pending}>
          Save settings
        </Button>
      </form>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl text-fg">{"التخزين"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {"استضافة ملفات الألعاب:"} <span className="text-fg">{"روابط MediaFire خارجية"}</span>. {"يخزن الموقع بيانات الملف ورابط التنزيل فقط؛ ولا تُخزن ملفات الألعاب على هذا الخادم."}
          {"عيّن"} <code className="text-gold">STORAGE_DIR</code> {"لاختيار مكان تخزين أصول الموقع مثل الأغلفة."}
        </p>
      </section>

      <LookupManager
        title={"المنصات"}
        table="platforms"
        items={lookups.platforms}
        onChange={() => void reload()}
      />
      <LookupManager
        title={"أنواع المشاريع"}
        table="project_types"
        items={lookups.projectTypes}
        onChange={() => void reload()}
      />
      <LookupManager
        title={"حالة المشروع"}
        table="project_statuses"
        items={lookups.statuses}
        onChange={() => void reload()}
      />
      <LookupManager
        title={"التصنيفات"}
        table="categories"
        items={lookups.categories}
        onChange={() => void reload()}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <Label>{label}</Label>
      {children}
    </label>
  );
}

function LookupManager({
  title,
  table,
  items,
  onChange,
}: {
  title: string;
  table: "platforms" | "project_types" | "project_statuses" | "categories";
  items: Array<{ id: string; name: string }>;
  onChange: () => void;
}) {
  const [name, setName] = useState("");
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display text-xl text-fg">{title}</h2>
      <ul className="mt-3 divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="text-fg">{item.name}</span>
            <button
              type="button"
              className="h-11 text-xs text-danger"
              onClick={async () => {
                try {
                  await deleteLookup({ data: { table, id: item.id } });
                  onChange();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "لا يمكن الحذف");
                }
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await upsertLookup({ data: { table, id: name, name } });
          setName("");
          onChange();
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`New ${title.toLowerCase()}`} />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>
    </section>
  );
}
