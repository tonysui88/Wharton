/**
 * app/api/events/route.ts
 *
 * Server-Sent Events endpoint for real-time manager notifications.
 * Streams ReviewEvent objects as they are pushed to the reviewStore.
 *
 * Usage: EventSource("/api/events")
 * Each message is a JSON-serialised ReviewEvent.
 */

import { reviewStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send a heartbeat comment every 25s to keep the connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      // Subscribe to new review events
      const unsubscribe = reviewStore.subscribe((event) => {
        try {
          const data = JSON.stringify({
            ...event,
            submittedAt: event.submittedAt.toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Client disconnected
        }
      });

      // Cleanup when the client closes the connection
      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
