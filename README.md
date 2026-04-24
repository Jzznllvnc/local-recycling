# ScrapNear - Your Local Recycling Guide

ScrapNear is a web application that helps users find nearby recycling centers and junk shops using live map data, geolocation, and searchable addresses. It provides a simple interface for discovering the closest recycling options and viewing directions quickly.

---

<p align="center">
  <img width="1903" height="1079" alt="scrapp" src="https://github.com/user-attachments/assets/8af4f40a-d65a-46c9-9e51-1e4dfbc34d7f" />
</p>

## Purpose

The goal of ScrapNear is to make recycling more accessible by helping users discover nearby facilities with as little friction as possible. By combining maps, address lookup, and location-based search, the app encourages practical day-to-day recycling habits.

---

## Features

- **Nearby shop search**
  - Use the **Find Shops Near Me** button to detect your current location and find the nearest recycling centers.

- **Manual location search**
  - Search by city, address, or landmark to find recycling centers near a custom location.

- **Interactive map**
  - Displays your location and nearby recycling centers using Leaflet and OpenStreetMap tiles.

- **Address fetching**
  - Fetches readable addresses for the closest matching locations and shows an animated loading state during lookup.

- **Clean routes**
  - Supports `/`, `/docs`, and `/report` in both local preview and Vercel production.

- **Bug report page**
  - Includes a dedicated report page for submitting issues and feedback.

---

## Tech Stack

- **Frontend**
  - HTML5
  - Tailwind CSS via CDN
  - JavaScript (ES modules)
  - Vite

- **Mapping and location**
  - Leaflet.js
  - OpenStreetMap tiles
  - Browser Geolocation API

- **Data sources**
  - Nominatim for geocoding and reverse geocoding
  - Overpass API for recycling center queries

- **Production API layer**
  - Vercel serverless functions:
    - `/api/geocode`
    - `/api/reverse-geocode`
    - `/api/recycling-centers`

---

## Project Structure

```text
api/
  geocode.js
  reverse-geocode.js
  recycling-centers.js
public/
  assets/
  css/
  js/
  docs.html
  index.html
  report.html
dist/
vite.config.mjs
vercel.json
package.json
```

---

## Getting Started

### Requirements

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

Available local routes:

- `/`
- `/docs`
- `/report`

### Build for production

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

---

## How to Use

### Automatic Search

1. Click **Find Shops Near Me**.
2. Allow location access when your browser asks for permission.
3. ScrapNear will center the map on your location.
4. The app finds the closest named recycling centers within the search radius.
5. The top matches are listed with readable addresses and direction links.

### Manual Search

1. Enter a city, address, or landmark such as `Makati City`.
2. Click **Search** or press `Enter`.
3. ScrapNear geocodes the location and searches for nearby recycling centers.

---

## Data Fetching Behavior

- **Local development**
  - The app calls Nominatim and Overpass directly so Vite development works without Vercel serverless functions.

- **Production deployment**
  - The frontend uses same-origin Vercel API routes to proxy geocoding, reverse geocoding, and recycling center requests.
  - This avoids browser-side fetch and CORS issues on the live deployment.

- **Loading state**
  - While addresses are being fetched for the closest results, ScrapNear displays an animated dotLottie loader.

---

## Deployment Notes

ScrapNear is configured for deployment on Vercel.

- **Framework Preset**
  - Vite

- **Build Command**
  - `npm run build`

- **Output Directory**
  - `dist`

- **Root Directory**
  - Keep this at the repository root

The root `vercel.json` enables clean URLs and redirects legacy `.html` routes to:

- `/`
- `/docs`
- `/report`

---

## Available Scripts

- **`npm run dev`**
  - Starts the Vite development server on `localhost:3000`.

- **`npm run build`**
  - Creates the production build in `dist`.

- **`npm run preview`**
  - Serves the production build locally for testing.
