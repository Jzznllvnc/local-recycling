document.addEventListener('DOMContentLoaded', () => {

    const locationsGrid = document.getElementById('locations-grid');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const getLocationButton = document.getElementById('getLocationButton');
    const mapSection = document.getElementById('map-section');
    
    // --- App State ---
    let map;
    let userMarker;
    let markersLayer;

    // --- Core Functions ---

    /**
     * Initializes the map and its layers.
     */
    function initializeMap() {
        map = L.map('map').setView([14.6091, 121.0223], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        markersLayer = L.layerGroup().addTo(map);
    }

    /**
     * Calculates the distance between two lat/lng points in km.
     */
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
        return R * 2 * Math.asin(Math.sqrt(a));
    }

    /**
     * Renders a sorted list of locations with high-quality addresses.
     */
    function renderLocations(locations) {
        locationsGrid.innerHTML = '';
        markersLayer.clearLayers();

        if (locations.length === 0) {
            locationsGrid.innerHTML = '<p class="text-gray-500 col-span-full text-center">No named recycling centers found within 5km.</p>';
            return;
        }

        locations.forEach(location => {
            const name = location.tags.name;
            const address = location.full_address;
            const lat = location.type === 'node' ? location.lat : location.center.lat;
            const lon = location.type === 'node' ? location.lon : location.center.lon;
            const distance = location.distance.toFixed(1);
            
            const marker = L.marker([lat, lon]).bindPopup(`<b>${name}</b><br>${address}`).addTo(markersLayer);
            
            const cardHTML = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border-t-4 border-green-500">
                    <div class="p-6">
                        <h3 class="text-lg font-bold text-gray-800 truncate">${name}</h3>
                        <p class="text-gray-600 mt-2 text-sm h-10">${address}</p>
                        <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                            <div class="flex items-center text-sm text-gray-500">
                                <svg class="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                                <span>${distance} km away</span>
                            </div>
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
                                Get Directions
                            </a>
                        </div>
                    </div>
                </div>`;
            locationsGrid.innerHTML += cardHTML;
        });
    }
    
    /**
     * Fetches a high-quality, human-readable address for a location.
     */
    async function fetchAddressForLocation(location) {
        const lat = location.type === 'node' ? location.lat : location.center.lat;
        const lon = location.type === 'node' ? location.lon : location.center.lon;
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
        
        try {
            const response = await fetch(url, { headers: { 'User-Agent': 'ScrapNear/1.0' } });
            if (!response.ok) throw new Error('Reverse geocoding request failed');
            const data = await response.json();
            
            if (data && data.address) {
                const addr = data.address;
                const addressParts = [
                    addr.road || addr.pedestrian,
                    addr.suburb || addr.village || addr.town,
                    addr.city,
                    addr.county,
                    addr.postcode
                ].filter(Boolean).join(', ');
                location.full_address = addressParts || data.display_name;
            } else {
                location.full_address = data.display_name || 'Could not determine address.';
            }

        } catch (error) {
            console.error(`Address fetch failed for location ${location.id}:`, error);
            location.full_address = 'Address lookup failed.';
        }
    }

    /**
     * The main function to find and display recycling centers based on coordinates.
     */
    async function findAndDisplayCenters(lat, lon) {
        setLoadingState(true, 'Searching for nearby recycling centers...');
        map.setView([lat, lon], 14);

        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([lat, lon], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            })
        }).bindPopup('Your Location').addTo(map).openPopup();

        try {
            const radius = 5000; 
            const query = `[out:json][timeout:25];(node["amenity"="recycling"](around:${radius},${lat},${lon});way["amenity"="recycling"](around:${radius},${lat},${lon});relation["amenity"="recycling"](around:${radius},${lat},${lon}););out center;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
            
            const response = await fetch(url, { headers: { 'User-Agent': 'ScrapNear/1.0' } });
            if (!response.ok) throw new Error(`Map data API error: ${response.statusText}`);
            const data = await response.json();

            // First, process all locations to calculate distance and filter
            let processedLocations = data.elements
                .filter(loc => loc.tags && loc.tags.name)
                .map(location => {
                    const locLat = location.type === 'node' ? location.lat : location.center.lat;
                    const locLon = location.type === 'node' ? location.lon : location.center.lon;
                    location.distance = getDistance(lat, lon, locLat, locLon);
                    return location;
                })
                .sort((a, b) => a.distance - b.distance);

            // Take only the top 5 closest locations
            const top5Locations = processedLocations.slice(0, 5);

            if (top5Locations.length === 0) {
                renderLocations([]);
                return;
            }

            setLoadingState(true, `Found ${top5Locations.length} closest locations, fetching addresses...`);

            // Fetch high-quality addresses for ONLY the top 5
            for (const location of top5Locations) {
                await fetchAddressForLocation(location);
            }

            renderLocations(top5Locations);

        } catch (error) {
            console.error('Full error object:', error);
            locationsGrid.innerHTML = `<p class="text-red-500 col-span-full text-center">An error occurred: ${error.message}.</p>`;
        } finally {
            setLoadingState(false);
        }
    }

    // --- Event Handlers ---
    function handleGetLocation() {
        mapSection.scrollIntoView({ behavior: 'smooth' });
        
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setLoadingState(true, 'Requesting location permission...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                findAndDisplayCenters(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                locationsGrid.innerHTML = `<p class="text-red-500 col-span-full text-center">Could not get your location. Please enable location services and refresh the page.</p>`;
                setLoadingState(false);
            }
        );
    }

    async function handleManualSearch() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) return;
        
        mapSection.scrollIntoView({ behavior: 'smooth' });
        setLoadingState(true, `Searching for "${searchTerm}"...`);
        
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=1&countrycodes=ph`;
            const response = await fetch(url, { headers: { 'User-Agent': 'ScrapNear/1.0' } });
            if (!response.ok) throw new Error('Geocoding service failed.');
            const data = await response.json();
            if (data.length === 0) throw new Error(`Could not find a location for "${searchTerm}".`);
            
            findAndDisplayCenters(data[0].lat, data[0].lon);
        } catch (error) {
            console.error('Full manual search error:', error);
            locationsGrid.innerHTML = `<p class="text-red-500 col-span-full text-center">${error.message}.</p>`;
            setLoadingState(false);
        }
    }

    function setLoadingState(isLoading, message = '') {
        searchButton.disabled = isLoading;
        getLocationButton.disabled = isLoading;
        if (isLoading) {
            locationsGrid.innerHTML = `<p class="text-gray-500 col-span-full text-center">${message}</p>`;
            getLocationButton.innerHTML = '...';
        } else {
            getLocationButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg> Find Shops Near Me`;
        }
    }

    // --- Initial Setup ---
    initializeMap();
    locationsGrid.innerHTML = '<p class="text-gray-500 col-span-full text-center">Detected recycling centers or shops near you will appear here. Click the button above to scan.</p>';
    getLocationButton.addEventListener('click', handleGetLocation);
    searchButton.addEventListener('click', handleManualSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') handleManualSearch();
    });
});