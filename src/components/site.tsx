"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { categories } from "@/lib/catalog";
import { trackEvent } from "@/lib/analytics";
import { useStore } from "@/lib/store";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, vehicle, account, signOut } = useStore();
  const [query, setQuery] = useState("");
  useEffect(() => {
    trackEvent({ type: "pageView", path: pathname, title: document.title });
  }, [pathname]);
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    trackEvent({ type: "search", query: value });
    router.push(`/recherche?q=${encodeURIComponent(value)}`);
  }
  return (
    <>
      <div className="announcement">Livraison offerte dès 59 € d’achat · Paiement sécurisé · Retours faciles sous 30 jours</div>
      <header className="site-header">
        <div className="header-main page-width">
          <Link href="/" className="wordmark" aria-label="Mister Auto, accueil"><span>MISTER</span><strong>AUTO</strong></Link>
          <form className="search-box" onSubmit={search}>
            <input aria-label="Rechercher des pièces auto" placeholder="Rechercher un produit, une référence ou une marque" value={query} onChange={(event) => setQuery(event.target.value)} />
            <button aria-label="Rechercher" type="submit">⌕</button>
          </form>
          <div className="header-actions">
            <Link href="/garage" className="header-action"><span>◉</span><small>Mon véhicule</small></Link>
            {account ? (
              <div className="account-menu"><Link href="/compte" className="header-action"><span>♙</span><small>Bonjour, {account.firstName}</small></Link><button className="logout-link" onClick={signOut}>Déconnexion</button></div>
            ) : <Link href="/connexion" className="header-action"><span>♙</span><small>Mon compte</small></Link>}
            <Link href="/panier" className="header-action cart-action"><span>🛒{cartCount > 0 && <b>{cartCount}</b>}</span><small>Mon panier</small></Link>
            <Link href="/connexion-pro" className="pro-entry"><strong>Vous êtes un PRO ?</strong><small>Offre de bienvenue ›</small></Link>
          </div>
        </div>
        <nav className="category-nav" aria-label="Catégories produits">
          <div className="page-width nav-inner">
            <Link href="/categories" className={`all-products ${pathname === "/categories" ? "active" : ""}`}>☰ <span>Tous nos produits</span></Link>
            {categories.filter((category) => category.slug !== "pieces-occasion").map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className={pathname === `/categories/${category.slug}` ? "active" : ""}>{category.name}</Link>
            ))}
            <Link href="/categories/pieces-occasion">Pièces d’occasion</Link>
          </div>
        </nav>
      </header>
      <div className="vehicle-strip">
        <div className="page-width vehicle-strip-inner">
          <span className="vehicle-icon">🚘</span>
          <span>{vehicle ? <><strong>{vehicle.make} {vehicle.model}</strong><small>{vehicle.engine}</small></> : <><strong>Des pièces compatibles avec votre voiture</strong><small>Ajoutez votre véhicule pour trouver les bonnes références</small></>}</span>
          <Link href="/garage" className="button button-light">{vehicle ? "Gérer mon garage" : "Ajouter un véhicule"} <span>›</span></Link>
        </div>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <>
      <div className="service-benefits page-width">
        <div><span>♧</span><strong>Des experts à votre écoute</strong></div>
        <div><span>▣</span><strong>Paiement en 3 ou 4 fois</strong></div>
        <div><span>⇢</span><strong>Livraison rapide</strong></div>
        <div><span>↻</span><strong>Retours faciles sous 30 jours</strong></div>
      </div>
      <footer className="site-footer">
        <div className="page-width footer-grid">
          <section><h3>Vous voulez commander ?</h3><Link href="/connexion">Mon compte</Link><Link href="/connexion-pro">Mon compte Pro</Link><Link href="/garage">Choisir mes pièces auto</Link><Link href="/panier">Mon panier</Link></section>
          <section><h3>Infos pratiques</h3><a href="#livraison">Livraison et retours</a><a href="#contact">Nous contacter</a><a href="#faq">Questions fréquentes</a></section>
          <section><h3>Nos catégories</h3>{categories.slice(0, 5).map((category) => <Link key={category.slug} href={`/categories/${category.slug}`}>{category.name}</Link>)}</section>
          <section><h3>Nos engagements</h3><a href="#qualite">Qualité contrôlée</a><a href="#paiement">Paiement sécurisé</a><a href="#retours">Retours sous 30 jours</a></section>
        </div>
        <div className="page-width footer-bottom">Mister Auto · Votre spécialiste pièces auto · © 2026 · Mentions légales · Confidentialité</div>
      </footer>
    </>
  );
}
