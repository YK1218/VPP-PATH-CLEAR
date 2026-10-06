# PathClear UI Design System & Progress Handover (`UI_DESIGN_SYSTEM.md`)

## 1. Product UI Objective

### Product Vision

PathClear is a real-time, hyper-local accessible navigation platform engineered for Mumbai’s multi-modal transit ecosystem (suburban rail, metro, footbridges, and street corridors). From the citizen’s perspective, PathClear converts complex physical urban barriers—such as broken curb cuts, monsoon waterlogging, steep ramp gradients, and broken station lifts—into seamless, continuous, zero-threshold journeys.

### Core UX Philosophy

* **Accessibility-First & Context-Aware:** Every UI component defaults to low-cognitive-load design, high-contrast readability, and immediate sensory responsiveness.
* **Ultra-Minimal Completion:** Inputs are visual and chip-based, allowing citizens to configure profiles and calibrate routes in under 10 seconds without filling long forms.
* **Action-Oriented & Map-Centric:** Information is presented directly within the spatial context of Mumbai’s transit map, avoiding disconnected metric cards or generic analytics.

### UI Look & Feel

* **Human-Crafted & Realistic:** Clean, breathable, high-end SaaS architecture with subtle 3D iconography, precise micro-interactions, and professional elevation.
* **Lightweight & Breathable:** Clean white canvas base (`#FFFFFF`) with balanced $24\text{px}\text{--}32\text{px}$ internal card padding and clear spatial geometry.

### What the UI Must Avoid

* ❌ **No Text-Heavy Dashboards:** Eliminate dense paragraphs, redundant footers, and generic SaaS filler.
* ❌ **No Overlapping or Clipped Elements:** No randomly floating cards that obscure critical route lines, map controls, or turn-by-turn maneuvers.
* ❌ **No AI-Template Aesthetics:** Avoid generic dark-mode gradients, decorative floating shapes, or irrelevant metrics.
* ❌ **No Form Fatigue:** Never use multi-step text forms or unnecessary drop-down menus.

---

## 2. Global Design System

### Color Palette

| Token Name | HEX Code | Primary Application & Usage Guidelines |
| --- | --- | --- |
| **Canvas Base** | `#FFFFFF` | Primary background color for all screens, maps, and outer containers. |
| **Deep Slate** | `#2B2D42` | Primary brand color, dark structural containers, top headers, active toggle states, primary action CTA buttons, and user location pucks. |
| **Accessibility Red** | `#E63946` | Secondary accent strictly reserved for critical hazards (e.g., broken lifts, 12-inch paver drops), emergency **Safe Haven** buttons, and active destructive actions. |
| **Soft Mint** | `#A8DADC` | Glowing safe-route corridors, active selection highlights, subtle hover backgrounds, and accessible pathway indicators. |
| **Warm Amber** | `#FCBF49` | Live warning alerts (e.g., footbridge scaffolding, temporary narrow pass clearance), and monsoon caution badges. |
| **Off-White Container** | `#F1FAEE` | Background fills for subtle card containers, pill chips, and secondary hover states. |

---

### UI Components & Styling Principles

* **Background Treatment:** Pure White (`#FFFFFF`) base canvas across all application views. Map base layers use a light-mode vector canvas with soft slate road geometry (`#2B2D42` at 6–8% opacity).
* **Typography:** System Sans-Serif (Inter / SF Pro Display) with tight hierarchy:
  * *Headings:* Bold `#2B2D42` ($20\text{px}\text{--}28\text{px}$).
  * *Labels & Telemetry:* Medium/Bold ($13\text{px}\text{--}15\text{px}$) with uppercase micro-copy for status tags.
* **Cards & Glassmorphism:** Squircle cards ($16\text{px}\text{--}24\text{px}$ corner radius) using `#FFFFFF` at 92% opacity with $12\text{px}$ backdrop-blur, $1\text{px}$ subtle border (`#2B2D42` at 8% opacity), and soft ambient drop shadows (`0px 8px 24px rgba(43, 45, 66, 0.06)`).
* **Borders, Shadows & Spacing:** Strict $24\text{px}$ outer screen margin with $16\text{px}\text{--}24\text{px}$ internal padding on all floating cards. No elements touch screen edges or overlap adjacent containers.
* **Iconography & 3D Visual Style:** Custom 3D glyphs for mobility profiles (🦽 Wheelchair, 🦯 Low Vision, 🧏 Deaf/Hard of Hearing, 🚶 Senior) combined with minimal 24px line icons for system actions.
* **Animations & Motion:**
  * *Route Pulse:* Active step-free path uses a forward-flowing vector pulse animation (`#A8DADC` glow).
  * *Location Tracking:* User GPS puck features a soft radar pulse ring indicating continuous synchronization.
  * *Transitions:* Smooth $200\text{ms}$ ease-out transforms on hover, selection, and card expansions.
* **Responsive Layout:** Flexbox/CSS Grid overlay pinned to a 4-corner HUD structure relative to the map viewport, ensuring responsiveness without clipping on various screen sizes.
* **Map & Route Visuals:** Distinct vector layers for continuous tactile paving (dotted yellow), zero-threshold lifts (green node dots), and audited obstacle callouts (floating micro-pills).

---

## 3. Page-by-Page UI Architecture

| Page | Purpose | Key UI Elements | UX Objective | Status |
| --- | --- | --- | --- | --- |
| **Citizen Context & Profile** | Capture citizen mobility constraints, age, transit role, and home base in under 10 seconds. | • Name/Age inputs<br>• Transit role chips (`Daily Commuter`, etc.)<br>• 4 3D Mobility Presets<br>• 1-tap constraint tags<br>• Mini-map location picker<br>• Floating CTA footer. | Zero form fatigue; instant visual selection of accessibility requirements. | **Approved & Completed** |
| **Active Journey Planner & Route Audit** | Display multi-modal route candidates with verified accessibility friction scores (RFI) prior to starting guidance. | • Origin/Destination bar<br>• Split view: Interactive corridor map (60%) vs. Candidate audit cards (40%)<br>• Step-free stats (`RFI: 0.12`, ramp gradients, lift statuses)<br>• Pre-trip 3D rehearsal CTA. | Transparent pre-trip verification; build confidence in route accessibility before departure. | **Approved Concept** |
| **Live Route / Navigation View** | Provide turn-by-turn guidance, clock-face sensory alerts, live hazard intercepts, and real-time station node updates. | • Full-bleed Mumbai vector map<br>• Top navigation header<br>• Floating top-left Next Maneuver HUD<br>• Top-right map controls & Safe Haven CTA<br>• Floating bottom telemetry dock. | Clear situational awareness: "Where I am, where I need to go, and how PathClear keeps me safe." | **In Refinement (Needs Layout Fixes)** |

---

### Detailed Screen Breakdown

#### 1. Citizen Context & Profile Screen

* **Why it exists:** Establishes the citizen's personal constraints (wheelchair specs, low vision audio needs, monsoon avoidance) to filter transit algorithms.
* **What user accomplishes:** Inputs basic identity, selects a mobility persona, toggles immediate constraints, and sets a default hub.
* **Essential Visual Components:** Full-width Identity Pill (Top), 2×2 Mobility Card Grid (Left), Vertical Constraint Toggle Panel (Right), Interactive Mini-Map Selector (Bottom).
* **What MUST NOT be shown:** Multi-page forms, long health questionnaires, or dense paragraphs of legal text.
* **Interaction Behavior:** Tapping a mobility preset (e.g., 🦽 Wheelchair) automatically highlights relevant constraints (e.g., `Step-Free Only`, `Elevator Required`) with active `#2B2D42` borders.

#### 2. Active Journey Planner & Route Audit Screen

* **Why it exists:** Provides pre-trip assurance by showing exactly why a route was selected and auditing physical barriers.
* **What user accomplishes:** Compares candidate corridors (Suburban Rail vs. Auto-Rickshaw Drop), reviews lift statuses, and launches active guidance.
* **Essential Visual Components:** Route summary chips, candidate corridor cards with Route Friction Index (RFI) metrics, and interactive vector preview map.
* **What MUST NOT be shown:** Unaudited general navigation routes, static text lists without spatial context, or cluttered system logs.

#### 3. Live Route / Navigation View (Dominant Canvas)

* **Why it exists:** Real-time navigation view during active transit.
* **What user accomplishes:** Follows live step-free guidance, receives audio/tactile callouts, and views obstacle alerts.
* **Essential Visual Components:** Full-bleed map canvas, floating Next Maneuver HUD (`"In 40m, turn right onto Tactile Ramp"`), top-right map controls, animated user puck, and bottom journey telemetry dock.
* **Current Known Issues & Required Refinements:**
  1. *Clipping & Overlap:* Top-left maneuver card overlaps top-bar controls; bottom dock text cuts off on smaller viewports.
  2. *Layout Composition:* Needs strict adherence to the 4-corner non-overlapping grid layout to ensure the map remains the clear visual centerpiece.
  3. *Background Consistency:* Ensure canvas strictly enforces `#FFFFFF` background without green/grey tinting.

---

## 4. Current Progress

```text
[Completed & Frozen]           [In Refinement]                 [Remaining / Next]
+------------------------+     +------------------------+     +------------------------+
|  Citizen Context &     | --> |   Live Route /         | --> |  Station Concourse /   |
|  Profile Screen        |     |   Navigation View      |     |  The Last 50 Feet HUD  |
+------------------------+     +------------------------+     +------------------------+
                               (Fixing HUD overlapping,       (In-station micro-nav,
                                clipping, & viewport margins)  platform-to-lift transfer)
```

1. **Pages Completed & Designed:**
   * **Citizen Context & Profile Screen:** Approved 1-page visual selector layout with white canvas, horizontal pill identity container, 2×2 mobility grid, constraint toggles, and mini-map picker.
2. **Pages Currently Being Refined:**
   * **Live Route / Navigation View:** Core features defined (animated map, maneuver HUD, telemetry dock), but undergoing structural composition refinements to fix card clipping and overlapping elements.
3. **Pages Remaining in User Journey:**
   * **Station Concourse / "The Last 50 Feet" View:** Detailed indoor/concourse guidance view for complex interchanges (e.g., Dadar Western to Central Line platform transfer via elevators).

---

## 5. Navigation / User Flow

```text
+------------------+       +---------------------+       +----------------------+       +-----------------------+
|  Landing Page    |  ---> |  Citizen Profile    |  ---> |  Route Audit /       |  ---> |  Live Route /         |
|  (Home Canvas)   |       |  & Preferences      |       |  Corridor Planner    |       |  Navigation View      |
+------------------+       +---------------------+       +----------------------+       +-----------------------+
```

* **Step 1 (Landing $\rightarrow$ Citizen Profile):** Citizen opens PathClear and taps *"Tailor Your Journey Experience"* or selects a default commuter shortcut.
* **Step 2 (Citizen Profile $\rightarrow$ Route Audit):** Upon tapping *"Save & Calibrate Route →"*, profile constraints (e.g., Wheelchair, Ramp $\le 3^\circ$) are applied to the routing engine.
* **Step 3 (Route Audit $\rightarrow$ Live Navigation):** Citizen reviews audited corridors, verifies operational lifts, and taps *"Start Guided Journey →"* to initialize live turn-by-turn guidance.
* **Step 4 (Live Navigation $\rightarrow$ Concourse Navigation):** As the citizen approaches within $50\text{m}$ of a transit hub (e.g., BKC Metro Entrance #3), the view transitions into high-precision indoor station concourse guidance.

---

## 6. Design Rules for Future Screens

When designing remaining pages or refining existing views, the team must adhere to this checklist:

* [ ] **1. Viewport Containment:** Ensure all cards sit within a strict $16\text{px}\text{--}24\text{px}$ viewport margin. No UI element may clip, overlap adjacent controls, or extend beyond screen boundaries.
* [ ] **2. Pure White Canvas Baseline:** Always build on a pure white background (`#FFFFFF`). Never introduce dark/tinted page backgrounds.
* [ ] **3. Strict Palette Adherence:** Use `#2B2D42` for structural containers/text, `#A8DADC` for route corridors/accents, `#FCBF49` for warnings, and `#E63946` sparingly for critical alerts.
* [ ] **4. Map-First Dominance:** On active guidance screens, the map must occupy $\ge 80\%$ of the screen real estate. HUD containers must float compactly along screen edges.
* [ ] **5. Compact Information Density:** Replace paragraphs with short labels, icons, progress nodes, and status pills.
* [ ] **6. Purposeful Motion:** Every visual movement must convey live status (e.g., user GPS pulse, glowing route vector, active hazard warning ring).
* [ ] **7. Zero Generic UI Elements:** Do not add placeholder analytics, decorative abstract shapes, or non-functional dashboard cards.
