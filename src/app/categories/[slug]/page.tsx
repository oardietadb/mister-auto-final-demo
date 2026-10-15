import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCategory } from "@/lib/catalog";
import { ListingPage } from "@/components/storefront";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  return { title: category ? `${category.name} | Mister Auto` : "Catégorie | Mister Auto" };
}

export function generateStaticParams() {
  return ["accessoires", "batteries", "freinage", "chaines-neige", "huile-moteur", "pieces-occasion", "pneus"].map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findCategory(slug)) notFound();
  return <ListingPage slug={slug} />;
}
