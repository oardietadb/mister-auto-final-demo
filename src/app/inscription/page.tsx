import type { Metadata } from "next";
import { RegistrationChoicePage } from "@/components/storefront";

export const metadata: Metadata = { title: "Mon compte | Mister Auto" };

export default function Page() {
  return <RegistrationChoicePage />;
}
