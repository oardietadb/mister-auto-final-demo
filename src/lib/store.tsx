"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/lib/catalog";
import { LOCAL_USER_STORAGE_KEY, storeLocalUser, supabaseAuthAdapter, type DemoAccount, type LocalUserOptIns } from "@/lib/auth";
import { createBrowserRepository } from "@/lib/persistence";
import { track } from "@/lib/track";

export type CartLine = { productId: string; quantity: number };
export type CartDetailItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  priceTotal: number;
  imageUrl: string;
  productUrl: string;
};
export type CartDetails = {
  items: CartDetailItem[];
  cartTotal: number;
  itemCount: number;
};
export type Vehicle = { id: string; make: string; model: string; engine: string; registration?: string; mileage?: string; lastInspection?: string };
export type StoreContextValue = {
  cart: CartLine[];
  vehicle: Vehicle | null;
  vehicles: Vehicle[];
  account: DemoAccount | null;
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  clearCart: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  saveVehicle: (vehicle: Omit<Vehicle, "id"> & { id?: string }) => void;
  setPrimaryVehicle: (vehicleId: string) => void;
  removeVehicle: (vehicleId: string) => void;
  signIn: (account: DemoAccount, optIns?: LocalUserOptIns) => void;
  signOut: () => Promise<void>;
};
const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "mister-auto-demo-cart";
const VEHICLE_KEY = "mister-auto-demo-vehicle";
const VEHICLES_KEY = "mister-auto-demo-vehicles";
const PRIMARY_VEHICLE_KEY = "mister-auto-demo-primary-vehicle";
const LEGACY_ACCOUNT_KEY = "mister-auto-demo-account";
const cartRepository = createBrowserRepository<CartLine[]>(CART_KEY, []);
const vehicleRepository = createBrowserRepository<Vehicle | null>(VEHICLE_KEY, null);
const vehiclesRepository = createBrowserRepository<Vehicle[]>(VEHICLES_KEY, []);
const primaryVehicleRepository = createBrowserRepository<string | null>(PRIMARY_VEHICLE_KEY, null);

export function getCartDetails(baseUrl?: string): CartDetails {
  const origin = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : null);
  if (!origin) throw new Error("getCartDetails doit être appelé dans le navigateur ou avec une URL de base.");
  const siteUrl = new URL(origin).origin;
  const lines = cartRepository.read();
  const items = (Array.isArray(lines) ? lines : [])
    .filter(isCartLine)
    .flatMap((line): CartDetailItem[] => {
      const product = products.find((candidate) => candidate.id === line.productId);
      if (!product) return [];
      return [{
        sku: product.reference,
        name: product.name,
        quantity: line.quantity,
        unitPrice: product.price ?? 0,
        priceTotal: (product.price ?? 0) * line.quantity,
        imageUrl: new URL(product.image ?? "/images/products/product-unavailable.svg", siteUrl).toString(),
        productUrl: new URL(`/produit/${product.slug}`, siteUrl).toString(),
      }];
    });
  return {
    items,
    cartTotal: items.reduce((total, item) => total + item.priceTotal, 0),
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
  };
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return typeof line.productId === "string" && Number.isSafeInteger(line.quantity) && Number(line.quantity) > 0;
}

function isDemoAccount(value: unknown): value is DemoAccount {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return typeof profile.firstName === "string"
    && typeof profile.lastName === "string"
    && typeof profile.email === "string"
    && (profile.kind === "particulier" || profile.kind === "professionnel");
}

function isVehicleProfile(value: unknown): value is Omit<Vehicle, "id"> & { id?: string } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.make === "string"
    && typeof candidate.model === "string"
    && typeof candidate.engine === "string"
    && (candidate.registration === undefined || typeof candidate.registration === "string")
    && (candidate.mileage === undefined || typeof candidate.mileage === "string")
    && (candidate.lastInspection === undefined || typeof candidate.lastInspection === "string");
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [primaryVehicleId, setPrimaryVehicleId] = useState<string | null>(null);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [pendingCartAddCount, setPendingCartAddCount] = useState(0);
  useEffect(() => {
    let active = true;
    const storedCart = cartRepository.read();
    setCart(Array.isArray(storedCart) ? storedCart.filter(isCartLine) : []);
    const initialCart = getCartDetails();
    window.misterAuto ??= {};
    window.misterAuto.cart = {
      items: initialCart.items,
      total: initialCart.cartTotal,
      itemCount: initialCart.itemCount,
    };
    window.localStorage.removeItem(LEGACY_ACCOUNT_KEY);
    const storedVehicles = vehiclesRepository.read();
    const storedPrimary = primaryVehicleRepository.read();
    const validVehicles = Array.isArray(storedVehicles) ? storedVehicles.filter((item) => typeof item?.id === "string" && isVehicleProfile(item)) : [];
    if (validVehicles.length) {
      setVehicles(validVehicles);
      setPrimaryVehicleId(validVehicles.some((item) => item.id === storedPrimary) ? storedPrimary : validVehicles[0].id);
    } else {
      const legacyVehicle = vehicleRepository.read();
      if (legacyVehicle && isVehicleProfile(legacyVehicle)) {
        const migrated = { ...legacyVehicle, id: "vehicle-legacy" };
        setVehicles([migrated]);
        setPrimaryVehicleId(migrated.id);
      }
    }
    void supabaseAuthAdapter.getSession()
      .then((profile) => {
        if (!active) return;
        const restoredProfile = profile && isDemoAccount(profile) ? profile : null;
        setAccount(restoredProfile);
        if (restoredProfile) storeLocalUser(restoredProfile);
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Le compte Supabase n’a pas pu être chargé.", error);
          setAccount(null);
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => { active = false; };
  }, []);
  useLayoutEffect(() => {
    if (!ready) return;
    cartRepository.write(cart);
    vehiclesRepository.write(vehicles);
    primaryVehicleRepository.write(primaryVehicleId);
    vehicleRepository.write(vehicles.find((item) => item.id === primaryVehicleId) ?? null);
    const details = getCartDetails();
    window.misterAuto ??= {};
    window.misterAuto.cart = {
      items: details.items,
      total: details.cartTotal,
      itemCount: details.itemCount,
    };
  }, [cart, vehicles, primaryVehicleId, ready]);
  useEffect(() => {
    if (pendingCartAddCount === 0) return;
    for (let index = 0; index < pendingCartAddCount; index += 1) track("ma_addToCart");
    setPendingCartAddCount(0);
  }, [pendingCartAddCount]);
  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (product.available === false || product.price === null || !Number.isSafeInteger(quantity) || quantity < 1) return;
    setCart((current) => {
      const line = current.find((item) => item.productId === product.id);
      return line
        ? current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { productId: product.id, quantity }];
    });
    setPendingCartAddCount((current) => current + 1);
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((current) => quantity < 1 ? current.filter((item) => item.productId !== productId) : current.map((item) => item.productId === productId ? { ...item, quantity } : item));
  }, []);
  const removeFromCart = useCallback((productId: string) => setCart((current) => current.filter((item) => item.productId !== productId)), []);
  const saveVehicle = useCallback((next: Omit<Vehicle, "id"> & { id?: string }) => {
    const vehicle = { ...next, id: next.id ?? (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `vehicle-${Date.now()}`) };
    setVehicles((current) => current.some((item) => item.id === vehicle.id)
      ? current.map((item) => item.id === vehicle.id ? vehicle : item)
      : [...current, vehicle]);
    setPrimaryVehicleId(vehicle.id);
  }, []);
  const setPrimaryVehicle = useCallback((vehicleId: string) => {
    setPrimaryVehicleId(vehicleId);
  }, []);
  const removeVehicle = useCallback((vehicleId: string) => {
    setVehicles((current) => current.filter((item) => item.id !== vehicleId));
    if (primaryVehicleId === vehicleId) setPrimaryVehicleId(vehicles.find((item) => item.id !== vehicleId)?.id ?? null);
  }, [primaryVehicleId, vehicles]);
  const signIn = useCallback((next: DemoAccount, optIns?: LocalUserOptIns) => {
    const normalized = supabaseAuthAdapter.normalizeAccount(next);
    storeLocalUser(normalized, optIns);
    setAccount(normalized);
  }, []);
  const signOut = useCallback(async () => {
    try {
      await supabaseAuthAdapter.signOut();
    } finally {
      window.localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
      setAccount(null);
    }
  }, []);
  const cartCount = useMemo(() => cart.reduce((total, line) => total + line.quantity, 0), [cart]);
  const vehicle = vehicles.find((item) => item.id === primaryVehicleId) ?? null;
  return (
    <StoreContext.Provider value={{ cart, vehicle, vehicles, account, cartCount, addToCart, clearCart, setQuantity, removeFromCart, saveVehicle, setPrimaryVehicle, removeVehicle, signIn, signOut }}>
      {children}
    </StoreContext.Provider>
  );
}
export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore doit être utilisé dans StoreProvider.");
  return context;
}
