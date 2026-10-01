import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GameForm, gameToForm, type GameFormValue } from "@/components/admin/game-form";
import { createGame } from "@/lib/server/admin";
import { getLookups } from "@/lib/server/catalog";
import type { Lookups } from "@/lib/types";

export const Route = createFileRoute("/owner-panel/games/new")({
  component: NewGamePage,
});

function NewGamePage() {
  const navigate = useNavigate();
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [value, setValue] = useState<GameFormValue>(gameToForm());
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getLookups().then((lu) => {
      setLookups(lu);
      setValue(gameToForm(null, lu));
    });
  }, []);

  if (!lookups) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;

  return (
    <div className="max-w-2xl">
      <p className="text-xs tracking-[0.28em] text-gold uppercase">{"المكتبة"}</p>
      <h1 className="mt-2 font-display text-3xl text-fg">{"إضافة لعبة"}</h1>
      <div className="mt-8">
        <GameForm
          lookups={lookups}
          value={value}
          onChange={setValue}
          pending={pending}
          submitLabel={"إنشاء اللعبة"}
          onSubmit={async () => {
            setPending(true);
            try {
              const created = await createGame({
                data: {
                  ...value,
                  version: value.version || null,
                  developer: value.developer || null,
                  original_release: value.original_release || null,
                  localization_release: value.localization_release || null,
                },
              });
              toast.success("تم إنشاء اللعبة");
              await navigate({ to: "/owner-panel/games/$id", params: { id: created.id } });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "تعذر إنشاء اللعبة");
            } finally {
              setPending(false);
            }
          }}
        />
      </div>
    </div>
  );
}
