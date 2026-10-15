import type { Metadata } from "next";
import { CartPage } from "@/components/storefront";

export const metadata: Metadata = { title: "Mon panier | Mister Auto" };

export default function Page() { return <CartPage />; }
