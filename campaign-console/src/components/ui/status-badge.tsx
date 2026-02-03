import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "sent" | "failed" | "active" | "running" | "completed" | "queued";
}

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  sent: "bg-success/10 text-success border-success/20",
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  running: "bg-primary/10 text-primary border-primary/20",
  queued: "bg-warning/10 text-warning border-warning/20",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
