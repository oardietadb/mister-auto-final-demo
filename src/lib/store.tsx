"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { demoAuthAdapter, type DemoAccount } from "@/lib/auth";
import { createBrowserRepository } from "@/lib/persistence";

type CartLine = { productId: string; quantity: number };
export type Vehicle = { id: string; make: string; model: string; engine: string; registration?: string };
export type StoreContextValue = {
  cart: CartLine[];
  vehicle: Vehicle | null;
  vehicles: Vehicle[];
  account: DemoAccount | null;
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  saveVehicle: (vehicle: Omit<Vehicle, "id"> & { id?: string }) => void;
  setPrimaryVehicle: (vehicleId: string) => void;
  removeVehicle: (vehicleId: string) => void;
  signIn: (account: DemoAccount) => void;
  signOut: () => void;
};
const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "mister-auto-demo-cart";
const VEHICLE_KEY = "mister-auto-demo-vehicle";
const VEHICLES_KEY = "mister-auto-demo-vehicles";
const PRIMARY_VEHICLE_KEY = "mister-auto-demo-primary-vehicle";
const ACCOUNT_KEY = "mister-auto-demo-account";
const cartRepository = createBrowserRepository<CartLine[]>(CART_KEY, []);
const vehicleRepository = createBrowserRepository<Vehicle | null>(VEHICLE_KEY, null);
const vehiclesRepository = createBrowserRepository<Vehicle[]>(VEHICLES_KEY, []);
const primaryVehicleRepository = createBrowserRepository<string | null>(PRIMARY_VEHICLE_KEY, null);
const accountRepository = createBrowserRepository<DemoAccount | null>(ACCOUNT_KEY, null);

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
    && (candidate.registration === undefined || typeof candidate.registration === "string");
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [primaryVehicleId, setPrimaryVehicleId] = useState<string | null>(null);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const storedCart = cartRepository.read();
    setCart(Array.isArray(storedCart) ? storedCart.filter(isCartLine) : []);
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
    const storedAccount = accountRepository.read();
    setAccount(isDemoAccount(storedAccount) ? storedAccount : null);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    cartRepository.write(cart);
    vehiclesRepository.write(vehicles);
    primaryVehicleRepository.write(primaryVehicleId);
    vehicleRepository.write(vehicles.find((item) => item.id === primaryVehicleId) ?? null);
    if (account) accountRepository.write(account);
    else accountRepository.clear();
  }, [cart, vehicles, primaryVehicleId, account, ready]);
  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((current) => {
      const line = current.find((item) => item.productId === product.id);
      return line
        ? current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { productId: product.id, quantity }];
    });
  }, []);
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
  const signIn = useCallback((next: DemoAccount) => setAccount(demoAuthAdapter.createDemoSession(next)), []);
  const signOut = useCallback(() => setAccount(null), []);
  const cartCount = useMemo(() => cart.reduce((total, line) => total + line.quantity, 0), [cart]);
  const vehicle = vehicles.find((item) => item.id === primaryVehicleId) ?? null;
  return (
    <StoreContext.Provider value={{ cart, vehicle, vehicles, account, cartCount, addToCart, setQuantity, removeFromCart, saveVehicle, setPrimaryVehicle, removeVehicle, signIn, signOut }}>
      {children}
    </StoreContext.Provider>
  );
}
export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore doit être utilisé dans StoreProvider.");
  return context;
}
