import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryTypes, findCategory, findCategoryType } from "@/lib/catalog";
import { ListingPage } from "@/components/storefront";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; type: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  return { title: category ? `${category.name} | Mister Auto` : "Catégorie | Mister Auto" };
}

export function generateStaticParams() {
  return categoryTypes.map(({ category, slug }) => ({ slug: category, type: slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string; type: string }> }) {
  const { slug, type } = await params;
  if (!findCategory(slug) || findCategoryType(type)?.category !== slug) notFound();
  return <ListingPage slug={slug} typeSlug={type} />;
}
