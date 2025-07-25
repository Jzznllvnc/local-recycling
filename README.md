# ScrapNear - Your Local Recycling Guide

ScrapNear is a user-friendly web application designed to help people easily locate nearby recycling centers and junk shops. Using live map data, it provides a simple and intuitive way to find facilities for recycling various materials.

---

## Purpose

The main goal of ScrapNear is to promote recycling and proper waste management by making it effortless for users to find local centers. By providing an accessible tool, the project aims to encourage more people to participate in recycling efforts, contributing to a cleaner environment.

---

## Tech Stack

This project was built using a combination of modern front-end technologies, focusing on a lightweight and fast user experience.

* **Front-End:**
    * HTML5
    * **Tailwind CSS** (via CDN for rapid styling)
    * **JavaScript (ES6+)** (for all application logic)

* **Mapping & Geolocation:**
    * **Leaflet.js:** A powerful open-source library for interactive maps.
    * **OpenStreetMap APIs:**
        * **Nominatim:** Used for geocoding (converting a search term like "Quezon City" into coordinates).
        * **Overpass API:** Used to query the live OpenStreetMap database for recycling center locations.

* **Development Environment:**
    * **Laragon:** A portable, isolated, and fast local development environment used to serve the project locally with SSL.

---

## How to Use

### 1. Local Setup

To run this project on your local machine, follow these steps:

1.  **Place the Project Folder:** Ensure your `localrecycling` project folder is inside your Laragon's `www` directory.

2.  **Start Laragon:** Open the Laragon application and click `Start All`.

3.  **Enable SSL (Important):**
    * Right-click on the Laragon window to open the menu.
    * Navigate to `Menu > Apache > SSL`.
    * Click `Enabled`. Laragon will automatically configure a security certificate.
    * Restart Laragon's services if they don't restart automatically.

4.  **Access the App:** Open your web browser and navigate to the secure URL:
    ```
    [https://localrecycling.test/public/](https://localrecycling.test/public/)
    ```
    *Note: Your browser may show a security warning the first time. You can safely proceed.*

### 2. Finding Recycling Centers

There are two ways to find locations:

* **Automatic Search (Recommended):**
    1.  Click the green **"Find Centers Near Me"** button.
    2.  Your browser will ask for permission to access your location. Click **"Allow"**.
    3.  The app will automatically pinpoint your location on the map and display the 5 closest recycling centers.

* **Manual Search:**
    1.  Type a city, address, or landmark into the search bar (e.g., "Makati City").
    2.  Click the **"Search"** button or press Enter.
    3.  The app will find that location and display the 5 closest recycling centers.