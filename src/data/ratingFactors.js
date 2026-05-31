export const stateRatingFactors = {
  CA: { label: "California", factor: 1.18 },
  CO: { label: "Colorado", factor: 1.06 },
  GA: { label: "Georgia", factor: 1.12 },
  IA: { label: "Iowa", factor: 0.82 },
  NC: { label: "North Carolina", factor: 0.86 },
  NJ: { label: "New Jersey", factor: 1.24 },
  NY: { label: "New York", factor: 1.32 },
  OH: { label: "Ohio", factor: 0.9 },
  PA: { label: "Pennsylvania", factor: 0.96 },
  TX: { label: "Texas", factor: 1.08 },
};

export const areaTypeFactors = {
  rural: { label: "Lower-density area", factor: 0.9 },
  suburban: { label: "Suburban garaging area", factor: 1 },
  urban: { label: "Urban garaging area", factor: 1.16 },
};

export const vehicleTypeFactors = {
  sedan: { label: "Sedan", factor: 0.98 },
  suv: { label: "SUV", factor: 1.02 },
  truck: { label: "Truck", factor: 1.05 },
  coupe: { label: "Coupe", factor: 1.12 },
  minivan: { label: "Minivan", factor: 0.94 },
  ev: { label: "Electric vehicle", factor: 1.12 },
  luxury: { label: "Luxury vehicle", factor: 1.22 },
};

export const parkingFactors = {
  garage: { label: "Private garage", factor: 0.94 },
  driveway: { label: "Driveway", factor: 0.98 },
  street: { label: "Street parking", factor: 1.08 },
  lot: { label: "Shared lot", factor: 1.04 },
};

export const riskTierFactors = {
  preferred: { label: "Preferred insurance score tier", factor: 0.92 },
  standard: { label: "Standard insurance score tier", factor: 1 },
  developing: { label: "Developing insurance score tier", factor: 1.1 },
};
