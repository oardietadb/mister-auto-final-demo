export type CategorySlug =
  | "accessoires" | "batteries" | "freinage" | "chaines-neige"
  | "huile-moteur" | "pieces-occasion" | "pneus";

export type CategoryTypeSlug =
  | "plaquettes-de-frein" | "disques-de-frein" | "batteries-auto"
  | "pneus-auto" | "huiles-moteur" | "chaines-a-neige"
  | "accessoires-auto" | "pieces-occasion";

export type CategoryType = {
  slug: CategoryTypeSlug;
  category: CategorySlug;
  name: string;
  description: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  eyebrow: string;
  description: string;
  icon: string;
  image: string;
  accent: string;
  types: CategoryType[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  categoryType: CategoryTypeSlug;
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
  image: string | null;
  imageAlt: string;
  imageSourceUrl: string | null;
  imageStatus: "matched" | "unavailable";
  listed: boolean;
};

type ProductRecord = Omit<Product, "image" | "imageAlt" | "imageSourceUrl" | "imageStatus" | "listed"> & { listed?: boolean };

export const categoryTypes: CategoryType[] = [
  { slug: "plaquettes-de-frein", category: "freinage", name: "Plaquettes de frein", description: "Des plaquettes adaptées à chaque essieu et à chaque conduite." },
  { slug: "disques-de-frein", category: "freinage", name: "Disques de frein", description: "Disques ventilés et pleins pour retrouver un freinage efficace." },
  { slug: "batteries-auto", category: "batteries", name: "Batteries auto", description: "Batteries fiables pour un démarrage serein toute l’année." },
  { slug: "pneus-auto", category: "pneus", name: "Pneus", description: "Pneus été et toutes saisons pour votre véhicule." },
  { slug: "huiles-moteur", category: "huile-moteur", name: "Huiles moteur", description: "Des lubrifiants sélectionnés selon les besoins de votre moteur." },
  { slug: "chaines-a-neige", category: "chaines-neige", name: "Chaînes et chaussettes à neige", description: "Équipez vos roues avant les premiers flocons." },
  { slug: "accessoires-auto", category: "accessoires", name: "Accessoires auto", description: "Des accessoires pratiques pour vos trajets et votre véhicule." },
  { slug: "pieces-occasion", category: "pieces-occasion", name: "Pièces auto d’occasion", description: "Des pièces contrôlées pour réparer à prix juste." },
];

export const categories: Category[] = [
  { slug: "freinage", name: "Freinage", eyebrow: "Sécurité avant tout", description: "Plaquettes, disques et kits de frein pour prendre la route en toute sérénité.", icon: "◉", image: "linear-gradient(145deg,#e9eef3,#cbd6df)", accent: "#e6532e", types: categoryTypes.filter((type) => type.category === "freinage") },
  { slug: "batteries", name: "Batteries", eyebrow: "Un démarrage garanti", description: "La batterie qu’il vous faut, sélectionnée selon votre véhicule.", icon: "▣", image: "linear-gradient(145deg,#ecf0e9,#d6e3cf)", accent: "#478455", types: categoryTypes.filter((type) => type.category === "batteries") },
  { slug: "pneus", name: "Pneus", eyebrow: "La route vous attend", description: "Pneus été, hiver et toutes saisons au meilleur prix.", icon: "◉", image: "linear-gradient(145deg,#e7edf0,#c5d5dc)", accent: "#3179a7", types: categoryTypes.filter((type) => type.category === "pneus") },
  { slug: "huile-moteur", name: "Huile moteur", eyebrow: "Prenez soin du moteur", description: "Des huiles adaptées aux exigences de votre moteur.", icon: "▤", image: "linear-gradient(145deg,#fbedd2,#f0d4a3)", accent: "#dc9d29", types: categoryTypes.filter((type) => type.category === "huile-moteur") },
  { slug: "chaines-neige", name: "Chaînes à neige", eyebrow: "Prêt pour l’hiver", description: "Chaînes et chaussettes neige compatibles avec vos pneus.", icon: "❄", image: "linear-gradient(145deg,#e0eff9,#bad9eb)", accent: "#318bc5", types: categoryTypes.filter((type) => type.category === "chaines-neige") },
  { slug: "accessoires", name: "Accessoires", eyebrow: "Chaque détail compte", description: "Tout le confort et les accessoires utiles pour votre voiture.", icon: "✦", image: "linear-gradient(145deg,#f4e9e4,#e5c9bc)", accent: "#d66d4c", types: categoryTypes.filter((type) => type.category === "accessoires") },
  { slug: "pieces-occasion", name: "Pièces d’occasion", eyebrow: "La seconde vie des pièces", description: "Des pièces auto d’occasion vérifiées, plus accessibles.", icon: "↻", image: "linear-gradient(145deg,#e8e9f2,#c9cce1)", accent: "#6067a2", types: categoryTypes.filter((type) => type.category === "pieces-occasion") },
];

const baseProducts: ProductRecord[] = [
  { id: "p1", slug: "plaquettes-frein-ate-ceramic", name: "Jeu de 4 plaquettes de frein ATE Ceramic", brand: "ATE", category: "freinage", categoryType: "plaquettes-de-frein", reference: "ATE-13.0470", price: 53.9, rating: 4.8, reviews: 126, stock: "En stock — expédié sous 24 h", icon: "◉", color: "#e5edf3", description: "Freinage silencieux et performant. Jeu de plaquettes pour essieu avant, conçu pour limiter la poussière de frein.", tags: ["Avant", "Faible poussière", "Montage facile"] },
  { id: "p2", slug: "disques-frein-brembo", name: "Disque de frein ventilé BREMBO", brand: "BREMBO", category: "freinage", categoryType: "disques-de-frein", reference: "BRE-09.9772", price: 68.5, rating: 4.7, reviews: 89, stock: "En stock — expédié sous 24 h", icon: "◉", color: "#eee9e6", description: "Disque de frein ventilé à haut rendement, fabriqué selon les standards de qualité du constructeur.", tags: ["Avant", "Vendu à l’unité", "Ventilé"] },
  { id: "p3", slug: "batterie-varta-blue-dynamic", name: "Batterie VARTA Blue Dynamic 74 Ah", brand: "VARTA", category: "batteries", categoryType: "batteries-auto", reference: "VAR-D24", price: 98.9, rating: 4.9, reviews: 204, stock: "En stock — livraison rapide", icon: "▣", color: "#e8f0e8", description: "Batterie fiable au quotidien, puissance de démarrage élevée et technologie sans entretien.", tags: ["74 Ah", "750 A", "Sans entretien"], listed: false },
  { id: "p4", slug: "batterie-bosch-s4", name: "Batterie BOSCH S4 60 Ah", brand: "BOSCH", category: "batteries", categoryType: "batteries-auto", reference: "BOS-0092S40050", price: 86.4, rating: 4.6, reviews: 97, stock: "Temporairement indisponible", available: false, icon: "▣", color: "#e9edf3", description: "Démarrage fiable et puissance adaptée à de nombreux véhicules récents.", tags: ["60 Ah", "540 A", "12 V"], listed: false },
  { id: "p5", slug: "pneu-michelin-primacy-4", name: "Pneu MICHELIN Primacy 4+ 205/55 R16", brand: "MICHELIN", category: "pneus", categoryType: "pneus-auto", reference: "MIC-2055516", price: 91.2, rating: 4.9, reviews: 316, stock: "En stock — livraison offerte dès 2 pneus", icon: "◉", color: "#e8edf0", description: "Pneu été premium offrant une excellente longévité et une sécurité durable sur sol mouillé.", tags: ["Été", "205/55 R16", "A/A"] },
  { id: "p6", slug: "pneu-goodyear-vector-4seasons", name: "Pneu GOODYEAR Vector 4Seasons Gen-3", brand: "GOODYEAR", category: "pneus", categoryType: "pneus-auto", reference: "GOO-4S205", price: 84.9, rating: 4.7, reviews: 182, stock: "En stock — livraison rapide", icon: "◉", color: "#edf0e8", description: "Pneu toutes saisons pour garder le contrôle tout au long de l’année.", tags: ["4 saisons", "205/55 R16", "M+S"] },
  { id: "p7", slug: "huile-castrol-edge-5w30", name: "Huile moteur CASTROL EDGE 5W-30 LL", brand: "CASTROL", category: "huile-moteur", categoryType: "huiles-moteur", reference: "CAS-15669E", price: 42.9, rating: 4.8, reviews: 143, stock: "En stock — expédié sous 24 h", icon: "▤", color: "#f3eadb", description: "Huile moteur synthétique conçue pour protéger les moteurs performants et réduire les frictions.", tags: ["5W-30", "5 litres", "Synthétique"] },
  { id: "p8", slug: "huile-total-quartz-ineo", name: "Huile moteur TOTAL Quartz Ineo 5W-30", brand: "TOTAL", category: "huile-moteur", categoryType: "huiles-moteur", reference: "TOT-214877", price: 36.5, rating: 4.7, reviews: 114, stock: "En stock — expédié sous 24 h", icon: "▤", color: "#f5ebdc", description: "Lubrifiant haute performance adapté aux moteurs essence et diesel modernes.", tags: ["5W-30", "5 litres", "ACEA C3"] },
  { id: "p9", slug: "chaines-neige-chaussettes", name: "Chaînes neige textiles ISSE Classic", brand: "ISSE", category: "chaines-neige", categoryType: "chaines-a-neige", reference: "ISS-66", price: 59.9, rating: 4.5, reviews: 74, stock: "Plus que quelques pièces", icon: "❄", color: "#e6f0f5", description: "Chaussettes à neige homologuées, faciles à installer et compatibles avec de nombreuses dimensions.", tags: ["Paire", "Homologuées", "Installation rapide"] },
  { id: "p10", slug: "accessoire-coffre-organiseur", name: "Organiseur de coffre pliable antidérapant", brand: "MISTER AUTO", category: "accessoires", categoryType: "accessoires-auto", reference: "MA-ORG-01", price: 24.9, rating: 4.4, reviews: 58, stock: "En stock — expédié sous 24 h", icon: "▧", color: "#f1e8e4", description: "Rangez vos accessoires et gardez un coffre bien organisé grâce à cet organiseur robuste.", tags: ["Universel", "Pliable", "Antidérapant"] },
  { id: "p11", slug: "retroviseur-occasion-renault", name: "Rétroviseur extérieur droit — contrôlé", brand: "PIÈCE D’OCCASION", category: "pieces-occasion", categoryType: "pieces-occasion", reference: "OCC-REN-245", price: 48.9, rating: 4.5, reviews: 31, stock: "En stock — pièce vérifiée", icon: "◩", color: "#ececf2", description: "Pièce d’occasion contrôlée et nettoyée, en bon état de fonctionnement.", tags: ["Contrôlée", "Garantie 12 mois", "Économie circulaire"] },
  { id: "p12", slug: "kit-entretien-frein", name: "Kit d’entretien et nettoyage des freins", brand: "ATE", category: "freinage", categoryType: "plaquettes-de-frein", reference: "ATE-700015", price: 18.7, rating: 4.6, reviews: 45, stock: "En stock — expédié sous 24 h", icon: "▤", color: "#edf0f2", description: "Un kit pratique pour l’entretien courant de votre système de freinage.", tags: ["Entretien", "Kit complet", "Usage atelier"] },
];

const extraProducts: Array<Omit<ProductRecord, "id">> = [
  ...([
    ["plaquettes-de-frein", "freinage", "Plaquettes de frein BOSCH QuietCast", "BOSCH", "BOS-BP1234", 39.9, "Plaquettes avant avec réduction du bruit et de la poussière."],
    ["plaquettes-de-frein", "freinage", "Jeu de plaquettes TRW Cotec", "TRW", "TRW-GDB1550", 44.5, "Revêtement de transfert pour un freinage efficace dès les premiers kilomètres."],
    ["plaquettes-de-frein", "freinage", "Plaquettes de frein FERODO Premier", "FERODO", "FER-FDB1789", 36.8, "Plaquettes de frein conçues pour une réponse progressive au quotidien."],
    ["plaquettes-de-frein", "freinage", "Plaquettes avant VALEO First", "VALEO", "VAL-598821", 31.2, "Jeu de plaquettes pour essieu avant, conforme aux exigences de première monte."],
    ["disques-de-frein", "freinage", "Disque de frein BOSCH ventilé", "BOSCH", "BOS-0986479", 58.4, "Disque ventilé robuste pour une dissipation efficace de la chaleur."],
    ["disques-de-frein", "freinage", "Disque de frein TRW coated", "TRW", "TRW-DF6073", 62.9, "Disque avec revêtement anticorrosion et finition prête à monter."],
    ["disques-de-frein", "freinage", "Disque plein ATE Original", "ATE", "ATE-240125", 47.6, "Disque de frein plein répondant aux standards constructeur."],
    ["disques-de-frein", "freinage", "Disque de frein FERODO Premier", "FERODO", "FER-DDF1512", 54.3, "Géométrie optimisée pour un freinage fiable et régulier."],
    ["batteries-auto", "batteries", "Batterie EXIDE Premium 77 Ah", "EXIDE", "EXI-EB770", 112.9, "Puissance de démarrage élevée pour les véhicules fortement équipés."],
    ["batteries-auto", "batteries", "Batterie VARTA Silver Dynamic 63 Ah", "VARTA", "VAR-D15", 104.5, "Batterie sans entretien offrant une réserve de puissance renforcée."],
    ["batteries-auto", "batteries", "Batterie BOSCH S5 74 Ah", "BOSCH", "BOS-0092S50080", 119.9, "Technologie fiable pour un démarrage sûr en toutes saisons."],
    ["pneus-auto", "pneus", "Pneu CONTINENTAL PremiumContact 7 205/55 R16", "CONTINENTAL", "CON-2055516", 88.9, "Pneu été équilibré pour la sécurité et le confort de conduite."],
    ["pneus-auto", "pneus", "Pneu HANKOOK Ventus Prime4 205/55 R16", "HANKOOK", "HAN-2055516", 76.9, "Pneu été confortable avec une bonne adhérence sur sol mouillé."],
    ["pneus-auto", "pneus", "Pneu PIRELLI Cinturato P7 205/55 R16", "PIRELLI", "PIR-2055516", 94.2, "Pneu tourisme conçu pour une conduite efficace et silencieuse."],
    ["huiles-moteur", "huile-moteur", "Huile moteur MOTUL 8100 X-clean 5W-30", "MOTUL", "MOT-104777", 45.7, "Huile synthétique adaptée aux motorisations essence et diesel modernes."],
    ["huiles-moteur", "huile-moteur", "Huile moteur ELF Evolution Full-Tech 5W-30", "ELF", "ELF-220284", 39.4, "Lubrifiant haute performance pour moteurs avec filtre à particules."],
    ["huiles-moteur", "huile-moteur", "Huile moteur MOBIL Super 3000 5W-30", "MOBIL", "MOB-153667", 41.8, "Protection du moteur au démarrage et lors des trajets quotidiens."],
    ["chaines-a-neige", "chaines-neige", "Chaînes neige métalliques MICHELIN Easy Grip", "MICHELIN", "MIC-160", 89.9, "Chaînes faciles à installer pour une meilleure motricité sur neige."],
    ["chaines-a-neige", "chaines-neige", "Chaînes neige KÖNIG CG-9", "KÖNIG", "KON-090", 72.5, "Chaînes métalliques compactes compatibles avec de nombreuses dimensions."],
    ["chaines-a-neige", "chaines-neige", "Chaussettes neige POLAIRE Show’7", "POLAIRE", "POL-007", 64.9, "Équipement textile homologué, simple à poser en quelques minutes."],
    ["chaines-a-neige", "chaines-neige", "Chaînes neige frontales KÖNIG K-Summit", "KÖNIG", "KON-K45", 239, "Chaînes frontales haut de gamme adaptées aux passages de roue réduits."],
    ["accessoires-auto", "accessoires", "Tapis de coffre universel antidérapant", "MISTER AUTO", "MA-TAP-01", 29.9, "Tapis résistant qui protège le coffre des salissures et de l’humidité."],
    ["accessoires-auto", "accessoires", "Compresseur d’air portable 12 V", "MICHELIN", "MIC-CA-100", 34.9, "Compresseur compact avec manomètre pour vérifier la pression des pneus."],
    ["accessoires-auto", "accessoires", "Chargeur de batterie intelligent 12 V", "CTEK", "CTK-MXS5", 79.9, "Chargeur automatique pour préserver les batteries des véhicules."],
    ["accessoires-auto", "accessoires", "Kit sécurité auto gilet et triangle", "OSRAM", "OSR-LEDriving", 18.5, "Éléments essentiels pour être visible et équipé en cas d’arrêt."],
    ["pieces-occasion", "pieces-occasion", "Alternateur d’occasion — contrôlé", "PIÈCE D’OCCASION", "OCC-ALT-208", 89.9, "Alternateur d’occasion testé, nettoyé et garanti 12 mois."],
    ["pieces-occasion", "pieces-occasion", "Démarreur d’occasion — vérifié", "PIÈCE D’OCCASION", "OCC-DEM-314", 74.5, "Démarreur contrôlé avant expédition pour une réparation plus accessible."],
    ["pieces-occasion", "pieces-occasion", "Feu arrière gauche — pièce contrôlée", "PIÈCE D’OCCASION", "OCC-FEU-582", 56.9, "Optique d’occasion inspectée et testée avant remise en vente."],
    ["pieces-occasion", "pieces-occasion", "Rétroviseur gauche — pièce vérifiée", "PIÈCE D’OCCASION", "OCC-RET-365", 42.9, "Rétroviseur d’occasion en bon état de fonctionnement, garanti 12 mois."],
  ] as const).map(([categoryType, category, name, brand, reference, price, description], index) => {
    const categoryInfo = categories.find((item) => item.slug === category);
    return {
      slug: `catalogue-${reference.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      brand,
      category,
      categoryType,
      reference,
      price,
      rating: Math.min(4.9, 4.5 + (index % 5) / 10),
      reviews: 28 + index * 7,
      stock: "En stock — expédié sous 24 h",
      icon: categoryInfo?.icon ?? "◉",
      color: baseProducts.find((product) => product.category === category)?.color ?? "#e9eef2",
      description,
      tags: ["Sélection Mister Auto", "Garantie fabricant"],
      listed: categoryType !== "batteries-auto",
    } satisfies Omit<ProductRecord, "id">;
  }),
];

const batteryProducts: Array<Omit<ProductRecord, "id">> = [
  { slug: "batterie-bolk-m040002", name: "Batterie de voiture 70 Ah / 760 A AGM", brand: "BOLK", category: "batteries", categoryType: "batteries-auto", reference: "BOL-M040002", price: 132.23, rating: 4.5, reviews: 44, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie AGM 70 Ah avec courant de démarrage de 760 A, adaptée aux véhicules équipés du système Start & Stop.", tags: ["70 Ah", "760 A", "AGM", "Start & Stop", "12 V", "À saisir"] },
  { slug: "batterie-bolk-m040006", name: "Batterie de voiture 60 Ah / 560 A EFB", brand: "BOLK", category: "batteries", categoryType: "batteries-auto", reference: "BOL-M040006", price: 92.51, rating: 4.8, reviews: 12, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie EFB 60 Ah délivrant 560 A, conçue pour les véhicules avec Start & Stop.", tags: ["60 Ah", "560 A", "EFB", "Start & Stop", "12 V"] },
  { slug: "batterie-bolk-m040026", name: "Batterie de voiture 74 Ah / 680 A", brand: "BOLK", category: "batteries", categoryType: "batteries-auto", reference: "BOL-M040026", price: 75.18, rating: 4.8, reviews: 149, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie 74 Ah avec courant de démarrage de 680 A pour un démarrage fiable au quotidien.", tags: ["74 Ah", "680 A", "12 V"] },
  { slug: "batterie-bolk-m010022", name: "Batterie de voiture haute performance 77 Ah / 760 A", brand: "BOLK", category: "batteries", categoryType: "batteries-auto", reference: "BOL-M010022", price: 86.78, rating: 4.5, reviews: 23, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie haute performance de 77 Ah et 760 A pour les véhicules fortement équipés.", tags: ["77 Ah", "760 A", "Haute performance", "12 V"] },
  { slug: "batterie-bolk-m040003", name: "Batterie de voiture 80 Ah / 800 A AGM", brand: "BOLK", category: "batteries", categoryType: "batteries-auto", reference: "BOL-M040003", price: 148.19, rating: 4.0, reviews: 5, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie AGM 80 Ah et 800 A destinée aux véhicules équipés du système Start & Stop.", tags: ["80 Ah", "800 A", "AGM", "Start & Stop", "12 V"] },
  { slug: "batterie-bosch-0092-s5a-110", name: "Batterie de voiture 80 Ah / 800 A", brand: "BOSCH", category: "batteries", categoryType: "batteries-auto", reference: "0 092 S5A 110 / S5 A11", price: 189.14, rating: 4.7, reviews: 12, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie BOSCH de 80 Ah avec courant de démarrage de 800 A.", tags: ["80 Ah", "800 A", "12 V"] },
  { slug: "batterie-exide-ek820", name: "Batterie de voiture 82 Ah / 800 A", brand: "EXIDE", category: "batteries", categoryType: "batteries-auto", reference: "EK820", price: 162.23, rating: 5, reviews: 2, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie EXIDE de 82 Ah et 800 A, modèle EK820.", tags: ["82 Ah", "800 A", "12 V"] },
  { slug: "batterie-bosch-0092-s40-080", name: "Batterie de voiture 74 Ah / 680 A", brand: "BOSCH", category: "batteries", categoryType: "batteries-auto", reference: "0 092 S40 080 / S4 008", price: 110.89, rating: 4.8, reviews: 21, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie BOSCH S4 de 74 Ah avec courant de démarrage de 680 A.", tags: ["74 Ah", "680 A", "12 V"] },
  { slug: "batterie-bosch-0092-s50-080", name: "Batterie de voiture 77 Ah / 780 A", brand: "BOSCH", category: "batteries", categoryType: "batteries-auto", reference: "0 092 S50 080 / S5 008", price: 125.78, rating: 4.6, reviews: 16, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie BOSCH S5 de 77 Ah et 780 A.", tags: ["77 Ah", "780 A", "12 V"] },
  { slug: "batterie-bosch-0092-s4e-051", name: "Batterie de voiture 60 Ah / 640 A", brand: "BOSCH", category: "batteries", categoryType: "batteries-auto", reference: "0 092 S4E 051 / S4 E05", price: 115.99, rating: 4.4, reviews: 8, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie BOSCH S4 de 60 Ah et 640 A.", tags: ["60 Ah", "640 A", "12 V"] },
  { slug: "batterie-bproauto-04220002", name: "Batterie de voiture 70 Ah / 760 A", brand: "BPROAUTO", category: "batteries", categoryType: "batteries-auto", reference: "PRO-04220002", price: 135.76, rating: 4.6, reviews: 6, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie BPROAUTO de 70 Ah avec courant de démarrage de 760 A.", tags: ["70 Ah", "760 A", "12 V"] },
  { slug: "batterie-yuasa-ybx9115", name: "Batterie de voiture 80 Ah / 800 A", brand: "YUASA", category: "batteries", categoryType: "batteries-auto", reference: "YBX9115", price: 180.62, rating: 0, reviews: 0, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie YUASA de 80 Ah avec courant de démarrage de 800 A, référence YBX9115.", tags: ["80 Ah", "800 A", "12 V"] },
  { slug: "batterie-bproauto-04220003", name: "Batterie de voiture 80 Ah / 800 A", brand: "BPROAUTO", category: "batteries", categoryType: "batteries-auto", reference: "PRO-04220003", price: 152.15, rating: 4.0, reviews: 5, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie BPROAUTO de 80 Ah et 800 A.", tags: ["80 Ah", "800 A", "12 V"] },
  { slug: "batterie-bproauto-04220026", name: "Batterie de voiture 74 Ah / 680 A", brand: "BPROAUTO", category: "batteries", categoryType: "batteries-auto", reference: "PRO-04220026", price: 77.18, rating: 4.8, reviews: 12, stock: "Livraison rapide — expédié sous 24 h", icon: "▣", color: "#fff", description: "Batterie BPROAUTO de 74 Ah avec courant de démarrage de 680 A.", tags: ["74 Ah", "680 A", "12 V"] },
];

const productRecords = [
  ...baseProducts,
  ...extraProducts.map((product, index) => ({ ...product, id: `p${index + 13}` })),
  ...batteryProducts.map((product) => ({ ...product, id: `battery-${product.reference.toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, "-")}` })),
];

const batteryImages: Record<string, string> = {
  "BOL-M040002": "/images/products/batteries/bolk-m040002.png",
  "BOL-M040006": "/images/products/batteries/bolk-m040006.png",
  "BOL-M040026": "/images/products/batteries/bolk-m040026.png",
  "BOL-M010022": "/images/products/batteries/bolk-m010022.png",
  "BOL-M040003": "/images/products/batteries/bolk-m040003.png",
  "0 092 S5A 110 / S5 A11": "/images/products/batteries/bosch-0092-s5a-110.png",
  EK820: "/images/products/batteries/exide-ek820.png",
  "0 092 S40 080 / S4 008": "/images/products/batteries/bosch-0092-s40-080.png",
  "0 092 S50 080 / S5 008": "/images/products/batteries/bosch-0092-s50-080.png",
  "0 092 S4E 051 / S4 E05": "/images/products/batteries/bosch-0092-s4e-051.png",
  "PRO-04220002": "/images/products/batteries/bproauto-04220002.png",
  YBX9115: "/images/products/batteries/yuasa-ybx9115.png",
  "PRO-04220003": "/images/products/batteries/bproauto-04220003.png",
  "PRO-04220026": "/images/products/batteries/bproauto-04220026.png",
};

const batteryScreenshotSource = "https://github.com/oardietadb/mister-auto-final-demo/blob/main/batteries.png";

export const products: Product[] = productRecords.map((product) => ({
  ...product,
  image: batteryImages[product.reference] ?? null,
  imageAlt: product.name,
  imageSourceUrl: batteryImages[product.reference] ? batteryScreenshotSource : null,
  imageStatus: batteryImages[product.reference] ? "matched" : "unavailable",
  listed: product.listed !== false,
}));

export const listedProducts = products.filter((product) => product.listed);

export const productImageAudit = listedProducts.map(({ slug, reference, imageSourceUrl, image, imageStatus }) => ({
  slug,
  reference,
  sourceUrl: imageSourceUrl,
  imagePath: image,
  status: imageStatus,
  note: imageStatus === "matched" ? null : "Aucune image retenue : la correspondance officielle n’a pas pu être vérifiée.",
}));

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price);
export const findProduct = (slug: string) => products.find((product) => product.slug === slug);
export const findCategory = (slug: string) => categories.find((category) => category.slug === slug);
export const findCategoryType = (slug: string) => categoryTypes.find((type) => type.slug === slug);
