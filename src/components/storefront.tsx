"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { categories, findCategory, findProduct, formatPrice, products, type Product } from "@/lib/catalog";
import { trackEvent } from "@/lib/analytics";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  return (
    <article className="product-card">
      <Link className="product-image" href={`/produit/${product.slug}`} style={{ background: product.color }}>
        <span className="brand-chip">{product.brand}</span>
        <span className="product-illustration" aria-hidden="true">{product.icon}</span>
        <span className="compatibility">✓ Compatible avec votre véhicule</span>
      </Link>
      <div className="product-content">
        <span className="product-reference">Réf. {product.reference}</span>
        <Link href={`/produit/${product.slug}`} className="product-name">{product.name}</Link>
        <div className="rating"><span>★★★★★</span> {product.rating} <small>({product.reviews} avis)</small></div>
        <p className={product.available === false ? "stock unavailable" : "stock"}>● {product.stock}</p>
        <div className="product-buy"><strong>{formatPrice(product.price)}</strong><button className="button button-primary button-small" disabled={product.available === false} onClick={() => addToCart(product)}>{product.available === false ? "Indisponible" : "Ajouter au panier"}</button></div>
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  return <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

export function CategoryTiles() {
  return <div className="category-grid">{categories.map((category) => (
    <Link className="category-tile" key={category.slug} href={`/categories/${category.slug}`}>
      <span className="category-art" style={{ background: category.image, color: category.accent }}><b>{category.icon}</b></span>
      <span className="category-tile-label"><strong>{category.name}</strong><small>{category.eyebrow}</small></span><span className="tile-arrow">↗</span>
    </Link>
  ))}</div>;
}

function VehicleForm() {
  const { vehicle, saveVehicle } = useStore();
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [engine, setEngine] = useState(vehicle?.engine ?? "");
  const [saved, setSaved] = useState(false);
  const makes: Record<string, string[]> = { Renault: ["Clio V", "Captur II", "Mégane IV", "Espace V"], Peugeot: ["208 II", "308 III", "3008 II"], Citroën: ["C3 III", "C4 III", "C5 Aircross"], Volkswagen: ["Golf VIII", "Polo VI", "Tiguan II"] };
  const models = make ? makes[make] ?? [] : [];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!make || !model || !engine) return;
    saveVehicle({ make, model, engine });
    setSaved(true);
  }
  return (
    <form className="vehicle-form" onSubmit={submit}>
      <label>Marque<select required value={make} onChange={(event) => { setMake(event.target.value); setModel(""); setSaved(false); }}><option value="">Choisir une marque</option>{Object.keys(makes).map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Modèle<select required value={model} disabled={!make} onChange={(event) => { setModel(event.target.value); setSaved(false); }}><option value="">Choisir un modèle</option>{models.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Motorisation<select required value={engine} disabled={!model} onChange={(event) => { setEngine(event.target.value); setSaved(false); }}><option value="">Choisir une motorisation</option>{["1.0 TCe 90 ch", "1.5 BlueHDi 110 ch", "1.3 TCe 140 ch", "1.2 PureTech 130 ch"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <button className="button button-primary" type="submit">Valider mon véhicule <span>→</span></button>
      {saved && <p className="success-message">✓ Votre véhicule a été ajouté à votre garage.</p>}
      <small className="privacy-note">Sélection de démonstration enregistrée sur cet appareil.</small>
    </form>
  );
}

export function GaragePage() {
  const { vehicle } = useStore();
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Mon garage</div><div className="garage-layout"><section><span className="eyebrow">LE BON PRODUIT, POUR LA BONNE VOITURE</span><h1>Votre garage automobile</h1><p>Ajoutez votre véhicule pour trouver facilement les pièces compatibles et profiter d’une sélection personnalisée.</p><div className="garage-points"><span>✓ Références compatibles</span><span>✓ Recherche simplifiée</span><span>✓ Votre véhicule sauvegardé</span></div><div className="vehicle-card"><div className="vehicle-card-top"><span className="vehicle-icon large">🚘</span><div><small>VOTRE VÉHICULE PRINCIPAL</small><strong>{vehicle ? `${vehicle.make} ${vehicle.model}` : "Pas encore de véhicule sélectionné"}</strong>{vehicle && <small>{vehicle.engine}</small>}</div></div><VehicleForm /></div></section><aside className="garage-aside"><div className="garage-art">🚘</div><h2>Des pièces compatibles, sans hésiter.</h2><p>Retrouvez uniquement les références adaptées à votre modèle.</p></aside></div><section className="section"><SectionHeading kicker="À DÉCOUVRIR" title="Les catégories préférées des automobilistes" /><CategoryTiles /></section></div>;
}

export function SectionHeading({ kicker, title, action }: { kicker?: string; title: string; action?: { label: string; href: string } }) {
  return <div className="section-heading"><div>{kicker && <span className="eyebrow">{kicker}</span>}<h2>{title}</h2></div>{action && <Link href={action.href} className="text-link">{action.label} →</Link>}</div>;
}

export function HomePage() {
  return <div>
    <section className="hero page-width">
      <div className="hero-copy"><span className="eyebrow">MISTER AUTO, À VOS CÔTÉS SUR LA ROUTE</span><h1>La pièce qu’il vous faut.<br /><span>Au prix qui vous plaît.</span></h1><p>Des milliers de références auto, sélectionnées pour vous et livrées rapidement.</p><Link href="/categories" className="button button-primary">Découvrir nos pièces <span>→</span></Link><div className="hero-proof"><span>★★★★★</span> 4,6/5 · La confiance de nos clients</div></div>
      <div className="hero-visual"><div className="hero-sun" /><div className="hero-road" /><div className="hero-car">🚙</div><div className="hero-sticker">LE BON<br /><strong>CHOIX</strong><br />POUR MA<br />VOITURE</div><div className="hero-caption">L’entretien auto, en toute simplicité</div></div>
    </section>
    <div className="page-width home-vehicle"><div><strong>Identifiez votre véhicule</strong><span> pour ne voir que les pièces compatibles</span></div><Link href="/garage" className="button button-secondary">🚘 {`Choisir mon véhicule`} <span>→</span></Link></div>
    <div className="page-width">
      <section className="section"><SectionHeading kicker="NOS UNIVERS" title="Trouvez tout pour votre auto" action={{ label: "Toutes les catégories", href: "/categories" }} /><CategoryTiles /></section>
      <section className="promo-banner"><div><span className="eyebrow">LES ESSENTIELS AUTO</span><h2>Votre prochaine révision ?<br /><span>On vous équipe.</span></h2><p>Huiles moteur, filtres, freinage : les bons produits pour repartir l’esprit léger.</p><Link href="/categories/huile-moteur" className="button button-primary">Voir les indispensables →</Link></div><div className="promo-illustration">🛠️<span>⚙️</span></div></section>
      <section className="section"><SectionHeading kicker="LES CHOIX DE LA COMMUNAUTÉ" title="Nos meilleures ventes" action={{ label: "Voir tout le catalogue", href: "/categories" }} /><ProductGrid items={products.slice(0, 4)} /></section>
      <section className="trust-row"><div><strong>01</strong><h3>À vos côtés</h3><p>Des experts pour vous guider dans le choix de vos pièces.</p></div><div><strong>02</strong><h3>Au meilleur prix</h3><p>Des marques reconnues et des offres toute l’année.</p></div><div><strong>03</strong><h3>Livrés chez vous</h3><p>Un suivi fiable et des retours simples sous 30 jours.</p></div></section>
      <section className="section"><SectionHeading kicker="TOUT POUR L’ENTRETIEN" title="Un véhicule bien entretenu, c’est essentiel" /><p className="editorial-copy">Retrouvez une large sélection de pièces et d’accessoires pour entretenir votre véhicule en toute confiance. Choisissez votre véhicule pour identifier rapidement les références compatibles et profiter de nos conseils.</p><div className="brand-row">{["BOSCH", "BREMBO", "MICHELIN", "VARTA", "CASTROL", "VALEO", "MANN-FILTER"].map((brand) => <span key={brand}>{brand}</span>)}</div></section>
    </div>
  </div>;
}

export function CategoriesPage() {
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Catégories</div><span className="eyebrow">TOUS NOS UNIVERS AUTO</span><h1>Quelles pièces recherchez-vous ?</h1><p className="page-intro">Trouvez la bonne pièce parmi nos catégories, puis filtrez par marque, prix et disponibilité.</p><CategoryTiles /></div>;
}

export function ListingPage({ slug, query }: { slug?: string; query?: string }) {
  const category = slug ? findCategory(slug) : undefined;
  const [sort, setSort] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(250);
  const [brandFilter, setBrandFilter] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);
  const items = useMemo(() => {
    const search = query?.toLocaleLowerCase("fr");
    const filtered = products.filter((product) => (!slug || product.category === slug) && (!search || `${product.name} ${product.brand} ${product.reference}`.toLocaleLowerCase("fr").includes(search)) && product.price <= maxPrice && (!brandFilter || product.brand === brandFilter) && (!inStockOnly || product.available !== false));
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [slug, query, sort, maxPrice, brandFilter, inStockOnly]);
  useEffect(() => {
    trackEvent({ type: "productListView", category: category?.name ?? query ?? "Catalogue", productIds: items.map((product) => product.id) });
  }, [slug, query, category?.name, items]);
  const brands = [...new Set(products.filter((product) => !slug || product.category === slug).map((product) => product.brand))];
  return <div className="page-width section-page">
    <div className="breadcrumb"><Link href="/">Accueil</Link> / {query ? "Recherche" : "Pièces auto"} {category && `/ ${category.name}`}</div>
    {category && <div className="listing-hero" style={{ background: category.image }}><div><span className="eyebrow">{category.eyebrow}</span><h1>{category.name}</h1><p>{category.description}</p></div><span className="listing-hero-icon">{category.icon}</span></div>}
    {!category && <><span className="eyebrow">PIÈCES ET ACCESSOIRES AUTO</span><h1>{query ? `Résultats pour « ${query} »` : "Toutes nos pièces auto"}</h1><p className="page-intro">{query ? `${items.length} résultat${items.length > 1 ? "s" : ""} dans notre catalogue.` : "Des pièces sélectionnées pour entretenir votre véhicule."}</p></>}
    <div className="listing-toolbar"><strong>{items.length} produit{items.length > 1 ? "s" : ""}</strong><label>Trier par <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Popularité</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></select></label></div>
    <div className="listing-layout"><aside className="filters"><h2>Affiner ma recherche</h2><div><strong>Prix maximum</strong><input aria-label="Prix maximum" type="range" min="15" max="250" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><span>Jusqu’à {formatPrice(maxPrice)}</span></div><div><strong>Marque</strong><select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="">Toutes les marques</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></div><div><strong>Disponibilité</strong><label className="check-label"><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} /> En stock uniquement</label></div><button className="clear-filter" onClick={() => { setMaxPrice(250); setBrandFilter(""); setSort("popular"); setInStockOnly(false); }}>Effacer les filtres</button></aside>
      <div>{items.length ? <ProductGrid items={items} /> : <div className="empty-state"><h2>Aucun produit trouvé</h2><p>Modifiez vos filtres ou essayez une autre recherche.</p><Link className="button button-secondary" href="/categories">Voir les catégories</Link></div>}</div>
    </div>
  </div>;
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const { addToCart } = useStore();
  const product = findProduct(slug);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (product) {
      trackEvent({ type: "productView", productId: product.id, name: product.name, price: product.price });
    }
  }, [product, slug]);
  if (!product) return <div className="page-width section-page"><h1>Produit introuvable</h1><Link href="/categories">Retour au catalogue</Link></div>;
  const category = findCategory(product.category);
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / <Link href={`/categories/${product.category}`}>{category?.name}</Link> / {product.name}</div><div className="detail-layout"><div className="detail-image" style={{ background: product.color }}><span className="brand-chip">{product.brand}</span><span>{product.icon}</span></div><div className="detail-info"><span className="eyebrow">{category?.name} · Réf. {product.reference}</span><h1>{product.name}</h1><div className="rating"><span>★★★★★</span> {product.rating} <small>({product.reviews} avis clients)</small></div><p className="detail-description">{product.description}</p><div className="compatibility-box"><span>✓</span><div><strong>Compatibilité à vérifier</strong><p>Identifiez votre véhicule pour confirmer que cette pièce est adaptée.</p><Link href="/garage">Sélectionner mon véhicule →</Link></div></div><p className={product.available === false ? "stock unavailable detail-stock" : "stock detail-stock"}>● {product.stock}</p><div className="detail-price">{formatPrice(product.price)} <small>TTC</small></div><button className="button button-primary detail-add" disabled={product.available === false} onClick={() => { addToCart(product); setAdded(true); }}>{product.available === false ? "Temporairement indisponible" : added ? "✓ Ajouté au panier" : "Ajouter au panier"} {product.available !== false && <span>→</span>}</button><p className="delivery-note">↗ Paiement sécurisé · Retours sous 30 jours</p></div></div><section className="section"><SectionHeading title="Vous aimerez aussi" /><ProductGrid items={products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)} /></section></div>;
}

export function CartPage() {
  const { cart, setQuantity, removeFromCart } = useStore();
  const [promo, setPromo] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const lines = cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) })).filter((line): line is typeof line & { product: Product } => Boolean(line.product));
  const articleCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const delivery = subtotal >= 59 || subtotal === 0 ? 0 : 5.9;
  function applyPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accepted = promo.trim().toUpperCase() === "BIENVENUE10";
    setPromoApplied(accepted);
    setPromoMessage(accepted ? "Code accepté : remise de 10 % appliquée." : "Code non reconnu. Essayez BIENVENUE10.");
  }
  if (!lines.length) return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Mon panier</div><div className="empty-state"><span className="empty-icon">🛒</span><h1>Votre panier est vide</h1><p>Découvrez notre sélection de pièces pour votre véhicule.</p><Link className="button button-primary" href="/categories">Continuer mes achats →</Link></div></div>;
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Mon panier</div><h1>Votre panier <span className="subtle">({articleCount} article{articleCount !== 1 ? "s" : ""})</span></h1><div className="cart-layout"><section className="cart-items">{lines.map((line) => <article className="cart-line" key={line.productId}><div className="cart-product-art" style={{ background: line.product.color }}>{line.product.icon}</div><div className="cart-line-info"><Link href={`/produit/${line.product.slug}`}><strong>{line.product.name}</strong></Link><small>Réf. {line.product.reference}</small><span className="stock">● {line.product.stock}</span><button className="remove-link" onClick={() => removeFromCart(line.productId)}>Supprimer</button></div><div className="quantity-control"><button aria-label="Diminuer" onClick={() => setQuantity(line.productId, line.quantity - 1)}>−</button><span>{line.quantity}</span><button aria-label="Augmenter" onClick={() => setQuantity(line.productId, line.quantity + 1)}>+</button></div><strong className="line-price">{formatPrice(line.product.price * line.quantity)}</strong></article>)}<Link href="/categories" className="text-link">← Continuer mes achats</Link></section><aside className="order-card"><h2>Votre commande</h2><form className="promo-form" onSubmit={applyPromo}><label htmlFor="promo">Vous avez un code promo ?</label><div><input id="promo" value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Code promo" /><button className="button button-secondary">Appliquer</button></div>{promoMessage && <small>{promoMessage}</small>}</form><div className="order-row"><span>Sous-total</span><strong>{formatPrice(subtotal)}</strong></div>{discount > 0 && <div className="order-row"><span>Remise BIENVENUE10</span><strong>− {formatPrice(discount)}</strong></div>}<div className="order-row"><span>Livraison estimée</span><strong>{delivery === 0 ? "Offerte" : formatPrice(delivery)}</strong></div><div className="order-total"><strong>Total TTC</strong><strong>{formatPrice(subtotal - discount + delivery)}</strong></div><button className="button button-primary checkout-button" onClick={() => window.alert("La validation de commande est simulée dans cette démo.")}>Continuer ma commande →</button><small className="demo-note">Démo : aucune commande ni aucun paiement réel ne sera effectué.</small></aside></div></div>;
}

export function AuthPage({ professional = false }: { professional?: boolean }) {
  const { signIn, account, signOut } = useStore();
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    signIn({
      firstName: String(form.get("firstName") ?? "Alexandre"),
      lastName: String(form.get("lastName") ?? "Martin"),
      email: String(form.get("email") ?? ""),
      kind: professional ? "professionnel" : "particulier",
      ...(professional ? { company: String(form.get("company") ?? "") } : {}),
    });
    setMessage("Votre session de démonstration est ouverte.");
  }
  if (account) return <div className="page-width section-page"><div className="auth-card account-summary"><span className="eyebrow">MON ESPACE</span><h1>Bonjour {account.firstName} !</h1><p>Connecté en tant que {account.kind === "professionnel" ? "professionnel" : "particulier"} · {account.email}</p>{account.company && <p>Entreprise : {account.company}</p>}<p className="demo-note">Compte de démonstration — aucune donnée de mot de passe n’est conservée.</p><div className="auth-links"><Link className="button button-secondary" href="/garage">Mon garage</Link><Link className="button button-secondary" href="/panier">Mon panier</Link><button className="button button-primary" onClick={() => { signOut(); setMessage(""); }}>Déconnexion</button></div></div></div>;
  return <div className="page-width section-page auth-page"><section className="auth-card"><span className="eyebrow">{professional ? "ESPACE PROFESSIONNEL" : "ESPACE CLIENT"}</span><h1>{professional ? "Bienvenue dans votre espace Pro" : register ? "Créer mon compte" : "Ravi de vous revoir !"}</h1><p>{professional ? "Accédez aux offres et services réservés aux professionnels de l’automobile." : "Connectez-vous à votre compte pour retrouver vos commandes et véhicules."}</p><div className="auth-tabs"><Link className={!professional ? "selected" : ""} href="/connexion">Particulier</Link><Link className={professional ? "selected" : ""} href="/connexion-pro">Professionnel</Link></div><div className="auth-switch"><button className={!register ? "selected" : ""} onClick={() => setRegister(false)}>Connexion</button><button className={register ? "selected" : ""} onClick={() => setRegister(true)}>Créer un compte</button></div><form className="auth-form" onSubmit={submit}>
    {register && <div className="form-two"><label>Prénom<input required name="firstName" autoComplete="given-name" /></label><label>Nom<input required name="lastName" autoComplete="family-name" /></label></div>}
    <label>{professional ? "E-mail professionnel" : "Adresse e-mail"}<input required type="email" name="email" autoComplete="email" /></label>
    {register && professional && <><label>Nom de l’entreprise<input required name="company" /></label><label>SIRET<input required name="siret" inputMode="numeric" pattern="[0-9]{14}" title="Le SIRET doit contenir 14 chiffres." minLength={14} maxLength={14} /></label><label>Activité professionnelle<select required name="activity"><option value="">Sélectionner une activité</option><option>Garage / réparateur</option><option>Carrosserie</option><option>Revendeur de pièces auto</option><option>Autre professionnel automobile</option></select></label><label>Téléphone<input required type="tel" name="phone" /></label></>}
    <label>Mot de passe<input required type="password" name="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} /></label>
    {register && <div className="consent-fields"><label><input type="checkbox" /> Je souhaite recevoir les offres et actualités (facultatif).</label><label><input required type="checkbox" /> J’accepte les conditions générales.</label></div>}
    {!register && <a className="forgot-link" href="#mot-de-passe">Mot de passe oublié ?</a>}
    <button className="button button-primary auth-submit">{register ? "Créer mon compte" : "Me connecter"} <span>→</span></button>
    {message && <p className="success-message">{message}</p>}
  </form><div className="demo-disclaimer"><strong>Compte de démonstration</strong><p>Ce formulaire simule une connexion locale. Ne saisissez pas de vrai mot de passe : aucun identifiant n’est envoyé ni stocké.</p></div></section></div>;
}

export function NotFoundPage() {
  return <div className="page-width section-page empty-state"><h1>Cette page n’existe pas</h1><Link href="/" className="button button-primary">Retour à l’accueil</Link></div>;
}
