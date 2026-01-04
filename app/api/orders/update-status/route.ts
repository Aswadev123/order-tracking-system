import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderHistory from "@/models/OrderHistory";
import { isValidStatus, canTransition } from "@/lib/orderFlow";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = jwt.verify(token!, process.env.JWT_SECRET!) as any;

  if (user.role !== "DRIVER") {
    return Response.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { orderId, status, expectedSeq } = await req.json();
  if (!orderId) return Response.json({ message: "orderId is required" }, { status: 400 });
  if (!isValidStatus(status)) return Response.json({ message: "Invalid status value" }, { status: 400 });
  if (expectedSeq === undefined || typeof expectedSeq !== "number") {
    return Response.json({ message: "expectedSeq (number) is required for concurrency control" }, { status: 400 });
  }

  await connectDB();
  // read for existence
  const existing = await Order.findOne({ orderId });
  if (!existing) return Response.json({ message: "Order not found" }, { status: 404 });

  if (!canTransition(existing.status, status)) {
    return Response.json({ message: `Invalid transition from ${existing.status} to ${status}` }, { status: 400 });
  }

  // perform atomic conditional update based on seq to detect out-of-order/duplicate updates
  const updated = await Order.findOneAndUpdate(
    { orderId, seq: expectedSeq },
    { $set: { status }, $inc: { seq: 1 } },
    { new: true }
  );

  if (!updated) {
    // conflict: someone else updated first or duplicate
    const current = await Order.findOne({ orderId }).lean();
    return Response.json({ message: "Sequence conflict or duplicate update", currentSeq: current?.seq, currentStatus: current?.status }, { status: 409 });
  }

  // write history
  try {
    await OrderHistory.create({
      orderId: updated.orderId,
      status: updated.status,
      seq: updated.seq,
      updatedBy: user.id,
      role: user.role,
      metadata: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-client-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || null,
        source: "DRIVER_UPDATE",
        prevStatus: existing.status,
      },
    });
  } catch (err) {
    console.error("Failed to write order history:", err);
  }

  // publish realtime update
  try {
    const realtime = (await import("@/lib/realtime")).default;
    realtime.publish("order.updated", { orderId: updated.orderId, status: updated.status, updatedAt: new Date(), seq: updated.seq });
  } catch (e) {
    console.error("Realtime publish failed:", e);
  }

  return Response.json({ message: "Status updated", orderId: updated.orderId, status: updated.status, seq: updated.seq });
}
