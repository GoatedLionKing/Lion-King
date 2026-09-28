export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <h2 className="font-display text-xl text-fg">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
