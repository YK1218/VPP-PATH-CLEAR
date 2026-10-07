/**
 * PathClear 3D Spatial Map & Micro-Segment Configuration
 * Supports 3D vector building extrusions, terrain elevation DEM, and 3D micro-segment objects.
 */

import type { StyleSpecification } from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";

// Camera Perspective Constants
export const MAP_3D_PITCH = 58;
export const MAP_3D_BEARING = -22;
export const MAP_3D_ZOOM = 16.2;
export const MAP_2D_PITCH = 0;
export const MAP_2D_BEARING = 0;
export const DEFAULT_MAP_CENTER: [number, number] = [72.8656, 19.0657]; // Mumbai BKC
export const DEFAULT_MAP_ZOOM = 14.5;
export const DEFAULT_MAP_PITCH = 45;
export const DEFAULT_MAP_BEARING = -15;

// OpenFreeMap Vector Tile Endpoints
export const OPENFREEMAP_LIBERTY_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
export const OPENFREEMAP_BRIGHT_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";

// OSM Raster Style for MapLibre
export const OSM_RASTER_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
} as const;

// High-fidelity 3D Architectural Extrusions for Mumbai BKC & Bandra Route Hubs
export const BKC_3D_BUILDINGS_GEOJSON = {
  type: "FeatureCollection" as const,
  features: [
    // 1. Jio World Convention Centre & Gate 2 South Complex
    {
      type: "Feature",
      properties: {
        id: "bldg-jio-world-centre",
        name: "Jio World Convention Centre - Gate 2 Arena",
        height: 54,
        min_height: 0,
        color: "#64748b",
        roofColor: "#334155",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8668, 19.0692],
            [72.8698, 19.0692],
            [72.8698, 19.0674],
            [72.8668, 19.0674],
            [72.8668, 19.0692],
          ],
        ],
      },
    },
    // 2. Hotel Trident BKC
    {
      type: "Feature",
      properties: {
        id: "bldg-trident-bkc",
        name: "Hotel Trident BKC",
        height: 62,
        min_height: 0,
        color: "#94a3b8",
        roofColor: "#475569",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8662, 19.0673],
            [72.8682, 19.0673],
            [72.8682, 19.0658],
            [72.8662, 19.0658],
            [72.8662, 19.0673],
          ],
        ],
      },
    },
    // 3. Sofitel Mumbai BKC Luxury Tower
    {
      type: "Feature",
      properties: {
        id: "bldg-sofitel-bkc",
        name: "Sofitel Mumbai BKC Tower",
        height: 58,
        min_height: 0,
        color: "#cbd5e1",
        roofColor: "#64748b",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8686, 19.0673],
            [72.8704, 19.0673],
            [72.8704, 19.0658],
            [72.8686, 19.0658],
            [72.8686, 19.0673],
          ],
        ],
      },
    },
    // 4. Diamond Market BKC Avenue 3 Lane 4
    {
      type: "Feature",
      properties: {
        id: "bldg-diamond-market",
        name: "Diamond Market Trade Complex",
        height: 38,
        min_height: 0,
        color: "#94a3b8",
        roofColor: "#475569",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8646, 19.0682],
            [72.8662, 19.0682],
            [72.8662, 19.0668],
            [72.8646, 19.0668],
            [72.8646, 19.0682],
          ],
        ],
      },
    },
    // 5. Bharat Diamond Bourse - East Wings
    {
      type: "Feature",
      properties: {
        id: "bldg-diamond-bourse-east",
        name: "Bharat Diamond Bourse Tower A-D",
        height: 68,
        min_height: 0,
        color: "#e2e8f0",
        roofColor: "#94a3b8",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8638, 19.0658],
            [72.8662, 19.0658],
            [72.8662, 19.0638],
            [72.8638, 19.0638],
            [72.8638, 19.0658],
          ],
        ],
      },
    },
    // 6. Bharat Diamond Bourse - West Wings
    {
      type: "Feature",
      properties: {
        id: "bldg-diamond-bourse-west",
        name: "Bharat Diamond Bourse Tower E-H",
        height: 64,
        min_height: 0,
        color: "#cbd5e1",
        roofColor: "#64748b",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8622, 19.0658],
            [72.8636, 19.0658],
            [72.8636, 19.0636],
            [72.8622, 19.0636],
            [72.8622, 19.0658],
          ],
        ],
      },
    },
    // 7. Laxmi Tower & Avenue 3 Plaza
    {
      type: "Feature",
      properties: {
        id: "bldg-laxmi-tower",
        name: "Laxmi Commercial Tower",
        height: 52,
        min_height: 0,
        color: "#78716c",
        roofColor: "#44403c",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8626, 19.0634],
            [72.8646, 19.0634],
            [72.8646, 19.0618],
            [72.8626, 19.0618],
            [72.8626, 19.0634],
          ],
        ],
      },
    },
    // 8. The Capital Tower BKC
    {
      type: "Feature",
      properties: {
        id: "bldg-the-capital",
        name: "The Capital Commercial Landmark",
        height: 72,
        min_height: 0,
        color: "#a1a1aa",
        roofColor: "#52525b",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8602, 19.0664],
            [72.8622, 19.0664],
            [72.8622, 19.0646],
            [72.8602, 19.0646],
            [72.8602, 19.0664],
          ],
        ],
      },
    },
    // 9. Nita Mukesh Ambani Cultural Centre (NMACC)
    {
      type: "Feature",
      properties: {
        id: "bldg-nmacc",
        name: "NMACC Grand Theatre & Art House",
        height: 42,
        min_height: 0,
        color: "#0f766e",
        roofColor: "#115e59",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.8672, 19.0662],
            [72.8688, 19.0662],
            [72.8688, 19.0646],
            [72.8672, 19.0646],
            [72.8672, 19.0662],
          ],
        ],
      },
    },
  ],
};

// 3D Micro-Segment Entrance Portals
export interface EntrancePortal3DData {
  id: string;
  name: string;
  coordinates: [number, number];
  doorWidthCm: number;
  doorHeightCm: number;
  doorType: "automatic_sliding" | "automatic_swing" | "manual_ramp";
  thresholdMm: number;
  isStepFreeVerified: boolean;
  beaconColor: string;
}

export const DEMO_3D_ENTRANCE_PORTALS = [
  {
    id: "ent-101",
    name: "Jio World Centre - Gate 2 South Accessible Entrance",
    coordinates: [72.868, 19.068],
    doorWidthCm: 210,
    doorHeightCm: 240,
    doorType: "automatic_sliding",
    thresholdMm: 0,
    isStepFreeVerified: true,
    beaconColor: "#10b981",
  },
  {
    id: "ent-102",
    name: "Dadar Central Station - Platform 1 West Ramp",
    coordinates: [72.8435, 19.0178],
    doorWidthCm: 180,
    doorHeightCm: 230,
    doorType: "manual_ramp",
    thresholdMm: 12,
    isStepFreeVerified: true,
    beaconColor: "#06b6d4",
  },
];

// Helper to inject 3D Building Extrusions & 3D Lighting into any MapLibre instance
export function setup3DMapLayers(map: MapLibreMap): void {
  if (!map) return;

  try {
    // Add 3D building extrusions source if not already present
    if (!map.getSource("bkc-3d-buildings")) {
      map.addSource("bkc-3d-buildings", {
        type: "geojson",
        data: "/api/v1/maps/buildings",
      });
    }

    // Add 3D Extruded Buildings Layer with dynamic elevation
    if (!map.getLayer("3d-buildings-extrusion")) {
      map.addLayer({
        id: "3d-buildings-extrusion",
        type: "fill-extrusion",
        source: "bkc-3d-buildings",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.92,
        },
      });
    }

    // Add 3D Rooftop Highlight Outlines for architectural definition
    if (!map.getLayer("3d-buildings-roof-line")) {
      map.addLayer({
        id: "3d-buildings-roof-line",
        type: "line",
        source: "bkc-3d-buildings",
        minzoom: 13,
        paint: {
          "line-color": "#ffffff",
          "line-width": 2,
          "line-opacity": 0.6,
        },
      });
    }

    // Configure 3D lighting for better depth perception
    map.setLight({
      anchor: "viewport",
      color: "#ffffff",
      intensity: 0.4,
      position: [1.5, 90, 80],
    });

  } catch (error) {
    console.warn("Failed to setup 3D map layers:", error);
  }
}

/**
 * Phase 4: 3D Micro-Segments
 * Adds tactile 3D route ribbons, 3D entrance portals (Gateways), and 3D Hazard pylons.
 */
export function setup3DMicroSegments(
  map: MapLibreMap,
  routeCoordinates: [number, number][],
  entranceCoordinates: [number, number],
  hazardCoordinates: [number, number][]
) {
  try {
    // 1. 3D Tactile Path Ribbon
    if (!map.getSource("tactile-ribbon-source")) {
      map.addSource("tactile-ribbon-source", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { height: 0.3, base: 0 }, // 0.3m elevated
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      map.addLayer({
        id: "tactile-ribbon-3d",
        type: "line",
        source: "tactile-ribbon-source",
        paint: {
          "line-color": "#10b981", // Emerald green for step-free
          "line-width": 8,
          "line-opacity": 0.8,
        },
      });
    }

    // 2. 3D Entrance Portals (Virtual Gateway arches)
    if (!map.getSource("entrance-portal-source")) {
      // Generate a small square polygon around entrance to extrude it
      const lng = entranceCoordinates[0];
      const lat = entranceCoordinates[1];
      const s = 0.00005; // ~5 meters

      map.addSource("entrance-portal-source", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: { height: 4, base: 0, color: "#0ea5e9" }, // 4m high blue glowing portal
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lng - s, lat - s],
              [lng + s, lat - s],
              [lng + s, lat + s],
              [lng - s, lat + s],
              [lng - s, lat - s],
            ]],
          },
        },
      });

      map.addLayer({
        id: "entrance-portal-3d",
        type: "fill-extrusion",
        source: "entrance-portal-source",
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "base"],
          "fill-extrusion-opacity": 0.6,
        },
      });
    }

    // 3. 3D Hazard Warning Pylons
    if (hazardCoordinates.length > 0) {
      if (!map.getSource("hazard-pylon-source")) {
        const hazardFeatures = hazardCoordinates.map((coord) => {
          const lng = coord[0];
          const lat = coord[1];
          const s = 0.00003; // ~3 meters
          return {
            type: "Feature" as const,
            properties: { height: 2, base: 0, color: "#ef4444" }, // Red barrier
            geometry: {
              type: "Polygon" as const,
              coordinates: [[
                [lng - s, lat - s],
                [lng + s, lat - s],
                [lng + s, lat + s],
                [lng - s, lat + s],
                [lng - s, lat - s],
              ]],
            },
          };
        });

        map.addSource("hazard-pylon-source", {
          type: "geojson",
          data: { type: "FeatureCollection" as const, features: hazardFeatures },
        });

        map.addLayer({
          id: "hazard-pylon-3d",
          type: "fill-extrusion",
          source: "hazard-pylon-source",
          paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 0.9,
          },
        });
      }
    }

  } catch (error) {
    console.warn("Failed to setup 3D micro segments:", error);
  }
}