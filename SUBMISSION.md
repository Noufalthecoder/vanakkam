# Devpost submission kit

## Tagline (≤ 200 chars)

Try on the exact shade you'll buy. Vanakkam reads your skin with YouCam AI and designs looks for your outfit and venue lighting. It matches them to real products and builds a countdown skincare cart.

## Inspiration

In India, the big beauty purchases happen around a date: a wedding muhurtham, a sangeet, Diwali. Shoppers buying online face three problems:

- **Wrong shade.** A foundation or lipstick that looked right on screen arrives wrong and gets sent back.
- **Outfit clash.** A coral lip next to a peacock-blue saree.
- **Lighting.** A look that was perfect in the shop goes flat under temple camera flash.

We wanted a store that answers "will this work on *me*, in *that* outfit, at *that* event?" before checkout.

## What it does

- **Beauty DNA scan:** one selfie, two YouCam analyses.
  - *Skin Tone Analysis* returns skin, lip and brow colour. We convert those to CIE Lab to work out undertone and depth.
  - *Skin Analysis* returns 9 concern scores, skin age, skin type and an overall score.
- **Three occasion looks** (18 recipes across 6 occasions). Each look is tuned for:
  - **Venue lighting:** flash, stage or daylight change intensity, glow, coverage and shimmer.
  - **Outfit colour:** pick a preset or upload a photo of the outfit. Lips swap families to avoid clashes, and the lids pick up the outfit colour.
  - **Skin scores:** visible texture raises coverage, oiliness cuts glow, and dull skin gets extra glow.
- **Try-on = buy.** Every AI-designed shade is snapped to the nearest real SKU with **CIEDE2000**, and the **YouCam Makeup VTO** renders that SKU's exact colour. Each product shows a % match and ΔE, and the foundation shows a runner-up shade. A weighted *Shade Confidence* score summarises return risk.
- **Shop the Look.** The full kit has your shade codes, a 15% bundle price, and a cart and checkout. Checkout warns you if delivery would land after your event.
- **Countdown regimen.** Your three lowest skin scores each become one product, with an order-by date and a supply check against the days left.
- **Prep plan.** A day-by-day timeline you can export to any calendar.

## How we built it

- **Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4, TypeScript end-to-end.
- **YouCam API v2:**
  - `POST /file`, then a signed `PUT`, gives one `file_id`.
  - That ID is reused for `skin-tone-analysis`, `skin-analysis` and every `makeup-vto` render.
  - Server route handlers proxy the API and keep the key off the client.
  - Features are allow-listed, and the browser polls with backoff.
- **Makeup VTO:** six categories per render (foundation, blush, eye shadow with 1–3 colour patterns, shaped eyebrows, lip colour with matte/satin/gloss, liner).
  - We verified every pattern and texture combination against the live API before using it.
- **Colour science, written from scratch:**
  - sRGB → Lab conversion and the CIEDE2000 colour difference.
  - Undertone from the Lab b\*/a\* ratio.
  - Dominant-colour extraction for outfit photos, weighted toward saturated colours.
- **Framing tool:** skin analysis needs the face to fill more than 60% of the frame width. We built a pan/zoom oval framer and camera capture so users get a passing photo on the first try.
- **Resilience:**
  - If the detailed skin scan fails, the look flow still continues.
  - Renders are de-duplicated by a key built from their effects.
  - Raw API error codes become friendly instructions, for example "zoom in so your face fills the oval".

## Challenges

- The first test photo failed skin analysis with `error_src_face_too_small`. That led to the oval framer.
- The docs and the live API disagree on some fields: `results.url` versus `download_url`, and which liner patterns are valid. We probed each combination before building on it.
- The colours YouCam measures are less saturated than a typical foundation chart, so we tuned the shade range until real scans matched at 85–94%.

## Accomplishments

- A complete storefront flow, scan → look → cart → checkout → plan, all driven by real YouCam output.
- The try-on uses the colour of the product you'd actually buy.

## What's next

- Plug in a real retailer catalogue: the ΔE snapping works on any list of SKU hex values.
- Add YouCam hair colour and jewellery try-on for the full outfit.
- Re-scan progress tracking during the countdown.

## Built with

YouCam API (Skin Analysis, Skin Tone Analysis, Makeup VTO) · Next.js · React · TypeScript · Tailwind CSS

---

# Demo video script (≈ 2:30)

| Time | Show | Say |
| --- | --- | --- |
| 0:00 | Hero | "Buying makeup online is a guess: wrong shades, outfit clashes, looks that die under camera flash. This is Vanakkam, built on the YouCam API." |
| 0:15 | Moment step: Muhurtham, date, Camera flash, Peacock blue | "I'm shopping for a wedding morning. Temple photographers mean flash, and I'm wearing a peacock-blue saree." |
| 0:30 | Selfie and oval framer | "One selfie. YouCam's skin analysis needs the face to fill the frame, so this framer gets it right first time." |
| 0:40 | Scan checklist | "Two YouCam APIs run in parallel. **Skin Tone Analysis** measures my skin, lip and brow colour. **Skin Analysis** scores 9 skin concerns." |
| 0:55 | Beauty DNA | "Warm undertone, medium depth, skin age 30. My weakest scores are under-eyes and fine lines." |
| 1:05 | Looks and before/after slider | "Three bridal looks, rendered on my face by **YouCam Makeup VTO**: foundation, blush, eyes, brows, liner and lips in one call." |
| 1:20 | Why-this-works notes, then switch lighting | "Every decision is explained. Switch to daylight and the look re-renders softer." |
| 1:35 | Switch outfit | "Change the saree and the lip and lids adapt so they don't clash." |
| 1:50 | Shop the Look, hover the 89% match | "Here's what makes it a store. Each AI shade is matched to a real product with CIEDE2000, so the try-on shows the exact lipstick and foundation you'll receive." |
| 2:05 | Add full kit, then bag and checkout | "One tap adds the kit at a bundle price. Checkout checks that delivery lands before my wedding." |
| 2:15 | Regimen and countdown | "My lowest skin scores become a skincare regimen with order-by dates, plus a day-by-day prep plan I can add to my calendar." |
| 2:25 | Logo | "Vanakkam: try on what you'll actually buy." |

**Rules to follow:** show it running in a browser, name the YouCam APIs, no third-party trademarks, no copyrighted music.

# Screenshots to upload

Hero · moment step with outfit · oval framer · scanning · Beauty DNA · looks with before/after · shop the look · bag · countdown regimen.
