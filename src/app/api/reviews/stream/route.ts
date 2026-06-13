import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { Contract } from "@/lib/db/models";
import { runFullReview } from "@/lib/orchestrator";
import { ProgressEvent } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const contractId = req.nextUrl.searchParams.get("contractId");
  if (!contractId) {
    return new Response("contractId required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        await connectDB();
        const contract = await Contract.findById(contractId);
        if (!contract?.extractedText) {
          send("review_error", { message: "No contract text found. Add contract text in the contract details page and try again." });
          return;
        }

        await runFullReview(contractId, (progress: ProgressEvent) => {
          send("progress", progress);
        });
        send("done", { contractId });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Review failed";
        send("review_error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
