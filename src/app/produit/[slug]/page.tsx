import { notFound } from "next/navigation";
import { findProduct, products } from "@/lib/catalog";
import { ProductDetailPage } from "@/components/storefront";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findProduct(slug)) notFound();
  return <ProductDetailPage slug={slug} />;
}
