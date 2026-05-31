const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";
const US_BOUNDS = "-125,24,-66,50";

const stateAbbreviations = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

const urbanSignals = [
  "new york",
  "brooklyn",
  "queens",
  "bronx",
  "jersey city",
  "newark",
  "philadelphia",
  "boston",
  "chicago",
  "los angeles",
  "san francisco",
  "seattle",
  "austin",
  "atlanta",
  "washington",
];

const ruralSignals = ["township", "village", "borough", "unincorporated"];

export const mockAddresses = [
  {
    id: "nyc-park-slope",
    label: "284 7th Ave, Brooklyn, NY 11215",
    city: "Brooklyn",
    state: "NY",
    zip: "11215",
    areaType: "urban",
    garagingRisk: "high",
  },
  {
    id: "nj-montclair",
    label: "41 Valley Rd, Montclair, NJ 07042",
    city: "Montclair",
    state: "NJ",
    zip: "07042",
    areaType: "suburban",
    garagingRisk: "medium",
  },
  {
    id: "pa-lancaster",
    label: "216 N Duke St, Lancaster, PA 17602",
    city: "Lancaster",
    state: "PA",
    zip: "17602",
    areaType: "suburban",
    garagingRisk: "medium",
  },
  {
    id: "tx-austin",
    label: "1201 S Congress Ave, Austin, TX 78704",
    city: "Austin",
    state: "TX",
    zip: "78704",
    areaType: "urban",
    garagingRisk: "medium",
  },
  {
    id: "ca-irvine",
    label: "18881 Von Karman Ave, Irvine, CA 92612",
    city: "Irvine",
    state: "CA",
    zip: "92612",
    areaType: "suburban",
    garagingRisk: "low",
  },
  {
    id: "oh-columbus",
    label: "352 W 5th Ave, Columbus, OH 43201",
    city: "Columbus",
    state: "OH",
    zip: "43201",
    areaType: "urban",
    garagingRisk: "medium",
  },
  {
    id: "nc-cary",
    label: "201 W Chatham St, Cary, NC 27511",
    city: "Cary",
    state: "NC",
    zip: "27511",
    areaType: "suburban",
    garagingRisk: "low",
  },
  {
    id: "co-boulder",
    label: "1300 Pearl St, Boulder, CO 80302",
    city: "Boulder",
    state: "CO",
    zip: "80302",
    areaType: "urban",
    garagingRisk: "medium",
  },
  {
    id: "ga-savannah",
    label: "22 E Bryan St, Savannah, GA 31401",
    city: "Savannah",
    state: "GA",
    zip: "31401",
    areaType: "urban",
    garagingRisk: "medium",
  },
  {
    id: "ia-ames",
    label: "420 Main St, Ames, IA 50010",
    city: "Ames",
    state: "IA",
    zip: "50010",
    areaType: "rural",
    garagingRisk: "low",
  },
];

export function findAddressSuggestions(query) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];
  if (mockAddresses.some((address) => address.label.toLowerCase() === normalized)) return [];

  return mockAddresses
    .filter((address) => address.label.toLowerCase().includes(normalized))
    .slice(0, 5);
}

export async function searchAddressSuggestions(query, signal) {
  const normalized = query.trim();
  if (normalized.length < 3) {
    return { source: "none", suggestions: [] };
  }

  try {
    const apiSuggestions = await searchPhotonAddresses(normalized, signal);
    if (apiSuggestions.length) {
      return { source: "api", suggestions: apiSuggestions };
    }
  } catch (error) {
    if (error.name === "AbortError") throw error;
  }

  return {
    source: "fallback",
    suggestions: findAddressSuggestions(normalized),
  };
}

async function searchPhotonAddresses(query, signal) {
  const params = new URLSearchParams({
    q: query,
    countrycode: "US",
    layer: "house",
    limit: "8",
    lang: "en",
    bbox: US_BOUNDS,
  });

  const response = await fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(`Photon address lookup failed with ${response.status}`);
  }

  const data = await response.json();
  return (data.features ?? [])
    .map(normalizePhotonFeature)
    .filter(Boolean)
    .filter((address, index, addresses) => addresses.findIndex((item) => item.label === address.label) === index)
    .slice(0, 6);
}

function normalizePhotonFeature(feature) {
  const properties = feature.properties ?? {};
  const street = properties.street || properties.name;
  const houseNumber = properties.housenumber;
  const city =
    properties.city ||
    properties.locality ||
    properties.district ||
    properties.county ||
    properties.municipality ||
    "";
  const state = normalizeState(properties.state);
  const zip = properties.postcode || "";

  if (!street || !state) return null;

  const streetLine = houseNumber ? `${houseNumber} ${street}` : street;
  const labelParts = [streetLine, city, [state, zip].filter(Boolean).join(" ")].filter(Boolean);
  const [lon, lat] = feature.geometry?.coordinates ?? [];

  return {
    id: `photon-${properties.osm_type || "x"}-${properties.osm_id || labelParts.join("-")}`,
    label: labelParts.join(", "),
    city,
    state,
    zip,
    areaType: inferAreaType(city),
    garagingRisk: inferGaragingRisk(city),
    source: "Photon / OpenStreetMap",
    coordinates: Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null,
  };
}

function normalizeState(state) {
  if (!state) return "";
  if (state.length === 2) return state.toUpperCase();
  return stateAbbreviations[state] || state;
}

function inferAreaType(city) {
  const normalized = city.toLowerCase();
  if (urbanSignals.some((signal) => normalized.includes(signal))) return "urban";
  if (ruralSignals.some((signal) => normalized.includes(signal))) return "rural";
  return "suburban";
}

function inferGaragingRisk(city) {
  const areaType = inferAreaType(city);
  if (areaType === "urban") return "high";
  if (areaType === "rural") return "low";
  return "medium";
}
