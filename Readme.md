# The Core Opportunity

## What is the real core problem?

The core problem is not "calculating a route." It is uncertainty and the physical cost of failure.

For an able-bodied person, a wrong route means losing 5 minutes. For a wheelchair user, a person with a walker, or a visually impaired individual, a wrong route means getting stranded, suffering physical pain, missing an appointment, or risking an injury.

- **The pain point that matters most:** Anxiety before and during the journey.
- **What the user is actually struggling with:** Map apps lie by omission. They say a path is 10 minutes, but leave out the 3 steps at the end that make the entire journey impossible.
- **The trust deficit:** Users do not trust crowdsourced data because an unverified report from 6 months ago might mean a broken elevator today.

## What will most people build?

Most teams will attempt to build an "all-in-one" accessibility platform packed with generic features:

- An AI Chatbot asking "Where do you want to go?"
- Complex reporting forms with 15 fields (ramp angle, surface texture, door width).
- Gamified community leaderboards ("Earn 50 points for reporting a obstacle!").
- A crowded map interface with dozens of overlapping colored pins.
- A dashboard showing community statistics and analytics.

**Why these fail:** They overload an interface used by people who need maximum clarity. They rely on crowdsourcing without solving the "data decay" problem, and they add friction to a journey that already carries high cognitive load.

## Where is the opportunity to differentiate?

- **The "Last 50 Feet" Trap:** Most accessibility failures occur right at the destination entrance (e.g., heavy doors, single step, hidden alley ramp). Maps route to the street coordinate, not the accessible door.
- **Micro-Stressors vs. Complete Blockers:** An elderly person can walk 100 meters, but cannot handle a 15-degree incline. A blind user can walk steps, but needs audio-guided tactile paving indicators. Accessibility is a spectrum, not a single toggle.
- **Data Decay and Decay Trust:** A barrier report decays over time. An obstacle reported 3 months ago might be fixed; a broken elevator reported 2 hours ago is critical. Differentiating means treating time as a core safety factor.
- **Assisted Verification over Manual Forms:** Asking users to fill out forms while navigating is unreasonable. Verification must happen in 1 tap during active navigation.

# The Solution: "PathClear"

## Solution Concept

A hyper-focused, low-friction accessibility navigation web/mobile app centered around Micro-Segment Routing and Real-Time Entrance Verification. It gives users guaranteed, step-by-step route previews with focus on the final 50 feet.

## Target User

**Primary:** Wheelchair users, motorized scooter riders, and individuals with severe mobility impairments who face total travel failure if an unexpected step or broken ramp occurs.

## Core User Journey

1. **Open & Select Profile:** User opens the app; their preset profile (e.g., "Step-Free + Max 5% Incline") is active by default.
2. **Search Destination:** User types or speaks a destination.
3. **Visual Friction Preview:** Before starting, the app shows a simple horizontal "Stress Bar" highlighting slope changes, surface quality, and entry points.
4. **Turn-by-Turn Navigation:** Voice and high-contrast visuals guide the user.
5. **1-Tap Passive Verification:** As the user passes a known hazard or arrives at an entrance, a single large prompt asks: "Is the ramp clear? Yes / No".

## Main Value

It eliminates journey anxiety by focusing on total route predictability and entry-level precision.

## Differentiator

Instead of routing to an address, PathClear routes directly to the Accessible Doorway, providing a verified photo preview of the exact entrance before the user departs.

## Why It Works

It solves the precise failure point of conventional map apps: arriving at a destination only to be trapped outside by an unmapped step or closed accessible gate.

# Feature Selection

## Must-Have

- **Profile-Based Routing Engine:** Allows filtering routes by Step-Free, Low-Incline, or Well-Lit criteria.
- **Accessible Entrance Pinpointing:** Pins the exact step-free door, not just the building center.
- **Data Freshness Indicators:** Explicit visual tags on route segments showing data age (e.g., "Verified 15 mins ago" vs "Unverified > 30 days").
- **High-Contrast / Screen-Reader Native UI:** High-contrast color spaces, screen-reader optimized layout, and minimum 48px touch targets.

## Differentiating

### Differentiating Feature 1: The "Last 50 Feet" Entrance Card

- **What it does:** Displays a high-contrast photo, exact step-free entrance location, and door interaction type (automatic, manual heavy, push-button) upon selecting a destination.
- **Problem it solves:** Eliminates the common failure mode where a user completes a 20-minute route successfully only to be stuck at the entrance.
- **Why users care:** It turns a guess into a guarantee.
- **Why competitors overlook it:** Standard mapping APIs end routing at street coordinates, ignoring building access logic.

### Differentiating Feature 2: Time-Decaying Confidence Scores

- **What it does:** Dynamically degrades path confidence as time passes without a report. A barrier reported 1 hour ago lowers path rating drastically; if unconfirmed after 7 days, its status shifts to "Unverified."
- **Problem it solves:** Solves data decay and trust issues in crowdsourced platforms.
- **Why users care:** Prevents detouring around obstacles that were removed weeks ago.
- **Why competitors overlook it:** Most systems treat user reports as static database entries.

## Nice to Have (Post-MVP)

- **Offline Mode:** Pre-downloading accessible routes for low-connectivity zones.
- **Weather-Adjusted Routing:** Automatically avoiding outdoor steep slopes or unpaved paths during rain/snow.

# Signature Feature Selection

## Three Candidates

### Candidate A: "Hazard Flash" Voice & Haptic Obstacle Alerting

When navigating, the phone vibrates with distinct rhythms and speaks warnings 30 meters before a barrier (e.g., "Warning: Steep incline ahead in 100 feet").

### Candidate B: The "Last 50 Feet" Entrance Preview

When setting a destination, the app slides up a card showing the exact step-free entrance, an image of the doorway, whether the door has an auto-button, and the verified entry path from the street.

### Candidate C: "1-Tap Micro-Verification" Prompts

During navigation, when a user passes a reported barrier or accessible feature, a giant 2-button overlay pops up for 10 seconds: "Ramp Open? [YES] [NO]".

## Selection Rationale

While Candidate C keeps data fresh and Candidate A helps during motion, Candidate B directly addresses the single most anxiety-inducing moment in accessible travel: arrival. Knowing with certainty that you can actually enter a building before you leave home transforms user trust instantly. It requires no complex hardware, is visually clear, and makes users immediately say: "This app actually understands what I struggle with."

# UX Principles & Interaction Flow

```text
[Open App]
   │
   ▼
[Select Profile] ──► (Default saved: "Wheelchair / Step-Free")
   │
   ▼
[Search Location]
   │
   ▼
[Route Screen] ──► Shows 1 Best Safe Route + "Last 50 Feet" Entrance Preview
   │
   ▼
[Start Navigation]
   │
   ▼
[Active Guidance] ──► Voice/Audio Cues + Large Arrow Navigation
   │
   ▼
[Passing Hazard Point] ──► Instant 1-Tap Prompt: "Obstacle still here? [YES] [NO]"
   │
   ▼
[Arrival] ──► Guidance to exact step-free door
```

- **Zero-Confusion Main Action:** Opening the app exposes a clean search bar and one prominent profile indicator at the top right.
- **Progressive Disclosure:** Route technicalities (slope angles, surface types) are hidden behind a single "Route Details" tap; the main screen shows only travel time, hazard count, and data freshness.
- **Targeting Friction:** All interactive elements on navigation screens are a minimum of 52x52 pixels for users with reduced motor control.

# Competitive Differentiation

| Aspect | Typical Solution | PathClear (Our Solution) |
|---|---|---|
| **Core Approach** | Calculate shortest route + show barrier icons | Calculate safest route + guarantee entrance access |
| **User Experience** | Complex map crowded with 50+ unverified pins | Clean map showing 1 optimized path with freshness tags |
| **Key Weakness** | Routes to street address; outdated community reports | Relies on community density for passive verification |
| **Differentiator** | Generalized accessibility tags | Dynamic time-decaying confidence scores |
| **Signature Feature** | Generic barrier reporting form | The "Last 50 Feet" Entrance Preview |
| **Complexity** | High (menus, layers, forms, forums) | Low (3 screens max from search to navigation) |
| **User Value** | Moderate (informational, but high failure rate) | High (predictable, stress-free travel) |

# Final Recommendation

## 1. The Solution in One Sentence

PathClear is a ultra-lean, accessible navigation app that guarantees stress-free travel by routing users around physical obstacles and guiding them directly to verified step-free building entrances.

## 2. The 5 Features to Build

1. **Profile-Customized Path Engine:** Filters out steps, steep inclines, or unpaved roads based on active preference.
2. **The "Last 50 Feet" Entrance Preview (Signature Feature):** Shows exact entrance photos, door automation details, and step-free access paths at the destination.
3. **Time-Decaying Data Confidence Tags:** Visual indicators showing how recent and trustworthy route data is.
4. **1-Tap In-Navigation Micro-Verification:** Prompts users passing known hazards with a single tap [YES] / [NO] check to keep map data live.
5. **High-Contrast Screen-Reader Native UI:** High accessibility standard layout with screen-reader focus, voice guidance, and oversized touch targets.

## 3. The ONE Signature Feature

**The "Last 50 Feet" Entrance Preview:** Eliminates final-destination failure by displaying a verified photo, door type, and step-free access route directly to the accessible door before navigation begins.

## 4. Why This Solution Beats the Generic Approach

Generic approaches try to map the entire world with overwhelming forms and crowdsourcing clutter, leaving users unsure if data is accurate. PathClear solves the exact moments where travel fails—unverified data and inaccessible entrances—using a minimal, ultra-reliable interface.
