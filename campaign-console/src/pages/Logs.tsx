import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";

interface LogEntry {
  _id: string;
  phone: string;
  status: "sent" | "failed";
  error?: string;
  createdAt: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  /* ---------------- LOAD LOGS ---------------- */

  const loadLogs = async () => {
    try {
      const data = await api<LogEntry[]>("/logs");
      setLogs(data);
    } catch (e) {
      console.error("Failed to load logs", e);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000); // live updates
    return () => clearInterval(interval);
  }, []);

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    { header: "Phone Number", accessor: "phone" as const },
    {
      header: "Status",
      accessor: (row: LogEntry) => <StatusBadge status={row.status} />,
    },
    {
      header: "Error Message",
      accessor: (row: LogEntry) => (
        <span
          className={
            !row.error || row.error === "-"
              ? "text-muted-foreground"
              : "text-foreground"
          }
        >
          {row.error || "-"}
        </span>
      ),
    },
    {
      header: "Timestamp",
      accessor: (row: LogEntry) => (
        <span className="text-muted-foreground font-mono text-xs">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Logs</h1>
          <p className="text-muted-foreground mt-1">
            Message delivery history
          </p>
        </div>

        <DataTable columns={columns} data={logs} />
      </div>
    </DashboardLayout>
  );
};

export default Logs;
