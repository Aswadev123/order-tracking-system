import realtime from "@/lib/realtime";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  try {
    jwt.verify(token!, process.env.JWT_SECRET!);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const stream = new ReadableStream({
    start(controller) {
      function sendEvent(channel: string, payload: any) {
        const data = `event: ${channel}\ndata: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }

      const handlers: { [k: string]: (...args: any[]) => void } = {};

      // subscribe to all order events
      const orderCreated = (p: any) => sendEvent("order.created", p);
      const orderUpdated = (p: any) => sendEvent("order.updated", p);

      handlers["order.created"] = orderCreated;
      handlers["order.updated"] = orderUpdated;

      realtime.on("order.created", orderCreated);
      realtime.on("order.updated", orderUpdated);

      // keep the connection alive with comments
      const keepAlive = setInterval(() => controller.enqueue(new TextEncoder().encode(`: keep-alive\n\n`)), 20000);

      controller.enqueue(new TextEncoder().encode(`: connected\n\n`));

      return () => {
        clearInterval(keepAlive);
        realtime.off("order.created", orderCreated);
        realtime.off("order.updated", orderUpdated);
      };
    }
  });

  return new Response(stream, { status: 200, headers });
}
