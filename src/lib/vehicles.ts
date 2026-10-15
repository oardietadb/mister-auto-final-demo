export const vehicleCatalog = [
  { make: "Audi", models: [
    { name: "A3 Sportback (8YA)", engines: ["30 TFSI 110 ch", "35 TFSI 150 ch", "35 TDI 150 ch", "RS3 2.5 TFSI 400 ch"] },
    { name: "A4 Avant (B9)", engines: ["35 TFSI 150 ch", "40 TDI 204 ch"] },
  ] },
  { make: "Citroën", models: [
    { name: "C3 III", engines: ["1.2 PureTech 83 ch", "1.5 BlueHDi 100 ch"] },
    { name: "C4 III", engines: ["1.2 PureTech 130 ch", "1.5 BlueHDi 130 ch"] },
  ] },
  { make: "Peugeot", models: [
    { name: "208 II", engines: ["1.2 PureTech 100 ch", "1.5 BlueHDi 100 ch"] },
    { name: "308 III", engines: ["1.2 PureTech 130 ch", "1.5 BlueHDi 130 ch"] },
    { name: "3008 II", engines: ["1.2 PureTech 130 ch", "1.5 BlueHDi 130 ch"] },
  ] },
  { make: "Renault", models: [
    { name: "Clio V", engines: ["1.0 TCe 90 ch", "1.3 TCe 140 ch", "1.5 Blue dCi 100 ch"] },
    { name: "Captur II", engines: ["1.0 TCe 90 ch", "1.3 TCe 140 ch", "1.5 Blue dCi 115 ch"] },
    { name: "Espace IV (JK0/1_)", engines: ["2.0 16V 140 ch", "2.0 dCi 150 ch", "3.0 dCi 180 ch"] },
    { name: "Mégane IV", engines: ["1.3 TCe 140 ch", "1.5 Blue dCi 115 ch"] },
  ] },
  { make: "Volkswagen", models: [
    { name: "Golf VIII", engines: ["1.0 eTSI 110 ch", "1.5 eTSI 150 ch", "2.0 TDI 150 ch"] },
    { name: "Polo VI", engines: ["1.0 TSI 95 ch", "1.0 TSI 110 ch"] },
    { name: "Tiguan II", engines: ["1.5 TSI 150 ch", "2.0 TDI 150 ch"] },
  ] },
] as const;

export const vehicleMileageOptions = [
  { value: "under-5000", label: "Moins de 5 000 km" },
  { value: "5000-10000", label: "De 5 000 à 10 000 km" },
  { value: "10000-20000", label: "De 10 000 à 20 000 km" },
  { value: "20000-50000", label: "De 20 000 à 50 000 km" },
  { value: "over-50000", label: "Plus de 50 000 km" },
] as const;

export type VehicleSelection = {
  make: (typeof vehicleCatalog)[number]["make"];
  model: string;
  engine: string;
  registration?: string;
  mileage?: (typeof vehicleMileageOptions)[number]["value"];
  lastInspection?: string;
};

const vehicleInspectionYears = new Set(
  Array.from({ length: 30 }, (_, index) => String(new Date().getFullYear() - index)),
);

function findVehicleModel(make: unknown, model: unknown) {
  if (typeof make !== "string" || typeof model !== "string") return undefined;
  return vehicleCatalog.find((entry) => entry.make === make)?.models.find((entry) => entry.name === model);
}

export function isVehicleSelection(value: unknown): value is VehicleSelection {
  if (!value || typeof value !== "object") return false;
  const vehicle = value as Record<string, unknown>;
  const make = vehicle.make;
  const model = vehicle.model;
  const engine = vehicle.engine;
  const registration = vehicle.registration;
  const selectedModel = findVehicleModel(make, model);
  if (!selectedModel || typeof engine !== "string" || !selectedModel.engines.some((availableEngine) => availableEngine === engine)) return false;
  if (registration !== undefined && (typeof registration !== "string" || !/^[A-Z0-9 -]{1,12}$/i.test(registration))) return false;
  if (vehicle.mileage !== undefined && !vehicleMileageOptions.some((option) => option.value === vehicle.mileage)) return false;
  if (vehicle.lastInspection !== undefined) {
    const match = typeof vehicle.lastInspection === "string" && /^(\d{4})-(0[1-9]|1[0-2])$/.exec(vehicle.lastInspection);
    if (!match || !vehicleInspectionYears.has(match[1])) return false;
  }
  return true;
}

export async function validateVehicleSelection(value: VehicleSelection): Promise<VehicleSelection> {
  const response = await fetch("/api/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  const result = await response.json() as { vehicle?: VehicleSelection; error?: string };
  if (!response.ok || !result.vehicle) throw new Error(result.error ?? "La validation du véhicule a échoué.");
  return result.vehicle;
}
