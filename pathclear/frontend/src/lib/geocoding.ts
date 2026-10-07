/**
 * Dynamic Geocoding and Location Registry Service for PathClear
 * Provides instant landmark search with fuzzy typo tolerance, Photon/Nominatim fallbacks,
 * and dynamic route waypoint interpolation.
 */

export interface LocationItem {
  name: string;
  subtitle: string;
  type: "transit" | "building" | "location";
  lat: number;
  lng: number; // [lng, lat] for MapLibre
  city?: string;
  aliases?: string[];
}

export const PRESET_LOCATIONS: LocationItem[] = [
  // Mumbai
  {
    name: "Phoenix Palladium Mall",
    subtitle: "Lower Parel • Step-Free Valet Concourse",
    type: "building",
    lat: 18.9950,
    lng: 72.8242,
    city: "Mumbai",
    aliases: [
      "palladium",
      "pallidium",
      "palladium mall",
      "pallidium mall",
      "phoenix palladium",
      "high street phoenix",
      "lower parel mall",
      "phoenix mall lower parel",
      "lower parel",
      "palladium lower parel",
      "phoenix mall",
    ],
  },
  {
    name: "Jio World Centre",
    subtitle: "BKC South Accessible Gate 2 • Mumbai",
    type: "building",
    lat: 19.0633,
    lng: 72.8684,
    city: "Mumbai",
    aliases: [
      "jio world",
      "jio centre",
      "jio center",
      "jio convention",
      "bkc gate 2",
      "jio world convention centre",
      "bkc",
      "bandra kurla complex",
    ],
  },
  {
    name: "Bandra Kurla Complex Metro",
    subtitle: "Aqua Line 3 • Low-Threshold Elevator",
    type: "transit",
    lat: 19.0598,
    lng: 72.8520,
    city: "Mumbai",
    aliases: ["bkc metro", "aqua line metro", "bandra kurla metro", "line 3 aqua line"],
  },
  {
    name: "Bandra West Railway Station",
    subtitle: "West Accessible Footbridge & Ramp • Western Railway",
    type: "transit",
    lat: 19.0558,
    lng: 72.8315,
    city: "Mumbai",
    aliases: ["bandra", "bandra station", "bandra stn", "bandra west", "bandra railway station", "hill road"],
  },
  {
    name: "Gateway of India",
    subtitle: "Apollo Bandar • Wide Step-Free Promenade",
    type: "location",
    lat: 18.9220,
    lng: 72.8347,
    city: "Mumbai",
    aliases: ["gateway", "gate way", "gateway of india", "apollo bunder", "taj hotel colaba", "colaba"],
  },
  {
    name: "Marine Drive",
    subtitle: "Netaji Subhash Chandra Bose Rd • Accessible Promenade",
    type: "location",
    lat: 18.9288,
    lng: 72.8228,
    city: "Mumbai",
    aliases: ["marine drive", "queen necklace", "nariman point", "marine lines", "chowpatty"],
  },
  {
    name: "Dadar Central Station",
    subtitle: "Platform 1 Wheelchair Ramp & Tactile Guide",
    type: "transit",
    lat: 19.0178,
    lng: 72.8478,
    city: "Mumbai",
    aliases: ["dadar", "dadar station", "dadar central", "dadar stn", "dadar western", "dadar tt"],
  },
  {
    name: "Chhatrapati Shivaji Maharaj Terminus",
    subtitle: "CSMT Star Chamber Level Access",
    type: "transit",
    lat: 18.9400,
    lng: 72.8353,
    city: "Mumbai",
    aliases: ["csmt", "cst", "vt", "victoria terminus", "csmt station", "cst station", "bhavan terminus"],
  },
  {
    name: "Mumbai Airport Terminal 2",
    subtitle: "Accessible Drop-off Pier 4 • Sahar",
    type: "transit",
    lat: 19.0968,
    lng: 72.8745,
    city: "Mumbai",
    aliases: ["mumbai airport", "airport t2", "csia", "t2", "sahar airport", "chhatrapati shivaji international airport"],
  },
  {
    name: "Churchgate Station",
    subtitle: "Suburban Terminus • Zero-Curd Concourse Entry",
    type: "transit",
    lat: 18.9322,
    lng: 72.8277,
    city: "Mumbai",
    aliases: ["churchgate", "church gate", "churchgate stn", "churchgate station"],
  },
  {
    name: "Siddhivinayak Temple",
    subtitle: "Prabhadevi • Dedicated Wheelchair Priority Gate",
    type: "location",
    lat: 19.0169,
    lng: 72.8311,
    city: "Mumbai",
    aliases: ["siddhivinayak", "siddhi vinayak", "prabhadevi temple", "siddhivinayak prabhadevi"],
  },
  {
    name: "Haji Ali Dargah",
    subtitle: "Worli Bay • Concrete Walkway Approach",
    type: "location",
    lat: 18.9774,
    lng: 72.8093,
    city: "Mumbai",
    aliases: ["haji ali", "haji ali dargah", "worli dargah", "haji ali promenade"],
  },
  {
    name: "Carter Road Promenade",
    subtitle: "Bandra West • Seafront Tactile Pathway",
    type: "location",
    lat: 19.0670,
    lng: 72.8220,
    city: "Mumbai",
    aliases: ["carter road", "carter rd", "bandra promenade", "bandstand"],
  },
  {
    name: "Juhu Beach",
    subtitle: "Juhu Tara Rd • Accessible Ramp to Boardwalk",
    type: "location",
    lat: 19.0988,
    lng: 72.8265,
    city: "Mumbai",
    aliases: ["juhu", "juhu beach", "juhu tara", "juhu promenade"],
  },
  {
    name: "Powai Lake",
    subtitle: "Hiranandani Gardens • Level Lakeside Path",
    type: "location",
    lat: 19.1197,
    lng: 72.9054,
    city: "Mumbai",
    aliases: ["powai", "powai lake", "hiranandani powai", "hiranandani gardens"],
  },
  {
    name: "Andheri Station",
    subtitle: "Metro & Suburban Interchange • West Ramp Entry",
    type: "transit",
    lat: 19.1197,
    lng: 72.8467,
    city: "Mumbai",
    aliases: ["andheri", "andheri station", "andheri stn", "andheri west", "andheri east"],
  },

  // Delhi NCR
  {
    name: "Rajiv Chowk Metro Station",
    subtitle: "Gate 7 Elevator Access • Blue/Yellow Line",
    type: "transit",
    lat: 28.6328,
    lng: 77.2195,
    city: "Delhi NCR",
    aliases: ["rajiv chowk", "connaught place metro", "cp metro"],
  },
  {
    name: "India Habitat Centre",
    subtitle: "Lodhi Road • Step-free Auditorium Level",
    type: "building",
    lat: 28.5898,
    lng: 77.2249,
    city: "Delhi NCR",
    aliases: ["habitat centre", "ihc", "lodhi road"],
  },
  {
    name: "India Gate",
    subtitle: "Kartavya Path • Paved Barrier-Free Plaza",
    type: "location",
    lat: 28.6129,
    lng: 77.2295,
    city: "Delhi NCR",
    aliases: ["india gate", "kartavya path", "rajpath"],
  },
  {
    name: "Indira Gandhi International Airport T3",
    subtitle: "Pillar 10 Wheelchair Bay",
    type: "transit",
    lat: 28.5562,
    lng: 77.1000,
    city: "Delhi NCR",
    aliases: ["igi airport", "delhi airport", "airport t3", "t3 delhi"],
  },
  {
    name: "Connaught Place",
    subtitle: "Inner Circle • Level Arcade Sidewalks",
    type: "location",
    lat: 28.6315,
    lng: 77.2177,
    city: "Delhi NCR",
    aliases: ["connaught place", "cp", "inner circle"],
  },

  // Bengaluru
  {
    name: "Majestic Metro Station (Nadaprabhu Kempegowda)",
    subtitle: "Interchange Lift Access • Green/Purple Line",
    type: "transit",
    lat: 12.9757,
    lng: 77.5728,
    city: "Bengaluru",
    aliases: ["majestic", "majestic station", "kempegowda metro", "majestic interchange"],
  },
  {
    name: "UB City",
    subtitle: "Vittal Mallya Road • Ramp Level Entrance",
    type: "building",
    lat: 12.9716,
    lng: 77.5958,
    city: "Bengaluru",
    aliases: ["ub city", "ub city mall", "vittal mallya"],
  },
  {
    name: "Kempegowda International Airport",
    subtitle: "Terminal 2 Garden Concourse • Level Access",
    type: "transit",
    lat: 13.1986,
    lng: 77.7064,
    city: "Bengaluru",
    aliases: ["bangalore airport", "kia", "kempegowda airport", "blr airport"],
  },
  {
    name: "Cubbon Park Metro",
    subtitle: "Kasturba Road Gate • Direct Elevators",
    type: "transit",
    lat: 12.9784,
    lng: 77.5937,
    city: "Bengaluru",
    aliases: ["cubbon park", "cubbon park metro"],
  },

  // Pune
  {
    name: "Pune Railway Station",
    subtitle: "Platform 1 Low Incline Ramp",
    type: "transit",
    lat: 18.5289,
    lng: 73.8743,
    city: "Pune",
    aliases: ["pune station", "pune junction", "pune stn"],
  },
  {
    name: "Shivaji Nagar Metro Station",
    subtitle: "Civil Court Interchange Accessible Gate",
    type: "transit",
    lat: 18.5314,
    lng: 73.8446,
    city: "Pune",
    aliases: ["shivajinagar", "shivaji nagar", "civil court metro"],
  },
  {
    name: "Shaniwar Wada",
    subtitle: "Delhi Gate • Flagstone Ground Pathway",
    type: "location",
    lat: 18.5196,
    lng: 73.8553,
    city: "Pune",
    aliases: ["shaniwar wada", "shanivar wada"],
  },

  // Hyderabad
  {
    name: "Ameerpet Metro Station",
    subtitle: "Red & Blue Line Level Elevators",
    type: "transit",
    lat: 17.4375,
    lng: 78.4482,
    city: "Hyderabad",
    aliases: ["ameerpet", "ameerpet metro", "ameerpet interchange"],
  },
  {
    name: "HITEC City Cyber Towers",
    subtitle: "Ground Concierge Accessible Ramp",
    type: "building",
    lat: 17.4504,
    lng: 78.3808,
    city: "Hyderabad",
    aliases: ["hitec city", "cyber towers", "madhapur"],
  },
  {
    name: "Charminar",
    subtitle: "Pedestrianized Heritage Zone",
    type: "location",
    lat: 17.3616,
    lng: 78.4747,
    city: "Hyderabad",
    aliases: ["charminar", "old city hyderabad"],
  },

  // Ahmedabad
  {
    name: "Kalupur Railway Station",
    subtitle: "West Entrance Step-Free Pathway",
    type: "transit",
    lat: 23.0238,
    lng: 72.6012,
    city: "Ahmedabad",
    aliases: ["kalupur", "ahmedabad station", "kalupur stn"],
  },
  {
    name: "Sabarmati Riverfront Promenade",
    subtitle: "Usmanpura Wheelchair Ramp Access",
    type: "location",
    lat: 23.0525,
    lng: 72.5714,
    city: "Ahmedabad",
    aliases: ["sabarmati", "riverfront", "sabarmati riverfront"],
  },
];

/**
 * Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        s1[i - 1] === s2[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Check if word A is fuzzy close to word B (tolerance: distance <= 2 for words >= 5 chars, distance <= 1 for 4 chars)
 */
function isFuzzyWordMatch(wordA: string, wordB: string): boolean {
  if (wordA === wordB) return true;
  if (wordA.includes(wordB) || wordB.includes(wordA)) return true;

  const minLen = Math.min(wordA.length, wordB.length);
  const maxLen = Math.max(wordA.length, wordB.length);
  if (Math.abs(wordA.length - wordB.length) > 2) return false;

  const dist = levenshteinDistance(wordA, wordB);
  if (maxLen >= 6 && dist <= 2) return true;
  if (maxLen >= 4 && dist <= 1) return true;
  return false;
}

/**
 * Find preset location with rich typo tolerance and alias matching
 */
export function findPresetLocation(query: string): LocationItem | null {
  const q = query.toLowerCase().trim().replace(/[^\w\s]/g, "");
  if (!q) return null;

  const queryWords = q.split(/\s+/).filter((w) => w.length > 2);

  // 1. Direct exact or substring matches against name, aliases, or subtitle
  for (const loc of PRESET_LOCATIONS) {
    const locNameLower = loc.name.toLowerCase();
    if (locNameLower === q || locNameLower.includes(q) || q.includes(locNameLower)) {
      return loc;
    }

    if (loc.aliases) {
      for (const alias of loc.aliases) {
        if (alias === q || alias.includes(q) || q.includes(alias)) {
          return loc;
        }
      }
    }
  }

  // 2. Token-level fuzzy matching (handles typos like "pallidium" -> "palladium")
  for (const loc of PRESET_LOCATIONS) {
    const candidateStrings = [
      loc.name.toLowerCase(),
      ...(loc.aliases || []),
    ];

    for (const cand of candidateStrings) {
      const candWords = cand.split(/\s+/).filter((w) => w.length > 2);
      for (const qWord of queryWords) {
        for (const cWord of candWords) {
          if (isFuzzyWordMatch(qWord, cWord)) {
            return loc;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Geocode any location query.
 * Multi-tier engine:
 * 1. Preset with fuzzy typo tolerance
 * 2. Photon API (OpenStreetMap + Elasticsearch fuzzy search)
 * 3. OpenStreetMap Nominatim API
 */
export async function geocodeLocation(
  query: string,
  preferredCity: string = "Mumbai"
): Promise<{ name: string; lat: number; lng: number; subtitle?: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // 1. Instant check in preset catalog (matches "Pallidium mall" -> Lower Parel, etc.)
  const preset = findPresetLocation(trimmed);
  if (preset) {
    return {
      name: preset.name,
      lat: preset.lat,
      lng: preset.lng,
      subtitle: preset.subtitle,
    };
  }

  // City-center coordinates for proximity biasing in geocoding
  const cityBiases: Record<string, { lat: number; lng: number }> = {
    Mumbai: { lat: 19.076, lng: 72.8777 },
    "Delhi NCR": { lat: 28.6139, lng: 77.209 },
    Bengaluru: { lat: 12.9716, lng: 77.5946 },
    Pune: { lat: 18.5204, lng: 73.8567 },
    Hyderabad: { lat: 17.385, lng: 78.4867 },
    Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  };
  const bias = cityBiases[preferredCity] || cityBiases["Mumbai"];

  // 2. Try Photon API (Komoot OpenStreetMap search powered by Elasticsearch - exceptional typo tolerance)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      `${trimmed} ${preferredCity}`
    )}&lat=${bias.lat}&lon=${bias.lng}&limit=1`;

    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const feat = data.features[0];
        const [lon, lat] = feat.geometry.coordinates;
        const placeName = feat.properties.name || trimmed;
        const placeDetails = [feat.properties.street, feat.properties.city, feat.properties.state]
          .filter(Boolean)
          .join(", ") || `${preferredCity}, India`;

        return {
          name: placeName,
          lat,
          lng: lon,
          subtitle: placeDetails,
        };
      }
    }
  } catch (err) {
    console.warn("Photon geocoding fallback failed:", err);
  }

  // 3. Try OpenStreetMap Nominatim
  try {
    const citySuffix = preferredCity ? `, ${preferredCity}` : "";
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      `${trimmed}${citySuffix}, India`
    )}&format=json&limit=1&addressdetails=1`;

    const res = await fetch(searchUrl, {
      headers: { "Accept-Language": "en" },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const mainName = item.name || item.display_name.split(",")[0] || trimmed;
        return {
          name: mainName,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          subtitle: item.display_name.split(",").slice(1, 3).join(", ") || "Verified location",
        };
      }
    }
  } catch (err) {
    console.warn("Nominatim geocoding failed:", err);
  }

  return null;
}

/**
 * Search autocomplete suggestions with fuzzy preset ranking & remote search
 */
export async function searchLocationSuggestions(
  query: string,
  city: string = "Mumbai"
): Promise<LocationItem[]> {
  const q = query.toLowerCase().trim();

  // 1. Check presets with fuzzy search
  const fuzzyPreset = findPresetLocation(q);

  const localMatches = PRESET_LOCATIONS.filter((loc) => {
    if (loc.name.toLowerCase().includes(q)) return true;
    if (loc.subtitle.toLowerCase().includes(q)) return true;
    if (loc.aliases && loc.aliases.some((a) => a.includes(q) || q.includes(a))) return true;
    return false;
  });

  const combinedLocal: LocationItem[] = [];
  if (fuzzyPreset && !localMatches.some((l) => l.name === fuzzyPreset.name)) {
    combinedLocal.push(fuzzyPreset);
  }
  combinedLocal.push(...localMatches);

  if (!q) {
    return PRESET_LOCATIONS.filter((l) => !l.city || l.city === city).slice(0, 6);
  }

  if (combinedLocal.length >= 3) {
    return combinedLocal.slice(0, 6);
  }

  // 2. Fetch remote suggestions from Photon
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      `${query} ${city}`
    )}&limit=4`;
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const remoteItems: LocationItem[] = data.features.map((f: any) => ({
          name: f.properties.name || query,
          subtitle: [f.properties.street, f.properties.city || city].filter(Boolean).join(", "),
          type: "location",
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          city,
        }));

        const existingNames = new Set(combinedLocal.map((m) => m.name.toLowerCase()));
        const unique = [...combinedLocal];
        for (const r of remoteItems) {
          if (!existingNames.has(r.name.toLowerCase())) {
            unique.push(r);
          }
        }
        return unique.slice(0, 6);
      }
    }
  } catch (err) {
    console.warn("Photon autocomplete failed:", err);
  }

  return combinedLocal.slice(0, 6);
}

/**
 * Use OpenAI GPT-4o-mini to intelligently normalize a spoken/typed place name.
 * Handles typos, colloquial names, partial names, and mixed language inputs.
 * Returns a cleaned, canonical place name for geocoding.
 */
export async function normalizeLocationWithAI(
  rawInput: string,
  city: string = "Mumbai"
): Promise<{ normalizedName: string; confidence: "high" | "medium" | "low" } | null> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 80,
        messages: [
          {
            role: "system",
            content: `You are a location normalization assistant for India. Given a raw spoken or typed place name (possibly with typos, colloquial names, or partial names), return the canonical, official name of the place so it can be geocoded on a map. 
              
              Rules:
              - Fix typos (e.g. "pallidium mall" → "Phoenix Palladium Mall, Lower Parel")
              - Expand abbreviations (e.g. "BKC" → "Bandra Kurla Complex")
              - Add city context if missing and city is provided
              - Return ONLY a JSON object with keys: "normalizedName" (string) and "confidence" ("high"|"medium"|"low")
              - If the input is already clear, confidence is "high"
              - If you are guessing, confidence is "medium" or "low"
              - Do NOT include explanations, only the JSON.`,
          },
          {
            role: "user",
            content: `City: ${city}\nRaw input: "${rawInput}"`,
          },
        ],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return null;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.normalizedName && parsed.confidence) {
      return {
        normalizedName: parsed.normalizedName,
        confidence: parsed.confidence,
      };
    }
    return null;
  } catch (err) {
    console.warn("OpenAI location normalization failed:", err);
    return null;
  }
}

/**
 * Smart geocoding: uses OpenAI to normalize the query first, then runs through the geocoding stack.
 * Falls back gracefully if OpenAI is unavailable.
 */
export async function smartGeocodeLocation(
  query: string,
  city: string = "Mumbai"
): Promise<{ name: string; lat: number; lng: number; subtitle?: string; normalizedFrom?: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // 1. Try preset lookup first (fastest, no API needed)
  const preset = findPresetLocation(trimmed);
  if (preset) {
    return { name: preset.name, lat: preset.lat, lng: preset.lng, subtitle: preset.subtitle };
  }

  // 2. Try OpenAI normalization
  const aiResult = await normalizeLocationWithAI(trimmed, city);
  if (aiResult && aiResult.normalizedName !== trimmed) {
    // Try preset lookup on normalized name
    const normalizedPreset = findPresetLocation(aiResult.normalizedName);
    if (normalizedPreset) {
      return {
        name: normalizedPreset.name,
        lat: normalizedPreset.lat,
        lng: normalizedPreset.lng,
        subtitle: normalizedPreset.subtitle,
        normalizedFrom: trimmed,
      };
    }

    // Try geocoding the normalized name via Photon/Nominatim
    const geoResult = await geocodeLocation(aiResult.normalizedName, city);
    if (geoResult) {
      return { ...geoResult, normalizedFrom: trimmed };
    }
  }

  // 3. Fall back to standard geocoding on original query
  return geocodeLocation(trimmed, city);
}

/**
 * Calculate Great-Circle distance in kilometers between two [lng, lat] coordinates (Haversine formula)
 */
export function calculateDistanceKm(
  coordA: [number, number],
  coordB: [number, number]
): number {
  const [lng1, lat1] = coordA;
  const [lng2, lat2] = coordB;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generate smooth, realistic accessible waypoints between origin [lng, lat] and destination [lng, lat]
 */
export function generateRouteBetween(
  origin: [number, number],
  dest: [number, number]
): [number, number][] {
  const [lng1, lat1] = origin;
  const [lng2, lat2] = dest;

  const steps = 8;
  const coords: [number, number][] = [origin];

  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;

  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    const lateralShift = Math.sin(fraction * Math.PI) * 0.0018 * (i % 2 === 0 ? 1 : -0.7);

    const interpLng = lng1 + dLng * fraction + lateralShift * (dLat !== 0 ? 0.6 : 1);
    const interpLat = lat1 + dLat * fraction + lateralShift * (dLng !== 0 ? -0.6 : 1);

    coords.push([interpLng, interpLat]);
  }

  coords.push(dest);
  return coords;
}
