import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Search } from "lucide-react";
import { api, API_BASE } from "@/lib/api";

interface Contact {
  _id: string;
  phone: string;
  name: string;
  status: "active";
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- LOAD CONTACTS ---------------- */

  const loadContacts = async () => {
    try {
      const data = await api<Contact[]>("/contacts");
      // attach status locally (backend doesn’t need it)
      setContacts(
        data.map((c) => ({
          ...c,
          status: "active",
        }))
      );
    } catch (e) {
      console.error("Failed to load contacts", e);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ---------------- CSV UPLOAD ---------------- */

  const uploadCSV = async (file: File) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch(`${API_BASE}/contacts/upload`, {
        method: "POST",
        body: formData,
      });

      await loadContacts();
    } catch (e) {
      console.error("Upload failed", e);
    }

    setUploading(false);
  };

  /* ---------------- SEARCH ---------------- */

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    { header: "Phone Number", accessor: "phone" as const },
    { header: "Name", accessor: "name" as const },
    {
      header: "Status",
      accessor: (row: Contact) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your WhatsApp contacts
          </p>
        </div>

        {/* UPLOAD SECTION */}
        <div className="form-section">
          <h2 className="text-lg font-medium text-foreground">
            Upload Contacts
          </h2>

          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />

            <p className="text-sm text-foreground font-medium">
              Drop your CSV file here or click to browse
            </p>

            <p className="form-hint mt-2">CSV format: phone, name</p>

            <Button variant="outline" className="mt-4" disabled={uploading}>
              {uploading ? "Uploading..." : "Select File"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCSV(file);
              }}
            />
          </div>
        </div>

        {/* CONTACT LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">
              Contact List
            </h2>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <DataTable columns={columns} data={filteredContacts} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
