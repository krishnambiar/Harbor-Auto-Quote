const NHTSA_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";

export async function getNhtsaMakes({ signal } = {}) {
  const vehicleTypes = ["car", "truck", "multipurpose passenger vehicle"];
  const requests = vehicleTypes.map(async (type) => {
    const url = `${NHTSA_BASE_URL}/GetMakesForVehicleType/${encodeURIComponent(type)}?format=json`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`NHTSA make lookup failed with ${response.status}`);
    const data = await response.json();
    return data.Results ?? [];
  });

  const results = await Promise.allSettled(requests);
  const makes = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .map((item) => normalizeMakeLabel(item.MakeName || item.Make_Name || item.make_name || ""))
    .filter(Boolean);

  if (!makes.length) throw new Error("NHTSA make lookup returned no vehicle makes");
  return [...new Set(makes)].sort((a, b) => a.localeCompare(b));
}

export async function getNhtsaModels({ year, make, signal }) {
  if (!make || !year || Number(year) < 1995) return [];

  const url = `${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}?format=json`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`NHTSA model lookup failed with ${response.status}`);

  const data = await response.json();
  return [...new Set((data.Results ?? []).map((item) => item.Model_Name).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((model) => ({
      name: model,
      source: "NHTSA vPIC",
    }));
}

export async function decodeVin({ vin, signal }) {
  const normalizedVin = vin.trim().toUpperCase();
  if (normalizedVin.length !== 17) return null;

  const url = `${NHTSA_BASE_URL}/DecodeVinValuesExtended/${encodeURIComponent(normalizedVin)}?format=json`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`NHTSA VIN decode failed with ${response.status}`);

  const data = await response.json();
  const result = data.Results?.[0];
  if (!result || result.ErrorCode !== "0") return null;

  return {
    year: result.ModelYear || "",
    make: normalizeMakeLabel(result.Make || ""),
    model: result.Model || "",
    trim: result.Trim || result.Series || "",
    bodyClass: result.BodyClass || "",
    source: "NHTSA VIN decode",
  };
}

function normalizeMakeLabel(make) {
  const normalized = make
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const specialCases = {
    Bmw: "BMW",
    Gmc: "GMC",
    Mini: "MINI",
    Ram: "RAM",
    Fiat: "FIAT",
    Srt: "SRT",
    Amc: "AMC",
    Alfa: "Alfa Romeo",
    "Landrover": "Land Rover",
    "Land Rover": "Land Rover",
    "Mercedes-benz": "Mercedes-Benz",
    "Rolls Royce": "Rolls-Royce",
  };

  return specialCases[normalized] || normalized;
}
