"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "@/lib/types";
import { cartLineKey } from "@/lib/cart";

/**
 * Cart state lives in the browser (localStorage) so guests can shop without an
 * account. Prices are NEVER stored here — every view re-prices the lines on the
 * server for the current viewer (see app/actions/cart.ts).
 */
const STORAGE_KEY = "nl_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  hydrated: boolean;
  count: number;
  addItem: (productId: string, quantity: number, options?: Record<string, string>) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.productId === "string" && l.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setLines(readStorage());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage full or disabled — cart still works for this page view
    }
  }, [lines, hydrated]);

  const addItem = useCallback((productId: string, quantity: number, options?: Record<string, string>) => {
    setLines((current) => {
      const key = cartLineKey({ productId, options });
      const existing = current.find((l) => cartLineKey(l) === key);
      if (existing) {
        return current.map((l) => (cartLineKey(l) === key ? { ...l, quantity: Math.min(999, l.quantity + quantity) } : l));
      }
      return [...current, { productId, quantity, options: options && Object.keys(options).length ? options : undefined }];
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) => current.map((l) => (cartLineKey(l) === key ? { ...l, quantity: Math.max(1, Math.min(999, quantity)) } : l)));
  }, []);

  const removeItem = useCallback((key: string) => {
    setLines((current) => current.filter((l) => cartLineKey(l) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      hydrated,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [lines, hydrated, addItem, setQuantity, removeItem, clear, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
