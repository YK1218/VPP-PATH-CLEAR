import { NextResponse } from "next/server";
import { BKC_3D_BUILDINGS_GEOJSON } from "@/lib/map-3d-config";

export async function GET() {
  // In a real app, this would query a database (e.g., PostGIS) for buildings within a bounding box.
  // For Phase 5, we serve the optimized GeoJSON collection.
  return NextResponse.json(BKC_3D_BUILDINGS_GEOJSON);
}
