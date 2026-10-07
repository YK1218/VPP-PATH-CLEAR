import type { StyleSpecification } from "maplibre-gl";

export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
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
};

export const OPENFREEMAP_LIBERTY_STYLE = "https://tiles.openfreemap.org/styles/liberty";
export const OPENFREEMAP_BRIGHT_STYLE = "https://tiles.openfreemap.org/styles/bright";
export const DEFAULT_MAP_STYLE = OPENFREEMAP_LIBERTY_STYLE;

export const DEFAULT_MAP_CENTER: [number, number] = [72.8656, 19.0657]; // Mumbai BKC
export const MAP_CENTER = DEFAULT_MAP_CENTER;
export const DEFAULT_MAP_ZOOM = 14.5;
export const DEFAULT_MAP_PITCH = 45;
export const DEFAULT_MAP_BEARING = -15;