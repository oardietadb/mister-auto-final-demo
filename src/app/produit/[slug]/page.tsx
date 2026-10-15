import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findProduct, products } from "@/lib/catalog";
import { ProductDetailPage } from "@/components/storefront";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  return { title: product ? `${product.name} | Mister Auto` : "Produit introuvable | Mister Auto" };
}

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findProduct(slug)) notFound();
  return <ProductDetailPage slug={slug} />;
}
