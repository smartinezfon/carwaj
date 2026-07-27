# Carwaj Design System Builder — Figma plugin

Builds the Carwaj screens directly inside Figma. It runs the same Figma Plugin API
code the MCP server would have run, but executes locally — so it **does not consume
the MCP tool-call quota** that the Starter plan caps at ~6/month.

## Install (one time)

1. Open the **Figma desktop app** (this does not work in the browser).
2. Open the **Carwaj Design System** file.
3. Menu → **Plugins → Development → Import plugin from manifest…**
4. Select `figma-plugin/manifest.json` from this repo.

It now appears under **Plugins → Development → Carwaj Design System Builder**.

## Run

Open the Carwaj Design System file, launch the plugin, and click the steps in order.
Each step is safe to re-run — it deletes and rebuilds only the frames it owns, so a
partial or failed run can just be repeated.

| Step | Builds |
|------|--------|
| 1 | Input Field icon slot (INSTANCE_SWAP) — **run first**, screens depend on it |
| 2 | Auth — Login, Set password, Suspended |
| 3 | Super admin — Dashboard, Companies, Users, My profile |
| 4 | Admin — Overview, Employees, Villas, Payments, Communities |
| 5 | Cleaner — Today, Calendar, Clients, Payments, Profile |
| 6 | Password reset — Forgot password, Check your email, New password |
| 7 | Missing app screens — Client setup (+ submitted), Booking detail, Add client, Add employee, Schedule, Add schedule, Add community |
| 8 | Landing page — public marketing page at 1440px (not a device frame) |

"Run everything" does all eight in sequence.

App screens land on the **Screens** page at 375×812, laid out in rows by section.
The landing page sits below them at 1440px wide, since it is a desktop page rather than a device.

## What it depends on

The plugin reads what already exists in the file rather than hardcoding values:

- **Color** variables (semantic tokens like `bg/canvas`, `status/completed/text`)
- **Primitives**, **Radius** variable collections
- Text styles (`Heading/H1`, `Body/Small`, `Pill`, …)
- Effect styles (`shadow/brand-md`, `shadow/brand-lg`)
- `Icon/*` components on the **Components** page
- The **Input Field** component set

If any are missing it stops with a clear message instead of building something wrong.
Every fill, stroke and corner radius is bound to a variable, so changing a token in
Figma updates the screens.

## Why this exists

The Starter plan caps MCP tool calls at roughly 6/month, and finishing these screens
needs ~18–20. Plugin development is available on Starter with no such limit, so this
route sidesteps the quota entirely. It is not a workaround for the *3-page* file
limit — that is a separate plan restriction, which is why everything shares the
Foundations / Components / Screens pages.
