const fs = require('fs');
const path = require('path');

async function generateGeoJSON() {
  const query = `[out:json][timeout:25];
  way["building"](19.060,72.860,19.072,72.872);
  out body;
  >;
  out skel qt;`;

  console.log("Fetching BKC building geometry from OpenStreetMap...");
  let res;
  try {
    res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PathClear-App/1.0",
      },
      body: "data=" + encodeURIComponent(query),
    });
  } catch (e) {
    console.log("Retrying with kumi endpoint...");
  }

  if (!res || !res.ok) {
    res = await fetch("https://overpass.kumi.systems/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PathClear-App/1.0",
      },
      body: "data=" + encodeURIComponent(query),
    });
  }

  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status}`);
  }

  const data = await res.json();
  const nodes = new Map();
  for (const el of data.elements) {
    if (el.type === 'node') {
      nodes.set(el.id, [el.lon, el.lat]);
    }
  }

  const features = [];
  const colorPalette = [
    '#64748b', '#94a3b8', '#cbd5e1', '#78716c', '#a1a1aa', '#475569', '#334155'
  ];

  for (const el of data.elements) {
    if (el.type === 'way' && el.nodes && el.nodes.length >= 4) {
      const coords = [];
      for (const nodeId of el.nodes) {
        const pt = nodes.get(nodeId);
        if (pt) coords.push(pt);
      }

      if (coords.length >= 4) {
        // Ensure polygon is closed
        if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
          coords.push(coords[0]);
        }

        const tags = el.tags || {};
        let height = 20;
        if (tags.height) {
          const parsed = parseFloat(tags.height);
          if (!isNaN(parsed) && parsed > 0) height = parsed;
        } else if (tags['building:levels']) {
          const levels = parseFloat(tags['building:levels']);
          if (!isNaN(levels) && levels > 0) height = levels * 3.8;
        } else {
          // Approximate height based on building footprint area or hash
          const pseudoHash = (el.id % 7);
          height = 16 + pseudoHash * 6; // between 16m and 52m
        }

        // Highlight landmarks
        const name = tags.name || tags['addr:housename'] || 'BKC Building';
        let color = colorPalette[el.id % colorPalette.length];
        if (name.includes('Jio') || name.includes('Convention')) {
          color = '#0d9488'; // Teal
          height = Math.max(height, 46);
        } else if (name.includes('Diamond')) {
          color = '#38bdf8'; // Cyan/Glass
          height = Math.max(height, 58);
        } else if (name.includes('Trident') || name.includes('Sofitel')) {
          color = '#818cf8'; // Indigo
          height = Math.max(height, 54);
        }

        features.push({
          type: 'Feature',
          id: `bkc-osm-${el.id}`,
          properties: {
            id: `bkc-osm-${el.id}`,
            name,
            height: Math.round(height),
            min_height: 0,
            color,
            levels: tags['building:levels'] ? parseInt(tags['building:levels'], 10) : Math.round(height / 3.5),
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coords],
          },
        });
      }
    }
  }

  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  const outDir = path.join(__dirname, 'public', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'bkc_buildings.geojson');
  fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log(`Successfully generated 3D GeoJSON with ${features.length} real buildings at: ${outPath}`);
  console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
}

generateGeoJSON().catch(console.error);
