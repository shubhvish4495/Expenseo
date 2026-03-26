# Design System: Editorial Motion & Tonal Depth

## 1. Overview & Creative North Star: "The Midnight Concierge"
The design system moves away from the "utility-first" aesthetic of typical travel apps, embracing instead the feel of a high-end digital editorial. Our Creative North Star is **The Midnight Concierge**: an experience that feels premium, quiet, and effortlessly intelligent. 

By utilizing **intentional asymmetry** and **tonal layering**, we break the rigid "box-on-box" grid. We rely on the juxtaposition of expansive negative space against high-contrast typography to guide the user’s eye. This isn't just a dark mode; it is a curated environment where depth is felt through color shifts rather than seen through lines.

---

## 2. Colors: The Tonal Spectrum
In this system, we abandon the "flat" UI approach. Color is used to define physical space and hierarchy.

### The Palette
- **Core Neutral:** `surface` (#0e0e0e) — A deep, ink-like charcoal that acts as our canvas.
- **The Accents:** 
    - `primary` (#8dedec - Teal): Used for high-action clarity.
    - `secondary` (#ffbf00 - Amber): Used for highlights, warnings, or premium status indicators.
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background shifts. To separate a hero section from a content feed, transition from `surface` to `surface-container-low`.
- **The Glass & Gradient Rule:** For primary CTAs, do not use a flat fill. Apply a subtle linear gradient from `primary` (#8dedec) to `primary-container` (#4dafaf) at a 135-degree angle. This adds "soul" and a tactile, backlit quality to the interface.
- **Signature Textures:** Use `surface-tint` (#8dedec) at 5% opacity as an overlay on `surface-container-highest` to create a "metallic" sheen for luxury travel cards.

---

## 3. Typography: Editorial Authority
We pair the geometric precision of **Plus Jakarta Sans** for headers with the approachable readability of **Manrope** for utility.

- **Display (Plus Jakarta Sans):** `display-lg` (3.5rem) and `display-md` (2.75rem). Use these for destination names or "Welcome" states. These should always be `on-surface` (#ffffff) with tight letter-spacing (-0.02em).
- **Headline (Plus Jakarta Sans):** `headline-lg` (2rem). Used for section titles. Pair with `secondary` (#ffbf00) for a single "power word" within a sentence to draw focus.
- **Body (Manrope):** `body-lg` (1rem) for primary descriptions. Use `on-surface-variant` (#adaaaa) for secondary body text to create a natural hierarchy without changing font size.
- **Labels (Manrope):** `label-md` (0.75rem). Always uppercase with 0.05em tracking for a "passport-stamp" utility feel.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders create "visual noise." We achieve depth through the **Layering Principle**.

- **Surface Hierarchy:** 
    - Base Level: `surface` (#0e0e0e)
    - Nested Elements: `surface-container-low` (#131313)
    - Interactive Cards: `surface-container` (#1a1a1a)
    - Floating Modals: `surface-container-highest` (#262626)
- **The "Ghost Border" Fallback:** If a layout requires a container to sit on an identical background, use the `outline-variant` (#484847) at **15% opacity**. It should be felt, not seen.
- **Glassmorphism:** For floating navigation bars or "Quick Action" buttons, use `surface-bright` (#2c2c2c) at 60% opacity with a `24px` backdrop-blur. This keeps the travel imagery visible beneath the UI, maintaining the "Modern Travel" vibe.
- **Ambient Shadows:** When an element must "float" (e.g., a flight selector), use a shadow with a 40px blur, 0px offset, and 8% opacity of `on-surface`.

---

## 5. Components: Effortless Primitives

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), `rounded-full`, `p-4` (horizontal `p-8`). Text: `on-primary-container`.
- **Secondary:** `surface-container-high` fill, `rounded-full`. Use for "Cancel" or "Back."
- **Ghost:** No fill. `primary` text. `rounded-full`.

### Cards (The "Travel Slate")
- **Rule:** Never use dividers.
- **Style:** `surface-container-low` background, `rounded-2xl`, `p-6` (Spacing 6 / 2rem). 
- **Interaction:** On hover, shift background to `surface-container-high`. Do not add a border.

### Chips
- **Filter Chips:** `surface-container-highest` fill, `rounded-full`, `p-2` (horizontal `p-4`). 
- **Selection State:** Fill with `secondary-container` (#795900), text `on-secondary-container`.

### Input Fields
- **Default:** `surface-container-highest` fill, `rounded-2xl`, `p-4`. No border.
- **Active:** Add a `Ghost Border` (1px `primary` at 30% opacity).
- **Error:** Fill `error_container` (#9f0519) at 20% opacity. Text `error`.

### Signature Component: The "Itinerary Scroller"
A horizontal list of `surface-container` cards. Use Spacing 4 (1.4rem) between cards. The active card uses a subtle `tertiary` (#83fff6) glow (inner shadow) to indicate "Current Stop."

---

## 6. Do’s and Don’ts

### Do
- **Do** use `p-6` (2rem) as your default inner padding for all containers.
- **Do** use `rounded-full` for all interactive triggers (buttons, chips) and `rounded-2xl` for content containers (cards, modals).
- **Do** lean into asymmetry. For example, left-align a `display-lg` headline and right-align the body copy below it to create editorial tension.

### Don't
- **Don’t** use pure black (#000000) for anything other than `surface-container-lowest` shadows.
- **Don’t** use `1px` lines to separate list items. Use Spacing 3 (1rem) of vertical gap instead.
- **Don’t** use high-saturation Amber (#ffbf00) for large background areas; keep it reserved for high-intent accents (CTA icons, badges).