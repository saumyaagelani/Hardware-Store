import type { ProductInventory, StockStatus } from "./types";

export interface StockDisplay {
  status: StockStatus;
  label: string;
  detail?: string;
  tone: "success" | "warning" | "danger" | "special";
  purchasable: boolean;
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });

/** Human-friendly stock indicator. */
export function describeStock(inventory: ProductInventory): StockDisplay {
  switch (inventory.status) {
    case "in_stock":
      return { status: "in_stock", label: "In Stock", detail: "Ready for pickup or delivery", tone: "success", purchasable: true };
    case "low_stock":
      return {
        status: "low_stock",
        label: "Low Stock",
        detail: inventory.quantity > 0 ? `Only ${inventory.quantity} left` : "Limited quantity",
        tone: "warning",
        purchasable: true,
      };
    case "special_order":
      return {
        status: "special_order",
        label: "Special Order",
        detail: inventory.leadTime ? `Ships in ${inventory.leadTime}` : "Ordered in for you",
        tone: "special",
        purchasable: true,
      };
    case "out_of_stock":
    default:
      return {
        status: "out_of_stock",
        label: "Out of Stock",
        detail: inventory.restockDate ? `Expected restock ${shortDate(inventory.restockDate)}` : "Restock date to be confirmed",
        tone: "danger",
        purchasable: false,
      };
  }
}

/**
 * Suggest a stock status from quantity — used by the admin inventory editor so
 * that stock levels and labels stay consistent. Special order is always explicit.
 */
export function statusFromQuantity(quantity: number, threshold: number, current: StockStatus): StockStatus {
  if (current === "special_order") return current;
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= threshold) return "low_stock";
  return "in_stock";
}

export const stockStatusOptions: { value: StockStatus; label: string }[] = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "special_order", label: "Special Order" },
];
