# Handoff: WhatsGlazin — The Fine Line pottery studio

## Overview
WhatsGlazin is a mobile-first web app for members of **The Fine Line** pottery studio (Portland, OR) to photograph finished pieces and log the glazes used. It doubles as a searchable gallery and a living glaze library. Members typically use it **on a phone, one-handed, at the studio, right after pulling a piece from the kiln** — so the capture flow must be instant, while the browse/marketing surfaces are a showpiece.

Domain purchased: **whatsglazin.com**

Design language: **"Earthy & Tactile"** — warm ceramic neutrals as the canvas, real glaze-chemistry accents, editorial serif display + clean sans UI, paper-grain texture, soft real-world shadows. The interface stays quiet so pottery photos carry the color.

## About the design files
The files in this bundle are **design references created in HTML** — a single interactive prototype (`WhatsGlazin.dc.html`) showing the intended look, layout, copy, and behavior. **They are not production code to ship directly.** The `.dc.html` file uses an internal streaming-component runtime (`support.js`) purely so the prototype renders in a browser; **do not port that runtime**. Instead, **recreate these designs in a real codebase** using its established patterns.

**Recommended stack (no codebase exists yet):**
- **Next.js (App Router) + React + TypeScript** — mobile-first, installable as a PWA, SSR for the shareable gallery/glaze pages (good for SEO on whatsglazin.com).
- **Tailwind CSS** with the token values below mapped to `theme.extend` (or CSS custom properties). All spacing/color/radius values here are Tailwind-friendly.
- **GSAP** (+ ScrollTrigger, Flip) for the showpiece motion. Gate every animation behind `prefers-reduced-motion`.
- **Supabase or Firebase** for auth (Google + Apple SSO + passwordless email magic link), Postgres/Firestore for pieces & glazes, and image storage with on-upload thumbnail generation.
- A fuzzy-match library (e.g. **Fuse.js**) for the glaze type-ahead, or Postgres `pg_trgm` / `ILIKE` if server-side.

To run the reference: open `WhatsGlazin.dc.html` with `support.js` beside it in a browser (or any static server). It is a single-page design canvas — scroll through tokens → components → 3 landing directions → **the chosen 1c landing, built out** → live app prototype → upload-flow states → auth.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, copy, and interaction states are all specified. Recreate the UI pixel-close using the target stack's components. The only placeholders are the **pottery photos** and **glaze swatches**, which are rendered as tinted diagonal-stripe fills labeled `PHOTO`; the client (studio) will supply real photography. Swap these for real images; keep everything else.

---

## Design tokens

### Color — ceramic neutrals (the canvas)
| Token | Hex | Use |
|---|---|---|
| `bone` | `#FBF7EE` | Lightest surface, inputs, cards on darker sections |
| `paper` | `#F6F1E7` | Default card / panel surface |
| `clay` (unfired) | `#F1E7D6` | Page background inside app; warm section band |
| `clay-deep` | `#E7DDC9` | Alt band / auth gradient base |
| `canvas` | `#DCD1BF` | Outermost document background (behind frames) |
| `wet-stoneware` | `#C4B49A` | Muted fills |
| `line` | `#E0D6C2` / `#EAE0CD` | Card borders (warm, ~1px) |
| `line-strong` | `#D8CDB9` | Stronger dividers, input borders |
| `slip-grey` | `#8B7E6A` → text `#8A7A64` | Muted/secondary text |
| `ink-2` | `#5A4D3C` / `#4A3D2E` | Body text |
| `ink` (kiln-shadow) | `#2A2018` | Primary text, dark bg. 12:1 on bone (AA/AAA) |
| `kiln-dark` | `#241A12` / `#2E2016` | Dark hero/CTA backgrounds |

### Color — glaze-chemistry accents
The **primary action color** is iron/terracotta. Celadon is the secondary/link color. The 10 glaze swatch colors below are also the studio's glaze data (see Data model).

| Role | Hex | Notes |
|---|---|---|
| **Primary / CTA** | `#B0552F` (hover `#9A4726`) | Buttons, active states, focus. Text on it: `#FBF7EE` |
| **Secondary / link** | `#5E7E63` (celadon) | Links, "see more", positive accents |
| **Info / cobalt** | `#4E6E88` | Occasional accent (step 03 numeral) |
| **Success** | `#5E7E63` on `#EDF0E7`, border `#C4D2BC` | Toasts, checkmark |
| **Error** | `#B0552F` on `#F6E7E1`, border `#E0BBAC` | Error toast |

**Studio glazes** (name · family · base hex · shade2 · finish · on-color):
1. Studio Celadon · Celadon · `#8FA98A` / `#6E8A6C` · satin · `#22301F`
2. Tenmoku · Iron · `#2E2016` / `#5C3A22` · glossy · `#F0E4D2`
3. Shino · Feldspathic · `#C98A4E` / `#A9662F` · matte · `#3A2410`
4. Chun Blue · Ash·Blue · `#55708A` / `#3E566E` · glossy · `#EAF0F5`
5. Iron Red · Iron · `#A5482B` / `#7E3320` · satin · `#F5E7E0`
6. Nuka Oatmeal · Ash · `#D8C6A2` / `#B9A379` · satin · `#3A3018`
7. Copper Green · Copper · `#3F7A66` / `#2C5B4B` · glossy · `#E7F1EC`
8. Ash Falls · Ash · `#7E8574` / `#5E6455` · runny · `#EDF0E9`
9. Kaki Persimmon · Iron · `#B4622C` / `#8C4A1E` · satin · `#F7EBE0`
10. Bone Matte · Liner · `#E7DDCC` / `#CFC3AC` · dry matte · `#3A3018`

Swatch/photo fill recipe (until real images): `repeating-linear-gradient(135deg, rgba(255,255,255,.055) 0 9px, rgba(28,18,8,.05) 9px 18px), linear-gradient(158deg, {baseHex} 0%, {shade2Hex} 96%)`. For a combination piece, use glaze[0].base → glaze[1].shade2.

### Typography
- **Display:** `Young Serif` (Google Fonts, weight 400 only) — headlines, glaze names, hero, numerals. Characterful, warm, earthy. Letter-spacing `-0.01em` to `-0.02em` at large sizes.
- **UI / body:** `Hanken Grotesk` (Google Fonts, 400/500/600/700, plus italic 400/500) — all UI, labels, body.
- **Mono (labels/metadata):** `ui-monospace, Menlo, monospace` — hex values, firing tags (`CONE 10`, `REDUCTION`), photo counters.

Scale (px): Display 72–104 · H1 30–34 · H2 38–46 · H3 20 · body 15–16 (1.5–1.6 line-height) · small 13–14 · micro 11–12. Eyebrows: 600 11–12px, `letter-spacing:.14–.2em`, uppercase, color `#B0552F` or `#8A6A4A`.

### Spacing — 4pt base
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Section padding desktop ≈ `56–72px` vertical / `40–44px` horizontal; card padding `13–28px`.

### Radius (thrown, not corporate)
`sm 8 · md 12–14 · card 16–18 · lg 20 · pill 999`. Buttons `13–15`, chips `999`, phone screen `32–42`.

### Shadow (soft, warm)
- Card rest: `0 1px 2px rgba(42,34,22,.05), 0 6–14px 16–26px -12–18px rgba(42,34,22,.5)`
- Elevated / hero card: `0 30px 60px -34px rgba(42,34,22,.5)`
- Primary button glow: `0 10–14px 22–26px -10–12px rgba(176,85,47,.6)`

### Texture
Subtle paper/clay grain over everything: a fixed full-viewport overlay, `opacity:.05`, `mix-blend-mode:multiply`, SVG `feTurbulence` `baseFrequency 0.85, numOctaves 2` tiled at 140px. Pointer-events none, non-interactive.

---

## Screens / views

> Mobile screens are designed at **390px** wide (iPhone), fully responsive up to desktop. Bottom tab nav on mobile; header nav on desktop/marketing.

### 1. Landing (marketing) — chosen direction "1c: Living gallery wall"
- **Purpose:** The wow moment + what-is-this + CTA to sign in / add a piece. The studio's real work IS the hero.
- **Layout (desktop, ~1180px content):** sticky top nav → **hero** (full-bleed masonry wall of piece thumbnails behind a left-anchored intro column, warm scrim gradient `linear-gradient(105deg, rgba(241,231,214,.97) 30%, .72 48%, .12 68%, transparent)` for legibility) → **"How it works"** 3-step band on `bone` → **Recent pieces** 4-card row on `clay` → **Glaze library peek** 6-swatch row on `bone` → **Community CTA** on `kiln-dark` → footer on `#241A12`.
- **Hero copy:** eyebrow "The Fine Line · Portland, OR"; H1 (Young Serif 84px) "A wall of / what / we made."; sub "Snap a piece straight off the kiln shelf, log the glaze in three taps, and it joins a gallery the whole studio can search — by colour, recipe, and maker."; buttons **Add your piece** (primary), **Browse the gallery** (secondary); stat row 217 pieces · 34 members · 10 glazes.
- **How it works:** eyebrow "Three taps at the shelf", H2 "The kiln forgets. We don't." Three cards, Young-Serif numerals 01/02/03 in celadon/terracotta/cobalt: **Shoot it** / **Log the glaze** / **It's remembered**.
- **Recent pieces:** 4 pottery cards (see Pottery card component). "See all 217 →".
- **Glaze peek:** 6 swatch tiles (120px rounded), name + piece count. "Explore all 10 →".
- **CTA band:** H2 (Young Serif 56px) "Made something? / Add it to the wall." (second line terracotta `#C98A4E`), pill "Continue with Google · Apple · Email".
- **Footer:** brand, nav links, "whatsglazin.com · The Fine Line, est. 2014".
- Mobile: hero wall becomes a 2–3 col masonry with the intro card stacked above; sections stack single-column.

### 2. Auth — sign in / sign up
- **Purpose:** Secure but warm entry. SSO one-tap + passwordless email.
- **Layout:** centered column on a radial warm gradient (`radial-gradient(120% 70% at 50% 0%, #F1E7D6, #E7DDC9)`). Logo tile (66px, rounded 20, multi-glaze conic gradient with stripe overlay) → wordmark (Young Serif 32) → subcopy → **Continue with Google** (bone, `G` in Google conic-gradient) → **Continue with Apple** (ink `#2A2018`, white text,  glyph) → "or with email" divider → email input (mail glyph) → **Email me a magic link** (primary) → fine print + member terms link.
- **Passwordless "link sent" state:** mail tile (78px), H1 "Check your email", "We sent a one-tap sign-in link to **june@thefineline.studio**. It's good for 15 minutes.", **Open mail app** (secondary), "Didn't get it? Resend · Use a different email".
- All SSO/submit buttons ≥ 48px tall.

### 3. Upload a piece — the heart (minimize friction)
Required path is **photo → glaze(s) → done**. Four states:
- **Empty:** H1 "Add a piece", sub "Photo → glaze → done.", large dashed **dropzone** (camera icon 50px terracotta tile, "Tap to shoot or pick", "Add multiple angles"), then labeled type-ahead input "Search studio glazes…". Optional details collapsed.
- **Typing / suggesting:** photo thumbs row (uploaded + shimmer-loading tile with % + dashed "add angle"); type-ahead input focused (terracotta border + `0 0 0 3px rgba(201,138,78,.16)` ring, blinking caret); suggestion list below — each row: 24–26px rounded swatch + glaze name + family (right), tap to add; last row is a dashed **"New glaze: '{query}'"** affordance (only when no exact match).
- **Selected / combination:** chosen glazes shown as **removable chips** (glaze color bg, on-color text, ×). Supports multiple/layered glazes; helper text "order is kept". "Optional details" accordion (title, clay body, cone/firing, notes). Sticky bottom **Add this piece** bar (≥52px).
- **Saving → Success:** brief spinner ("Saving to the studio…") then success screen — celadon check circle (88px, scale-in), H1 "It's in the studio.", "Now searchable by {glazes}", buttons **See it in the gallery** / **Add another**.
- **Critical:** the submit is instant; the only celebration is the check-mark scale-in. Never block logging on animation.

### 4. Gallery / browse
- **Purpose:** Powerful but friendly search & filter over all pieces.
- **Layout:** header ("The Fine Line" eyebrow + "Gallery" + avatar) → search input ("Search glaze, maker, piece…") → horizontally-scrolling **filter chip row** (one chip per glaze; chip = color dot + name; active chip fills with the glaze color + on-color text) → result count + "Clear filters ×" when active → **2-column masonry** of pottery cards (varying heights). Cards show a `COMBO` badge when multi-glaze.
- **Behavior:** search matches title/maker/glaze names (case-insensitive contains/fuzzy). Filter chip toggles a single-glaze filter. Tap card → piece detail.

### 5. Piece detail
- **Layout:** full-width hero photo (340px) with back button (circular glass), photo counter `PHOTO 1 / 3 · {form}`, and an angle-thumbnail row (3 mini). Then title (Young Serif 30), meta "{form} • by {maker} • {when} ago", **"Glazes used · tap to explore"** — each glaze a tappable row (44px swatch + name + "family • finish" + chevron) linking to that glaze's page. **Firing & notes** panel (mono tags CONE 10 / REDUCTION / STONEWARE + note text). Bottom **"See more in {glaze} →"** button.

### 6. Glaze library + glaze detail
- **Library:** "Glaze library" H1, search "Search 10 studio glazes…", **2-col grid of glaze tiles** — each tile: 96px material swatch (finish label top-right in on-color), name, "family • N pieces". Tap → glaze detail.
- **Glaze detail:** 220px full-bleed swatch header with back button and overlaid "family • finish" + glaze name (Young Serif 38, on-color). Description paragraph. Mono chemistry chips (e.g. `Fe · reduction`, finish, `CONE 10`). "N pieces in this glaze" → 2-col masonry of member pieces (tap → piece detail). Should also surface common **combinations** for that glaze.

### 7. Member profile
- **Layout:** avatar (gradient initials) + name (Young Serif 28) + "Member since {year} • {disciplines}". Stat row (pieces / glazes / saves). **"Glazes they reach for"** horizontal swatch row (tap → glaze detail). **"Their pieces"** 2-col masonry.

---

## Components
- **Buttons:** Primary (`#B0552F` bg, `#FBF7EE` text, radius 13–15, ≥48px, glow shadow). Secondary (`#EDE4D2` bg, `#D8CDB9` border, ink text). Ghost/link (celadon `#5E7E63`, no bg). **SSO Google** (bone bg, border, multicolor `G`). **SSO Apple** (ink bg, white text,  glyph). Active/hover: darken primary to `#9A4726`; secondary bg → `#E7DDC9`.
- **Inputs:** bone bg, 1.5px `#D8CDB9`/`#E0D6C2` border, radius 12–13, ≥48px, 15px Hanken. Focus: terracotta border + soft ring. Always a real `<label>` (incl. type-ahead — label "Glaze(s) used").
- **Type-ahead search:** controlled input → fuzzy-filtered suggestion list (swatch + name + family) → tap adds a chip; "New glaze" dashed row when no exact match. Keyboard: ↑/↓ to move, Enter to select, Esc to close. ARIA combobox/listbox roles.
- **Glaze chip / tag:** pill, glaze-color bg + on-color text, optional × remove button (semi-transparent white circle). Small variant (on cards): `#F1EADB` bg, color dot + name, 10–11px.
- **Pottery card:** bone surface, 1px `#EAE0CD` border, radius 14–16, soft shadow. Photo fill on top (aspect varies for masonry), optional `COMBO` badge top-right. Body: title (600 14–16), maker (500 12 muted), glaze chip row. Whole card is the tap target → piece detail. Hover (desktop): lift + shadow grow.
- **Glaze tile:** material swatch (rounded) + finish label + name + family/count. Hover: material shimmer sweep.
- **Filter bar:** horizontally scrollable chip row; active chip fills with glaze color; "Clear filters ×" appears when any filter/search active.
- **Modals / sheets:** on mobile use bottom sheets (rounded top, warm bg, drag handle).
- **Toasts:** success (celadon on `#EDF0E7`, check circle) / error (terracotta on `#F6E7E1`, `!` circle). Slide/fade in, auto-dismiss ~3s.
- **Skeletons:** warm shimmer `linear-gradient(90deg,#EAE0CD 8%,#F3ECDD 20%,#EAE0CD 32%)`, `background-size:200% 100%`, `wg-shimmer 1.4s linear infinite`. Never show a blank grid while photos decode.
- **Dropzone:** 2px dashed `#C9B48F`, bone bg, camera tile, supports multiple angles (JPG/HEIC/PNG), per-file upload progress %.
- **Nav:** **Mobile bottom tab bar** — Browse / Glazes / **Add** (raised terracotta FAB, 46px, +) / Search / You. Active tab = ink `#2A2018`, inactive = `#A99A82`. **Desktop header** — wordmark + Gallery / Glazes / Members + Sign in button.

---

## Interactions & behavior

### Navigation / state
App-level state: `screen` (browse | pieceDetail | glazeLib | glazeDetail | upload | profile | auth), `activePieceId`, `activeGlazeId`, `profileMaker`, `filterGlaze` (single glaze id | null), `searchQuery`, and upload sub-state: `upStep` (empty | active/saving | saving | success), `upGlazes` (ordered array of glaze ids, incl. `new-*`), `taQuery`, `showAdvanced`.
- Browse: search filters by title/maker/glaze (contains/fuzzy). Filter chip toggles single-glaze filter. Card tap → pieceDetail. Glaze row/tile tap → glazeDetail. Avatar/You → profile. Add FAB → upload.
- Upload: type-ahead adds/removes glaze chips; submit → `saving` (~1.4s simulated; real = actual upload) → `success`; "Add another" resets, "See it in the gallery" → browse.

### Motion (GSAP "showpiece" — annotated in the prototype with dashed pills)
- **Landing hero:** masonry wall staggers in (~0.04s per item), slow parallax drift on scroll; scrim fades as you scroll past. Headline may split & rise word-by-word on load. Consider a hero piece that "turns on the wheel" (scrub-rotate) if using direction 1a's motif.
- **Gallery:** cards stagger up on scroll (ScrollTrigger, batch). Filtering reflows the grid with **FLIP** (GSAP Flip) so pieces glide to new positions rather than snapping. Tap → shared-element transition into the detail hero photo.
- **Glaze library:** each swatch catches a **material shimmer sweep** on hover; smooth page transition into glaze detail.
- **Page-to-page:** cohesive smooth-scroll + shared-element transitions.
- **Micro:** chips pop in on select (~120ms), tactile feedback on taps/toggles.
- **Auth:** envelope/mail glyph draws in on the "link sent" mount.
- Suggested easings: `power3.out` for reveals, `power2.inOut` for FLIP; durations 0.4–0.8s on marketing, ≤0.15s in the capture flow.

### CRITICAL — capture flow stays fast
No blocking animation in upload. Submit is instant; success check-mark scale-in is the only flourish. Motion here is confined to gentle confirmation and progress feedback.

### Reduced motion
With `prefers-reduced-motion: reduce`: all reveals become instant cross-fades, spinner → static "Saving…" label, parallax/shimmer/turn disabled, FLIP → instant reposition. App remains fully usable and calm. (The prototype already ships a CSS `@media (prefers-reduced-motion: reduce)` block zeroing animations/transitions — mirror that plus JS guards on GSAP timelines.)

### Accessibility
WCAG AA throughout: ink `#2A2018` on bone = 12:1. Tap targets ≥ 44px (SSO/submit ≥ 48px). Real labels on all fields incl. the type-ahead (combobox pattern with `aria-expanded`, `aria-activedescendant`). Full keyboard nav; visible focus rings (terracotta) on the warm palette.

---

## Data model (suggested)

**Glaze**: `id, name, family (Celadon|Iron|Feldspathic|Ash|Ash·Blue|Copper|Liner|…), baseHex, shade2Hex, onColor, finish (satin|glossy|matte|runny|dry matte), chemistry (short mono string), description, isStudioGlaze (bool), createdBy, createdAt`.
**Piece**: `id, title?, makerId, form (Tumbler|Vase|Bowl|…), glazeIds (ordered[]), photos (ordered[]), clayBody?, firing? (cone/atmosphere), notes?, createdAt`.
**Member**: `id, name, avatar, memberSince, disciplines[], stats`.
A piece↔glaze is many-to-many and **ordered** (layer order matters). "Combinations" = the set/sequence of glazeIds on a piece; the glaze detail page should aggregate common co-occurring glazes.

Seed data used in the prototype (10 glazes above; 12 pieces incl. combos like *Ash Vessel No.4* = Ash Falls + Tenmoku, *Dipped Beaker* = Celadon + Shino) is illustrative — real content comes from the studio.

---

## Assets
- **Fonts:** Google Fonts — `Young+Serif` (400) and `Hanken+Grotesk` (ital,wght 0,400;0,500;0,600;0,700;1,400;1,500). Self-host for performance/PWA offline.
- **Pottery photos & glaze swatches:** **placeholders only** (tinted diagonal-stripe fills labeled `PHOTO`). The studio will supply real photography; generate multiple sizes + blur-up placeholders on upload.
- **Grain texture:** inline SVG `feTurbulence` (see Texture). No external image.
- **Icons:** currently Unicode glyphs (camera, mail, chevrons, tab icons). Replace with a real icon set (e.g. Lucide/Phosphor) matching the crafted, rounded feel. The Apple/Google marks must use official brand assets per their guidelines.
- No Anthropic or third-party brand assets are used.

## Files
- `WhatsGlazin.dc.html` — the full interactive design reference (tokens, components, 3 landing directions, chosen **1c** landing built out, live app prototype, upload-flow states, auth). Open with `support.js` beside it.
- `support.js` — prototype runtime **for viewing only; do not port**.
- (Optional) request screenshots of any screen from the designer if a static reference is preferred.
