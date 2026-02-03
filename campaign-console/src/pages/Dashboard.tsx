import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { Users, Megaphone, Send, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

const DAILY_LIMIT = 1000;

const Dashboard = () => {
  const [stats, setStats] = useState<{
    totalContacts: number;
    sent: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    api("/stats")
      .then(setStats)
      .catch(err => {
        console.error("Failed to load stats", err);
      });
  }, []);

  if (!stats) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  const campaignProgress = Math.min(
    (stats.sent / DAILY_LIMIT) * 100,
    100
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your WhatsApp campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Active Campaign"
            value={stats.sent > 0 ? "Running" : "None"}
            icon={<Megaphone className="h-5 w-5" />}
          />
          <StatCard
            title="Messages Sent Today"
            value={stats.sent.toString()}
            icon={<Send className="h-5 w-5" />}
          />
          <StatCard
            title="Failed Messages"
            value={stats.failed.toString()}
            icon={<AlertCircle className="h-5 w-5" />}
          />
        </div>

        <div className="form-section">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                Campaign Progress
              </h2>
              <p className="text-sm text-muted-foreground">
                Today’s Campaign
              </p>
            </div>
            <span className="text-sm font-medium text-foreground">
              {stats.sent} / {DAILY_LIMIT} messages sent
            </span>
          </div>

          <Progress value={campaignProgress} className="h-2" />

          <p className="text-xs text-muted-foreground mt-2">
            {campaignProgress >= 100
              ? "Campaign completed"
              : "Campaign in progress"}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
