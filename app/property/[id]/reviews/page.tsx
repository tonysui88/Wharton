import { notFound } from "next/navigation";
import { loadProperties } from "@/lib/data";
import { reviewStore } from "@/lib/store";
import ManagerNotifications from "@/components/ManagerNotifications";
import LiveReviewsFeed, { LiveReviewEvent } from "@/components/LiveReviewsFeed";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function ReviewsPage({ params }: Props) {
  const { id } = await params;
  const properties = loadProperties();
  const property = properties.find((p) => p.eg_property_id === id);
  if (!property) notFound();

  const recentEvents: LiveReviewEvent[] = reviewStore
    .getRecentEvents(50)
    .filter((e) => e.propertyId === id)
    .map((event) => {
      const liveReviews = reviewStore.getLiveReviewsForProperty(id);
      const liveReview = liveReviews.find((r) => r.id === event.id);
      return {
        ...event,
        submittedAt: event.submittedAt.toISOString(),
        answers: liveReview?.answers ?? [],
        photos: event.photos ?? [],
      };
    });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1E243A]">Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">
            Live guest submissions and real-time notifications.
          </p>
        </div>
        <ManagerNotifications />
      </div>

      {recentEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4E7EF] p-10 text-center">
          <p className="text-gray-400 text-sm">No live reviews submitted yet for this property.</p>
          <p className="text-gray-300 text-xs mt-1">Reviews submitted via the guest flow will appear here in real time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4E7EF] p-6">
          <LiveReviewsFeed events={recentEvents} />
        </div>
      )}
    </div>
  );
}
