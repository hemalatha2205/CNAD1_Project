// Geolocation and Distance utility for LogiSphere Marketplace

export const DEFAULT_CITIES = [
  { name: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { name: "Mumbai", state: "Maharashtra", latitude: 19.0760, longitude: 72.8777 },
  { name: "Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.2090 },
  { name: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867 },
  { name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
  { name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
  { name: "New York", state: "NY", latitude: 40.7128, longitude: -74.0060 },
  { name: "London", state: "UK", latitude: 51.5074, longitude: -0.1278 }
];

const STORAGE_KEY = "logisphere_user_location";

/**
 * Calculates great-circle distance in kilometers using the Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
      Math.cos(nLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a numeric kilometer distance into a friendly display string
 */
export function formatDistance(km) {
  if (km == null || isNaN(km)) return null;
  if (km < 1) return "< 1 km away";
  return `${km.toFixed(1)} km away`;
}

/**
 * Retrieves the current customer location preference
 */
export function getUserLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read stored location", e);
  }
  // Default fallback if neither browser nor manual has been set
  return {
    label: "Bengaluru, KA",
    city: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    isGps: false
  };
}

/**
 * Persists location preference and triggers notification
 */
export function setUserLocation(locationData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));
    window.dispatchEvent(new CustomEvent("logisphere_location_changed", { detail: locationData }));
  } catch (e) {
    console.error("Could not save location", e);
  }
}

/**
 * Prompts the browser for GPS location (once)
 */
export function requestBrowserGpsLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          label: "Current GPS Location",
          city: "Nearby",
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          isGps: true
        };
        setUserLocation(loc);
        resolve(loc);
      },
      (err) => {
        reject(err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
