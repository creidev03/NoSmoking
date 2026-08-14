import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// Use Turso cloud if env vars are set, otherwise use local SQLite file
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const db = drizzle(client);
