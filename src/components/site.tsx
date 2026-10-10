"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { categories } from "@/lib/catalog";
import { trackEvent } from "@/lib/analytics";
import { useStore } from "@/lib/store";
import { NewsletterForm } from "@/components/storefront";

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
            <Link href={account?.kind === "professionnel" ? "/compte" : "/inscription"} className="pro-entry"><strong>{account?.kind === "professionnel" ? "Espace professionnel" : "Vous êtes un PRO ?"}</strong><small>{account?.kind === "professionnel" ? account.company : "Créer mon compte Pro ›"}</small></Link>
          </div>
        </div>
        <nav className="category-nav" aria-label="Catégories produits">
          <div className="page-width nav-inner">
            <Link href="/categories" className={`all-products ${pathname === "/categories" ? "active" : ""}`}>☰ <span>Tous nos produits</span></Link>
            {categories.filter((category) => category.slug !== "pieces-occasion").map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className={pathname.startsWith(`/categories/${category.slug}`) ? "active" : ""}>{category.name}</Link>
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
        <div><span>♧</span><strong>150 experts à votre écoute</strong></div>
        <div><span>▣</span><strong>Paiement en 3 ou 4 fois</strong></div>
        <div><span>⇢</span><strong>Livraison rapide</strong></div>
        <div><span>↻</span><strong>Retours faciles sous 30 jours</strong></div>
      </div>
      <footer className="site-footer">
        <div className="page-width footer-newsletter"><div><strong>La route, en mieux.</strong><span>Nos actualités, offres et conseils auto par e-mail.</span></div><NewsletterForm /></div>
        <div className="page-width footer-grid">
          <section><h3>Besoin d’aide ?</h3><a href="#contact">Nous contacter</a><a href="#faq">Questions fréquentes</a><a href="#livraison">Livraison et retours</a><Link href="/garage">Trouver une pièce compatible</Link><Link href="/panier">Suivre mon panier</Link></section>
          <section><h3>Mon compte</h3><Link href="/connexion">Connexion particulier</Link><Link href="/inscription/particulier">Créer un compte particulier</Link><Link href="/connexion-pro">Espace professionnel</Link><Link href="/inscription/professionnel">Créer un compte Pro</Link><Link href="/garage">Mon garage</Link></section>
          <section><h3>Nos catégories</h3>{categories.map((category) => <Link key={category.slug} href={`/categories/${category.slug}`}>{category.name}</Link>)}</section>
          <section><h3>Nos marques</h3>{["Bosch", "Brembo", "Michelin", "Varta", "Castrol", "Valeo"].map((brand) => <Link key={brand} href={`/recherche?q=${encodeURIComponent(brand)}`}>{brand}</Link>)}</section>
          <section><h3>Mister Auto</h3><a href="#qui-sommes-nous">Qui sommes-nous ?</a><a href="#engagements">Nos engagements</a><a href="#confidentialite">Confidentialité</a><a href="#mentions">Mentions légales</a><Link href="/demo/events">Événements de démonstration</Link></section>
        </div>
        <div className="page-width footer-trust"><span>✓ Paiement sécurisé</span><span>✓ Livraison rapide en France</span><span>✓ Retours sous 30 jours</span><span>ⓘ Démonstration e-commerce locale</span></div>
        <div className="page-width footer-bottom">Mister Auto · Votre spécialiste pièces auto · © {new Date().getFullYear()} · Mentions légales · Politique de confidentialité</div>
      </footer>
    </>
  );
}
