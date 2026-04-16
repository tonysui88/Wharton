import { loadProperties, loadReviews } from "@/lib/data";
import { generateHotelDisplayName } from "@/lib/utils";
import TravelerHome from "@/components/TravelerHome";

export const dynamic = "force-dynamic";

// Deterministic "hash" of a string → 0..1
function pseudoRand(seed: string, offset = 0): number {
  let h = offset * 2654435761;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return ((h >>> 0) % 1000) / 1000;
}

// ── Image catalogue ────────────────────────────────────────────────────────────
// Each key maps to a curated Unsplash photo that visually matches the scene.

const IMG = {
  // Specific cities / landmarks
  pompei_amalfi:  "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&auto=format&fit=crop", // Positano cliff-side colourful houses
  rome:           "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop", // Rome skyline / dome
  bangkok:        "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop", // Bangkok river + temples
  germany_forest: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&auto=format&fit=crop", // Misty pine forest (Black Forest)
  germany_urban:  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&auto=format&fit=crop", // European city with river
  sa_nature:      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&auto=format&fit=crop", // African landscape / safari dusk
  costa_rica:     "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&auto=format&fit=crop", // Lush tropical jungle waterfall
  // Property settings
  beach:          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop", // Empty white-sand beach
  mountain:       "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop", // Mountain hotel / alpine
  pool_resort:    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop", // Bali infinity pool villa
  resort_pool2:   "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop", // Resort pool deck
  spa:            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop", // Beach resort / spa terrace
  national_park:  "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800&auto=format&fit=crop", // Wildlife safari / savanna
  historic:       "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop", // Historic European street / hotel
  rural:          "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop", // Countryside inn / rolling hills
  // Urban / business
  city_modern:    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop", // Sleek city hotel exterior
  city_lobby:     "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&auto=format&fit=crop", // Grand hotel lobby
  city_room:      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop", // Cozy city hotel room
  boutique:       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop", // Boutique pool hotel
  // Generic quality fallbacks by star tier
  luxury:         "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800&auto=format&fit=crop", // Elegant chandelier lobby
  midscale:       "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop", // Clean modern hotel
};

/**
 * Pick the most contextually appropriate image by scanning the full description
 * text (property + area) for scene keywords before falling back to city/country.
 */
function pickImage(
  id: string,
  city: string,
  country: string,
  propertyDesc: string,
  amenities: string[],
  starRating: number,
): string {
  const text = [propertyDesc, city, country, ...amenities].join(" ").toLowerCase();

  // ── 1. Specific landmark / city signals ───────────────────────────────────
  if (text.includes("pompei") || text.includes("positano") || text.includes("amalfi") || text.includes("sorrento") || text.includes("vesuvius"))
    return IMG.pompei_amalfi;
  if (text.includes("rome") || text.includes("colosseum") || text.includes("vatican") || text.includes("trevi"))
    return IMG.rome;
  if (text.includes("bangkok") || text.includes("grand palace") || text.includes("emerald buddha") || text.includes("chao phraya"))
    return IMG.bangkok;
  if (text.includes("freudenstadt") || text.includes("black forest") || text.includes("schwarzwald") || text.includes("alpirsbacher"))
    return IMG.germany_forest;
  if (text.includes("bochum") || text.includes("starlight express") || text.includes("westfalenhallen"))
    return IMG.germany_urban;
  if (text.includes("mbombela") || text.includes("nelspruit") || text.includes("kruger") || text.includes("mpumalanga"))
    return IMG.sa_nature;
  if (text.includes("costa rica") || text.includes("quebradas") || text.includes("san isidro"))
    return IMG.costa_rica;

  // ── 2. Setting / scene keywords (priority order) ──────────────────────────
  if (text.includes("national park") || text.includes("nature reserve") || text.includes("wildlife") || text.includes("private nature"))
    return IMG.national_park;
  if (text.includes("beach") || text.includes("ocean") || text.includes("sea") || text.includes("coastal") || text.includes("waterfront") || text.includes("marina") || text.includes("ferry landing"))
    return IMG.beach;
  if (text.includes("ski") || text.includes("alpine") || text.includes("mountain") || text.includes("snow"))
    return IMG.mountain;
  if (text.includes("rural") || text.includes("countryside") || text.includes("vineyard") || text.includes("farm"))
    return IMG.rural;
  if (text.includes("historical district") || text.includes("ancient") || text.includes("heritage") || text.includes("old town"))
    return IMG.historic;

  // ── 3. Property-type keywords ──────────────────────────────────────────────
  if (text.includes("pool") || text.includes("resort")) {
    return pseudoRand(id, 7) < 0.5 ? IMG.pool_resort : IMG.resort_pool2;
  }
  if (text.includes("spa")) return IMG.spa;
  if (text.includes("boutique")) return IMG.boutique;

  // ── 4. Country fallback ────────────────────────────────────────────────────
  if (country.toLowerCase() === "italy") return pseudoRand(id, 9) < 0.5 ? IMG.pompei_amalfi : IMG.rome;
  if (country.toLowerCase() === "thailand") return pseudoRand(id, 9) < 0.5 ? IMG.pool_resort : IMG.resort_pool2;
  if (country.toLowerCase() === "germany") return pseudoRand(id, 9) < 0.5 ? IMG.germany_forest : IMG.germany_urban;
  if (country.toLowerCase() === "south africa") return IMG.sa_nature;
  if (country.toLowerCase() === "costa rica") return IMG.costa_rica;

  // ── 5. Star-rating tier ───────────────────────────────────────────────────
  if (starRating >= 4) return pseudoRand(id, 11) < 0.5 ? IMG.luxury : IMG.city_lobby;
  if (starRating >= 3) return pseudoRand(id, 11) < 0.5 ? IMG.city_modern : IMG.city_room;
  return IMG.midscale;
}

function derivePrice(id: string, starRating: number): number {
  const base =
    starRating >= 5 ? 420 :
    starRating >= 4 ? 220 :
    starRating >= 3 ? 120 :
    90;
  const variance = Math.floor(pseudoRand(id, 3) * base * 0.4);
  return base + variance;
}

export default function HotelsPage() {
  const properties = loadProperties();
  const reviews = loadReviews();

  // Count reviews per property
  const reviewCounts: Record<string, number> = {};
  for (const r of reviews) {
    reviewCounts[r.eg_property_id] = (reviewCounts[r.eg_property_id] ?? 0) + 1;
  }

  const hotels = properties.map((p) => ({
    id: p.eg_property_id,
    name: generateHotelDisplayName(p.property_description, p.city, p.country, p.star_rating),
    location: [p.city, p.province, p.country].filter(Boolean).join(", "),
    guestRating: p.guestrating_avg_expedia,
    imageUrl: pickImage(p.eg_property_id, p.city, p.country, p.property_description, p.popular_amenities_list, p.star_rating),
    price: derivePrice(p.eg_property_id, p.star_rating),
    reviewCount: reviewCounts[p.eg_property_id] ?? 0,
  }));

  return <TravelerHome hotels={hotels} />;
}
