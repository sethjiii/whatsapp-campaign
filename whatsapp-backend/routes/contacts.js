import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import Contact from "../models/Contact.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ── LIST ─────────────────────────────────────────── */
router.get("/", async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
});

/* ── UPLOAD CSV ───────────────────────────────────── */
router.post("/upload", upload.single("file"), (req, res) => {
    const contacts = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            if (row.phone) {
                contacts.push({
                    phone: row.phone.trim(),
                    name: row.name || "",
                });
            }
        })
        .on("end", async () => {
            await Contact.insertMany(contacts, { ordered: false });
            fs.unlinkSync(req.file.path);
            res.json({ success: true, count: contacts.length });
        });
});

/* ── DELETE ALL ───────────────────────────────────── */
// Must be before /:id so "all" isn't treated as an id
router.delete("/all", async (req, res) => {
    const result = await Contact.deleteMany({});
    res.json({ success: true, deleted: result.deletedCount });
});

/* ── DELETE BULK (selected) ───────────────────────── */
router.delete("/bulk", async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: "No ids provided" });
    }

    const result = await Contact.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deleted: result.deletedCount });
});

/* ── DELETE SINGLE ────────────────────────────────── */
router.delete("/:id", async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

export default router;
