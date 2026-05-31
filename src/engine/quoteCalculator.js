import { coverageLevels, deductibleOptions } from "../data/coverage.js";
import { discountCatalog } from "../data/discounts.js";
import {
  areaTypeFactors,
  parkingFactors,
  riskTierFactors,
  stateRatingFactors,
  vehicleTypeFactors,
} from "../data/ratingFactors.js";
import { getVehicleModel } from "../data/vehicles.js";

const BASE_MONTHLY_PREMIUM = 142;

const roundCurrency = (value) => Math.round(value);

function yearsBetween(dateString, now = new Date()) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  let years = now.getFullYear() - date.getFullYear();
  const hasHadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hasHadBirthday) years -= 1;
  return Math.max(years, 16);
}

function addFactor(factors, label, multiplier, directionHint) {
  factors.push({
    label,
    multiplier,
    direction: directionHint ?? (multiplier >= 1 ? "increase" : "decrease"),
  });
}

function calculateDriverAgeFactor(age) {
  if (!age) return 1;
  if (age < 20) return 1.72;
  if (age < 25) return 1.38;
  if (age < 30) return 1.14;
  if (age < 55) return 0.96;
  if (age < 70) return 1;
  return 1.12;
}

function calculateYearsLicensedFactor(yearsLicensed) {
  if (yearsLicensed === "" || yearsLicensed === null || Number.isNaN(Number(yearsLicensed))) return 1;
  if (yearsLicensed < 1) return 1.42;
  if (yearsLicensed < 3) return 1.22;
  if (yearsLicensed < 8) return 1.05;
  return 0.94;
}

function calculateVehicleAgeFactor(year) {
  if (!Number(year)) return 1;
  const vehicleAge = new Date().getFullYear() - Number(year);
  if (vehicleAge <= 2) return 1.12;
  if (vehicleAge <= 6) return 1.04;
  if (vehicleAge <= 12) return 0.97;
  return 0.9;
}

function calculateMileageFactor(annualMileage) {
  if (!Number(annualMileage)) return 1;
  const miles = Number(annualMileage);
  if (miles < 6000) return 0.88;
  if (miles < 10000) return 0.96;
  if (miles <= 14000) return 1;
  if (miles <= 20000) return 1.1;
  return 1.22;
}

function calculateValueFactor(value) {
  if (!Number(value)) return 1;
  const vehicleValue = Number(value);
  if (vehicleValue < 18000) return 0.92;
  if (vehicleValue < 32000) return 1;
  if (vehicleValue < 50000) return 1.1;
  return 1.24;
}

function calculateIncidentFactor(history) {
  const accidents = Number(history.accidents || 0);
  const atFault = Number(history.atFaultAccidents || 0);
  const tickets = Number(history.tickets || 0);
  const claims = Number(history.claims || 0);
  const hasDui = history.dui === "yes";
  const hasSuspension = history.suspension === "yes";

  return (
    1 +
    accidents * 0.1 +
    atFault * 0.18 +
    tickets * 0.08 +
    claims * 0.06 +
    (hasDui ? 0.58 : 0) +
    (hasSuspension ? 0.28 : 0)
  );
}

function findDiscount(discountId) {
  return discountCatalog.find((discount) => discount.id === discountId);
}

function getEligibleDiscounts(quote) {
  const selected = new Set(quote.discounts.selected);
  const historyFieldsAnswered =
    quote.history.accidents !== "" &&
    quote.history.tickets !== "" &&
    quote.history.claims !== "" &&
    quote.history.dui !== "" &&
    quote.history.suspension !== "";
  const historyIsClean =
    historyFieldsAnswered &&
    Number(quote.history.accidents || 0) === 0 &&
    Number(quote.history.tickets || 0) === 0 &&
    Number(quote.history.claims || 0) === 0 &&
    quote.history.dui !== "yes" &&
    quote.history.suspension !== "yes";

  const automaticDiscounts = [];
  if (historyIsClean) automaticDiscounts.push("safeDriver");
  if (quote.driver.homeStatus === "own") automaticDiscounts.push("homeowner");
  if (quote.driver.currentlyInsured === "yes" && Number(quote.driver.continuousInsurance || 0) >= 2) {
    automaticDiscounts.push("continuousInsurance");
  }
  if (quote.driver.studentStatus === "full-time" && quote.driver.goodStudent === "yes") {
    automaticDiscounts.push("goodStudent");
  }
  if (quote.vehicle.antiTheft === "yes") automaticDiscounts.push("antiTheft");

  [...automaticDiscounts, ...selected].forEach((discountId) => selected.add(discountId));

  return [...selected]
    .map(findDiscount)
    .filter(Boolean)
    .slice(0, 8);
}

export function calculateQuote(quote, coverageOverride) {
  const factors = [];
  const age = yearsBetween(quote.driver.dateOfBirth);
  const state = quote.location.state || "";
  const areaType = quote.location.areaType || "";
  const selectedCoverageId = coverageOverride ?? quote.coverage.level;
  const coverage = coverageLevels[selectedCoverageId] ?? coverageLevels.standard;
  const deductible = deductibleOptions.find((option) => option.value === Number(quote.coverage.deductible)) ?? deductibleOptions[1];
  const vehicleModel = getVehicleModel(quote.vehicle.make, quote.vehicle.model);
  const vehicleBodyType = quote.vehicle.bodyType || vehicleModel?.bodyType || "";
  const riskTier = quote.driver.riskTier || "";
  const parking = quote.vehicle.parking || "";

  let premium = BASE_MONTHLY_PREMIUM;

  const stateFactor = stateRatingFactors[state]?.factor ?? 1;
  const areaFactor = areaTypeFactors[areaType]?.factor ?? 1;
  const ageFactor = calculateDriverAgeFactor(age);
  const licensedFactor = calculateYearsLicensedFactor(quote.driver.yearsLicensed);
  const vehicleAgeFactor = calculateVehicleAgeFactor(quote.vehicle.year);
  const vehicleValueFactor = calculateValueFactor(quote.vehicle.estimatedValue);
  const vehicleTypeFactor = vehicleTypeFactors[vehicleBodyType]?.factor ?? 1;
  const safetyFactor = Number(vehicleModel?.safetyScore ?? 1);
  const mileageFactor = calculateMileageFactor(quote.vehicle.annualMileage);
  const incidentFactor = calculateIncidentFactor(quote.history);
  const riskTierFactor = riskTierFactors[riskTier]?.factor ?? 1;
  const parkingFactor = parkingFactors[parking]?.factor ?? 1;

  [
    [stateRatingFactors[state]?.label ?? "State rating area", stateFactor],
    [areaTypeFactors[areaType]?.label ?? "Garaging area", areaFactor],
    [age ? `Driver age ${age}` : "Driver age not provided", ageFactor],
    [quote.driver.yearsLicensed !== "" ? `${quote.driver.yearsLicensed} years licensed` : "Years licensed not provided", licensedFactor],
    [quote.vehicle.year ? `${quote.vehicle.year} vehicle year` : "Vehicle year not provided", vehicleAgeFactor],
    [quote.vehicle.estimatedValue ? `$${Number(quote.vehicle.estimatedValue || 0).toLocaleString()} vehicle value` : "Vehicle value not provided", vehicleValueFactor],
    [vehicleTypeFactors[vehicleBodyType]?.label ?? "Vehicle type not provided", vehicleTypeFactor],
    ["Model safety and repair profile", safetyFactor],
    [quote.vehicle.annualMileage ? `${Number(quote.vehicle.annualMileage || 0).toLocaleString()} annual miles` : "Annual mileage not provided", mileageFactor],
    ["Driving history", incidentFactor],
    [riskTierFactors[riskTier]?.label ?? "Insurance score tier", riskTierFactor],
    [parkingFactors[parking]?.label ?? "Overnight parking", parkingFactor],
    [coverage.name, coverage.priceFactor],
    [`$${deductible.value.toLocaleString()} deductible`, deductible.factor],
  ].forEach(([label, factor]) => {
    premium *= factor;
    addFactor(factors, label, factor);
  });

  if ((quote.vehicle.ownership === "financed" || quote.vehicle.ownership === "leased") && selectedCoverageId === "minimum") {
    premium *= 1.08;
    addFactor(factors, "Financed or leased vehicles usually need broader protection", 1.08, "increase");
  }

  if (quote.vehicle.primaryUse === "rideshare") {
    premium *= 1.24;
    addFactor(factors, "Rideshare use", 1.24, "increase");
  } else if (quote.vehicle.primaryUse === "business") {
    premium *= 1.16;
    addFactor(factors, "Business use", 1.16, "increase");
  } else if (quote.vehicle.primaryUse === "pleasure") {
    premium *= 0.96;
    addFactor(factors, "Pleasure use", 0.96, "decrease");
  }

  if (quote.driver.maritalStatus === "married") {
    premium *= 0.96;
    addFactor(factors, "Married driver profile", 0.96, "decrease");
  }

  if (quote.driver.currentlyInsured === "no") {
    premium *= 1.12;
    addFactor(factors, "No current insurance", 1.12, "increase");
  }

  const eligibleDiscounts = getEligibleDiscounts(quote);
  const discountDetails = eligibleDiscounts.map((discount) => ({
    ...discount,
    amount: roundCurrency(premium * discount.percent),
  }));
  const totalDiscountPercent = Math.min(
    0.34,
    eligibleDiscounts.reduce((sum, discount) => sum + discount.percent, 0)
  );

  const beforeDiscounts = premium;
  premium = premium * (1 - totalDiscountPercent);

  const monthly = Math.max(48, roundCurrency(premium));
  const sixMonth = roundCurrency(monthly * 6);

  const sortedIncreases = factors
    .filter((factor) => factor.multiplier > 1.01)
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 5);
  const sortedDecreases = factors
    .filter((factor) => factor.multiplier < 0.99)
    .sort((a, b) => a.multiplier - b.multiplier)
    .slice(0, 5);

  return {
    monthly,
    sixMonth,
    beforeDiscounts: roundCurrency(beforeDiscounts),
    totalDiscountPercent,
    coverage,
    deductible,
    discounts: discountDetails,
    factors,
    increases: sortedIncreases,
    decreases: sortedDecreases,
    driverAge: age,
  };
}

export function calculatePlanComparison(quote) {
  return ["basic", "standard", "full", "premium"].map((level) => ({
    ...calculateQuote(quote, level),
    level,
  }));
}
