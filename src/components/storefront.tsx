"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, useId, type FormEvent } from "react";
import { categories, findCategory, findCategoryType, findProduct, formatPrice, listedProducts, products, type Category, type Product } from "@/lib/catalog";
import { trackEvent } from "@/lib/analytics";
import { track } from "@/lib/track";
import { isSupabaseConfigured, storeLocalUser, supabaseAuthAdapter } from "@/lib/auth";
import { validateVehicleSelection, vehicleCatalog, vehicleMileageOptions } from "@/lib/vehicles";
import { useStore, type Vehicle } from "@/lib/store";
import { Icon } from "@/components/icon";

export function ProductCard({ product, layout = "standard" }: { product: Product; layout?: "standard" | "battery" }) {
  const { addToCart, vehicle } = useStore();
  const [compared, setCompared] = useState(false);
  const [added, setAdded] = useState(false);
  const unavailable = product.available === false || product.price === null;
  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [added]);
  function addProduct() {
    if (unavailable) return;
    addToCart(product);
    setAdded(true);
  }
  if (layout === "battery") {
    return (
      <article className="product-card battery-product-card">
        <div className="battery-product-main">
          <Link className="battery-product-image" href={`/produit/${product.slug}`}>
            {product.image
              ? <Image unoptimized src={product.image} alt={product.imageAlt} width={110} height={110} sizes="(max-width: 680px) 100px, 110px" />
              : <span aria-hidden="true">{product.icon}</span>}
          </Link>
          <div className="battery-product-info">
            <span className="battery-brand">{product.brand}</span>
            <Link href={`/produit/${product.slug}`} className="battery-product-name">{product.name}</Link>
            <span className="product-reference">{product.reference === "Non indiquée" ? "Référence non indiquée" : `Réf. ${product.reference}`}</span>
            {product.tags.includes("À saisir") && <span className="battery-promotion-tag">À saisir</span>}
            {product.reviews > 0 && <div className="rating"><span>★★★★★</span> <small>{product.reviews} avis</small></div>}
            <p className={product.available === false ? "stock unavailable" : "stock"}>✓ {product.stock}</p>
            <strong className="battery-product-price">{formatPrice(product.price)} <small>TTC</small></strong>
          </div>
        </div>
        <div className="battery-product-actions">
          <button className={compared ? "battery-compare selected" : "battery-compare"} type="button" aria-pressed={compared} onClick={() => setCompared((selected) => !selected)}>
            <span aria-hidden="true">{compared ? "✓" : "□"}</span> {compared ? "Sélectionné" : "Comparer"}
          </button>
          <button className="button button-primary button-small" disabled={unavailable} aria-label={`Ajouter ${product.name} au panier`} onClick={addProduct}>
            {unavailable ? "Indisponible" : added ? "Ajouté au panier" : "Ajouter au panier"}
          </button>
        </div>
        <span className="visually-hidden" role="status">{added ? `${product.name} ajouté au panier.` : ""}</span>
      </article>
    );
  }
  return (
    <article className="product-card standard-product-card">
      <Link className="product-image" href={`/produit/${product.slug}`}>
        <span className="brand-chip">{product.brand}</span>
        {product.image
          ? <Image className="product-photo" unoptimized src={product.image} alt={product.imageAlt} fill sizes="(max-width: 680px) 50vw, (max-width: 1000px) 33vw, 25vw" />
          : <Image className="product-photo" src="/images/products/product-unavailable.svg" alt="Visuel non disponible" fill sizes="(max-width: 680px) 50vw, 25vw" />}
      </Link>
      <div className="product-content">
        <span className="product-reference">Réf. {product.reference}</span>
        <Link href={`/produit/${product.slug}`} className="product-name">{product.name}</Link>
        {product.reviews > 0
          ? <div className="rating"><span aria-hidden="true">★</span> {product.rating.toLocaleString("fr-FR")}/5 <small>({product.reviews} avis)</small></div>
          : <div className="rating" aria-hidden="true" />}
        <p className="compatibility"><Icon name="car" />{vehicle ? "Compatibilité à confirmer" : "Ajoutez votre véhicule pour vérifier"}</p>
        <p className={product.available === false ? "stock unavailable" : "stock"}>{product.available !== false && <Icon name="check" />}{product.stock}</p>
        <div className="product-buy"><strong>{formatPrice(product.price)}</strong><button className="button button-primary button-small" disabled={unavailable} aria-label={`Ajouter ${product.name} au panier`} onClick={addProduct}>{added ? <Icon name="check" /> : <Icon name="cart" />}{unavailable ? "Indisponible" : added ? "Ajouté" : "Ajouter au panier"}</button></div>
        <span className="visually-hidden" role="status">{added ? `${product.name} ajouté au panier.` : ""}</span>
      </div>
    </article>
  );
}

export function ProductGrid({ items, layout = "standard" }: { items: Product[]; layout?: "standard" | "battery" }) {
  return <div className={`product-grid${layout === "battery" ? " battery-product-grid" : ""}`}>{items.map((product) => <ProductCard key={product.id} product={product} layout={layout} />)}</div>;
}

export function CategoryTiles() {
  return <div className="category-grid">{categories.map((category) => {
    const product = listedProducts.find((item) => item.category === category.slug && item.imageStatus === "matched");
    return (
      <Link className="category-tile" key={category.slug} href={`/categories/${category.slug}`}>
        <span className="category-art">{product?.image
          ? <Image unoptimized src={product.image} alt="" width={100} height={100} sizes="100px" />
          : <Icon name={category.slug === "chaines-neige" ? "snow" : "recycle"} />}</span>
        <span className="category-tile-label"><strong>{category.name}</strong><small>{category.eyebrow}</small></span><Icon name="arrow" className="tile-arrow" />
      </Link>
    );
  })}</div>;
}

export function CategoryTypes({ category }: { category: Category }) {
  return <div className="category-type-grid">{category.types.map((type) => (
    <Link className="category-type-card" href={`/categories/${category.slug}/${type.slug}`} key={type.slug}>
      <span><strong>{type.name}</strong><small>{type.description}</small></span>
      <span className="type-count">{listedProducts.filter((product) => product.categoryType === type.slug).length} références <b>→</b></span>
    </Link>
  ))}</div>;
}

function VehicleForm({ editingVehicle, onSaved }: { editingVehicle: Vehicle | null; onSaved: () => void }) {
  const { saveVehicle } = useStore();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [engine, setEngine] = useState("");
  const [registration, setRegistration] = useState("");
  const [mileage, setMileage] = useState("");
  const [inspectionMonth, setInspectionMonth] = useState("");
  const [inspectionYear, setInspectionYear] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (notice && !editingVehicle) track("ma_vehicleAdded");
  }, [editingVehicle, notice]);
  const selectedMake = vehicleCatalog.find((candidate) => candidate.make === make);
  const models = selectedMake?.models ?? [];
  const selectedModel = models.find((candidate) => candidate.name === model);
  const engines = selectedModel?.engines ?? [];
  const years = Array.from({ length: 30 }, (_, index) => String(new Date().getFullYear() - index));

  useEffect(() => {
    setMake(editingVehicle?.make ?? "");
    setModel(editingVehicle?.model ?? "");
    setEngine(editingVehicle?.engine ?? "");
    setRegistration(editingVehicle?.registration ?? "");
    setMileage(editingVehicle?.mileage ?? "");
    const [year = "", month = ""] = editingVehicle?.lastInspection?.split("-") ?? [];
    setInspectionMonth(month);
    setInspectionYear(year);
    setNotice("");
    setError("");
  }, [editingVehicle]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMake || !selectedModel || !selectedModel.engines.some((item) => item === engine)) return;
    if (Boolean(inspectionMonth) !== Boolean(inspectionYear)) {
      setError("Sélectionnez le mois et l’année du dernier contrôle technique.");
      return;
    }
    const selectedMileage = vehicleMileageOptions.find((item) => item.value === mileage)?.value;
    if (mileage && !selectedMileage) {
      setError("Sélectionnez une tranche de kilométrage proposée.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const validated = await validateVehicleSelection({
        make: selectedMake.make,
        model,
        engine,
        ...(registration.trim() ? { registration: registration.trim().toUpperCase() } : {}),
        ...(selectedMileage ? { mileage: selectedMileage } : {}),
        ...(inspectionMonth && inspectionYear ? { lastInspection: `${inspectionYear}-${inspectionMonth}` } : {}),
      });
      saveVehicle({ ...validated, ...(editingVehicle ? { id: editingVehicle.id } : {}) });
      setNotice(editingVehicle ? "Les informations du véhicule ont été mises à jour." : "Le véhicule a été ajouté à votre garage.");
      if (!editingVehicle) {
        setMake("");
        setModel("");
        setEngine("");
        setRegistration("");
        setMileage("");
        setInspectionMonth("");
        setInspectionYear("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="vehicle-form" onSubmit={submit}>
      <label>Marque<select required value={make} onChange={(event) => { setMake(event.target.value); setModel(""); setEngine(""); setNotice(""); }}><option value="">Choisir une marque</option>{vehicleCatalog.map((item) => <option key={item.make}>{item.make}</option>)}</select></label>
      <label>Modèle<select required value={model} disabled={!make} onChange={(event) => { setModel(event.target.value); setEngine(""); setNotice(""); }}><option value="">Choisir un modèle</option>{models.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
      <label>Motorisation<select required value={engine} disabled={!model} onChange={(event) => { setEngine(event.target.value); setNotice(""); }}><option value="">Choisir une motorisation</option>{engines.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Kilométrage<select value={mileage} onChange={(event) => setMileage(event.target.value)}><option value="">Sélectionner une tranche (facultatif)</option>{vehicleMileageOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <fieldset className="vehicle-inspection"><legend>Dernier contrôle technique <span className="optional-label">(facultatif)</span></legend><label><span className="visually-hidden">Mois du contrôle technique</span><select aria-label="Mois du contrôle technique" value={inspectionMonth} onChange={(event) => setInspectionMonth(event.target.value)}><option value="">Mois</option>{Array.from({ length: 12 }, (_, index) => { const value = String(index + 1).padStart(2, "0"); return <option key={value} value={value}>{value}</option>; })}</select></label><label><span className="visually-hidden">Année du contrôle technique</span><select aria-label="Année du contrôle technique" value={inspectionYear} onChange={(event) => setInspectionYear(event.target.value)}><option value="">Année</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label></fieldset>
      <label className="vehicle-registration">Immatriculation <span className="optional-label">(facultatif)</span><input value={registration} onChange={(event) => setRegistration(event.target.value.toUpperCase())} placeholder="AA-123-AA" maxLength={9} autoComplete="off" /></label>
      <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Vérification…" : editingVehicle ? "Enregistrer les modifications" : "Ajouter ce véhicule"} <span>→</span></button>
      {editingVehicle && <button className="text-link vehicle-cancel-edit" type="button" onClick={onSaved}>Annuler la modification</button>}
      {notice && <p className="success-message" role="status">✓ {notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <small className="privacy-note">Ces informations servent à personnaliser votre garage sur cet appareil. Aucune recherche d’immatriculation ni compatibilité réelle n’est effectuée.</small>
    </form>
  );
}

export function GaragePage() {
  const { vehicle, vehicles, setPrimaryVehicle, removeVehicle } = useStore();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Mon garage</div><div className="garage-layout"><section><span className="eyebrow">LE BON PRODUIT, POUR LA BONNE VOITURE</span><h1>Votre garage automobile</h1><p>Renseignez les caractéristiques de votre voiture pour retrouver votre sélection et vos informations d’entretien.</p><div className="garage-points"><span>✓ Marque, modèle et motorisation</span><span>✓ Kilométrage et contrôle technique</span><span>✓ Plusieurs véhicules sauvegardés</span></div>
      {vehicles.length > 0 && <section className="garage-saved"><h2>Mes véhicules ({vehicles.length})</h2>{vehicles.map((savedVehicle) => {
        const mileageLabel = vehicleMileageOptions.find((item) => item.value === savedVehicle.mileage)?.label;
        const inspectionLabel = savedVehicle.lastInspection ? `${savedVehicle.lastInspection.slice(5, 7)}/${savedVehicle.lastInspection.slice(0, 4)}` : null;
        return <article className="garage-saved-item" key={savedVehicle.id}><span className="vehicle-icon">🚘</span><span><strong>{savedVehicle.make} {savedVehicle.model}</strong><small>{savedVehicle.engine}{savedVehicle.registration ? ` · ${savedVehicle.registration}` : ""}{mileageLabel ? ` · ${mileageLabel}` : ""}{inspectionLabel ? ` · Contrôle : ${inspectionLabel}` : ""}</small></span><div className="garage-saved-actions">{vehicle?.id === savedVehicle.id ? <b className="primary-label">Véhicule principal</b> : <button className="text-link" onClick={() => setPrimaryVehicle(savedVehicle.id)}>Définir principal</button>}<button className="text-link" onClick={() => setEditingVehicle(savedVehicle)}>Modifier</button><button className="remove-link" onClick={() => { removeVehicle(savedVehicle.id); if (editingVehicle?.id === savedVehicle.id) setEditingVehicle(null); }} aria-label={`Supprimer ${savedVehicle.make} ${savedVehicle.model}`}>Supprimer</button></div></article>;
      })}</section>}
      <div className="vehicle-card"><div className="vehicle-card-top"><span className="vehicle-icon large">🚘</span><div><small>{editingVehicle ? "MODIFIER UN VÉHICULE" : "AJOUTER UN VÉHICULE"}</small><strong>{editingVehicle ? `${editingVehicle.make} ${editingVehicle.model}` : "Mon véhicule principal"}</strong><small>Les données de compatibilité restent à confirmer en conditions réelles.</small></div></div><VehicleForm editingVehicle={editingVehicle} onSaved={() => setEditingVehicle(null)} /></div></section><aside className="garage-aside"><div className="garage-art">🚘</div><h2>Des pièces adaptées à votre véhicule.</h2><p>Enregistrez plusieurs véhicules, leur kilométrage et la date du dernier contrôle technique.</p></aside></div><section className="section"><SectionHeading kicker="À DÉCOUVRIR" title="Les catégories préférées des automobilistes" /><CategoryTiles /></section></div>;
}

export function SectionHeading({ kicker, title, action }: { kicker?: string; title: string; action?: { label: string; href: string } }) {
  return <div className="section-heading"><div>{kicker && <span className="eyebrow">{kicker}</span>}<h2>{title}</h2></div>{action && <Link href={action.href} className="text-link">{action.label} →</Link>}</div>;
}

export function HomePage() {
  const { vehicle } = useStore();
  const popular = listedProducts.filter((product) => ["reference-plaquette-delphi-lp3302", "battery-bol-m040002", "reference-pneu-goodyear-efficientgrip-528503", "reference-huile-mannol-legend-mn7730-5"].includes(product.id));
  const seasonal = listedProducts.filter((product) => ["reference-pneu-goodyear-efficientgrip-528503", "reference-pneu-michelin-energy-saver-771116", "battery-bol-m040002", "reference-pneu-dunlop-bluresponse-528520"].includes(product.id));
  const heroProducts = ["reference-huile-mannol-legend-mn7730-5", "battery-bol-m040002", "reference-pneu-goodyear-efficientgrip-528503"]
    .flatMap((id) => popular.filter((product) => product.id === id));
  return <div className="home-page">
    <section className="hero page-width">
      <div className="hero-copy"><h1>Les bons produits auto,<br /><span>au bon moment.</span></h1><p>Des milliers de références, des marques reconnues et des conseils pour entretenir votre véhicule.</p><div className="hero-actions"><Link href="/categories" className="button button-primary">Découvrir nos pièces <Icon name="arrow" /></Link><Link href="/garage" className="text-link">Mon garage <Icon name="arrow" /></Link></div><div className="hero-proof"><span aria-hidden="true">★★★★★</span><span>4,6/5 · La confiance de nos clients</span></div></div>
      <div className="hero-products" role="group" aria-label="Une sélection de nos meilleures ventes">{heroProducts.map((product) => (
        <Link key={product.id} className={`hero-product hero-product-${product.category}`} href={`/produit/${product.slug}`} aria-label={`Découvrir ${product.name}`}>
          {product.image && <Image unoptimized src={product.image} alt="" width={280} height={280} priority={product.category === "pneus"} sizes="(max-width: 680px) 30vw, 260px" />}
          <span><strong>{product.brand}</strong><small>{categories.find((category) => category.slug === product.category)?.name}</small><Icon name="arrow" /></span>
        </Link>
      ))}</div>
    </section>
    <section className="page-width vehicle-banner" aria-labelledby="home-vehicle-title"><span className="vehicle-banner-icon"><Icon name="car" /></span><div><h2 id="home-vehicle-title">{vehicle ? `${vehicle.make} ${vehicle.model}` : "La bonne pièce commence par votre véhicule."}</h2><p>{vehicle ? vehicle.engine : "Retrouvez votre marque, votre modèle et votre motorisation dans votre garage."}</p><small>La compatibilité des pièces reste à confirmer.</small></div><Link href="/garage" className="button button-secondary">{vehicle ? "Gérer mon garage" : "Choisir mon véhicule"} <Icon name="arrow" /></Link></section>
    <div className="page-width">
      <section className="section"><SectionHeading title="Trouvez tout pour votre auto" action={{ label: "Toutes les catégories", href: "/categories" }} /><CategoryTiles /></section>
      <section className="section banner-section"><SectionHeading title="Des offres pour prendre soin de votre voiture" /><Link className="full-banner-link" href="/categories/huile-moteur"><Image src="/images/optimized/banners/home/maintenance-offers.webp" alt="Offres Mister Auto sur les produits d’entretien et l’huile moteur" width={1916} height={447} sizes="(max-width: 680px) 100vw, 1180px" /></Link></section>
      <section className="section"><SectionHeading title="Nos meilleures ventes" action={{ label: "Voir tout le catalogue", href: "/categories" }} /><ProductGrid items={popular} /></section>
      <section className="section banner-section"><SectionHeading title="Nos sélections de saison" action={{ label: "Préparer mon véhicule", href: "/garage" }} /><Link className="full-banner-link" href="/categories/pneus"><Image src="/images/optimized/banners/home/seasonal-selection.webp" alt="Sélection de produits auto de saison et équipements pour la route" width={1151} height={305} sizes="(max-width: 680px) 100vw, 1180px" /></Link><div className="seasonal-products"><ProductGrid items={seasonal} /></div></section>
      <div className="home-promo-grid"><Link className="full-banner-link" href="/categories/chaines-neige"><Image src="/images/optimized/banners/home/sachs-promotion.webp" alt="Offre promotionnelle sur une sélection de pièces auto Sachs" width={1906} height={444} sizes="(max-width: 680px) 100vw, 580px" /></Link><Link className="full-banner-link" href="/categories/accessoires"><Image src="/images/optimized/banners/home/app-services.webp" alt="Découvrez les services pratiques de l’application Mister Auto" width={1904} height={436} sizes="(max-width: 680px) 100vw, 580px" /></Link></div>
      <section className="trust-row"><div><Icon name="headset" /><h3>À vos côtés</h3><p>Des experts pour vous guider dans le choix de vos pièces.</p></div><div><Icon name="shield" /><h3>Au meilleur prix</h3><p>Des marques reconnues et des offres toute l’année.</p></div><div><Icon name="truck" /><h3>Livrés chez vous</h3><p>Un suivi fiable, paiement sécurisé et retours simples sous 30 jours.</p></div></section>
      <section className="section"><SectionHeading title="Un véhicule bien entretenu, c’est essentiel" /><p className="editorial-copy">Retrouvez une large sélection de pièces et d’accessoires pour entretenir votre véhicule en toute confiance. Consultez nos conseils, comparez les références et choisissez votre véhicule pour identifier les produits à vérifier.</p><div className="brand-row">{["BOSCH", "BREMBO", "MICHELIN", "VARTA", "CASTROL", "VALEO", "MANN-FILTER"].map((brand) => <span key={brand}>{brand}</span>)}</div><div className="advice-cards"><article><span>ENTRETIEN</span><h3>Quand faut-il changer son huile moteur ?</h3><p>Les bons repères pour planifier votre prochaine vidange.</p><Link href="/categories/huile-moteur">Voir les huiles moteur  →</Link></article><article><span>SÉCURITÉ</span><h3>Freinage : les signes à surveiller</h3><p>Reconnaître les symptômes d’usure et choisir ses pièces.</p><Link href="/categories/freinage">Découvrir le freinage →</Link></article><article><span>CONSEIL</span><h3>Préparez votre voiture pour l’hiver</h3><p>Pneus, batterie et équipement : anticipez les changements de saison.</p><Link href="/categories/chaines-neige">Voir les équipements hiver →</Link></article></div></section>
      <section className="home-newsletter"><div><h2>Nos conseils et bons plans, dans votre boîte mail.</h2><p>Recevez les offres et conseils auto. Désinscription possible à tout moment.</p></div><NewsletterForm /></section>
    </div>
  </div>;
}

export function NewsletterForm() {
  const emailId = useId();
  const consentId = useId();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingNewsletterTrack, setPendingNewsletterTrack] = useState(false);
  useEffect(() => {
    if (!pendingNewsletterTrack) return;
    track("ma_newsletter");
    setPendingNewsletterTrack(false);
  }, [pendingNewsletterTrack]);
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), consent: form.get("consent") === "on" }),
      });
      const result = await response.json() as { message?: string; error?: string; alreadySubscribed?: boolean };
      if (!response.ok) throw new Error(result.error ?? "Votre inscription n’a pas pu être enregistrée.");
      setMessage(result.message ?? "Merci pour votre inscription.");
      if (!result.alreadySubscribed) {
        trackEvent({ type: "newsletterSubscribe" });
        setPendingNewsletterTrack(true);
      }
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSending(false);
    }
  }
  return <form className="newsletter-form" onSubmit={subscribe}><label htmlFor={emailId}>Votre adresse e-mail</label><div className="newsletter-input"><input id={emailId} type="email" name="email" required autoComplete="email" placeholder="vous@exemple.fr" /><button className="button button-primary" disabled={sending}>{sending ? "Envoi…" : "M’inscrire"}</button></div><label className="newsletter-consent" htmlFor={consentId}><input id={consentId} name="consent" type="checkbox" required /> J’accepte de recevoir des actualités par e-mail.</label>{message && <p className="newsletter-message" role="status">{message}</p>}</form>;
}

export function CategoriesPage() {
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Catégories</div><span className="eyebrow">TOUS NOS UNIVERS AUTO</span><h1>Quelles pièces recherchez-vous ?</h1><p className="page-intro">Trouvez la bonne pièce parmi nos catégories, puis filtrez par marque, prix et disponibilité.</p><CategoryTiles /></div>;
}

export function ListingPage({ slug, typeSlug, query }: { slug?: string; typeSlug?: string; query?: string }) {
  const category = slug ? findCategory(slug) : undefined;
  const categoryType = typeSlug ? findCategoryType(typeSlug) : undefined;
  const [sort, setSort] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [brandFilter, setBrandFilter] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [batteryStartStop, setBatteryStartStop] = useState(false);
  const [batteryAmperage, setBatteryAmperage] = useState("");
  const [batteryStartingCurrent, setBatteryStartingCurrent] = useState("");
  const [batteryTechnology, setBatteryTechnology] = useState("");
  const [batteryMinimumRating, setBatteryMinimumRating] = useState(0);
  const { vehicle } = useStore();
  const items = useMemo(() => {
    const search = query?.toLocaleLowerCase("fr");
    const validCategoryType = !typeSlug || categoryType?.category === slug;
    const filtered = listedProducts.filter((product) => validCategoryType && (!slug || product.category === slug) && (!typeSlug || product.categoryType === typeSlug) && (!search || `${product.name} ${product.brand} ${product.reference}`.toLocaleLowerCase("fr").includes(search)) && (product.price === null || product.price <= maxPrice) && (!brandFilter || product.brand === brandFilter) && (!inStockOnly || product.available !== false) && (!batteryStartStop || product.tags.includes("Start & Stop")) && (!batteryAmperage || product.tags.includes(batteryAmperage)) && (!batteryStartingCurrent || product.tags.includes(batteryStartingCurrent)) && (!batteryTechnology || product.tags.includes(batteryTechnology)) && (!batteryMinimumRating || product.rating >= batteryMinimumRating));
    if (sort === "price-asc") filtered.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
    if (sort === "price-desc") filtered.sort((a, b) => (b.price ?? Number.MAX_SAFE_INTEGER) - (a.price ?? Number.MAX_SAFE_INTEGER));
    return filtered;
  }, [slug, typeSlug, categoryType?.category, query, sort, maxPrice, brandFilter, inStockOnly, batteryStartStop, batteryAmperage, batteryStartingCurrent, batteryTechnology, batteryMinimumRating]);
  useEffect(() => {
    trackEvent({ type: "productListView", category: categoryType?.name ?? category?.name ?? query ?? "Catalogue", productIds: items.map((product) => product.id) });
  }, [slug, typeSlug, query, category?.name, categoryType?.name, items]);
  const brands = [...new Set(listedProducts.filter((product) => (!slug || product.category === slug) && (!typeSlug || product.categoryType === typeSlug)).map((product) => product.brand))];
  const isBatteryListing = slug === "batteries" && !query;
  if (isBatteryListing) {
    return <div className="page-width section-page battery-category-page">
      <div className="breadcrumb"><Link href="/">Accueil</Link> / Nos pièces détachées auto / Électricité auto / Batterie de démarrage / <strong>Batterie voiture</strong></div>
      <div className="battery-category-heading">
        <h1>BATTERIE VOITURE</h1>
        <div className="battery-category-tabs"><span aria-current="page">Batterie voiture</span><span>Batteries camion</span><span>Batterie à décharge lente</span></div>
      </div>
      <div className="battery-fitment-notice">
        <span aria-hidden="true">✓</span>
        <p>{vehicle ? <>Véhicule sélectionné : <strong>{vehicle.make} {vehicle.model}</strong>. Vérifiez la compatibilité avant commande.</> : "Ajoutez votre véhicule pour vérifier la compatibilité des batteries proposées."}</p>
        <Link href="/garage">{vehicle ? "Gérer mon véhicule" : "Ajouter un véhicule"} →</Link>
      </div>
      <div className="battery-listing-layout">
        <aside className="battery-filters">
          <h2><span aria-hidden="true">☷</span> FILTRER | TRIER <small>{items.length} produits</small></h2>
          <div className="battery-filter-group">
            <strong>Trier</strong>
            <label><input type="radio" name="battery-sort" checked={sort === "popular"} onChange={() => setSort("popular")} /> Par pertinence</label>
            <label><input type="radio" name="battery-sort" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} /> Du - cher au + cher</label>
            <label><input type="radio" name="battery-sort" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} /> Du + cher au - cher</label>
          </div>
          <div className="battery-filter-group">
            <strong>Caractéristiques techniques</strong>
            <details><summary>Start and Stop</summary><label><input type="checkbox" checked={batteryStartStop} onChange={(event) => setBatteryStartStop(event.target.checked)} /> Start &amp; Stop</label></details>
            <details><summary>Ampérage</summary>
              <select aria-label="Ampérage" value={batteryAmperage} onChange={(event) => setBatteryAmperage(event.target.value)}><option value="">Tous les ampérages</option>{["60 Ah", "70 Ah", "74 Ah", "77 Ah", "80 Ah", "82 Ah"].map((value) => <option key={value}>{value}</option>)}</select>
            </details>
            <details><summary>Puissance au démarrage (A)</summary>
              <select aria-label="Puissance au démarrage" value={batteryStartingCurrent} onChange={(event) => setBatteryStartingCurrent(event.target.value)}><option value="">Toutes les puissances</option>{["560 A", "640 A", "680 A", "760 A", "780 A", "800 A"].map((value) => <option key={value}>{value}</option>)}</select>
            </details>
            <details><summary>Technologie</summary>
              <select aria-label="Technologie de batterie" value={batteryTechnology} onChange={(event) => setBatteryTechnology(event.target.value)}><option value="">Toutes les technologies</option>{["AGM", "EFB"].map((value) => <option key={value}>{value}</option>)}</select>
            </details>
            <details><summary>Dimensions (mm)</summary><span>Les dimensions sont à vérifier sur la fiche correspondant à votre véhicule.</span></details>
          </div>
          <div className="battery-filter-group">
            <strong>Critères produits</strong>
            <details><summary>Avis client</summary>
              <select aria-label="Note minimale" value={batteryMinimumRating} onChange={(event) => setBatteryMinimumRating(Number(event.target.value))}><option value="0">Toutes les notes</option><option value="4">4 étoiles et plus</option><option value="4.5">4,5 étoiles et plus</option></select>
            </details>
          </div>
          <div className="battery-filter-group">
            <strong>Marque</strong>
            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="">Toutes les marques</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select>
          </div>
          <button className="clear-filter" type="button" onClick={() => { setMaxPrice(250); setBrandFilter(""); setSort("popular"); setInStockOnly(false); setBatteryStartStop(false); setBatteryAmperage(""); setBatteryStartingCurrent(""); setBatteryTechnology(""); setBatteryMinimumRating(0); }}>Effacer les filtres</button>
        </aside>
        <main className="battery-listing-results">
          <div className="battery-results-toolbar"><strong>{items.length} produits</strong><span>Prix TTC, hors frais de livraison</span></div>
          {items.length ? <ProductGrid items={items} layout="battery" /> : <div className="empty-state"><h2>Aucune batterie trouvée</h2><p>Modifiez vos filtres pour afficher d’autres références.</p></div>}
        </main>
      </div>
    </div>;
  }
  return <div className="page-width section-page">
    <div className="breadcrumb"><Link href="/">Accueil</Link> / {query ? "Recherche" : "Pièces auto"} {category && <>/ <Link href={`/categories/${category.slug}`}>{category.name}</Link></>} {categoryType && `/ ${categoryType.name}`}</div>
    {category && <div className={`listing-hero${category.heroImage ? " listing-hero-with-image" : ""}`} style={{ background: category.image }}>{category.heroImage && <Image className="listing-hero-background" src={category.heroImage} alt={`Illustration de la catégorie ${category.name}`} fill sizes="(max-width: 680px) 100vw, 1180px" /> }<div className="listing-hero-copy"><span className="eyebrow">{category.eyebrow}</span><h1>{categoryType?.name ?? category.name}</h1><p>{categoryType?.description ?? category.description}</p></div>{!category.heroImage && <span className="listing-hero-icon">{category.icon}</span>}</div>}
    {category && !categoryType && <section className="catalog-types"><SectionHeading kicker="AFFINER PAR FAMILLE" title={`Les produits ${category.name.toLocaleLowerCase("fr")}`} /><CategoryTypes category={category} /></section>}
    {!category && <><span className="eyebrow">PIÈCES ET ACCESSOIRES AUTO</span><h1>{query ? `Résultats pour « ${query} »` : "Toutes nos pièces auto"}</h1><p className="page-intro">{query ? `${items.length} résultat${items.length > 1 ? "s" : ""} dans notre catalogue.` : "Des pièces sélectionnées pour entretenir votre véhicule."}</p></>}
    <div className="listing-toolbar"><strong>{items.length} produit{items.length > 1 ? "s" : ""}</strong><label>Trier par <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Popularité</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></select></label></div>
    <div className="listing-layout"><aside className="filters"><h2>Affiner ma recherche</h2><div><strong>Prix maximum</strong><input aria-label="Prix maximum" type="range" min="15" max="2000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /><span>Jusqu’à {formatPrice(maxPrice)}</span></div><div><strong>Marque</strong><select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="">Toutes les marques</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></div><div><strong>Disponibilité</strong><label className="check-label"><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} /> En stock uniquement</label></div><button className="clear-filter" onClick={() => { setMaxPrice(2000); setBrandFilter(""); setSort("popular"); setInStockOnly(false); }}>Effacer les filtres</button></aside>
      <div>{items.length ? <ProductGrid items={items} /> : <div className="empty-state"><h2>Aucun produit trouvé</h2><p>Modifiez vos filtres ou essayez une autre recherche.</p><Link className="button button-secondary" href="/categories">Voir les catégories</Link></div>}</div>
    </div>
  </div>;
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const { addToCart } = useStore();
  const product = findProduct(slug);
  const [added, setAdded] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState(() =>
    process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
      : "https://www.mister-auto.com"
  );
  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    if (product && product.price !== null) {
      trackEvent({ type: "productView", productId: product.id, name: product.name, price: product.price });
    }
  }, [product, slug]);
  useEffect(() => {
    const productElement = document.getElementById("ma-product");
    if (!productElement || !product) return;
    productElement.dataset.maImage = new URL(
      product.image ?? "/images/products/product-unavailable.svg",
      window.location.origin,
    ).toString();
    track("ma_productView");
  }, [product, slug]);
  if (!product) return <div className="page-width section-page"><h1>Produit introuvable</h1><Link href="/categories">Retour au catalogue</Link></div>;
  const category = findCategory(product.category);
  const recommendations = listedProducts.filter((item) => item.category === product.category && item.categoryType === product.categoryType && item.id !== product.id).slice(0, 4);
  const productImageUrl = new URL(product.image ?? "/images/products/product-unavailable.svg", siteOrigin).toString();
  return <div className="page-width section-page">
    <div className="breadcrumb"><Link href="/">Accueil</Link> / <Link href={`/categories/${product.category}`}>{category?.name}</Link> / {product.name}</div>
    <div
      className="detail-layout"
      id="ma-product"
      data-ma-sku={product.reference}
      data-ma-name={product.name}
      data-ma-price={product.price?.toFixed(2) ?? ""}
      data-ma-category={category?.name ?? product.category}
      data-ma-brand={product.brand}
      data-ma-image={productImageUrl}
    >
      <div className="detail-image" style={{ background: product.color }}>
        <span className="brand-chip">{product.brand}</span>
        {product.image ? <Image className="product-photo product-photo-detail" unoptimized src={product.image} alt={product.imageAlt} fill sizes="(max-width: 800px) 100vw, 50vw" priority /> : <span aria-hidden="true">{product.icon}</span>}
      </div>
      <div className="detail-info">
        <span className="eyebrow">{category?.name}{product.reference === "Non indiquée" ? "" : ` · Réf. ${product.reference}`}</span><h1>{product.name}</h1>
        {product.reviews > 0 && <div className="rating"><span>★★★★★</span> {product.rating} <small>({product.reviews} avis clients)</small></div>}
        <p className="detail-description">{product.description}</p>
        <div className="compatibility-box"><span>✓</span><div><strong>Compatibilité à vérifier</strong><p>Identifiez votre véhicule pour confirmer que cette pièce est adaptée.</p><Link href="/garage">Sélectionner mon véhicule →</Link></div></div>
        <p className={product.available === false ? "stock unavailable detail-stock" : "stock detail-stock"}>● {product.stock}</p>
        <div className="detail-price">{formatPrice(product.price)} {product.price !== null && <small>TTC</small>}</div>
        <button className="button button-primary detail-add" disabled={product.available === false} onClick={() => { addToCart(product); setAdded(true); }}>{product.available === false ? "Temporairement indisponible" : added ? "✓ Ajouté au panier" : "Ajouter au panier"} {product.available !== false && <span>→</span>}</button>
        <p className="delivery-note">↗ Paiement sécurisé · Retours sous 30 jours</p>
      </div>
    </div>
    <section className="section"><SectionHeading title="Vous aimerez aussi" /><ProductGrid items={recommendations} layout={product.category === "batteries" ? "battery" : "standard"} /></section>
  </div>;
}

export function CartPage() {
  const { cart, clearCart, setQuantity, removeFromCart } = useStore();
  const [promo, setPromo] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  useEffect(() => {
    track("ma_cartView");
  }, []);
  const lines = cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) })).filter((line): line is typeof line & { product: Product } => Boolean(line.product));
  const articleCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + (line.product.price ?? 0) * line.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const delivery = subtotal >= 59 || subtotal === 0 ? 0 : 5.9;
  function applyPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accepted = promo.trim().toUpperCase() === "BIENVENUE10";
    setPromoApplied(accepted);
    setPromoMessage(accepted ? "Code accepté : remise de 10 % appliquée." : "Code non reconnu. Essayez BIENVENUE10.");
  }
  if (!lines.length) return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Mon panier</div><div className="empty-state"><span className="empty-icon">🛒</span><h1>Votre panier est vide</h1><p>Découvrez notre sélection de pièces pour votre véhicule.</p><Link className="button button-primary" href="/categories">Continuer mes achats →</Link></div></div>;
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Mon panier</div><div className="cart-heading-row"><h1>Votre panier <span className="subtle">({articleCount} article{articleCount !== 1 ? "s" : ""})</span></h1><button className="button button-secondary clear-cart-button" type="button" onClick={() => { clearCart(); setPromo(""); setPromoApplied(false); setPromoMessage(""); }}>Vider le panier</button></div><div className="cart-layout"><section className="cart-items">{lines.map((line) => <article className="cart-line" key={line.productId}><div className="cart-product-art" style={{ background: line.product.color }}>{line.product.image ? <Image unoptimized src={line.product.image} alt={line.product.imageAlt} width={100} height={100} sizes="100px" /> : <span aria-hidden="true">{line.product.icon}</span>}</div><div className="cart-line-info"><Link href={`/produit/${line.product.slug}`}><strong>{line.product.name}</strong></Link>{line.product.reference !== "Non indiquée" && <small>Réf. {line.product.reference}</small>}<span className="stock">● {line.product.stock}</span><button className="remove-link" onClick={() => removeFromCart(line.productId)}>Supprimer</button></div><div className="quantity-control"><button aria-label="Diminuer" onClick={() => setQuantity(line.productId, line.quantity - 1)}>−</button><span>{line.quantity}</span><button aria-label="Augmenter" onClick={() => setQuantity(line.productId, line.quantity + 1)}>+</button></div><strong className="line-price">{formatPrice(line.product.price === null ? null : line.product.price * line.quantity)}</strong></article>)}<Link href="/categories" className="text-link">← Continuer mes achats</Link></section><aside className="order-card"><h2>Votre commande</h2><form className="promo-form" onSubmit={applyPromo}><label htmlFor="promo">Vous avez un code promo ?</label><div><input id="promo" value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Code promo" /><button className="button button-secondary">Appliquer</button></div>{promoMessage && <small>{promoMessage}</small>}</form><div className="order-row"><span>Sous-total</span><strong>{formatPrice(subtotal)}</strong></div>{discount > 0 && <div className="order-row"><span>Remise BIENVENUE10</span><strong>− {formatPrice(discount)}</strong></div>}<div className="order-row"><span>Livraison estimée</span><strong>{delivery === 0 ? "Offerte" : formatPrice(delivery)}</strong></div><div className="order-total"><strong>Total TTC</strong><strong>{formatPrice(subtotal - discount + delivery)}</strong></div><button className="button button-primary checkout-button" onClick={() => { track("ma_checkout"); window.alert("La validation de commande est simulée dans cette démo."); }}>Continuer ma commande →</button><small className="demo-note">Démo : aucune commande ni aucun paiement réel ne sera effectué.</small></aside></div></div>;
}

export function AuthPage({ professional = false, registration = false }: { professional?: boolean; registration?: boolean }) {
  const { signIn, account, signOut } = useStore();
  const [register, setRegister] = useState(registration);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingAuthTrack, setPendingAuthTrack] = useState<"ma_login" | "ma_registration" | null>(null);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("confirmation") === "failed") {
      setErrorMessage("Le lien de confirmation n’a pas pu être validé. Réessayez ou demandez un nouveau lien.");
    }
  }, []);
  useEffect(() => {
    if (!pendingAuthTrack) return;
    track(pendingAuthTrack);
    setPendingAuthTrack(null);
  }, [pendingAuthTrack]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setErrorMessage("");
    const form = new FormData(event.currentTarget);
    const profile = {
      firstName: String(form.get("firstName") ?? "Alexandre"),
      lastName: String(form.get("lastName") ?? "Martin"),
      email: String(form.get("email") ?? ""),
      kind: professional ? "professionnel" : "particulier",
      ...(professional ? { company: String(form.get("company") ?? "") } : {}),
      ...(professional ? {
        siret: String(form.get("siret") ?? ""),
        activity: String(form.get("activity") ?? ""),
        phone: String(form.get("phone") ?? ""),
      } : {}),
    } as const;
    if (register) {
      try {
        const result = await supabaseAuthAdapter.register({
          ...profile,
          password: String(form.get("password") ?? ""),
          marketingConsent: form.get("marketingConsent") === "on",
          acceptedTerms: form.get("acceptedTerms") === "on",
        });
        const optIns = {
          email: form.get("marketingConsent") === "on",
          sms: false,
          push: false,
        };
        storeLocalUser(profile, optIns);
        trackEvent({ type: "accountRegistration", accountType: profile.kind, marketingConsent: optIns.email });
        setPendingAuthTrack("ma_registration");
        if (result.profile) {
          signIn(result.profile, optIns);
          setMessage("");
        } else if (result.requiresEmailConfirmation) {
          setMessage("Votre inscription est enregistrée. Consultez votre boîte mail pour confirmer votre adresse avant de vous connecter.");
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue. Réessayez.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    try {
      const authenticated = await supabaseAuthAdapter.signIn(profile.email, String(form.get("password") ?? ""), profile.kind);
      signIn(authenticated);
      setPendingAuthTrack("ma_login");
      setMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }
  if (account) return <div className="page-width section-page"><div className="auth-card account-summary"><span className="eyebrow">MON ESPACE</span><h1>Bonjour {account.firstName} !</h1><p>Connecté en tant que {account.kind === "professionnel" ? "professionnel" : "particulier"} · {account.email}</p>{account.company && <p>Entreprise : {account.company}</p>}{account.siret && <p>SIRET : {account.siret}</p>}{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<div className="auth-links"><Link className="button button-secondary" href="/garage">Mon garage</Link><Link className="button button-secondary" href="/panier">Mon panier</Link><button className="button button-primary" onClick={() => { void signOut().then(() => setErrorMessage("")).catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : "La déconnexion a échoué.")); }}>Déconnexion</button></div></div></div>;
  return <div className="page-width section-page auth-page"><section className="auth-card"><span className="eyebrow">{professional ? "ESPACE PROFESSIONNEL" : "ESPACE CLIENT"}</span><h1>{professional ? register ? "Créer mon compte Pro" : "Bienvenue dans votre espace Pro" : register ? "Créer mon compte" : "Ravi de vous revoir !"}</h1><p>{professional ? "Accédez aux offres et services réservés aux professionnels de l’automobile." : "Connectez-vous à votre compte pour retrouver vos commandes et véhicules."}</p><div className="auth-tabs"><Link className={!professional ? "selected" : ""} href={register ? "/inscription/particulier" : "/connexion"}>Particulier</Link><Link className={professional ? "selected" : ""} href={register ? "/inscription/professionnel" : "/connexion-pro"}>Professionnel</Link></div><div className="auth-switch"><button type="button" className={!register ? "selected" : ""} onClick={() => setRegister(false)}>Connexion</button><button type="button" className={register ? "selected" : ""} onClick={() => setRegister(true)}>Créer un compte</button></div><form className="auth-form" onSubmit={submit}>
    {register && <div className="form-two"><label>Prénom<input required name="firstName" autoComplete="given-name" /></label><label>Nom<input required name="lastName" autoComplete="family-name" /></label></div>}
    <label>{professional ? "E-mail professionnel" : "Adresse e-mail"}<input required type="email" name="email" autoComplete="email" /></label>
    {register && professional && <><label>Nom de l’entreprise<input required name="company" autoComplete="organization" /></label><label>SIRET<input required name="siret" inputMode="numeric" pattern="[0-9]{14}" title="Le SIRET doit contenir 14 chiffres." minLength={14} maxLength={14} /></label><label>Activité professionnelle<select required name="activity"><option value="">Sélectionner une activité</option><option>Garage / réparateur</option><option>Carrosserie</option><option>Revendeur de pièces auto</option><option>Autre professionnel automobile</option></select></label><label>Téléphone<input required type="tel" name="phone" autoComplete="tel" /></label></>}
    <label>Mot de passe<input required type="password" name="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} /></label>
    {register && <div className="consent-fields"><label><input name="marketingConsent" type="checkbox" /> Je souhaite recevoir les offres et actualités (facultatif).</label><label><input name="acceptedTerms" required type="checkbox" /> J’accepte les conditions générales.</label></div>}
    {!register && <a className="forgot-link" href="#mot-de-passe">Mot de passe oublié ?</a>}
    <button className="button button-primary auth-submit" disabled={submitting}>{submitting ? "Veuillez patienter…" : register ? "Créer mon compte" : "Me connecter"} <span>→</span></button>
    {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
    {message && <p className="success-message" role="status">{message}</p>}
  </form><div className="demo-disclaimer"><strong>Compte de démonstration</strong><p>{isSupabaseConfigured() ? "L’authentification est gérée par Supabase. Le mot de passe n’est jamais enregistré dans le profil client." : "Supabase n’est pas configuré : la connexion et l’inscription sont simulées localement. Aucun mot de passe n’est conservé."}</p></div><p className="auth-create-link">Nouveau client ? <Link href="/inscription">Choisir mon type de compte</Link></p></section></div>;
}

export function RegistrationChoicePage() {
  return <div className="page-width section-page"><div className="breadcrumb"><Link href="/">Accueil</Link> / Créer un compte</div><section className="registration-choice"><span className="eyebrow">BIENVENUE CHEZ MISTER AUTO</span><h1>Vous êtes un particulier ou un professionnel ?</h1><p>Choisissez votre espace pour profiter d’une expérience adaptée à votre activité.</p><div className="registration-options"><article><span className="registration-icon">♙</span><h2>Je suis un particulier</h2><p>Retrouvez vos véhicules, vos sélections et vos commandes au même endroit.</p><Link className="button button-primary" href="/inscription/particulier">Créer un compte particulier →</Link><Link className="text-link" href="/connexion">J’ai déjà un compte</Link></article><article><span className="registration-icon">▤</span><h2>Je suis un professionnel</h2><p>Accédez à un espace dédié aux pros de l’automobile et aux informations de votre entreprise.</p><Link className="button button-primary" href="/inscription/professionnel">Créer un compte Pro →</Link><Link className="text-link" href="/connexion-pro">J’ai déjà un compte Pro</Link></article></div></section></div>;
}

export function NotFoundPage() {
  return <div className="page-width section-page empty-state"><h1>Cette page n’existe pas</h1><Link href="/" className="button button-primary">Retour à l’accueil</Link></div>;
}
