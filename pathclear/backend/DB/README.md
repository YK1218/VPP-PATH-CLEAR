# PathClear Database Architecture (Vertical Slice Design)

This database architecture is built for **PathClear**, an accessible navigation and doorway verification platform tailored for wheelchair users, motorized scooter riders, and individuals with mobility or visual constraints.

---

## 1. Vertical Slice Architecture Principles

Unlike horizontal layer models (which group generic tables together), this database is structured around **independent business capability slices**. Each slice owns its domain tables, enums, triggers, and indices:

1. **Slice 1: Users & Accessibility Profiles (`users`, `accessibility_profiles`, `user_saved_places`)**
   - Mobility criteria (`mobility_type`: manual wheelchair, power chair, walker, cane, visual guide).
   - Incline limits (max 4.0% default), step-free requirement, tactile paving, surface preferences.

2. **Slice 2: Geography & Cities (`cities`, `transit_hubs`)**
   - Supported cities (Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, Ahmedabad).
   - Transit hubs (accessible metro stations, elevator operational counts, tactile paving).

3. **Slice 3: Destination Buildings & Venues (`buildings`)**
   - Destination complexes (Malls, Convention Centers, Hospitals, Civic Centers).
   - Street coordinate routing targets vs building footprint geometries.

4. **Slice 4: The Signature "Last 50 Feet" Entrances (`building_entrances`, `entrance_dimension_pins`)**
   - Direct routing to the accessible door instead of street center.
   - Exact doorway mechanics: clear width (e.g., `42.0" / 106.7 cm`), door type (`automatic_sliding`, `push_button`), sensor cone range (`2.4m`), actuator height (`34.0"`).
   - Zero-threshold curb metrics: 0 steps, `0.0"` flush lip, ramp grade (`2.1%`), turning radius (`60.0"`).
   - Photographic preview media and dimensional overlays.

5. **Slice 5: Hazards & Physical Barriers (`hazards`)**
   - Real-time community barrier registry: steps, curb lips, gravel debris, construction trenches, elevator outages.
   - Severity tags (`low_caution`, `medium_friction`, `high_barrier`, `critical_blocker`).
   - Time-decay half-life: 24.0 hours (temporary obstacles decay quickly).

6. **Slice 6: 1-Tap In-Navigation Verifications (`verifications`)**
   - 1-second in-motion crowd checks (`[YES, CLEAR]` / `[NO, BLOCKED]`).
   - Automated DB trigger (`fn_on_verification_submitted`) dynamically adjusts confidence scores in real-time.
   - Automatic hazard deactivation when confidence falls below threshold.

7. **Slice 7: Routes & Micro-Segments (`routes`, `route_micro_segments`)**
   - Safe path calculations with physical stress score (0.0 to 1.0).
   - Micro-segment slope breakdown, surface composition (asphalt, concrete, tactile pavers, zero cobblestones), and elevation sparklines.

8. **Slice 8: Live Navigation Sessions & Telemetry (`navigation_sessions`, `navigation_breadcrumbs`)**
   - Live GPS session state, remaining distance/time, speed (e.g., 3.4 mph), battery percentage, slope telemetry.

---

## 2. Zero-Friction Future Scalability

- **Forward-Compatible JSONB Extension Points:** Every slice contains a `metadata JSONB DEFAULT '{}'::jsonb` column, allowing new attributes to be ingested immediately without schema locks or downtime.
- **Loose Slice Coupling:** Slices reference each other through UUID foreign keys with appropriate cascades, preventing monolithic lockups.
- **PostGIS Spatial Geometry:** All points and routes use PostGIS `GEOMETRY(Point, 4326)` and `GEOMETRY(LineString, 4326)` indexed with spatial GiST indexes for sub-millisecond bounding box and distance queries.
- **Database-Level Time-Decay Math:** `fn_calculate_decayed_confidence()` calculates exponential decay based on elapsed hours directly within PostgreSQL.

---

## 3. Applying the Schema

```bash
# Using PostgreSQL CLI
psql -U postgres -d pathclear -f DB/db.sql
```
