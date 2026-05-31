import { mockAddresses, searchAddressSuggestions } from "./data/addresses.js";
import { coverageLevels, deductibleOptions } from "./data/coverage.js";
import { discountCatalog } from "./data/discounts.js";
import { decodeVin, getNhtsaMakes, getNhtsaModels } from "./data/vehicleApi.js";
import { estimateVehicleValue, getMakes, getModels, getVehicleModel, inferBodyType } from "./data/vehicles.js";
import { calculatePlanComparison, calculateQuote } from "./engine/quoteCalculator.js";

const app = document.querySelector("#app");

const currentYear = new Date().getFullYear();
const usStateOptions = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const steps = [
  { id: "landing", label: "Welcome" },
  { id: "location", label: "Location" },
  { id: "driver", label: "Driver" },
  { id: "vehicle", label: "Vehicle" },
  { id: "history", label: "History" },
  { id: "coverage", label: "Coverage" },
  { id: "discounts", label: "Discounts" },
  { id: "review", label: "Review" },
  { id: "results", label: "Quote" },
];

const defaultQuote = {
  location: {
    address: "",
    city: "",
    state: "",
    zip: "",
    areaType: "",
    garagingRisk: "",
  },
  driver: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    studentStatus: "",
    goodStudent: "",
    education: "",
    employment: "",
    homeStatus: "",
    currentlyInsured: "",
    continuousInsurance: "",
    licenseStatus: "",
    yearsLicensed: "",
    riskTier: "",
  },
  vehicle: {
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    bodyType: "",
    bodyTypeSource: "",
    estimatedValue: "",
    estimatedValueSource: "",
    ownership: "",
    primaryUse: "",
    annualMileage: "",
    commuteDistance: "",
    parking: "",
    safetyFeatures: [],
    antiTheft: "",
  },
  history: {
    accidents: "",
    atFaultAccidents: "",
    tickets: "",
    dui: "",
    claims: "",
    suspension: "",
    incidentDate: "",
    incidentSeverity: "",
  },
  coverage: {
    level: "",
    deductible: "",
  },
  discounts: {
    selected: [],
  },
};

const sampleQuote = {
  ...structuredClone(defaultQuote),
  driver: {
    firstName: "Alex",
    lastName: "Rivera",
    dateOfBirth: "1995-06-15",
    gender: "not-specified",
    maritalStatus: "single",
    studentStatus: "not-student",
    goodStudent: "no",
    education: "bachelors",
    employment: "employed",
    homeStatus: "rent",
    currentlyInsured: "yes",
    continuousInsurance: 3,
    licenseStatus: "valid",
    yearsLicensed: 8,
    riskTier: "standard",
  },
  vehicle: {
    vin: "",
    year: currentYear - 2,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    bodyType: "sedan",
    bodyTypeSource: "Local sample vehicle data",
    estimatedValue: 28500,
    estimatedValueSource: "Local sample vehicle data",
    ownership: "financed",
    primaryUse: "commute",
    annualMileage: 12000,
    commuteDistance: 14,
    parking: "driveway",
    safetyFeatures: ["automaticBraking", "blindSpot", "laneAssist"],
    antiTheft: "yes",
  },
  history: {
    accidents: 0,
    atFaultAccidents: 0,
    tickets: 0,
    dui: "no",
    claims: 0,
    suspension: "no",
    incidentDate: "",
    incidentSeverity: "none",
  },
  coverage: {
    level: "standard",
    deductible: 500,
  },
  discounts: {
    selected: ["paperless"],
  },
};

const stepSamples = {
  location: [
    {
      address: "22 E Bryan St, Savannah, GA 31401",
      city: "Savannah",
      state: "GA",
      zip: "31401",
      areaType: "urban",
      garagingRisk: "medium",
    },
    {
      address: "420 Main St, Ames, IA 50010",
      city: "Ames",
      state: "IA",
      zip: "50010",
      areaType: "rural",
      garagingRisk: "low",
    },
    {
      address: "18881 Von Karman Ave, Irvine, CA 92612",
      city: "Irvine",
      state: "CA",
      zip: "92612",
      areaType: "suburban",
      garagingRisk: "low",
    },
  ],
  driver: [
    {
      firstName: "Maya",
      lastName: "Chen",
      dateOfBirth: "2005-09-02",
      gender: "female",
      maritalStatus: "single",
      studentStatus: "full-time",
      goodStudent: "yes",
      education: "some-college",
      employment: "student",
      homeStatus: "family",
      currentlyInsured: "yes",
      continuousInsurance: 1,
      licenseStatus: "valid",
      yearsLicensed: 2,
      riskTier: "standard",
    },
    {
      firstName: "Jordan",
      lastName: "Brooks",
      dateOfBirth: "1978-03-18",
      gender: "not-specified",
      maritalStatus: "married",
      studentStatus: "not-student",
      goodStudent: "",
      education: "graduate",
      employment: "self-employed",
      homeStatus: "own",
      currentlyInsured: "yes",
      continuousInsurance: 18,
      licenseStatus: "valid",
      yearsLicensed: 25,
      riskTier: "preferred",
    },
    {
      firstName: "Riley",
      lastName: "Patel",
      dateOfBirth: "1999-12-04",
      gender: "non-binary",
      maritalStatus: "single",
      studentStatus: "not-student",
      goodStudent: "",
      education: "bachelors",
      employment: "employed",
      homeStatus: "rent",
      currentlyInsured: "no",
      continuousInsurance: 0,
      licenseStatus: "reinstated",
      yearsLicensed: 5,
      riskTier: "developing",
    },
  ],
  vehicle: [
    {
      vin: "",
      year: 2012,
      make: "Honda",
      model: "Civic",
      trim: "LX",
      bodyType: "sedan",
      bodyTypeSource: "Sample profile",
      estimatedValue: 9500,
      estimatedValueSource: "Sample value estimate; NHTSA vPIC does not provide market value.",
      ownership: "owned",
      primaryUse: "pleasure",
      annualMileage: 5200,
      commuteDistance: 0,
      parking: "garage",
      safetyFeatures: ["rearCamera"],
      antiTheft: "no",
    },
    {
      vin: "",
      year: 2024,
      make: "Land Rover",
      model: "Range Rover",
      trim: "N/A",
      bodyType: "suv",
      bodyTypeSource: "Sample profile",
      estimatedValue: 108000,
      estimatedValueSource: "Sample value estimate; NHTSA vPIC does not provide market value.",
      ownership: "leased",
      primaryUse: "commute",
      annualMileage: 10500,
      commuteDistance: 18,
      parking: "driveway",
      safetyFeatures: ["automaticBraking", "blindSpot", "laneAssist", "adaptiveCruise", "rearCamera"],
      antiTheft: "yes",
    },
    {
      vin: "",
      year: 2021,
      make: "Tesla",
      model: "Model Y",
      trim: "Long Range",
      bodyType: "ev",
      bodyTypeSource: "Sample profile",
      estimatedValue: 36500,
      estimatedValueSource: "Sample value estimate; NHTSA vPIC does not provide market value.",
      ownership: "financed",
      primaryUse: "rideshare",
      annualMileage: 26000,
      commuteDistance: 42,
      parking: "street",
      safetyFeatures: ["automaticBraking", "laneAssist", "adaptiveCruise", "rearCamera"],
      antiTheft: "yes",
    },
  ],
  history: [
    {
      accidents: 0,
      atFaultAccidents: 0,
      tickets: 0,
      dui: "no",
      claims: 0,
      suspension: "no",
      incidentDate: "",
      incidentSeverity: "none",
    },
    {
      accidents: 1,
      atFaultAccidents: 1,
      tickets: 2,
      dui: "no",
      claims: 1,
      suspension: "no",
      incidentDate: "2024-08-12",
      incidentSeverity: "moderate",
    },
    {
      accidents: 0,
      atFaultAccidents: 0,
      tickets: 1,
      dui: "yes",
      claims: 0,
      suspension: "yes",
      incidentDate: "2023-11-03",
      incidentSeverity: "severe",
    },
  ],
  coverage: [
    { level: "basic", deductible: 1000 },
    { level: "full", deductible: 500 },
    { level: "premium", deductible: 250 },
  ],
  discounts: [
    { selected: ["paperless"] },
    { selected: ["paperless", "payInFull", "bundle"] },
    { selected: ["defensiveDriving", "multiCar"] },
  ],
};

let quote = structuredClone(defaultQuote);
let activeStep = 0;
let stepSampleCursor = {};
let addressSuggestions = [];
let addressLookup = { status: "idle", message: "" };
let addressSearchTimer = null;
let addressSearchController = null;
let addressSearchRequestId = 0;
let vehicleMakeOptions = getMakes();
let vehicleMakeLookup = { status: "idle", message: "Loading public NHTSA make list..." };
let vehicleModelOptions = [];
let vehicleLookup = { status: "idle", message: "" };
let vehicleSearchController = null;
let vehicleSearchRequestId = 0;
let vinSearchController = null;
let vinSearchRequestId = 0;
let vinDecodeTimer = null;

function setNestedValue(path, value) {
  const parts = path.split(".");
  const finalKey = parts.pop();
  const target = parts.reduce((object, key) => object[key], quote);
  target[finalKey] = value;
}

function getNestedValue(path) {
  return path.split(".").reduce((object, key) => object?.[key], quote);
}

function getInputValue(input) {
  if (input.type !== "number") return input.value;
  return input.value === "" ? "" : Number(input.value);
}

function uniqueOptions(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function currency(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function option(label, value, selectedValue, extra = "") {
  return `<option value="${escapeHtml(value)}" ${String(selectedValue) === String(value) ? "selected" : ""} ${extra}>${escapeHtml(label)}</option>`;
}

function inputField({ label, path, type = "text", helper = "", min = "", max = "", step = "", maxLength = "", autoCapitalize = "" }) {
  const value = getNestedValue(path) ?? "";
  return `
    <label class="field">
      <span>${label}</span>
      <input data-path="${path}" type="${type}" value="${escapeHtml(value)}" min="${min}" max="${max}" step="${step}" maxlength="${maxLength}" autocapitalize="${autoCapitalize}" />
      ${helper ? `<small>${helper}</small>` : ""}
    </label>
  `;
}

function selectField({ label, path, options, helper = "", placeholder = "Select one" }) {
  const value = getNestedValue(path);
  return `
    <label class="field">
      <span>${label}</span>
      <select data-path="${path}">
        ${placeholder ? option(placeholder, "", value, "disabled") : ""}
        ${options.map((item) => option(item.label, item.value, value)).join("")}
      </select>
      ${helper ? `<small>${helper}</small>` : ""}
    </label>
  `;
}

function segmentedControl(path, items) {
  const value = getNestedValue(path);
  return `
    <div class="segmented" role="group">
      ${items
        .map(
          (item) => `
            <button type="button" class="segment ${String(value) === String(item.value) ? "is-active" : ""}" data-set="${path}" data-value="${item.value}">
              ${item.label}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function checkboxGrid(path, items) {
  const values = new Set(getNestedValue(path) ?? []);
  return `
    <div class="check-grid">
      ${items
        .map(
          (item) => `
            <label class="check-card">
              <input type="checkbox" data-array-path="${path}" value="${item.value}" ${values.has(item.value) ? "checked" : ""} />
              <span>${item.label}</span>
              ${item.helper ? `<small>${item.helper}</small>` : ""}
            </label>
          `
        )
        .join("")}
    </div>
  `;
}

function progressMarkup() {
  const visibleSteps = steps.slice(1);
  const currentVisibleIndex = Math.max(0, activeStep - 1);
  const percent = activeStep === 0 ? 0 : Math.round((currentVisibleIndex / (visibleSteps.length - 1)) * 100);

  return `
    <aside class="progress-shell">
      <a class="brand" href="#" data-action="home">
        <span class="brand-mark">H</span>
        <span>Harbor Auto Quote</span>
      </a>
      <div class="progress-meter" aria-label="Quote progress">
        <span style="width:${percent}%"></span>
      </div>
      <ol class="step-list">
        ${visibleSteps
          .map((step, index) => {
            const globalIndex = index + 1;
            const status = globalIndex === activeStep ? "is-current" : globalIndex < activeStep ? "is-done" : "";
            return `<li class="${status}"><span>${index + 1}</span>${step.label}</li>`;
          })
          .join("")}
      </ol>
      <div class="help-panel">
        <strong>Estimate only</strong>
        <p>This portfolio app uses simplified public-inspired assumptions and mock data. It is not an insurance offer.</p>
      </div>
    </aside>
  `;
}

function shell(content, options = {}) {
  if (activeStep === 0) return content;
  return `
    <div class="app-shell">
      ${progressMarkup()}
      <main class="quote-stage">
        ${content}
        ${options.hideNav ? "" : navigationMarkup()}
      </main>
    </div>
  `;
}

function navigationMarkup() {
  const backDisabled = activeStep <= 1 ? "disabled" : "";
  const nextLabel = activeStep === steps.length - 2 ? "Calculate Quote" : "Continue";
  const canAutofill = Boolean(stepSamples[steps[activeStep].id]);
  return `
    <nav class="flow-actions">
      <button class="button secondary" type="button" data-action="back" ${backDisabled}>Back</button>
      <div class="flow-action-group">
        ${canAutofill ? `<button class="button secondary" type="button" data-action="autofill">Auto-fill Step</button>` : ""}
        <button class="button primary" type="button" data-action="next">${nextLabel}</button>
      </div>
    </nav>
  `;
}

function landingView() {
  return `
    <main class="landing">
      <header class="landing-nav">
        <a class="brand" href="#" data-action="home">
          <span class="brand-mark">H</span>
          <span>Harbor Auto Quote</span>
        </a>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Portfolio auto insurance quote platform</p>
          <h1>Build a realistic auto quote in minutes.</h1>
          <p>
            Explore a full insurance-style quote flow with live address autocomplete, NHTSA vehicle data,
            VIN decoding, coverage recommendations, locked-in discount eligibility, and a transparent
            rating engine that explains how each answer shapes the estimate.
          </p>
          <div class="hero-actions">
            <button class="button primary large" type="button" data-action="start">Start Quote</button>
            <button class="button ghost large" type="button" data-action="sample">Use Sample Data</button>
          </div>
        </div>
        <div class="hero-visual" aria-label="Auto insurance quote preview">
          <div class="visual-top">
            <span>Sample quote</span>
            <strong>$148/mo</strong>
          </div>
          <div class="hero-car-frame">
            <img src="./harbor-car.png" alt="Green SUV used for Harbor Auto Quote" />
          </div>
          <dl class="visual-metrics">
            <div><dt>Coverage</dt><dd>Standard</dd></div>
            <div><dt>Discounts</dt><dd>5 applied</dd></div>
            <div><dt>Review</dt><dd>Editable</dd></div>
          </dl>
        </div>
      </section>

      <section class="feature-band">
        <article>
          <strong>Guided intake</strong>
          <p>One focused task per screen with plain-language helper text.</p>
        </article>
        <article>
          <strong>Realistic factors</strong>
          <p>Location, vehicle, mileage, history, coverage, deductible, and discounts all matter.</p>
        </article>
        <article>
          <strong>Explainable output</strong>
          <p>Final results show the factors that raised or lowered the estimate.</p>
        </article>
      </section>
    </main>
  `;
}

function locationView() {
  return shell(`
    <section class="step-panel">
      <p class="eyebrow">Step 1 of 8</p>
      <h2>Where is the vehicle primarily kept?</h2>
      <p class="lede">Your garaging address helps estimate state requirements, theft exposure, traffic density, and local claim costs.</p>

      <div class="form-grid single">
        <label class="field autocomplete">
          <span>Garaging address</span>
          <input data-path="location.address" data-autocomplete="address" type="text" value="${quote.location.address}" placeholder="Start typing an address" />
          <small>Powered by Photon / OpenStreetMap. Type at least 3 characters; local mock suggestions appear if the API is unavailable.</small>
          ${
            addressSuggestions.length
              ? `<div class="suggestions">${addressSuggestions
                  .map(
                    (address) =>
                      `<button type="button" data-address-id="${escapeHtml(address.id)}"><span>${escapeHtml(address.label)}</span>${
                        address.source ? `<small>${escapeHtml(address.source)}</small>` : ""
                      }</button>`
                  )
                  .join("")}</div>`
              : ""
          }
          ${addressLookup.message ? `<em class="lookup-status ${addressLookup.status}">${addressLookup.message}</em>` : ""}
        </label>
      </div>

      <div class="form-grid three">
        ${inputField({ label: "City", path: "location.city" })}
        ${selectField({
          label: "State",
          path: "location.state",
          options: usStateOptions.map((state) => ({ label: state, value: state })),
        })}
        ${inputField({ label: "ZIP code", path: "location.zip", type: "text" })}
      </div>

      <div class="form-grid two">
        ${selectField({
          label: "Area type",
          path: "location.areaType",
          helper: "Used as a simplified proxy for traffic density and local claim frequency.",
          options: [
            { label: "Urban", value: "urban" },
            { label: "Suburban", value: "suburban" },
            { label: "Rural", value: "rural" },
          ],
        })}
        ${selectField({
          label: "Garaging risk",
          path: "location.garagingRisk",
          helper: "Mocked from selected address and parking context.",
          options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ],
        })}
      </div>
    </section>
  `);
}

function driverView() {
  const showGoodStudent = quote.driver.studentStatus === "full-time";
  return shell(`
    <section class="step-panel">
      <p class="eyebrow">Step 2 of 8</p>
      <h2>Tell us about the primary driver.</h2>
      <p class="lede">The model uses common rating-style factors without collecting sensitive financial information.</p>

      <div class="form-grid two">
        ${inputField({ label: "First name", path: "driver.firstName", helper: "Only used for the quote summary." })}
        ${inputField({ label: "Last name", path: "driver.lastName" })}
      </div>

      <div class="form-grid three">
        ${inputField({ label: "Date of birth", path: "driver.dateOfBirth", type: "date" })}
        ${selectField({
          label: "Gender",
          path: "driver.gender",
          options: [
            { label: "Prefer not to say", value: "not-specified" },
            { label: "Female", value: "female" },
            { label: "Male", value: "male" },
            { label: "Non-binary", value: "non-binary" },
          ],
        })}
        ${selectField({
          label: "Marital status",
          path: "driver.maritalStatus",
          options: [
            { label: "Single", value: "single" },
            { label: "Married", value: "married" },
            { label: "Divorced", value: "divorced" },
            { label: "Widowed", value: "widowed" },
          ],
        })}
      </div>

      <div class="form-grid ${showGoodStudent ? "three" : "two"}">
        ${selectField({
          label: "Student status",
          path: "driver.studentStatus",
          options: [
            { label: "Not a student", value: "not-student" },
            { label: "Full-time student", value: "full-time" },
            { label: "Part-time student", value: "part-time" },
          ],
        })}
        ${
          showGoodStudent
            ? selectField({
                label: "Good student",
                path: "driver.goodStudent",
                helper: "Can qualify eligible full-time students for a discount.",
                options: [
                  { label: "No", value: "no" },
                  { label: "Yes", value: "yes" },
                ],
              })
            : ""
        }
        ${selectField({
          label: "Education level",
          path: "driver.education",
          options: [
            { label: "High school", value: "high-school" },
            { label: "Some college", value: "some-college" },
            { label: "Bachelor's degree", value: "bachelors" },
            { label: "Graduate degree", value: "graduate" },
          ],
        })}
      </div>

      <div class="form-grid three">
        ${selectField({
          label: "Employment status",
          path: "driver.employment",
          options: [
            { label: "Employed", value: "employed" },
            { label: "Self-employed", value: "self-employed" },
            { label: "Student", value: "student" },
            { label: "Retired", value: "retired" },
            { label: "Between jobs", value: "between-jobs" },
          ],
        })}
        ${selectField({
          label: "Housing",
          path: "driver.homeStatus",
          options: [
            { label: "Own", value: "own" },
            { label: "Rent", value: "rent" },
            { label: "Live with family", value: "family" },
          ],
        })}
        ${selectField({
          label: "Insurance score tier",
          path: "driver.riskTier",
          helper: "A fictional risk tier for modeling only, not a credit pull.",
          options: [
            { label: "Preferred", value: "preferred" },
            { label: "Standard", value: "standard" },
            { label: "Developing", value: "developing" },
          ],
        })}
      </div>

      <div class="form-grid four">
        ${selectField({
          label: "Currently insured",
          path: "driver.currentlyInsured",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        })}
        ${inputField({ label: "Years continuously insured", path: "driver.continuousInsurance", type: "number", min: 0, max: 60 })}
        ${selectField({
          label: "License status",
          path: "driver.licenseStatus",
          options: [
            { label: "Valid", value: "valid" },
            { label: "Permit", value: "permit" },
            { label: "Recently reinstated", value: "reinstated" },
          ],
        })}
        ${inputField({ label: "Years licensed", path: "driver.yearsLicensed", type: "number", min: 0, max: 70 })}
      </div>
    </section>
  `);
}

function vehicleView() {
  const makes = uniqueOptions([quote.vehicle.make, ...vehicleMakeOptions, ...getMakes()]);
  const localModels = getModels(quote.vehicle.make);
  const models = vehicleModelOptions.length ? vehicleModelOptions : localModels.map((model) => ({ name: model.name, source: "Local sample dataset" }));
  const selectedModel = getVehicleModel(quote.vehicle.make, quote.vehicle.model);
  const trims = uniqueOptions([quote.vehicle.trim, ...(selectedModel?.trims ?? [])]);
  const bodyTypeHelper = quote.vehicle.bodyTypeSource || "Estimated after year, make, and model are selected. You can override it.";
  const valueHelper =
    quote.vehicle.estimatedValueSource ||
    "NHTSA vPIC does not provide market values. After vehicle selection, this app estimates value with transparent depreciation rules you can override.";

  return shell(`
    <section class="step-panel">
      <p class="eyebrow">Step 3 of 8</p>
      <h2>Which vehicle are we quoting?</h2>
      <p class="lede">Vehicle value, repair costs, body type, safety features, and usage all influence the estimate. Model suggestions come from NHTSA vPIC when year and make are provided.</p>

      <div class="form-grid single">
        ${inputField({
          label: "VIN (optional)",
          path: "vehicle.vin",
          helper: "Enter a 17-character VIN to decode exact vehicle details through NHTSA vPIC.",
          maxLength: 17,
          autoCapitalize: "characters",
        })}
      </div>

      <div class="form-grid four">
        ${inputField({ label: "Year", path: "vehicle.year", type: "number", min: 1990, max: currentYear + 1 })}
        ${selectField({
          label: "Make",
          path: "vehicle.make",
          helper: vehicleMakeLookup.message,
          options: makes.map((make) => ({ label: make, value: make })),
        })}
        ${selectField({
          label: "Model",
          path: "vehicle.model",
          helper: vehicleLookup.message || "Choose a make and year to load public NHTSA model data.",
          options: models.map((model) => ({ label: model.name, value: model.name })),
        })}
        ${selectField({
          label: "Trim",
          path: "vehicle.trim",
          helper: quote.vehicle.trim === "N/A" ? "N/A means NHTSA did not return a trim for this VIN." : trims.length ? "Trim options come from local sample data for common models." : "Optional; NHTSA model lookup does not always include trim without a VIN.",
          options: trims.map((trim) => ({ label: trim, value: trim })),
        })}
      </div>

      <div class="form-grid three">
        ${selectField({
          label: "Body type",
          path: "vehicle.bodyType",
          helper: bodyTypeHelper,
          options: [
            { label: "Sedan", value: "sedan" },
            { label: "SUV", value: "suv" },
            { label: "Truck", value: "truck" },
            { label: "Coupe", value: "coupe" },
            { label: "Minivan", value: "minivan" },
            { label: "Electric vehicle", value: "ev" },
          ],
        })}
        ${inputField({ label: "Estimated value", path: "vehicle.estimatedValue", type: "number", min: 2000, step: 500, helper: valueHelper })}
        ${selectField({
          label: "Ownership",
          path: "vehicle.ownership",
          helper: "Financed and leased vehicles usually require physical damage coverage.",
          options: [
            { label: "Owned", value: "owned" },
            { label: "Financed", value: "financed" },
            { label: "Leased", value: "leased" },
          ],
        })}
      </div>

      <div class="form-grid four">
        ${selectField({
          label: "Primary use",
          path: "vehicle.primaryUse",
          options: [
            { label: "Commute", value: "commute" },
            { label: "Pleasure", value: "pleasure" },
            { label: "Business", value: "business" },
            { label: "School", value: "school" },
            { label: "Rideshare", value: "rideshare" },
          ],
        })}
        ${inputField({ label: "Annual mileage", path: "vehicle.annualMileage", type: "number", min: 0, step: 500 })}
        ${inputField({ label: "Daily commute miles", path: "vehicle.commuteDistance", type: "number", min: 0, step: 1 })}
        ${selectField({
          label: "Parked overnight",
          path: "vehicle.parking",
          options: [
            { label: "Private garage", value: "garage" },
            { label: "Driveway", value: "driveway" },
            { label: "Street", value: "street" },
            { label: "Shared lot", value: "lot" },
          ],
        })}
      </div>

      <div class="subsection">
        <h3>Safety features</h3>
        ${checkboxGrid("vehicle.safetyFeatures", [
          { label: "Automatic emergency braking", value: "automaticBraking" },
          { label: "Blind spot monitoring", value: "blindSpot" },
          { label: "Lane keeping assist", value: "laneAssist" },
          { label: "Adaptive cruise control", value: "adaptiveCruise" },
          { label: "Rear camera", value: "rearCamera" },
        ])}
      </div>

      <div class="form-grid two">
        ${selectField({
          label: "Anti-theft features",
          path: "vehicle.antiTheft",
          helper: "Alarm, immobilizer, tracker, or manufacturer anti-theft system.",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        })}
      </div>
    </section>
  `);
}

function historyView() {
  return shell(`
    <section class="step-panel">
      <p class="eyebrow">Step 4 of 8</p>
      <h2>Any recent incidents?</h2>
      <p class="lede">Insurers often review the past three to five years. This estimate separates at-fault accidents, tickets, claims, and serious violations.</p>

      <div class="form-grid three">
        ${inputField({ label: "Accidents", path: "history.accidents", type: "number", min: 0, max: 10 })}
        ${inputField({ label: "At-fault accidents", path: "history.atFaultAccidents", type: "number", min: 0, max: 10 })}
        ${inputField({ label: "Tickets or violations", path: "history.tickets", type: "number", min: 0, max: 10 })}
      </div>

      <div class="form-grid three">
        ${selectField({
          label: "DUI or serious violation",
          path: "history.dui",
          options: [
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ],
        })}
        ${inputField({ label: "Insurance claims", path: "history.claims", type: "number", min: 0, max: 10 })}
        ${selectField({
          label: "License suspension",
          path: "history.suspension",
          options: [
            { label: "No", value: "no" },
            { label: "Yes", value: "yes" },
          ],
        })}
      </div>

      <div class="form-grid two">
        ${inputField({ label: "Most recent incident date", path: "history.incidentDate", type: "date", helper: "Optional when there are no incidents." })}
        ${selectField({
          label: "Most severe incident",
          path: "history.incidentSeverity",
          options: [
            { label: "None", value: "none" },
            { label: "Minor", value: "minor" },
            { label: "Moderate", value: "moderate" },
            { label: "Severe", value: "severe" },
          ],
        })}
      </div>
    </section>
  `);
}

function getCoverageRecommendation() {
  const value = Number(quote.vehicle.estimatedValue || 0);
  const year = Number(quote.vehicle.year || 0);
  const vehicleAge = year ? currentYear - year : null;
  const incidents =
    Number(quote.history.accidents || 0) +
    Number(quote.history.atFaultAccidents || 0) +
    Number(quote.history.tickets || 0) +
    Number(quote.history.claims || 0);

  if (quote.vehicle.ownership === "leased" || quote.vehicle.ownership === "financed") {
    return {
      level: "full",
      title: "Full coverage recommended",
      reason: "Financed and leased vehicles usually require collision and comprehensive protection.",
    };
  }

  if (value >= 36000 || (vehicleAge !== null && vehicleAge <= 4)) {
    return {
      level: "full",
      title: "Full coverage recommended",
      reason: "The vehicle appears newer or higher value, so broader physical damage coverage is worth comparing.",
    };
  }

  if (value && value < 14000 && vehicleAge !== null && vehicleAge >= 10 && incidents === 0) {
    return {
      level: "basic",
      title: "Basic coverage may fit",
      reason: "An older owned vehicle with a clean record may not need the highest physical damage limits.",
    };
  }

  if (incidents >= 2 || quote.vehicle.primaryUse === "business" || quote.vehicle.primaryUse === "rideshare") {
    return {
      level: "standard",
      title: "Standard coverage recommended",
      reason: "Recent incidents or higher-exposure vehicle use make a balanced policy a safer starting point.",
    };
  }

  return {
    level: "standard",
    title: "Standard coverage recommended",
    reason: "Based on the information provided so far, this is a balanced middle option to compare against.",
  };
}

function coverageView() {
  const recommendation = getCoverageRecommendation();
  return shell(`
    <section class="step-panel">
      <p class="eyebrow">Step 5 of 8</p>
      <h2>Choose a coverage level.</h2>
      <p class="lede">Coverage changes both the monthly premium and how much protection the policy includes.</p>

      <aside class="recommendation-panel">
        <span>Recommendation</span>
        <strong>${recommendation.title}</strong>
        <p>${recommendation.reason}</p>
      </aside>

      <div class="coverage-grid">
        ${Object.values(coverageLevels)
          .map(
            (level) => `
              <button type="button" class="coverage-card ${quote.coverage.level === level.id ? "is-selected" : ""}" data-set="coverage.level" data-value="${level.id}">
                <span>${level.name}${recommendation.level === level.id ? `<b class="rec-badge">Recommended</b>` : ""}</span>
                <p>${level.description}</p>
                <dl>
                  <div><dt>Bodily injury</dt><dd>${level.liability}</dd></div>
                  <div><dt>Property damage</dt><dd>${level.propertyDamage}</dd></div>
                  <div><dt>Collision</dt><dd>${level.collision}</dd></div>
                  <div><dt>Comprehensive</dt><dd>${level.comprehensive}</dd></div>
                </dl>
              </button>
            `
          )
          .join("")}
      </div>

      <div class="subsection">
        <h3>Deductible</h3>
        <p class="helper-copy">A deductible is what you pay out of pocket for covered physical damage before insurance pays. Higher deductibles usually lower the premium.</p>
        ${segmentedControl(
          "coverage.deductible",
          deductibleOptions.map((item) => ({ label: `$${item.value.toLocaleString()}`, value: String(item.value) }))
        )}
      </div>
    </section>
  `);
}

function getDiscountLockState(discountId) {
  const historyFieldsAnswered =
    quote.history.accidents !== "" &&
    quote.history.tickets !== "" &&
    quote.history.claims !== "" &&
    quote.history.dui !== "" &&
    quote.history.suspension !== "";
  const cleanHistory =
    Number(quote.history.accidents || 0) === 0 &&
    Number(quote.history.tickets || 0) === 0 &&
    Number(quote.history.claims || 0) === 0 &&
    quote.history.dui === "no" &&
    quote.history.suspension === "no";

  const locks = {
    goodStudent: {
      isKnown: quote.driver.studentStatus !== "" && quote.driver.goodStudent !== "",
      checked: quote.driver.studentStatus === "full-time" && quote.driver.goodStudent === "yes",
      source: "Driver step",
    },
    safeDriver: {
      isKnown: historyFieldsAnswered,
      checked: historyFieldsAnswered && cleanHistory,
      source: "Driving history step",
    },
    homeowner: {
      isKnown: quote.driver.homeStatus !== "",
      checked: quote.driver.homeStatus === "own",
      source: "Driver step",
    },
    antiTheft: {
      isKnown: quote.vehicle.antiTheft !== "",
      checked: quote.vehicle.antiTheft === "yes",
      source: "Vehicle step",
    },
    continuousInsurance: {
      isKnown: quote.driver.currentlyInsured !== "" && (quote.driver.currentlyInsured === "no" || quote.driver.continuousInsurance !== ""),
      checked: quote.driver.currentlyInsured === "yes" && Number(quote.driver.continuousInsurance || 0) >= 2,
      source: "Driver step",
    },
  };

  const lock = locks[discountId];
  if (!lock) return { locked: false, checked: quote.discounts.selected.includes(discountId), note: "Optional discount question" };
  if (!lock.isKnown) return { locked: true, checked: false, note: `Locked until answered on ${lock.source}.` };
  return {
    locked: true,
    checked: lock.checked,
    note: lock.checked ? `Applied from ${lock.source}.` : `Not eligible based on ${lock.source}.`,
  };
}

function discountsView() {
  const visibleDiscounts = discountCatalog.filter((discount) => discount.id !== "goodStudent" || quote.driver.studentStatus === "full-time");
  return shell(`
    <section class="step-panel">
      <p class="eyebrow">Step 6 of 8</p>
      <h2>Pick possible discounts.</h2>
      <p class="lede">Discounts already determined by earlier answers are locked here. The remaining savings options are still yours to select.</p>

      <div class="discount-list">
        ${visibleDiscounts
          .map((discount) => {
            const state = getDiscountLockState(discount.id);
            return `
              <label class="discount-row ${state.locked ? "is-locked" : ""}">
                <input type="checkbox" ${state.locked ? "" : `data-array-path="discounts.selected"`} value="${discount.id}" ${state.checked ? "checked" : ""} ${state.locked ? "disabled" : ""} />
                <span>
                  <strong>${discount.name}</strong>
                  <small>${discount.description}</small>
                  <em>${state.note}</em>
                </span>
                <b>${Math.round(discount.percent * 100)}%</b>
              </label>
            `;
          })
          .join("")}
      </div>
    </section>
  `);
}

function summaryRows(section) {
  if (section === "location") {
    return [
      ["Address", quote.location.address || "Not provided"],
      ["City, state ZIP", `${quote.location.city || "-"}, ${quote.location.state || "-"} ${quote.location.zip || ""}`],
      ["Area type", quote.location.areaType],
    ];
  }
  if (section === "driver") {
    return [
      ["Driver", `${quote.driver.firstName || "Primary"} ${quote.driver.lastName || "Driver"}`],
      ["Date of birth", quote.driver.dateOfBirth || "Not provided"],
      ["Years licensed", quote.driver.yearsLicensed !== "" ? quote.driver.yearsLicensed : "Not provided"],
      [
        "Prior insurance",
        quote.driver.currentlyInsured === "yes"
          ? `${quote.driver.continuousInsurance || 0} years`
          : quote.driver.currentlyInsured === "no"
            ? "No current policy"
            : "Not provided",
      ],
    ];
  }
  if (section === "vehicle") {
    const vehicleLabel = [quote.vehicle.year, quote.vehicle.make, quote.vehicle.model, quote.vehicle.trim].filter(Boolean).join(" ");
    return [
      ["Vehicle", vehicleLabel || "Not provided"],
      ["Body type", quote.vehicle.bodyType || "Not provided"],
      ["Value", quote.vehicle.estimatedValue ? currency(quote.vehicle.estimatedValue) : "Not provided"],
      ["Use", quote.vehicle.primaryUse || "Not provided"],
      ["Mileage", quote.vehicle.annualMileage ? `${Number(quote.vehicle.annualMileage).toLocaleString()} miles/year` : "Not provided"],
    ];
  }
  if (section === "history") {
    return [
      ["Accidents", quote.history.accidents !== "" ? quote.history.accidents : "Not provided"],
      ["At fault", quote.history.atFaultAccidents !== "" ? quote.history.atFaultAccidents : "Not provided"],
      ["Tickets", quote.history.tickets !== "" ? quote.history.tickets : "Not provided"],
      ["Claims", quote.history.claims !== "" ? quote.history.claims : "Not provided"],
    ];
  }
  return [
    ["Coverage", coverageLevels[quote.coverage.level]?.name || "Not selected"],
    ["Deductible", quote.coverage.deductible ? currency(quote.coverage.deductible) : "Not selected"],
    ["Discounts selected", quote.discounts.selected.length],
  ];
}

function reviewCard(title, stepIndex, section) {
  return `
    <article class="review-section">
      <div class="review-heading">
        <h3>${title}</h3>
        <button type="button" class="text-button" data-edit-step="${stepIndex}">Edit</button>
      </div>
      <dl>
        ${summaryRows(section)
          .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
          .join("")}
      </dl>
    </article>
  `;
}

function reviewView() {
  const preview = calculateQuote(quote);
  return shell(`
    <section class="step-panel">
      <p class="eyebrow">Step 7 of 8</p>
      <h2>Review your information.</h2>
      <p class="lede">Check each section before calculating. You can jump back to edit any group of answers.</p>

      <div class="quote-preview">
        <span>Estimated from current answers</span>
        <strong>${currency(preview.monthly)} / month</strong>
        <small>${currency(preview.sixMonth)} for six months before final review</small>
      </div>

      <div class="review-grid">
        ${reviewCard("Location", 1, "location")}
        ${reviewCard("Driver", 2, "driver")}
        ${reviewCard("Vehicle", 3, "vehicle")}
        ${reviewCard("Driving history", 4, "history")}
        ${reviewCard("Coverage and savings", 5, "coverage")}
      </div>
    </section>
  `);
}

function resultsView() {
  const result = calculateQuote(quote);
  const comparisons = calculatePlanComparison(quote);
  const driverName = `${quote.driver.firstName || "Primary"} ${quote.driver.lastName || "Driver"}`.trim();

  return shell(
    `
    <section class="results">
      <div class="results-hero">
        <div>
          <p class="eyebrow">Estimated quote</p>
          <h2>${currency(result.monthly)} per month</h2>
          <p>${currency(result.sixMonth)} estimated six-month premium for ${result.coverage.name.toLowerCase()}.</p>
        </div>
        <div class="premium-stack">
          <span>Before discounts</span>
          <strong>${currency(result.beforeDiscounts)}</strong>
          <small>${Math.round(result.totalDiscountPercent * 100)}% total discount cap applied</small>
        </div>
      </div>

      <div class="result-columns">
        <section class="result-section">
          <h3>Policy snapshot</h3>
          <dl class="summary-list">
            <div><dt>Driver</dt><dd>${driverName}, age ${result.driverAge}</dd></div>
            <div><dt>Vehicle</dt><dd>${quote.vehicle.year} ${quote.vehicle.make} ${quote.vehicle.model}</dd></div>
            <div><dt>Garaging ZIP</dt><dd>${quote.location.zip || "Not provided"}</dd></div>
            <div><dt>Coverage</dt><dd>${result.coverage.name}</dd></div>
            <div><dt>Deductible</dt><dd>${currency(result.deductible.value)}</dd></div>
          </dl>
        </section>

        <section class="result-section">
          <h3>Discounts applied</h3>
          ${
            result.discounts.length
              ? `<ul class="discount-summary">${result.discounts
                  .map((discount) => `<li><span>${discount.name}</span><b>-${currency(discount.amount)}</b></li>`)
                  .join("")}</ul>`
              : `<p class="empty-state">No discounts applied yet.</p>`
          }
        </section>
      </div>

      <div class="result-columns">
        <section class="result-section">
          <h3>Main factors increasing the quote</h3>
          ${factorList(result.increases)}
        </section>
        <section class="result-section">
          <h3>Main factors lowering the quote</h3>
          ${factorList(result.decreases)}
        </section>
      </div>

      <section class="result-section">
        <h3>Compare coverage options</h3>
        <div class="plan-compare">
          ${comparisons
            .map(
              (plan) => `
                <article class="${plan.level === quote.coverage.level ? "is-current" : ""}">
                  <span>${plan.coverage.name}</span>
                  <strong>${currency(plan.monthly)}</strong>
                  <small>${currency(plan.sixMonth)} / 6 months</small>
                </article>
              `
            )
            .join("")}
        </div>
      </section>

      <div class="flow-actions">
        <button class="button secondary" type="button" data-edit-step="7">Edit Information</button>
        <button class="button ghost" type="button" data-action="restart">Restart Quote</button>
      </div>
    </section>
  `,
    { hideNav: true }
  );
}

function factorList(factors) {
  if (!factors.length) return `<p class="empty-state">No major factors in this category.</p>`;
  return `
    <ul class="factor-list">
      ${factors
        .map((factor) => {
          const percent = Math.abs(Math.round((factor.multiplier - 1) * 100));
          return `<li><span>${factor.label}</span><b>${factor.multiplier > 1 ? "+" : "-"}${percent}%</b></li>`;
        })
        .join("")}
    </ul>
  `;
}

function render(focusPath = null) {
  const view = steps[activeStep].id;
  const views = {
    landing: landingView,
    location: locationView,
    driver: driverView,
    vehicle: vehicleView,
    history: historyView,
    coverage: coverageView,
    discounts: discountsView,
    review: reviewView,
    results: resultsView,
  };
  app.innerHTML = views[view]();
  bindEvents();
  if (focusPath) restoreFocus(focusPath);
}

function restoreFocus(path) {
  const field = app.querySelector(`[data-path="${path}"]`);
  if (!field) return;
  field.focus();
  const valueLength = String(field.value ?? "").length;
  if (typeof field.setSelectionRange === "function") {
    field.setSelectionRange(valueLength, valueLength);
  }
}

function bindEvents() {
  app.querySelectorAll("[data-path]").forEach((input) => {
    input.addEventListener("input", (event) => {
      let value = getInputValue(event.target);
      if (event.target.dataset.path === "vehicle.vin") {
        const cursorPosition = event.target.selectionStart;
        value = String(value).toUpperCase();
        event.target.value = value;
        if (typeof event.target.setSelectionRange === "function" && cursorPosition !== null) {
          event.target.setSelectionRange(cursorPosition, cursorPosition);
        }
        scheduleVinDecode(value);
      }
      setNestedValue(event.target.dataset.path, value);
      if (event.target.dataset.autocomplete === "address") {
        scheduleAddressSearch(value);
        render(event.target.dataset.path);
      }
    });
    input.addEventListener("change", (event) => {
      let value = getInputValue(event.target);
      if (event.target.dataset.path === "vehicle.vin") {
        value = String(value).toUpperCase();
        event.target.value = value;
      }
      setNestedValue(event.target.dataset.path, value);
      handleDependentFieldChange(event);
    });
  });

  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const action = event.currentTarget.dataset.action;
      if (action === "start") activeStep = 1;
      if (action === "sample") {
        quote = structuredClone(sampleQuote);
        stepSampleCursor = {};
        applyAddress(mockAddresses[1]);
        activeStep = 7;
      }
      if (action === "home") activeStep = 0;
      if (action === "back") activeStep = Math.max(1, activeStep - 1);
      if (action === "next") activeStep = Math.min(steps.length - 1, activeStep + 1);
      if (action === "autofill") applyCurrentStepSample();
      if (action === "restart") {
        quote = structuredClone(defaultQuote);
        stepSampleCursor = {};
        activeStep = 0;
      }
      render();
    });
  });

  app.querySelectorAll("[data-set]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const { set, value } = event.currentTarget.dataset;
      const current = getNestedValue(set);
      const castValue = typeof current === "number" ? Number(value) : value;
      setNestedValue(set, castValue);
      render();
    });
  });

  app.querySelectorAll("[data-array-path]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const path = event.target.dataset.arrayPath;
      const values = new Set(getNestedValue(path) ?? []);
      if (event.target.checked) values.add(event.target.value);
      else values.delete(event.target.value);
      setNestedValue(path, [...values]);
      render();
    });
  });

  app.querySelectorAll("[data-address-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const address = [...addressSuggestions, ...mockAddresses].find((item) => item.id === event.currentTarget.dataset.addressId);
      applyAddress(address);
      render();
    });
  });

  app.querySelectorAll("[data-edit-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      activeStep = Number(event.currentTarget.dataset.editStep);
      render();
    });
  });
}

function handleDependentFieldChange(event) {
  const path = event.target.dataset.path;
  if (path === "driver.studentStatus") {
    if (quote.driver.studentStatus !== "full-time") {
      quote.driver.goodStudent = "";
      quote.discounts.selected = quote.discounts.selected.filter((discountId) => discountId !== "goodStudent");
    }
    render();
  }

  if (path === "vehicle.make" || path === "vehicle.year") {
    clearVehicleDerivedFields();
    loadVehicleModels();
    render();
  }

  if (path === "vehicle.model") {
    applyVehicleEstimate();
    render();
  }

  if (path === "vehicle.bodyType") {
    quote.vehicle.bodyTypeSource = "User-provided";
    if (!quote.vehicle.estimatedValue || quote.vehicle.estimatedValueSource?.startsWith("Estimated")) {
      quote.vehicle.estimatedValue = estimateVehicleValue(quote.vehicle);
      quote.vehicle.estimatedValueSource = "Estimated from body type, make, model, and depreciation rules.";
    }
    render();
  }

  if (path === "vehicle.estimatedValue") {
    quote.vehicle.estimatedValueSource = "User-provided";
    render();
  }

  if (path === "vehicle.vin") {
    decodeVehicleVin(quote.vehicle.vin);
  }
}

function scheduleVinDecode(vin) {
  window.clearTimeout(vinDecodeTimer);
  const normalizedVin = String(vin).trim().toUpperCase();
  if (normalizedVin.length !== 17) return;

  vinDecodeTimer = window.setTimeout(() => {
    decodeVehicleVin(normalizedVin);
  }, 350);
}

function applyCurrentStepSample() {
  const stepId = steps[activeStep].id;
  const samples = stepSamples[stepId];
  if (!samples?.length) return;

  const nextIndex = stepSampleCursor[stepId] ?? 0;
  const sample = structuredClone(samples[nextIndex % samples.length]);
  stepSampleCursor[stepId] = nextIndex + 1;

  if (stepId === "location") {
    quote.location = sample;
    addressSuggestions = [];
    addressLookup = { status: "idle", message: "" };
  }

  if (stepId === "driver") {
    quote.driver = sample;
    if (quote.driver.studentStatus !== "full-time") {
      quote.driver.goodStudent = "";
      quote.discounts.selected = quote.discounts.selected.filter((discountId) => discountId !== "goodStudent");
    }
  }

  if (stepId === "vehicle") {
    quote.vehicle = sample;
    vehicleModelOptions = sample.model ? [{ name: sample.model, source: "Sample profile" }] : [];
    vehicleLookup = { status: "success", message: "Loaded a sample vehicle profile. Select Auto-fill Step again to cycle." };
  }

  if (stepId === "history") {
    quote.history = sample;
  }

  if (stepId === "coverage") {
    quote.coverage = sample;
  }

  if (stepId === "discounts") {
    quote.discounts = sample;
  }
}

function clearVehicleDerivedFields() {
  quote.vehicle.model = "";
  quote.vehicle.trim = "";
  quote.vehicle.bodyType = "";
  quote.vehicle.bodyTypeSource = "";
  quote.vehicle.estimatedValue = "";
  quote.vehicle.estimatedValueSource = "";
  vehicleModelOptions = [];
  vehicleLookup = quote.vehicle.make && quote.vehicle.year ? { status: "loading", message: "Loading NHTSA model data..." } : { status: "idle", message: "" };
}

function applyVehicleEstimate(source = "Estimated from NHTSA model data and local vehicle assumptions.") {
  const localModel = getVehicleModel(quote.vehicle.make, quote.vehicle.model);
  const bodyType = localModel?.bodyType || inferBodyType(quote.vehicle);
  if (bodyType) {
    quote.vehicle.bodyType = bodyType;
    quote.vehicle.bodyTypeSource = localModel ? "Local sample dataset matched the selected model." : source;
  }

  if (!quote.vehicle.estimatedValue || quote.vehicle.estimatedValueSource?.startsWith("Estimated") || quote.vehicle.estimatedValueSource?.startsWith("Local")) {
    quote.vehicle.estimatedValue = estimateVehicleValue({ ...quote.vehicle, bodyType });
    quote.vehicle.estimatedValueSource = localModel
      ? "Estimated from local sample MSRP and depreciation rules. NHTSA vPIC does not provide market value."
      : "Estimated from body type, make, model, and depreciation rules. NHTSA vPIC does not provide market value.";
  }
}

async function loadVehicleModels() {
  if (vehicleSearchController) vehicleSearchController.abort();
  if (!quote.vehicle.make || !quote.vehicle.year) return;

  const requestId = ++vehicleSearchRequestId;
  vehicleSearchController = new AbortController();

  try {
    const models = await getNhtsaModels({
      year: quote.vehicle.year,
      make: quote.vehicle.make,
      signal: vehicleSearchController.signal,
    });
    if (requestId !== vehicleSearchRequestId) return;

    vehicleModelOptions = models;
    vehicleLookup = models.length
      ? { status: "success", message: `Loaded ${models.length} model options from NHTSA vPIC.` }
      : { status: "empty", message: "NHTSA did not return models for this year and make. Showing local examples if available." };
    render();
  } catch (error) {
    if (error.name === "AbortError") return;
    if (requestId !== vehicleSearchRequestId) return;

    vehicleModelOptions = [];
    vehicleLookup = { status: "fallback", message: "Could not reach NHTSA right now. Showing local example models if available." };
    render();
  }
}

async function decodeVehicleVin(vinOverride = quote.vehicle.vin) {
  window.clearTimeout(vinDecodeTimer);
  if (vinSearchController) vinSearchController.abort();
  const vin = String(vinOverride).trim().toUpperCase();
  quote.vehicle.vin = vin;

  if (vin.length !== 17) {
    vehicleLookup = vin.length ? { status: "idle", message: "Enter all 17 VIN characters to decode through NHTSA." } : { status: "idle", message: "" };
    render("vehicle.vin");
    return;
  }

  const requestId = ++vinSearchRequestId;
  vinSearchController = new AbortController();
  vehicleLookup = { status: "loading", message: "Decoding VIN through NHTSA vPIC..." };
  render("vehicle.vin");

  try {
    const decoded = await decodeVin({ vin, signal: vinSearchController.signal });
    if (requestId !== vinSearchRequestId) return;

    if (!decoded) {
      vehicleLookup = { status: "empty", message: "NHTSA could not decode that VIN. You can still enter the vehicle manually." };
      render("vehicle.vin");
      return;
    }

    quote.vehicle.year = decoded.year ? Number(decoded.year) : quote.vehicle.year;
    quote.vehicle.make = normalizeMakeName(decoded.make) || decoded.make || quote.vehicle.make;
    quote.vehicle.model = decoded.model || quote.vehicle.model;
    quote.vehicle.trim = decoded.trim || "N/A";
    quote.vehicle.bodyType = mapBodyClassToBodyType(decoded.bodyClass, quote.vehicle);
    quote.vehicle.bodyTypeSource = decoded.bodyClass ? `NHTSA VIN decode: ${decoded.bodyClass}` : "Estimated from decoded make and model.";
    quote.vehicle.estimatedValue = estimateVehicleValue(quote.vehicle);
    quote.vehicle.estimatedValueSource = "Estimated from decoded vehicle details and depreciation rules. NHTSA vPIC does not provide market value.";
    vehicleModelOptions = quote.vehicle.model ? [{ name: quote.vehicle.model, source: decoded.source }] : [];
    vehicleLookup = { status: "success", message: "VIN decoded through NHTSA vPIC." };
    render();
  } catch (error) {
    if (error.name === "AbortError") return;
    if (requestId !== vinSearchRequestId) return;
    vehicleLookup = { status: "fallback", message: "Could not reach NHTSA for VIN decode. You can still enter the vehicle manually." };
    render("vehicle.vin");
  }
}

function normalizeMakeName(make) {
  const normalizedMake = String(make).trim().toLowerCase();
  const normalizedCompact = normalizedMake.replace(/[^a-z0-9]/g, "");
  return (
    uniqueOptions([...vehicleMakeOptions, ...getMakes()]).find((item) => {
      const option = item.toLowerCase();
      return option === normalizedMake || option.replace(/[^a-z0-9]/g, "") === normalizedCompact;
    }) || ""
  );
}

function mapBodyClassToBodyType(bodyClass, vehicle) {
  const normalized = String(bodyClass || "").toLowerCase();
  if (normalized.includes("pickup")) return "truck";
  if (normalized.includes("sport utility") || normalized.includes("crossover") || normalized.includes("mpv")) return "suv";
  if (normalized.includes("minivan") || normalized.includes("van")) return "minivan";
  if (normalized.includes("coupe") || normalized.includes("convertible")) return "coupe";
  if (normalized.includes("hatchback") || normalized.includes("sedan") || normalized.includes("wagon")) return "sedan";
  return inferBodyType(vehicle);
}

function applyAddress(address) {
  if (!address) return;
  window.clearTimeout(addressSearchTimer);
  if (addressSearchController) addressSearchController.abort();
  addressSearchRequestId += 1;
  quote.location.address = address.label;
  quote.location.city = address.city;
  quote.location.state = address.state;
  quote.location.zip = address.zip;
  quote.location.areaType = address.areaType;
  quote.location.garagingRisk = address.garagingRisk;
  addressSuggestions = [];
  addressLookup = { status: "idle", message: "" };
}

function scheduleAddressSearch(query) {
  window.clearTimeout(addressSearchTimer);
  if (addressSearchController) addressSearchController.abort();

  const normalized = query.trim();
  if (normalized.length < 3) {
    addressSuggestions = [];
    addressLookup = normalized.length ? { status: "idle", message: "Keep typing to search live address suggestions." } : { status: "idle", message: "" };
    return;
  }

  addressLookup = { status: "loading", message: "Searching real address data..." };
  const requestId = ++addressSearchRequestId;
  addressSearchController = new AbortController();

  addressSearchTimer = window.setTimeout(async () => {
    try {
      const result = await searchAddressSuggestions(normalized, addressSearchController.signal);
      if (requestId !== addressSearchRequestId) return;

      addressSuggestions = result.suggestions;
      if (result.source === "api") {
        addressLookup = { status: "success", message: "Live suggestions from Photon / OpenStreetMap." };
      } else if (result.source === "fallback" && result.suggestions.length) {
        addressLookup = { status: "fallback", message: "Address API unavailable, showing local fallback suggestions." };
      } else {
        addressLookup = { status: "empty", message: "No matching addresses found yet. Try adding city or state." };
      }
      render("location.address");
    } catch (error) {
      if (error.name === "AbortError") return;
      if (requestId !== addressSearchRequestId) return;
      addressSuggestions = [];
      addressLookup = { status: "empty", message: "Address lookup could not connect. Try again or keep typing." };
      render("location.address");
    }
  }, 350);
}

async function loadVehicleMakes() {
  try {
    const makes = await getNhtsaMakes();
    vehicleMakeOptions = uniqueOptions([...makes, ...getMakes(), quote.vehicle.make]);
    vehicleMakeLookup = { status: "success", message: `Loaded ${vehicleMakeOptions.length} makes from NHTSA vPIC.` };
  } catch (error) {
    vehicleMakeOptions = getMakes();
    vehicleMakeLookup = { status: "fallback", message: "Could not reach NHTSA makes right now. Showing expanded local make list." };
  }

  if (activeStep === 3) render();
}

render();
loadVehicleMakes();
