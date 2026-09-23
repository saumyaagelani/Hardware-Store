import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Database } from "@/lib/types";
import { createSeedDatabase, DB_VERSION } from "@/data/seed";

/**
 * PROTOTYPE DATA STORE
 * -----------------------------------------------------------------------------
 * A small JSON-file database so the demo persists across page loads and server
 * restarts without external infrastructure. All reads/writes go through this
 * module, and all business logic goes through the services in server/services,
 * so this file can be swapped for a real database (e.g. Postgres via Prisma or
 * Drizzle) in Stage 2 without touching the UI.
 *
 * If the data directory is not writable (e.g. read-only serverless hosting) the
 * store falls back to in-memory mode and resets when the server restarts.
 */

export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface StoreState {
  db: Database;
  mtimeMs: number;
  persistent: boolean;
}

const globalStore = globalThis as unknown as { __northlineStore?: StoreState };

function writeFile(db: Database): number {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
  return fs.statSync(DB_FILE).mtimeMs;
}

function seedStore(): StoreState {
  const db = createSeedDatabase();
  try {
    return { db, mtimeMs: writeFile(db), persistent: true };
  } catch {
    return { db, mtimeMs: 0, persistent: false };
  }
}

function load(): StoreState {
  const cached = globalStore.__northlineStore;
  if (cached && !cached.persistent) return cached;

  let state: StoreState | undefined;
  try {
    const stat = fs.statSync(DB_FILE);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached;
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Database;
    if (parsed.version === DB_VERSION) state = { db: parsed, mtimeMs: stat.mtimeMs, persistent: true };
  } catch {
    // Missing or unreadable file — fall through to seeding.
  }
  state ??= seedStore();
  globalStore.__northlineStore = state;
  return state;
}

/** Read-only snapshot of the database. Do not mutate the returned object. */
export function getDb(): Readonly<Database> {
  return load().db;
}

/** Apply a mutation and persist it. Returns whatever the callback returns. */
export function mutate<T>(fn: (db: Database) => T): T {
  const state = load();
  const result = fn(state.db);
  if (state.persistent) {
    try {
      state.mtimeMs = writeFile(state.db);
    } catch {
      state.persistent = false;
    }
  }
  return result;
}

/** Restore the original demo data. */
export function resetDatabase(): void {
  globalStore.__northlineStore = undefined;
  try {
    fs.rmSync(DB_FILE, { force: true });
  } catch {
    // ignore
  }
  globalStore.__northlineStore = seedStore();
}

export function isPersistent(): boolean {
  return load().persistent;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
