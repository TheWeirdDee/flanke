import { getSystemStatus } from "@/lib/db/client";

// Unauthenticated — Railway worker pings this after each cycle.
export async function GET() {
  try {
    const status = await getSystemStatus();
    return Response.json({ status: "ok", ...status });
  } catch {
    return Response.json(
      { status: "degraded", workerVersion: "unknown", lastCycleAt: null },
      { status: 503 }
    );
  }
}
