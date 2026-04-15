import { loadProperties } from "@/lib/data";
import { generateHotelDisplayName } from "@/lib/utils";
import TravelerHome from "@/components/TravelerHome";

export const dynamic = "force-dynamic";

export default function HotelsPage() {
  const properties = loadProperties();

  const hotels = properties.map((p) => ({
    id: p.eg_property_id,
    name: generateHotelDisplayName(p.property_description, p.city, p.country, p.star_rating),
    location: [p.city, p.province, p.country].filter(Boolean).join(", "),
    guestRating: p.guestrating_avg_expedia,
  }));

  return <TravelerHome hotels={hotels} />;
}
