import type { Database } from "@/lib/types";
import { seedCategories } from "./categories";
import { buildProducts } from "./products";
import { buildUsers } from "./people";
import { buildActivity } from "./activity";
import { buildBanners, buildContent, buildSettings } from "./settings";

export const DB_VERSION = 1;

/** Build a fresh demo database. Dates are relative to `now` so demos always look current. */
export function createSeedDatabase(now = new Date()): Database {
  const products = buildProducts(now);
  const users = buildUsers(now);
  const activity = buildActivity(products, users, now);
  return {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    users,
    categories: structuredClone(seedCategories),
    products,
    orders: activity.orders,
    quotes: activity.quotes,
    uploads: activity.uploads,
    contactSubmissions: activity.contactSubmissions,
    emailLog: activity.emailLog,
    banners: buildBanners(),
    content: buildContent(),
    settings: buildSettings(),
    counters: {
      quoteByYear: { [String(now.getFullYear())]: activity.quoteCount },
      order: activity.lastOrderSeq,
    },
    newsletter: [],
  };
}
