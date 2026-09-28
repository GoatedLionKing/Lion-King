import { tx } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { STATUS_TONE } from "@/lib/constants";

export function StatusBadge({ statusId, label }: { statusId: string; label: string }) {
  return <Badge tone={STATUS_TONE[statusId] ?? "muted"}>{tx(label)}</Badge>;
}
