import { NextResponse } from "next/server";

export async function GET() {
  // Return the AWS Terrarium DEM tile configuration for Phase 5.
  // In production, this might proxy the tiles or serve a custom DEM dataset.
  return NextResponse.json({
    type: "raster-dem",
    tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
    tileSize: 256,
    encoding: "terrarium",
    maxzoom: 15,
  });
}
