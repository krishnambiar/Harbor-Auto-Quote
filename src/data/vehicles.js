export const commonVehicleMakes = [
  "Acura",
  "Alfa Romeo",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "FIAT",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Polestar",
  "Porsche",
  "RAM",
  "Rivian",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

export const vehicleCatalog = [
  {
    make: "Toyota",
    models: [
      { name: "Camry", bodyType: "sedan", trims: ["LE", "SE", "XLE"], baseValue: 28500, safetyScore: 0.96 },
      { name: "RAV4", bodyType: "suv", trims: ["LE", "XLE", "Limited"], baseValue: 33600, safetyScore: 0.97 },
      { name: "Corolla", bodyType: "sedan", trims: ["LE", "SE", "Hybrid"], baseValue: 23800, safetyScore: 0.95 },
    ],
  },
  {
    make: "Honda",
    models: [
      { name: "Accord", bodyType: "sedan", trims: ["LX", "EX", "Touring"], baseValue: 30500, safetyScore: 0.96 },
      { name: "CR-V", bodyType: "suv", trims: ["EX", "Sport", "Touring"], baseValue: 34500, safetyScore: 0.97 },
      { name: "Civic", bodyType: "sedan", trims: ["LX", "Sport", "EX"], baseValue: 25800, safetyScore: 0.95 },
    ],
  },
  {
    make: "Ford",
    models: [
      { name: "F-150", bodyType: "truck", trims: ["XL", "XLT", "Lariat"], baseValue: 43500, safetyScore: 1 },
      { name: "Escape", bodyType: "suv", trims: ["Active", "ST-Line", "Platinum"], baseValue: 32400, safetyScore: 0.98 },
      { name: "Mustang", bodyType: "coupe", trims: ["EcoBoost", "GT", "Dark Horse"], baseValue: 42500, safetyScore: 1.08 },
    ],
  },
  {
    make: "Chevrolet",
    models: [
      { name: "Malibu", bodyType: "sedan", trims: ["LS", "RS", "LT"], baseValue: 27000, safetyScore: 0.98 },
      { name: "Equinox", bodyType: "suv", trims: ["LS", "LT", "Premier"], baseValue: 31500, safetyScore: 0.98 },
      { name: "Silverado 1500", bodyType: "truck", trims: ["WT", "LT", "High Country"], baseValue: 45500, safetyScore: 1.03 },
    ],
  },
  {
    make: "Tesla",
    models: [
      { name: "Model 3", bodyType: "ev", trims: ["Rear-Wheel Drive", "Long Range", "Performance"], baseValue: 40200, safetyScore: 0.99 },
      { name: "Model Y", bodyType: "ev", trims: ["Rear-Wheel Drive", "Long Range", "Performance"], baseValue: 45200, safetyScore: 0.99 },
    ],
  },
  {
    make: "BMW",
    models: [
      { name: "330i", bodyType: "sedan", trims: ["Sport", "xDrive", "M Sport"], baseValue: 48200, safetyScore: 1.07 },
      { name: "X3", bodyType: "suv", trims: ["sDrive30i", "xDrive30i", "M40i"], baseValue: 52600, safetyScore: 1.08 },
    ],
  },
  {
    make: "Subaru",
    models: [
      { name: "Outback", bodyType: "suv", trims: ["Base", "Premium", "Touring"], baseValue: 34200, safetyScore: 0.94 },
      { name: "Forester", bodyType: "suv", trims: ["Base", "Sport", "Limited"], baseValue: 31900, safetyScore: 0.95 },
    ],
  },
  {
    make: "Hyundai",
    models: [
      { name: "Elantra", bodyType: "sedan", trims: ["SE", "SEL", "Limited"], baseValue: 23900, safetyScore: 0.98 },
      { name: "Santa Fe", bodyType: "suv", trims: ["SE", "SEL", "Calligraphy"], baseValue: 37100, safetyScore: 0.97 },
    ],
  },
];

export function getMakes() {
  return [...new Set([...vehicleCatalog.map((item) => item.make), ...commonVehicleMakes])].sort((a, b) => a.localeCompare(b));
}

export function getModels(make) {
  return vehicleCatalog.find((item) => item.make === make)?.models ?? [];
}

export function getVehicleModel(make, model) {
  return getModels(make).find((item) => item.name === model);
}

export function inferBodyType({ make = "", model = "" }) {
  const localModel = getVehicleModel(make, model);
  if (localModel?.bodyType) return localModel.bodyType;

  const normalized = `${make} ${model}`.toLowerCase();
  if (/\b(f-?150|silverado|ram|tacoma|tundra|ranger|sierra|frontier|ridgeline|colorado|canyon)\b/.test(normalized)) return "truck";
  if (/\b(sienna|odyssey|pacifica|caravan|sedona|carnival|minivan)\b/.test(normalized)) return "minivan";
  if (/\b(mustang|camaro|challenger|charger|corvette|coupe|2dr|2-door)\b/.test(normalized)) return "coupe";
  if (/\b(rav4|cr-v|x3|x5|x7|escape|equinox|explorer|forester|outback|crosstrek|highlander|pilot|tahoe|suburban|sorento|sportage|telluride|range rover|defender|discovery|suv|cuv)\b/.test(normalized)) return "suv";
  if (/\b(tesla|model 3|model y|bolt|leaf|ioniq|id\.4|e-tron|i4|i5|ev|electric)\b/.test(normalized)) return "ev";
  if (model) return "sedan";
  return "";
}

export function estimateVehicleValue({ year, make = "", model = "", bodyType = "" }) {
  const localModel = getVehicleModel(make, model);
  const resolvedBodyType = bodyType || inferBodyType({ make, model }) || "sedan";
  const baseByBodyType = {
    sedan: 30000,
    suv: 38000,
    truck: 44000,
    coupe: 36000,
    minivan: 35000,
    ev: 46000,
    luxury: 56000,
  };
  const luxuryMakes = ["BMW", "Mercedes-Benz", "Mercedes", "Audi", "Lexus", "Acura", "Genesis", "Cadillac", "Volvo", "Porsche", "Land Rover", "Jaguar", "Range Rover"];
  const baseValue = localModel?.baseValue ?? (baseByBodyType[resolvedBodyType] || 32000) * (luxuryMakes.includes(make) ? 1.28 : 1);
  const modelYear = Number(year);
  if (!modelYear) return Math.round(baseValue / 500) * 500;

  const age = Math.max(0, new Date().getFullYear() - modelYear);
  const depreciationFactor = Math.max(0.28, 1 - Math.min(age, 1) * 0.16 - Math.max(age - 1, 0) * 0.095);
  return Math.round((baseValue * depreciationFactor) / 500) * 500;
}
