import express from "express";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.resolve("src/data/json/wishes.json");
const TMP_FILE = path.resolve("src/data/json/wishes.tmp.json");

async function readWishes() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeWishes(list) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const json = JSON.stringify(list, null, 2);
  // atomic-ish write: write temp then rename
  await fs.writeFile(TMP_FILE, json, "utf8");
  await fs.rename(TMP_FILE, DATA_FILE);
}

const app = express();
app.use(express.json({ limit: "16kb" })); // small payloads

// GET all wishes (newest-first)
app.get("/api/wishes", async (_req, res) => {
  const list = await readWishes();
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// POST new wish
app.post("/api/wishes", async (req, res) => {
  let { name, message } = req.body || {};
  name = String(name ?? "").trim();
  message = String(message ?? "").trim();

  if (name.length < 1 || message.length < 1) {
    return res.status(400).send("Name and message required");
  }
  if (name.length > 120 || message.length > 2000) {
    return res.status(413).send("Payload too large");
  }

  const list = await readWishes();
  const newWish = {
    id: Date.now(),
    name,
    message,
    createdAt: new Date().toISOString(),
  };
  list.push(newWish);
  await writeWishes(list);
  res.json(newWish);
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
