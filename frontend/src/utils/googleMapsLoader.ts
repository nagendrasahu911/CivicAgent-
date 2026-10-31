/// <reference types="@types/google.maps" />
/**
 * Google Maps JavaScript API Loader and Geocoding Utility
 * Supports Google Maps, Google Places Autocomplete, and Geocoding API.
 */

let googleMapsPromise: Promise<typeof google.maps> | null = null;
let gmAuthFailed = false;

// Listen for Google Maps Authentication failure (invalid API key / billing disabled)
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = () => {
    gmAuthFailed = true;
    console.error("CivicSaathi AI: Google Maps Authentication failed (gm_authFailure). Check API key & billing.");
  };
}

export function getGoogleMapsApiKey(): string {
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
}

export function hasGoogleMapsKey(): boolean {
  const key = getGoogleMapsApiKey();
  return Boolean(key && key !== 'YOUR_GOOGLE_MAPS_API_KEY' && key.length > 10);
}

export function isGoogleMapsAuthFailed(): boolean {
  return gmAuthFailed;
}

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error("Window is not available"));
  }

  // If already loaded and ready
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return Promise.reject(new Error("MISSING_API_KEY"));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check again
    if ((window as any).google && (window as any).google.maps) {
      resolve((window as any).google.maps);
      return;
    }

    const callbackName = '__initCivicGoogleMaps_' + Math.random().toString(36).substring(2, 9);
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error("Google Maps object not found after script load"));
      }
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      delete (window as any)[callbackName];
      googleMapsPromise = null;
      reject(new Error("NETWORK_OR_BLOCKED"));
    };

    // Timeout fallback after 10s
    setTimeout(() => {
      if (!(window as any).google?.maps && !gmAuthFailed) {
        // don't reject if resolved
      }
    }, 10000);

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Reverse Geocode coordinates to a human-readable street address and locality
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; locality: string; landmark?: string }> {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const first = results[0];
          const fullAddress = first.formatted_address;

          let locality = '';
          let sublocality = '';
          let landmark = '';

          for (const comp of first.address_components) {
            if (comp.types.includes('sublocality') || comp.types.includes('sublocality_level_1')) {
              sublocality = comp.long_name;
            } else if (comp.types.includes('locality')) {
              locality = comp.long_name;
            } else if (comp.types.includes('point_of_interest') || comp.types.includes('establishment')) {
              landmark = comp.long_name;
            }
          }

          const combinedLocality = [sublocality, locality].filter(Boolean).join(', ') || locality || fullAddress.split(',')[0];

          resolve({
            address: fullAddress,
            locality: combinedLocality,
            landmark: landmark || undefined,
          });
        } else {
          resolve({
            address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            locality: 'Selected Location',
          });
        }
      });
    });
  } catch {
    return {
      address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      locality: 'Selected Location',
    };
  }
}
