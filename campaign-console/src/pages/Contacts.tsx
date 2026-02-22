import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Search, Trash2, AlertTriangle } from "lucide-react";
import { api, API_BASE } from "@/lib/api";

interface Contact {
  _id: string;
  phone: string;
  name: string;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── LOAD ─────────────────────────────────────── */
  const loadContacts = async () => {
    try {
      const data = await api<Contact[]>("/contacts");
      setContacts(data);
    } catch (e) {
      console.error("Failed to load contacts", e);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ── UPLOAD CSV ───────────────────────────────── */
  const uploadCSV = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch(`${API_BASE}/contacts/upload`, { method: "POST", body: formData });
      await loadContacts();
    } catch (e) {
      console.error("Upload failed", e);
    }
    setUploading(false);
  };

  /* ── SEARCH ───────────────────────────────────── */
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  /* ── SELECTION ────────────────────────────────── */
  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedIds.has(c._id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // deselect all currently visible
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredContacts.forEach((c) => next.delete(c._id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredContacts.forEach((c) => next.add(c._id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── DELETE SINGLE ────────────────────────────── */
  const handleDeleteOne = async (id: string) => {
    setDeleting(true);
    try {
      await api(`/contacts/${id}`, { method: "DELETE" });
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      await loadContacts();
    } catch (e) {
      console.error("Delete failed", e);
    }
    setDeleting(false);
  };

  /* ── DELETE SELECTED ──────────────────────────── */
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await api("/contacts/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      setSelectedIds(new Set());
      await loadContacts();
    } catch (e) {
      console.error("Bulk delete failed", e);
    }
    setDeleting(false);
  };

  /* ── DELETE ALL ───────────────────────────────── */
  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete all ${contacts.length} contacts? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api("/contacts/all", { method: "DELETE" });
      setSelectedIds(new Set());
      await loadContacts();
    } catch (e) {
      console.error("Delete all failed", e);
    }
    setDeleting(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage your WhatsApp contacts</p>
        </div>

        {/* UPLOAD SECTION */}
        <div className="form-section">
          <h2 className="text-lg font-medium text-foreground">Upload Contacts</h2>
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
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-medium text-foreground">
              Contact List
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                ({contacts.length} total)
              </span>
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Delete Selected (shown when at least one selected) */}
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedIds.size})
                </Button>
              )}

              {/* Delete All */}
              {contacts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Delete All
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="data-table">
              <thead className="bg-muted/50">
                <tr>
                  {/* Select-all checkbox */}
                  <th className="w-10 px-3">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 cursor-pointer accent-primary"
                      title="Select all"
                      disabled={filteredContacts.length === 0}
                    />
                  </th>
                  <th>Phone Number</th>
                  <th>Name</th>
                  <th className="w-16 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted-foreground py-8">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className={selectedIds.has(contact._id) ? "bg-primary/5" : ""}
                    >
                      <td className="px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(contact._id)}
                          onChange={() => toggleOne(contact._id)}
                          className="h-4 w-4 cursor-pointer accent-primary"
                        />
                      </td>
                      <td>{contact.phone}</td>
                      <td>{contact.name || <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="text-center">
                        <button
                          onClick={() => handleDeleteOne(contact._id)}
                          disabled={deleting}
                          className="inline-flex items-center justify-center p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                          title="Delete contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
