# Quote Estimator Tool

## About this project

This is a demo version of a quote estimator tool I originally built for a previous employer. 
I've cleaned it up and removed any company-specific data before sharing it here. The pricing 
and customer data shown are placeholder values, not real business information.  

**[Live Demo →](https://quote-estimator-tool-demo.vercel.app/)**

A client-side quote estimator built for a real-world use case: configuring a multi-variable product (vendor, size, materials, labor, add-ons), calculating a price in real time, and generating a branded PDF quote.

## Features

- **Dynamic pricing engine** — price recalculates live as specs, quantities, and options change, pulled from a structured pricing dataset (`data/pricing.js`)
- **Customer & contact management** — add, select, and delete customers/contacts, persisted to `localStorage`
- **Conditional form logic** — sections (flow conditioner type, flange config) show/hide based on prior selections
- **PDF generation** — itemized, professional quote documents generated client-side with [jsPDF](https://github.com/parallax/jsPDF)
- **Quote history** — the last several quotes are saved and reloadable from `localStorage`
- **Responsive layout** — sticky price summary sidebar on desktop, stacked layout on mobile

## Tech stack

Vanilla HTML, CSS, and JavaScript — no framework, no build step, no dependencies beyond the jsPDF CDN script. Colors and font sizes are defined as CSS custom properties (`:root`) in [styles.css](styles.css) for easy theming.

## Running locally

No build step required. Serve the directory with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

```
├── index.html              Markup
├── styles.css              Styling (CSS variables for theme colors/type scale)
├── script.js               Form logic, price calculation, event wiring
├── pdf-generator.js        PDF quote generation
├── data/
│   ├── pricing.js          Pricing rules by vendor/size/configuration
│   ├── customers.js        Customer/contact CRUD + localStorage persistence
│   └── quotes.js           Quote history persistence
```

## Note

This project was originally built as freelance client work and has been genericized (branding, contact info, sample data) for portfolio purposes.
