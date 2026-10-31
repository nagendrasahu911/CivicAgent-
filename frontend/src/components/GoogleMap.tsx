/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  loadGoogleMaps, 
  hasGoogleMapsKey, 
  reverseGeocode, 
  getGoogleMapsApiKey 
} from '../utils/googleMapsLoader';
import { MapMarker } from '../types';
import { 
  MapPin, Navigation, Search, RotateCcw, 
  AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, 
  Layers, ExternalLink, Flame
} from 'lucide-react';

export interface GoogleMapProps {
  center?: [number, number]; // [lat, lon]
  zoom?: number;
  height?: string;
  className?: string;

  // Mode: 'picker' (interactive location selection), 'display' (viewer), 'radar' (hotspots)
  mode?: 'picker' | 'display' | 'radar';

  // Location Picker State
  selectedCoord?: [number, number] | null;
  selectedAddress?: string;
  selectedLocality?: string;
  locationMethod?: 'gps' | 'manual_search' | 'map_pin' | string;
  onLocationChange?: (info: {
    lat: number;
    lon: number;
    address: string;
    locality: string;
    landmark?: string;
    method: 'gps' | 'manual_search' | 'map_pin';
  }) => void;
  onResetLocation?: () => void;

  // Multi-marker support
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  showRadarCircles?: boolean;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  center = [28.6139, 77.2090], // Default New Delhi center
  zoom = 13,
  height = '420px',
  className = '',
  mode = 'display',
  selectedCoord,
  selectedAddress,
  selectedLocality,
  locationMethod,
  onLocationChange,
  onResetLocation,
  markers = [],
  onMarkerClick,
  showRadarCircles = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const pickerMarkerRef = useRef<google.maps.Marker | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [mapState, setMapState] = useState<'loading' | 'ready' | 'missing_key' | 'auth_error' | 'error'>(
    hasGoogleMapsKey() ? 'loading' : 'missing_key'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Manual fallback inputs (when API key is missing or user prefers manual input)
  const [manualAddress, setManualAddress] = useState(selectedAddress || '');
  const [manualLocality, setManualLocality] = useState(selectedLocality || '');
  const [manualLat, setManualLat] = useState<number>(selectedCoord ? selectedCoord[0] : center[0]);
  const [manualLon, setManualLon] = useState<number>(selectedCoord ? selectedCoord[1] : center[1]);

  // Sync manual inputs when props change
  useEffect(() => {
    if (selectedAddress) setManualAddress(selectedAddress);
    if (selectedLocality) setManualLocality(selectedLocality);
    if (selectedCoord) {
      setManualLat(selectedCoord[0]);
      setManualLon(selectedCoord[1]);
    }
  }, [selectedAddress, selectedLocality, selectedCoord]);

  // 1. Initialize Google Map
  useEffect(() => {
    if (!hasGoogleMapsKey()) {
      setMapState('missing_key');
      return;
    }

    let isMounted = true;
    setMapState('loading');

    loadGoogleMaps()
      .then((maps) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Custom styled Google Map with clear road names, transit, and dark slate palette
        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom,
          mapTypeId: maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: maps.ControlPosition.TOP_RIGHT,
          },
          fullscreenControl: true,
          streetViewControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: maps.ControlPosition.RIGHT_BOTTOM,
          },
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#38bdf8' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#334155' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#1e293b' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#94a3b8' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#0d9488' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#ccfbf1' }],
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{ color: '#2dd4bf' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#082f49' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#38bdf8' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#64748b' }],
            },
          ],
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new maps.InfoWindow();
        setMapState('ready');

        // Setup Places Autocomplete for Location Search input
        if (mode === 'picker' && searchInputRef.current) {
          const autocomplete = new maps.places.Autocomplete(searchInputRef.current, {
            fields: ['formatted_address', 'geometry', 'name', 'address_components'],
          });
          autocomplete.bindTo('bounds', map);
          autocompleteRef.current = autocomplete;

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              setGpsNotice("No coordinate details found for that place. Click on the map to pin.");
              return;
            }

            const pLat = place.geometry.location.lat();
            const pLng = place.geometry.location.lng();

            map.panTo({ lat: pLat, lng: pLng });
            map.setZoom(16);

            let locality = '';
            let sublocality = '';
            if (place.address_components) {
              for (const comp of place.address_components) {
                if (comp.types.includes('sublocality')) sublocality = comp.long_name;
                if (comp.types.includes('locality')) locality = comp.long_name;
              }
            }
            const combinedLoc = [sublocality, locality].filter(Boolean).join(', ') || locality || place.name || 'Selected Area';

            if (onLocationChange) {
              onLocationChange({
                lat: Number(pLat.toFixed(5)),
                lon: Number(pLng.toFixed(5)),
                address: place.formatted_address || place.name || '',
                locality: combinedLoc,
                landmark: place.name || undefined,
                method: 'manual_search',
              });
            }
          });
        }

        // Click to pick location
        if (mode === 'picker') {
          map.addListener('click', async (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const clickLat = Number(e.latLng.lat().toFixed(5));
            const clickLng = Number(e.latLng.lng().toFixed(5));

            const geo = await reverseGeocode(clickLat, clickLng);

            if (onLocationChange) {
              onLocationChange({
                lat: clickLat,
                lon: clickLng,
                address: geo.address,
                locality: geo.locality,
                landmark: geo.landmark,
                method: 'map_pin',
              });
            }
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("CivicSaathi AI: Google Maps load error:", err);
        if (err.message === 'MISSING_API_KEY') {
          setMapState('missing_key');
        } else {
          setMapState('error');
          setErrorMessage(err.message || 'Could not connect to Google Maps servers.');
        }
      });

    return () => {
      isMounted = false;
      mapInstanceRef.current = null;
      pickerMarkerRef.current = null;
    };
  }, [mode]);

  // 2. Handle Picker Draggable Marker
  useEffect(() => {
    if (mapState !== 'ready' || !mapInstanceRef.current || mode !== 'picker') return;
    const map = mapInstanceRef.current;
    const maps = (window as any).google?.maps;
    if (!maps) return;

    if (selectedCoord && selectedCoord[0] && selectedCoord[1]) {
      const position = { lat: selectedCoord[0], lng: selectedCoord[1] };

      if (!pickerMarkerRef.current) {
        // Create custom draggable cyan pin
        const marker = new maps.Marker({
          position,
          map,
          draggable: true,
          title: 'Selected Incident Spot (Drag to refine)',
          animation: maps.Animation.DROP,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#06b6d4', // Cyan
            fillOpacity: 1.0,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 2.0,
            anchor: new maps.Point(12, 22),
          },
        });

        // Dragend listener
        marker.addListener('dragend', async () => {
          const newPos = marker.getPosition();
          if (!newPos) return;
          const newLat = Number(newPos.lat().toFixed(5));
          const newLon = Number(newPos.lng().toFixed(5));

          const geo = await reverseGeocode(newLat, newLon);

          if (onLocationChange) {
            onLocationChange({
              lat: newLat,
              lon: newLon,
              address: geo.address,
              locality: geo.locality,
              landmark: geo.landmark,
              method: 'map_pin',
            });
          }
        });

        pickerMarkerRef.current = marker;
      } else {
        pickerMarkerRef.current.setPosition(position);
      }

      // Center map smoothly if far
      const curCenter = map.getCenter();
      if (curCenter) {
        const dist = Math.abs(curCenter.lat() - position.lat) + Math.abs(curCenter.lng() - position.lng);
        if (dist > 0.05) {
          map.panTo(position);
        }
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setMap(null);
      pickerMarkerRef.current = null;
    }
  }, [mapState, selectedCoord, mode]);

  // 3. Multi-marker Mode (Feed / Dashboard / Radar)
  useEffect(() => {
    if (mapState !== 'ready' || !mapInstanceRef.current || mode === 'picker') return;
    const map = mapInstanceRef.current;
    const maps = (window as any).google?.maps;
    if (!maps) return;

    // Clear previous markers & circles
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    const bounds = new maps.LatLngBounds();
    let hasValidMarker = false;

    markers.forEach((m) => {
      if (!m.lat || !m.lon) return;
      hasValidMarker = true;
      const pos = { lat: m.lat, lng: m.lon };
      bounds.extend(pos);

      // Color code pin by status / severity / cluster
      let pinColor = '#0d9488'; // teal default
      if (m.is_cluster) {
        pinColor = '#8b5cf6'; // purple cluster
      } else if (m.status === 'resolved_pending_feedback' || m.status === 'closed') {
        pinColor = '#10b981'; // green resolved
      } else if (m.severity_label === 'Urgent Review' || m.status === 'reopened') {
        pinColor = '#f43f5e'; // red urgent
      } else if (m.severity_label === 'High') {
        pinColor = '#f59e0b'; // amber high
      } else if (m.status === 'in_progress') {
        pinColor = '#3b82f6'; // blue in progress
      }

      const marker = new maps.Marker({
        position: pos,
        map,
        title: m.title,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: pinColor,
          fillOpacity: 1.0,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: m.is_cluster ? 1.8 : 1.5,
          anchor: new maps.Point(12, 22),
        },
      });

      // Marker click opens InfoWindow
      marker.addListener('click', () => {
        if (!infoWindowRef.current) return;

        const content = `
          <div style="font-family: inherit; font-size: 13px; color: #0f172a; max-width: 240px; padding: 4px;">
            ${m.ticket_number ? `<div style="font-size: 11px; font-weight: 700; color: #0d9488; font-family: monospace; margin-bottom: 2px;">${m.ticket_number}</div>` : ''}
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">${m.title}</div>
            ${m.category ? `<div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📂 ${m.category}</div>` : ''}
            <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 6px;">
              ${m.status ? `<span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${m.status.replace(/_/g, ' ')}</span>` : ''}
              ${m.severity_label ? `<span style="background: ${m.severity_label === 'Urgent Review' ? '#ffe4e6' : '#e0f2fe'}; color: ${m.severity_label === 'Urgent Review' ? '#e11d48' : '#0284c7'}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${m.severity_label}</span>` : ''}
            </div>
            ${m.support_count ? `<div style="font-size: 11px; font-weight: 600; color: #8b5cf6;">👥 ${m.support_count} Community Supporters</div>` : ''}
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);

        if (onMarkerClick) {
          onMarkerClick(m);
        }
      });

      markersRef.current.push(marker);

      // Radar circles for spatial risk intensity
      if (showRadarCircles) {
        const radius = m.severity_label === 'Urgent Review' ? 450 : m.severity_label === 'High' ? 300 : 180;
        const circle = new maps.Circle({
          strokeColor: pinColor,
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
          fillColor: pinColor,
          fillOpacity: 0.15,
          map,
          center: pos,
          radius,
        });
        circlesRef.current.push(circle);
      }
    });

    if (hasValidMarker && markers.length > 1) {
      map.fitBounds(bounds);
    }
  }, [mapState, markers, mode, showRadarCircles]);

  // "Use My Current Location" via Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please select your location on the map or type an address.");
      return;
    }

    setIsLocatingGPS(true);
    setGpsNotice("Requesting device GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingGPS(false);
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lon = Number(pos.coords.longitude.toFixed(5));

        setGpsNotice(`GPS Location detected (±${Math.round(pos.coords.accuracy)}m accuracy). Resolving address...`);

        // Center map if available
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng: lon });
          mapInstanceRef.current.setZoom(16);
        }

        const geo = await reverseGeocode(lat, lon);
        setGpsNotice(`Location set to: ${geo.address}`);

        if (onLocationChange) {
          onLocationChange({
            lat,
            lon,
            address: geo.address,
            locality: geo.locality,
            landmark: geo.landmark,
            method: 'gps',
          });
        }
      },
      (error) => {
        setIsLocatingGPS(false);
        let msg = "Could not fetch current location. ";
        if (error.code === error.PERMISSION_DENIED) {
          msg += "Permission was denied. You can select your location on the map or enter an address manually.";
        } else if (error.code === error.TIMEOUT) {
          msg += "GPS request timed out. Please click on the map.";
        } else {
          msg += "Location unavailable. Please select on the map.";
        }
        setGpsNotice(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Manual fallback commit (when no API key or manual typing)
  const handleApplyManual = () => {
    if (onLocationChange) {
      onLocationChange({
        lat: manualLat,
        lon: manualLon,
        address: manualAddress || manualLocality || 'Manual Location',
        locality: manualLocality || manualAddress || 'Selected Locality',
        method: 'manual_search',
      });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search & Location Tools for Picker Mode */}
      {mode === 'picker' && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            {/* Google Places Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search street, locality, landmark or metro station (Google Places)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>

            {/* GPS Location Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocatingGPS}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20 shrink-0"
              title="Detect device GPS coordinates"
            >
              <Navigation className={`w-4 h-4 ${isLocatingGPS ? 'animate-spin' : ''}`} />
              {isLocatingGPS ? 'Detecting GPS...' : 'Use My Current Location'}
            </button>

            {/* Reset Button */}
            {onResetLocation && selectedCoord && (
              <button
                type="button"
                onClick={onResetLocation}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 shrink-0"
                title="Reset location"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {gpsNotice && (
            <div className="text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span>{gpsNotice}</span>
              <button
                type="button"
                onClick={() => setGpsNotice(null)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map Display Container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950"
        style={{ height }}
      >
        {/* Loading Spinner */}
        {mapState === 'loading' && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-white">Initializing Google Maps...</div>
            <p className="text-xs text-slate-400 max-w-sm">
              Loading real-world street tiles, landmarks, and Google Places services.
            </p>
          </div>
        )}

        {/* Missing API Key Friendly Configuration Card */}
        {mapState === 'missing_key' && (
          <div className="absolute inset-0 z-20 bg-gradient-to-br from-slate-950 via-[#0a1222] to-slate-950 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Maps JavaScript API Integration Ready</h3>
                  <span className="text-[11px] text-amber-300 font-mono">
                    Environment Variable: VITE_GOOGLE_MAPS_API_KEY
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The platform is fully wired to render interactive Google Maps with real streets, Places Autocomplete, and draggable pins. 
                To view live Google Maps tiles, supply your Google Cloud API key in <code className="text-cyan-300 font-mono">frontend/.env</code>.
              </p>

              {/* Step-by-step setup notice */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Google Cloud Configuration Steps:
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-400">
                  <li>Enable <strong>Maps JavaScript API</strong>, <strong>Places API</strong>, and <strong>Geocoding API</strong> in Google Cloud Console.</li>
                  <li>Add <code className="text-teal-300 font-mono">VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY</code> in <code className="text-teal-300 font-mono">frontend/.env</code>.</li>
                  <li>Restrict key by HTTP Referrer (<code className="text-teal-300 font-mono">localhost:5173/*</code>) for security.</li>
                </ol>
              </div>
            </div>

            {/* Graceful Manual Input Fallback (Citizens are never blocked!) */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-bold text-teal-300 block">
                ⚡ Manual Location Selector (Fully Functional without API Key):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Street / Detailed Address"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
                <input
                  type="text"
                  value={manualLocality}
                  onChange={(e) => setManualLocality(e.target.value)}
                  placeholder="Ward / Locality (e.g. Civil Lines, Delhi)"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Auto-Detect GPS
                </button>

                <button
                  type="button"
                  onClick={handleApplyManual}
                  className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Apply Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error / Auth Failure Banner */}
        {mapState === 'error' && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Google Maps Failed to Load</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {errorMessage || "Check your network connection and verify that your Google Cloud API key has billing enabled and the Maps JavaScript API enabled."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Real Google Maps Native Canvas */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* In-Map Helper Badge */}
        {mapState === 'ready' && mode === 'picker' && (
          <div className="absolute bottom-2 left-2 z-10 bg-slate-900/90 text-slate-200 text-[11px] px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>Click map or drag cyan pin to pinpoint incident</span>
          </div>
        )}
      </div>

      {/* Selected Location Summary Card (Picker Mode) */}
      {mode === 'picker' && selectedCoord && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0a1424] to-slate-900 border border-cyan-800/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Selected Incident Location
              </span>
              {locationMethod && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-700">
                  {locationMethod === 'gps' ? '🛰️ GPS Verified' : locationMethod === 'manual_search' ? '🔍 Google Place' : '📍 Map Pin'}
                </span>
              )}
            </div>

            <p className="text-slate-300 font-medium">
              {selectedAddress || selectedLocality || 'Incident Location Pinned'}
            </p>

            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
              <span>Latitude: <strong className="text-slate-200">{selectedCoord[0].toFixed(5)}</strong></span>
              <span>Longitude: <strong className="text-slate-200">{selectedCoord[1].toFixed(5)}</strong></span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] text-teal-400 font-semibold bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-800">
              Attached to Complaint
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
