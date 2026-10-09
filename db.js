// ---------- Database layer ----------
// Uses MongoDB (as per project plan). If MongoDB is not running on the demo
// laptop, it automatically falls back to a local JSON file so the demo
// NEVER fails in front of the teacher.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/civicsolve";
const FILE = path.join(__dirname, "data", "issues.json");

let mode = "file";
let Issue = null;

async function connect() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    Issue = mongoose.model("Issue", new mongoose.Schema({}, { strict: false }));
    mode = "mongodb";
    console.log("✅ Database: MongoDB connected");
  } catch (e) {
    mode = "file";
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");
    console.log("⚠️  MongoDB not found -> using local JSON file storage (data/issues.json)");
  }
}

const readFile = () => JSON.parse(fs.readFileSync(FILE, "utf8"));
const writeFile = data => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
const strip = d => {
  if (!d) return d;
  const { _id, __v, ...rest } = d;
  return rest;
};

async function all() {
  if (mode === "mongodb") return (await Issue.find().lean()).map(strip);
  return readFile();
}
async function get(id) {
  if (mode === "mongodb") return strip(await Issue.findOne({ id }).lean());
  return readFile().find(i => i.id === id);
}
async function create(doc) {
  if (mode === "mongodb") {
    await Issue.create(doc);
    return doc;
  }
  const data = readFile();
  data.push(doc);
  writeFile(data);
  return doc;
}
async function update(id, patch) {
  if (mode === "mongodb") {
    return strip(await Issue.findOneAndUpdate({ id }, patch, { new: true, strict: false }).lean());
  }
  const data = readFile();
  const idx = data.findIndex(i => i.id === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...patch };
  writeFile(data);
  return data[idx];
}
async function clear() {
  if (mode === "mongodb") await Issue.deleteMany({});
  else writeFile([]);
}
async function nextId() {
  const n = (await all()).length;
  return "CS-" + String(1001 + n);
}

module.exports = { connect, all, get, create, update, clear, nextId, getMode: () => mode };
