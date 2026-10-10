export type CategorySlug =
  | "accessoires" | "batteries" | "freinage" | "chaines-neige"
  | "huile-moteur" | "pieces-occasion" | "pneus";

export type Category = {
  slug: CategorySlug;
  name: string;
  eyebrow: string;
  description: string;
  icon: string;
  image: string;
  accent: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  reference: string;
  price: number;
  rating: number;
  reviews: number;
  stock: string;
  available?: boolean;
  icon: string;
  color: string;
  description: string;
  tags: string[];
};

export const categories: Category[] = [
  { slug: "freinage", name: "Freinage", eyebrow: "Sécurité avant tout", description: "Plaquettes, disques et kits de frein pour prendre la route en toute sérénité.", icon: "◉", image: "linear-gradient(145deg,#e9eef3,#cbd6df)", accent: "#e6532e" },
  { slug: "batteries", name: "Batteries", eyebrow: "Un démarrage garanti", description: "La batterie qu’il vous faut, sélectionnée selon votre véhicule.", icon: "▣", image: "linear-gradient(145deg,#ecf0e9,#d6e3cf)", accent: "#478455" },
  { slug: "pneus", name: "Pneus", eyebrow: "La route vous attend", description: "Pneus été, hiver et toutes saisons au meilleur prix.", icon: "◉", image: "linear-gradient(145deg,#e7edf0,#c5d5dc)", accent: "#3179a7" },
  { slug: "huile-moteur", name: "Huile moteur", eyebrow: "Prenez soin du moteur", description: "Des huiles adaptées aux exigences de votre moteur.", icon: "▤", image: "linear-gradient(145deg,#fbedd2,#f0d4a3)", accent: "#dc9d29" },
  { slug: "chaines-neige", name: "Chaînes à neige", eyebrow: "Prêt pour l’hiver", description: "Chaînes et chaussettes neige compatibles avec vos pneus.", icon: "❄", image: "linear-gradient(145deg,#e0eff9,#bad9eb)", accent: "#318bc5" },
  { slug: "accessoires", name: "Accessoires", eyebrow: "Chaque détail compte", description: "Tout le confort et les accessoires utiles pour votre voiture.", icon: "✦", image: "linear-gradient(145deg,#f4e9e4,#e5c9bc)", accent: "#d66d4c" },
  { slug: "pieces-occasion", name: "Pièces d’occasion", eyebrow: "La seconde vie des pièces", description: "Des pièces auto d’occasion vérifiées, plus accessibles.", icon: "↻", image: "linear-gradient(145deg,#e8e9f2,#c9cce1)", accent: "#6067a2" },
];

export const products: Product[] = [
  { id: "p1", slug: "plaquettes-frein-ate-ceramic", name: "Jeu de 4 plaquettes de frein ATE Ceramic", brand: "ATE", category: "freinage", reference: "ATE-13.0470", price: 53.9, rating: 4.8, reviews: 126, stock: "En stock — expédié sous 24 h", icon: "◉", color: "#e5edf3", description: "Freinage silencieux et performant. Jeu de plaquettes pour essieu avant, conçu pour limiter la poussière de frein.", tags: ["Avant", "Faible poussière", "Montage facile"] },
  { id: "p2", slug: "disques-frein-brembo", name: "Disque de frein ventilé BREMBO", brand: "BREMBO", category: "freinage", reference: "BRE-09.9772", price: 68.5, rating: 4.7, reviews: 89, stock: "En stock — expédié sous 24 h", icon: "◉", color: "#eee9e6", description: "Disque de frein ventilé à haut rendement, fabriqué selon les standards de qualité du constructeur.", tags: ["Avant", "Vendu à l’unité", "Ventilé"] },
  { id: "p3", slug: "batterie-varta-blue-dynamic", name: "Batterie VARTA Blue Dynamic 74 Ah", brand: "VARTA", category: "batteries", reference: "VAR-D24", price: 98.9, rating: 4.9, reviews: 204, stock: "En stock — livraison rapide", icon: "▣", color: "#e8f0e8", description: "Batterie fiable au quotidien, puissance de démarrage élevée et technologie sans entretien.", tags: ["74 Ah", "750 A", "Sans entretien"] },
  { id: "p4", slug: "batterie-bosch-s4", name: "Batterie BOSCH S4 60 Ah", brand: "BOSCH", category: "batteries", reference: "BOS-0092S40050", price: 86.4, rating: 4.6, reviews: 97, stock: "Temporairement indisponible", available: false, icon: "▣", color: "#e9edf3", description: "Démarrage fiable et puissance adaptée à de nombreux véhicules récents.", tags: ["60 Ah", "540 A", "12 V"] },
  { id: "p5", slug: "pneu-michelin-primacy-4", name: "Pneu MICHELIN Primacy 4+ 205/55 R16", brand: "MICHELIN", category: "pneus", reference: "MIC-2055516", price: 91.2, rating: 4.9, reviews: 316, stock: "En stock — livraison offerte dès 2 pneus", icon: "◉", color: "#e8edf0", description: "Pneu été premium offrant une excellente longévité et une sécurité durable sur sol mouillé.", tags: ["Été", "205/55 R16", "A/A"] },
  { id: "p6", slug: "pneu-goodyear-vector-4seasons", name: "Pneu GOODYEAR Vector 4Seasons Gen-3", brand: "GOODYEAR", category: "pneus", reference: "GOO-4S205", price: 84.9, rating: 4.7, reviews: 182, stock: "En stock — livraison rapide", icon: "◉", color: "#edf0e8", description: "Pneu toutes saisons pour garder le contrôle tout au long de l’année.", tags: ["4 saisons", "205/55 R16", "M+S"] },
  { id: "p7", slug: "huile-castrol-edge-5w30", name: "Huile moteur CASTROL EDGE 5W-30 LL", brand: "CASTROL", category: "huile-moteur", reference: "CAS-15669E", price: 42.9, rating: 4.8, reviews: 143, stock: "En stock — expédié sous 24 h", icon: "▤", color: "#f3eadb", description: "Huile moteur synthétique conçue pour protéger les moteurs performants et réduire les frictions.", tags: ["5W-30", "5 litres", "Synthétique"] },
  { id: "p8", slug: "huile-total-quartz-ineo", name: "Huile moteur TOTAL Quartz Ineo 5W-30", brand: "TOTAL", category: "huile-moteur", reference: "TOT-214877", price: 36.5, rating: 4.7, reviews: 114, stock: "En stock — expédié sous 24 h", icon: "▤", color: "#f5ebdc", description: "Lubrifiant haute performance adapté aux moteurs essence et diesel modernes.", tags: ["5W-30", "5 litres", "ACEA C3"] },
  { id: "p9", slug: "chaines-neige-chaussettes", name: "Chaînes neige textiles ISSE Classic", brand: "ISSE", category: "chaines-neige", reference: "ISS-66", price: 59.9, rating: 4.5, reviews: 74, stock: "Plus que quelques pièces", icon: "❄", color: "#e6f0f5", description: "Chaussettes à neige homologuées, faciles à installer et compatibles avec de nombreuses dimensions.", tags: ["Paire", "Homologuées", "Installation rapide"] },
  { id: "p10", slug: "accessoire-coffre-organiseur", name: "Organiseur de coffre pliable antidérapant", brand: "MISTER AUTO", category: "accessoires", reference: "MA-ORG-01", price: 24.9, rating: 4.4, reviews: 58, stock: "En stock — expédié sous 24 h", icon: "▧", color: "#f1e8e4", description: "Rangez vos accessoires et gardez un coffre bien organisé grâce à cet organiseur robuste.", tags: ["Universel", "Pliable", "Antidérapant"] },
  { id: "p11", slug: "retroviseur-occasion-renault", name: "Rétroviseur extérieur droit — contrôlé", brand: "PIÈCE D’OCCASION", category: "pieces-occasion", reference: "OCC-REN-245", price: 48.9, rating: 4.5, reviews: 31, stock: "En stock — pièce vérifiée", icon: "◩", color: "#ececf2", description: "Pièce d’occasion contrôlée et nettoyée, en bon état de fonctionnement.", tags: ["Contrôlée", "Garantie 12 mois", "Économie circulaire"] },
  { id: "p12", slug: "kit-entretien-frein", name: "Kit d’entretien et nettoyage des freins", brand: "ATE", category: "freinage", reference: "ATE-700015", price: 18.7, rating: 4.6, reviews: 45, stock: "En stock — expédié sous 24 h", icon: "▤", color: "#edf0f2", description: "Un kit pratique pour l’entretien courant de votre système de freinage.", tags: ["Entretien", "Kit complet", "Usage atelier"] },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price);
export const findProduct = (slug: string) => products.find((product) => product.slug === slug);
export const findCategory = (slug: string) => categories.find((category) => category.slug === slug);
