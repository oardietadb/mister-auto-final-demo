import type { Metadata } from "next";
import { AuthPage } from "@/components/storefront";

export const metadata: Metadata = { title: "Mon compte | Mister Auto" };

export default function Page() { return <AuthPage professional />; }
