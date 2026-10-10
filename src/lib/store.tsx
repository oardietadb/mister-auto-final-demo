"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { demoAuthAdapter, type DemoAccount } from "@/lib/auth";
import { createBrowserRepository } from "@/lib/persistence";

type CartLine = { productId: string; quantity: number };
type Vehicle = { make: string; model: string; engine: string };
export type StoreContextValue = {
  cart: CartLine[];
  vehicle: Vehicle | null;
  account: DemoAccount | null;
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  saveVehicle: (vehicle: Vehicle) => void;
  signIn: (account: DemoAccount) => void;
  signOut: () => void;
};
const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "mister-auto-demo-cart";
const VEHICLE_KEY = "mister-auto-demo-vehicle";
const ACCOUNT_KEY = "mister-auto-demo-account";
const cartRepository = createBrowserRepository<CartLine[]>(CART_KEY, []);
const vehicleRepository = createBrowserRepository<Vehicle | null>(VEHICLE_KEY, null);
const accountRepository = createBrowserRepository<DemoAccount | null>(ACCOUNT_KEY, null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setCart(cartRepository.read());
    setVehicle(vehicleRepository.read());
    setAccount(accountRepository.read());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    cartRepository.write(cart);
    vehicleRepository.write(vehicle);
    if (account) accountRepository.write(account);
    else accountRepository.clear();
  }, [cart, vehicle, account, ready]);
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
  const saveVehicle = useCallback((next: Vehicle) => setVehicle(next), []);
  const signIn = useCallback((next: DemoAccount) => setAccount(demoAuthAdapter.createDemoSession(next)), []);
  const signOut = useCallback(() => setAccount(null), []);
  const cartCount = useMemo(() => cart.reduce((total, line) => total + line.quantity, 0), [cart]);
  return (
    <StoreContext.Provider value={{ cart, vehicle, account, cartCount, addToCart, setQuantity, removeFromCart, saveVehicle, signIn, signOut }}>
      {children}
    </StoreContext.Provider>
  );
}
export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore doit être utilisé dans StoreProvider.");
  return context;
}
