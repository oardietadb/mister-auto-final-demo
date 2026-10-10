export const vehicleMakes = {
  Renault: ["Clio V", "Captur II", "Mégane IV", "Espace V"],
  Peugeot: ["208 II", "308 III", "3008 II"],
  Citroën: ["C3 III", "C4 III", "C5 Aircross"],
  Volkswagen: ["Golf VIII", "Polo VI", "Tiguan II"],
} as const;

export const vehicleEngines = ["1.0 TCe 90 ch", "1.5 BlueHDi 110 ch", "1.3 TCe 140 ch", "1.2 PureTech 130 ch"] as const;

export type VehicleSelection = {
  make: keyof typeof vehicleMakes;
  model: string;
  engine: (typeof vehicleEngines)[number];
  registration?: string;
};

function isVehicleMake(value: unknown): value is keyof typeof vehicleMakes {
  return typeof value === "string" && Object.hasOwn(vehicleMakes, value);
}

export function isVehicleSelection(value: unknown): value is VehicleSelection {
  if (!value || typeof value !== "object") return false;
  const vehicle = value as Record<string, unknown>;
  const make = vehicle.make;
  const model = vehicle.model;
  const engine = vehicle.engine;
  const registration = vehicle.registration;
  if (!isVehicleMake(make)) return false;
  if (typeof model !== "string" || !vehicleMakes[make].some((availableModel) => availableModel === model)) return false;
  if (typeof engine !== "string" || !vehicleEngines.some((availableEngine) => availableEngine === engine)) return false;
  return registration === undefined || typeof registration === "string" && /^[A-Z0-9 -]{1,12}$/i.test(registration);
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
