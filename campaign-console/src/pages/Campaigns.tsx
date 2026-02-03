import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Send } from "lucide-react";
import { api } from "@/lib/api";

type CampaignStatus = "idle" | "running" | "completed" | "error";

const Campaigns = () => {
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("idle");
  const [queued, setQueued] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- START CAMPAIGN ---------------- */

  const startCampaign = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setStatus("running");
    setQueued(null);

    try {
      const res = await api<{ queued: number }>("/campaign/start", {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      setQueued(res.queued);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage WhatsApp campaigns
          </p>
        </div>

        {/* CREATE CAMPAIGN */}
        <div className="form-section max-w-2xl">
          <h2 className="text-lg font-medium text-foreground">
            Create New Campaign
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="campaignName" className="form-label">
                Campaign Name
              </label>
              <Input
                id="campaignName"
                placeholder="e.g., Summer Sale 2024"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="message" className="form-label">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Hi {{name}}, this is a WhatsApp campaign message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-1.5"
              />
              <p className="form-hint">
                Use {"{{name}}"} to personalize with contact's name
              </p>
            </div>

            <Button
              className="w-full sm:w-auto"
              onClick={startCampaign}
              disabled={loading}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Starting..." : "Start Campaign"}
            </Button>
          </div>
        </div>

        {/* CAMPAIGN STATUS */}
        <div className="form-section max-w-2xl">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Campaign Status
          </h2>

          {status === "idle" && (
            <p className="text-sm text-muted-foreground">
              No active campaign
            </p>
          )}

          {status === "running" && (
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-foreground">
                  {campaignName || "Untitled Campaign"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Started just now
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status="running" />
                {queued !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {queued} messages queued
                  </p>
                )}
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="text-sm text-red-600">
              Failed to start campaign
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
