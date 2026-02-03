import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { api } from "@/lib/api";

interface SettingsResponse {
  evolutionApiUrl?: string;
  evolutionApiKey?: string;
  delaySeconds?: number;
  instanceName?: string;
}


const Settings = () => {
  const { toast } = useToast();

  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [delay, setDelay] = useState("3");
  const [saving, setSaving] = useState(false);
  const [instanceName, setInstanceName] = useState("");


  /* ---------------- LOAD SETTINGS ---------------- */
 useEffect(() => {
  api<SettingsResponse>("/settings")
    .then((data) => {
      if (!data) return;

      setApiUrl(data.evolutionApiUrl ?? "");
      setApiKey(data.evolutionApiKey ?? "");
      setDelay(String(data.delaySeconds ?? 3));
      setInstanceName(data.instanceName ?? "");
    })
    .catch(console.error);
}, []);



  /* ---------------- SAVE SETTINGS ---------------- */

  const handleSave = async () => {
    setSaving(true);

    try {
      await api("/settings", {
        method: "POST",
        body: JSON.stringify({
          apiUrl,
          apiKey,
          instanceName,
          delay,
        }),
      });


      toast({
        title: "Settings saved",
        description: "Your configuration has been updated successfully.",
      });
    } catch (e) {
      toast({
        title: "Save failed",
        description: "Could not save settings.",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your Evolution API connection
          </p>
        </div>

        <div className="form-section max-w-xl">
          <h2 className="text-lg font-medium text-foreground">
            API Configuration
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label className="form-label">Evolution API URL</label>
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="form-label">Evolution API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="form-label">Evolution Instance Name</label>
              <Input
                placeholder="e.g. main-whatsapp"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="mt-1.5"
              />
              <p className="form-hint">
                Must match the instance name shown in Evolution dashboard
              </p>
            </div>

            <div>
              <label className="form-label">
                Message Delay (seconds)
              </label>
              <Input
                type="number"
                min="1"
                max="60"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                className="mt-1.5 w-32"
              />
              <p className="form-hint">
                Recommended: 3–5 seconds
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
