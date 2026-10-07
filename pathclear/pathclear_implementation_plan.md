# PathClear Implementation Plan (Updated)

This implementation plan is tailored for the current project state, acknowledging that the **Next.js frontend (with MapLibre, Tailwind, and Supabase integration)** is already scaffolded in the `frontend/` directory.

The focus now shifts to building the backend, the routing graph, connecting the existing frontend to live data, and implementing the advanced AI features outlined in the Master Blueprint.

## Phase 1: Backend Foundation & API Contracts
**Goal:** Establish the FastAPI backend, set up the operational database (Supabase), and provide API endpoints for the existing frontend.

1. **Backend Initialization:**
   - Set up the FastAPI backend environment.
   - Implement the strict folder structure defined in the blueprint (`app/api/`, `app/db/repositories/`, `app/services/`).
2. **Database Setup (Supabase):**
   - Create tables: `users`, `accessibility_profiles`, `hazards`, `entrances`, `stations`, and `navigation_sessions`.
   - Implement repository functions (e.g., `hazard_repository.py`) following the rule: *No inline SQL in services; one DB operation per function.*
3. **Mock API Integration for Frontend:**
   - Implement the core API contracts (e.g., `POST /api/v1/navigation/route`, `GET /api/v1/hazards/nearby`) returning mock data matching the blueprint's schema.
   - Connect the existing frontend components (`Map.tsx`, `RouteLayer.tsx`, `HazardMarker.tsx`) to these mock endpoints to unblock UI development.

## Phase 2: Ingestion & Deterministic Routing (Neo4j)
**Goal:** Build the accessibility-aware routing graph.

1. **Graph Setup & Ingestion:**
   - Set up Neo4j with the Graph Data Science (GDS) plugin.
   - Build a Python script using OSMnx to download and normalize pedestrian data for a limited area (e.g., BKC).
   - Import this graph into Neo4j, seeding properties like `distance`, `slope`, `surface`, `stairs`, and `tactile_coverage`.
2. **Accessibility Routing Engine:**
   - Implement A*/Dijkstra algorithms in Neo4j GDS.
   - Apply routing penalties (soft constraints) and hard blocks based on user accessibility profiles.
3. **Route Audit Service:**
   - Build the backend logic to compute the "Nutrition Label" and Route Friction Index (RFI) for candidate routes.

## Phase 3: Frontend Integration & Feature Refinement
**Goal:** Connect the UI to the live routing engine and finalize the core navigation UX.

1. **Live Routing Integration:**
   - Swap the mock backend APIs with the live Neo4j routing services.
   - Ensure `RouteLayer.tsx` accurately renders the geometry from the live route.
2. **Accessibility Audit UI:**
   - Build/refine the frontend components to display the route comparison (shortest vs. PathClear route) and the Accessibility Nutrition Label.
3. **Profile & Onboarding:**
   - Finalize the frontend profile setup to capture independent mobility, vision, and hearing constraints and sync them with Supabase.

## Phase 4: Dynamic Reality & Transit
**Goal:** Handle real-time hazards and multi-modal transit (GTFS-Pathways).

1. **Hazard Management & Rerouting:**
   - Connect the frontend `report-barrier` flow to the backend.
   - Implement the backend logic to apply graph penalties/blocks when a hazard is reported.
   - Build the frontend/backend loop to trigger dynamic reroutes when the active path becomes blocked.
2. **Transit Station Graph:**
   - Seed Neo4j with a physical station transfer graph (entrance -> gate -> elevator -> platform).
   - Implement routing logic that handles elevator outages (triggering an accessibility reroute instead of just a warning).
3. **Multimodal Journey Planner:**
   - Normalize transport options (walking, transit, mocked cabs) and allow users to rank by time, cost, or accessibility.

## Phase 5: Agentic AI Layer (LangGraph)
**Goal:** Implement the LangGraph agent to handle natural language requests without compromising deterministic routing.

1. **LangGraph Setup:**
   - Initialize LangGraph in the backend (`app/agents/navigation/`).
   - Define intent classification and tool orchestration logic.
2. **Tool Wrapping:**
   - Expose the deterministic services (`calculate_route()`, `find_nearby_hazards()`, `find_accessible_entrance()`) as LangGraph tools.
3. **Frontend Integration:**
   - Build a chat/voice interface in the frontend that calls the backend agent API. The agent must return structured actions to update the map, not just text.

## Phase 6: Advanced Accessibility (Vision & Last 50 Feet)
**Goal:** Implement the hackathon-winning "Wow" features.

1. **Last 50 Feet Guidance:**
   - Seed detailed entrance data (door type, ramp location, photos) in Supabase.
   - Build the final approach UI that transitions from street navigation to exact entrance guidance.
2. **Virtual Cane (Vision Pipeline):**
   - Create a backend vision API to process camera frames (using a mock or lightweight model) and return structured obstacle evidence.
3. **Local Safety Controller (Frontend/Device):**
   - Implement device-side logic to translate the structured vision data into micro-maneuvers (e.g., haptic patterns for "move right") or macro-reroutes if fully blocked.
