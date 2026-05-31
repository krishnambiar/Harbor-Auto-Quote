# Harbor Auto Quote

Harbor Auto Quote is a mock auto insurance quote app that helps a user move from basic driver and vehicle information to an explainable estimated premium.

## Overview

Auto insurance quote forms can feel long, repetitive, and confusing, especially when users have to manually enter information that a product could help them find. I built Harbor Auto Quote to explore how a quote flow can feel more guided and transparent.

The app collects location, driver, vehicle, driving history, coverage, and discount information. It then calculates an estimated monthly and six-month premium and shows the user which factors affected the final result.

This is a student project for learning and demonstration purposes. It is not a real insurance product and does not provide legally accurate pricing.

## Key Features

- Multi-step quote flow with 9 screens from welcome to final quote  
- Address autocomplete to reduce manual typing and improve location accuracy  
- Vehicle make/model lookup using public vehicle data  
- Optional VIN decoding to help fill vehicle details faster  
- Coverage comparison across 5 coverage levels  
- 4 deductible options that update the quote calculation  
- 10 possible discount rules, including safe driver, homeowner, bundle, and anti-theft  
- Review step before the final quote so the user can check their inputs  
- Final results screen with monthly premium, six-month premium, discounts, and rating factors  
- Responsive layout for desktop and mobile

## Tech Stack

- HTML  
- CSS  
- JavaScript  
- ES modules  
- NHTSA vPIC API for vehicle makes, models, and VIN decoding  
- Photon/OpenStreetMap API for address suggestions  
- Local JavaScript data files for fallback data, coverage options, discounts, and rating factors  
- Python static server for local development

## APIs And Integrations

I used public APIs to make the quote flow feel closer to a real product instead of a basic static form.

The address step uses Photon/OpenStreetMap to suggest U.S. addresses as the user types. Helping the user select a structured address makes the experience faster and reduces the chance of bad or incomplete location data reaching the final quote.

The vehicle step uses the NHTSA vPIC API to load vehicle makes, find models by year and make, and optionally decode a VIN. This improves the user experience because vehicle information can be difficult to remember or format correctly. In a real quote product, API-assisted vehicle entry can reduce friction, prevent invalid combinations, and help more users reach the finished quote screen without giving up.

Both integrations include fallback behavior so the flow can still work if an API request fails.

## How It Works

1. The user starts the quote flow and enters their garaging address.  
2. The app searches for address suggestions through Photon/OpenStreetMap and falls back to local sample addresses if needed.  
3. The user enters driver details such as date of birth, license history, home status, and current insurance status.  
4. The user enters vehicle details manually or uses NHTSA data to help select make, model, and VIN-based information.  
5. The user enters driving history, including accidents, tickets, claims, and suspension status.  
6. The user chooses a coverage level and deductible.  
7. The app determines automatic discounts and allows the user to select additional eligible discounts.  
8. The review screen summarizes the information before the quote is calculated.  
9. The quote calculator applies rating factors, discounts, and coverage choices to produce the final estimated premium.

## Technical Highlights

- I separated the quote calculation into `src/engine/quoteCalculator.js` so the pricing logic is not mixed directly into the UI code.  
- Rating data is organized in separate files for coverage, discounts, vehicles, addresses, and rating factors.  
- The quote calculation uses multipliers for state, area type, driver age, years licensed, vehicle age, vehicle value, mileage, driving history, coverage, deductible, parking, and other inputs.  
- Discounts are applied after the main rating factors and capped so stacking too many discounts does not create unrealistic results.  
- The final result explains both increases and decreases instead of only showing a number.  
- The app uses no frontend framework, so I managed state, screen rendering, and user interactions directly with JavaScript.

## Results

- 9-step quote flow from intake to final result  
- 2 public API integrations  
- 5 coverage levels  
- 4 deductible options  
- 10 discount rules  
- 10 local fallback addresses  
- 14 core rating factors used in the quote calculation  
- No npm dependencies required to run locally

The main impact of the project is usability. The API-assisted fields help users move through the quote process with less guessing and less manual entry, which is important for any real product where completion rate and data quality both affect the business outcome.

## Challenges And Tradeoffs

One challenge was balancing realism with simplicity. Real insurance pricing is much more complex and uses regulated data, actuarial models, and company-specific rules. For this project, I used simplified rating factors so the logic would be understandable and easy to explain.

Another tradeoff was relying on public APIs. NHTSA provides useful vehicle data, but it does not provide market values or insurance-specific risk scores. Photon/OpenStreetMap can return useful address suggestions, but availability and formatting can vary. To handle that, I added fallback data and clear assumptions instead of pretending the app has access to proprietary insurance data.

## Run Locally

This project does not require any npm packages or environment variables.

From the project folder, start a local static server:

python3 \-m http.server 8000

Then open:

http://localhost:8000

## Project Structure

.

├── index.html

├── src

│   ├── data

│   │   ├── addresses.js

│   │   ├── coverage.js

│   │   ├── discounts.js

│   │   ├── ratingFactors.js

│   │   ├── vehicleApi.js

│   │   └── vehicles.js

│   ├── engine

│   │   └── quoteCalculator.js

│   ├── main.js

│   └── styles.css

└── README.md  
